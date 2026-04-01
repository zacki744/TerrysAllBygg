using API.Extensions;
using API.Middleware;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Models.Mail;
using Serilog;
using Serilog.Events;
using Services.Src;
using Services.Src.DB;
using System.Text;

// ── Bootstrap logger — catches startup crashes ─────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("=== Terrys All Bygg API startar ===");

    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, config) =>
    {
        var logsPath = Path.GetFullPath(
            Path.Combine(ctx.HostingEnvironment.ContentRootPath, "..", "..", "logs", "api-.log"));

        config
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("App", "TerrysAllBygg")
            .WriteTo.Console(
                outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}"
            )
            .WriteTo.File(
                path: logsPath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}"
            );
    });

    // ── Configuration ──────────────────────────────────────
    if (builder.Environment.IsDevelopment())
        builder.Configuration.AddUserSecrets<Program>();

    builder.Services.Configure<SmtpSettings>(
        builder.Configuration.GetSection("Smtp"));

    builder.Services.Configure<DatabaseOptions>(
        builder.Configuration.GetSection("Database"));

    // ── Dapper ─────────────────────────────────────────────
    DefaultTypeMap.MatchNamesWithUnderscores = true;
    SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

    // ── CORS ───────────────────────────────────────────────
    var allowedOrigins = builder.Configuration
        .GetSection("AllowedOrigins")
        .Get<string[]>() ?? [];

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ProductionPolicy", policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                policy.SetIsOriginAllowed(origin =>
                    new Uri(origin).Host == "localhost")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        });
    });

    // ── JWT ────────────────────────────────────────────────
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
    builder.Services.AddHealthChecks();

    var app = builder.Build();

    // ── Serilog request logging ────────────────────────────
    app.UseSerilogRequestLogging(opts =>
    {
        opts.MessageTemplate = "{RequestMethod} {RequestPath} → {StatusCode} ({Elapsed:0}ms)";

        // Skip noisy static file requests
        opts.GetLevel = (ctx, _, ex) =>
        {
            if (ex != null) return LogEventLevel.Error;
            if (ctx.Response.StatusCode >= 500) return LogEventLevel.Error;
            if (ctx.Response.StatusCode >= 400) return LogEventLevel.Warning;
            if (ctx.Request.Path.StartsWithSegments("/uploads") ||
                ctx.Request.Path.StartsWithSegments("/_next"))
                return LogEventLevel.Verbose;
            return LogEventLevel.Information;
        };
    });

    // ── Exception handler — FIRST in pipeline ──────────────
    app.UseMiddleware<GlobalExceptionHandler>();

    if (app.Environment.IsDevelopment())
        app.MapOpenApi();

    app.UseHttpsRedirection();
    app.UseCors("ProductionPolicy");

    // ── Frontend static files ──────────────────────────────
    var frontendPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "app");

    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(frontendPath)
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(frontendPath)
    });

    // ── Uploads ────────────────────────────────────────────
    var uploadsPath = Path.GetFullPath(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads"));

    Directory.CreateDirectory(uploadsPath);
    Log.Information("Uploads-mapp: {Path}", uploadsPath);

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads"
    });

    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();

    app.MapHealthChecks("/health");
    app.MapControllers();

    // ── SPA fallback ───────────────────────────────────────
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

    Log.Information("=== API redo på port 7026 ===");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "API kraschade vid uppstart");
}
finally
{
    Log.CloseAndFlush();
}