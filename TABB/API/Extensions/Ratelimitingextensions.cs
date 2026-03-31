using System.Net;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Extensions;

public static class RateLimitingExtensions
{
    // Policy name constants — use these on controllers/endpoints
    public const string PublicForm = "public-form";
    public const string AdminLogin = "admin-login";
    public const string GeneralApi = "general-api";

    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // ── Public forms (booking + snickeri inquiry) ──────────
            // 5 requests per 10 minutes per IP
            // Realistic for a real customer, blocks spam bots
            options.AddPolicy(PublicForm, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(context),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(10),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0   // no queuing — reject immediately
                    }));

            // ── Admin login ────────────────────────────────────────
            // 10 attempts per 15 minutes per IP
            // Stops brute force without locking out a forgetful admin
            options.AddPolicy(AdminLogin, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(context),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(15),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            // ── General API ────────────────────────────────────────
            // 120 requests per minute per IP — just a sanity ceiling
            // Won't affect real users, stops aggressive scrapers
            options.AddPolicy(GeneralApi, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(context),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 120,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            // ── Rejected request response ──────────────────────────
            // Return clean JSON instead of the default empty 429
            options.OnRejected = async (context, ct) =>
            {
                context.HttpContext.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";

                var retryAfter = context.Lease.TryGetMetadata(
                    MetadataName.RetryAfter, out var retry)
                    ? (int)retry.TotalSeconds
                    : 60;

                context.HttpContext.Response.Headers["Retry-After"] =
                    retryAfter.ToString();

                var body = JsonSerializer.Serialize(new
                {
                    error = "För många förfrågningar. Försök igen om en stund.",
                    retryAfter = retryAfter,
                    status = 429
                });

                await context.HttpContext.Response.WriteAsync(body, ct);
            };
        });

        return services;
    }

    // Prefer X-Forwarded-For (set by reverse proxies) over RemoteIpAddress
    // Falls back to "unknown" if neither is available
    private static string GetClientIp(HttpContext context)
    {
        var forwarded = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwarded))
        {
            // X-Forwarded-For can be a comma-separated list — take the first (client) IP
            var ip = forwarded.Split(',')[0].Trim();
            if (!string.IsNullOrEmpty(ip)) return ip;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}