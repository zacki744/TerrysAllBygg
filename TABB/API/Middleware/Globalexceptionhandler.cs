using System.Net;
using System.Text.Json;

namespace API.Middleware;

public class GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<GlobalExceptionHandler> _logger = logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (statusCode, message) = ex switch
        {
            ArgumentException => (HttpStatusCode.BadRequest, "Ogiltig förfrågan."),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Ej behörig."),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Resursen hittades inte."),
            OperationCanceledException => (HttpStatusCode.ServiceUnavailable, "Förfrågan avbröts."),
            _ => (HttpStatusCode.InternalServerError, "Ett oväntat fel uppstod.")
        };

        // Log with appropriate level and full context
        if ((int)statusCode >= 500)
        {
            _logger.LogError(ex,
                "Ohanterat undantag [{ExceptionType}] på {Method} {Path} → {StatusCode}",
                ex.GetType().Name,
                context.Request.Method,
                context.Request.Path,
                (int)statusCode);
        }
        else
        {
            _logger.LogWarning(
                "Hanterat undantag [{ExceptionType}] på {Method} {Path} → {StatusCode}: {Message}",
                ex.GetType().Name,
                context.Request.Method,
                context.Request.Path,
                (int)statusCode,
                ex.Message);
        }

        if (context.Response.HasStarted) return;

        context.Response.Clear();
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var body = JsonSerializer.Serialize(new
        {
            error = message,
            status = (int)statusCode,
            path = context.Request.Path.Value,
            traceId = context.TraceIdentifier
        });

        await context.Response.WriteAsync(body);
    }
}