namespace API.Middleware;

/// <summary>
/// Sätter säkerhetsheaders på alla svar (sidor, API och bilder).
///
/// CSP: sajten laddar bara egna resurser (inga CDN:er, typsnitt eller
/// analysskript). 'unsafe-inline' för style behövs eftersom komponenterna
/// använder style={{…}}. JSON-LD från react-helmet-async påverkas inte,
/// eftersom script-src bara gäller körbara skript.
/// Om en extern resurs läggs till (t.ex. en karta) måste CSP:n utökas.
/// </summary>
public class SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment env)
{
    private readonly RequestDelegate _next = next;
    private readonly bool _isDevelopment = env.IsDevelopment();

    private const string ContentSecurityPolicy =
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none'";

    public Task InvokeAsync(HttpContext context)
    {
        // OnStarting: headers sätts precis innan svaret skickas, så de
        // kommer med även på svar från static files och SPA-fallbacken.
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";
            headers["Cross-Origin-Opener-Policy"] = "same-origin";

            // Vite dev-server och hot reload behöver mer än 'self'
            if (!_isDevelopment)
                headers["Content-Security-Policy"] = ContentSecurityPolicy;

            // HSTS bara över HTTPS i produktion — annars kan en felkonfigurerad
            // lokal miljö låsa webbläsaren till https://localhost.
            if (!_isDevelopment && context.Request.IsHttps)
                headers["Strict-Transport-Security"] = "max-age=31536000";

            return Task.CompletedTask;
        });

        return _next(context);
    }
}
