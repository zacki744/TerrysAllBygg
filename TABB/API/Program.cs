using API.Extensions;
using API.Middleware;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Models.Mail;
using Services.Src;
using Services.Src.DB;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ──────────────────────────────────────────
if (builder.Environment.IsDevelopment())
    builder.Configuration.AddUserSecrets<Program>();

builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("Smtp"));

builder.Services.Configure<DatabaseOptions>(
    builder.Configuration.GetSection("Database"));

// ── Dapper ─────────────────────────────────────────────────
DefaultTypeMap.MatchNamesWithUnderscores = true;
SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

// ── CORS ───────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Permissive in dev — localhost on any port
            policy.SetIsOriginAllowed(origin =>
                new Uri(origin).Host == "localhost")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            // Strict in production — only configured origins
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

// ── JWT Authentication ─────────────────────────────────────
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key not configured"))
        )
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.ContainsKey("auth_token"))
                context.Token = context.Request.Cookies["auth_token"];
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddAppRateLimiting();
builder.Services.AddServiceLayer();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ── Health check ───────────────────────────────────────────
builder.Services.AddHealthChecks();

var app = builder.Build();

// ── Exception handler — must be FIRST in pipeline ─────────
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors("ProductionPolicy");

// ── Serve compiled frontend from wwwroot/app ───────────────
var frontendPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "app");

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath)
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath)
});

// ── Uploads — outside wwwroot, safe from FTP wipes ────────
var uploadsPath = Path.GetFullPath(
    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads"));

Directory.CreateDirectory(uploadsPath);

app.Logger.LogInformation("Uploads folder resolved to: {Path}", uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();


// ── Health check endpoint ──────────────────────────────────
app.MapHealthChecks("/health");

// ── API controllers ────────────────────────────────────────
app.MapControllers();

// ── SPA fallback ───────────────────────────────────────────
app.MapFallback(context =>
{
    if (context.Request.Path.StartsWithSegments("/api") ||
        context.Request.Path.StartsWithSegments("/uploads") ||
        context.Request.Path.StartsWithSegments("/health"))
    {
        context.Response.StatusCode = 404;
        return Task.CompletedTask;
    }

    var indexPath = Path.Combine(frontendPath, "index.html");
    context.Response.ContentType = "text/html";
    return context.Response.SendFileAsync(indexPath);
});

app.Run();