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
    Log.Information("=== Terrys Allbygg API startar ===");

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
    builder.Services.AddHealthChecks();

    // ── Kestrel — tillåt 50 MB uploads ────────────────────
    builder.Services.Configure<Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions>(options =>
    {
        options.Limits.MaxRequestBodySize = 52_428_800; // 50 MB
    });

    var app = builder.Build();

    // ── Serilog request logging ────────────────────────────
    app.UseSerilogRequestLogging(opts =>
    {
        opts.MessageTemplate = "{RequestMethod} {RequestPath} → {StatusCode} ({Elapsed:0}ms)";

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

    // ── Säkerhetsheaders — först, så att även felsvar får dem ──
    app.UseMiddleware<SecurityHeadersMiddleware>();

    // ── Exception handler ──────────────────────────────────
    app.UseMiddleware<GlobalExceptionHandler>();

    app.UseHttpsRedirection();
    app.UseCors("ProductionPolicy");

    // ── Frontend static files ──────────────────────────────
    var frontendPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "app");

    // Förrenderade sidor ligger som /about/index.html osv. Utan omdirigering
    // till "/about/" så att URL:en stämmer med canonical.
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(frontendPath),
        RedirectToAppendTrailingSlash = false,
    });

    // Vite-bygget: JS/CSS har hash i filnamnet → lång cache.
    // index.html har aldrig hash → no-cache så SPA-uppdateringar slår igenom.
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(frontendPath),
        OnPrepareResponse = ctx =>
        {
            var headers = ctx.Context.Response.Headers;
            var name = ctx.File.Name;
            if (name.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
                headers.CacheControl = "no-cache, no-store, must-revalidate";
            // robots.txt, sitemap.xml, site.webmanifest saknar hash → kort cache
            else if (name.EndsWith(".txt", StringComparison.OrdinalIgnoreCase) ||
                     name.EndsWith(".xml", StringComparison.OrdinalIgnoreCase) ||
                     name.EndsWith(".webmanifest", StringComparison.OrdinalIgnoreCase))
                headers.CacheControl = "public, max-age=3600";
            else
                headers.CacheControl = "public, max-age=31536000, immutable";
        }
    });

    // ── Uploads ────────────────────────────────────────────
    var uploadsPath = Path.GetFullPath(
        Path.Combine(app.Environment.ContentRootPath, "uploads"));

    Directory.CreateDirectory(uploadsPath);
    Log.Information("Uploads-mapp: {Path}", uploadsPath);

    // Uppladdade bilder är UUID-namngivna och ändras aldrig → safe att cache:a 1 år.
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads",
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";

            // Explicit MIME-typ för WebP (saknas i vissa host-miljöer)
            if (ctx.File.Name.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
                ctx.Context.Response.ContentType = "image/webp";
        }
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

        // Okända sökvägar får index.html (React visar 404-sidan) men med
        // statuskod 404, så att sökmotorer inte indexerar dem som riktiga
        // sidor ("soft 404"). Håll listan i synk med <Routes> i App.tsx.
        var spaPath = context.Request.Path.Value?.TrimEnd('/') ?? "";
        if (spaPath.Length == 0) spaPath = "/";

        string[] exactRoutes  = ["/", "/about", "/book", "/snickerier", "/projekt", "/integritetspolicy",
                                 "/snickeri", "/projects"];          // gamla URL:er → omdirigeras i React
        string[] prefixRoutes = ["/snickerier/", "/projekt/", "/admin"];

        var isKnownRoute = exactRoutes.Contains(spaPath, StringComparer.OrdinalIgnoreCase) ||
                    prefixRoutes.Any(prefix => spaPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));

        if (!isKnownRoute)
            context.Response.StatusCode = 404;

        // index.spa.html är den tomma SPA-mallen (skapas av scripts/prerender.mjs).
        // index.html är förrenderad startsida och får inte serveras för andra sidor.
        var spaTemplate = Path.Combine(frontendPath, "index.spa.html");
        var indexPath = File.Exists(spaTemplate) ? spaTemplate : Path.Combine(frontendPath, "index.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
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