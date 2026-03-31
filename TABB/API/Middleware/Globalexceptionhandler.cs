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
            _logger.LogError(ex,
                "Unhandled exception on {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            await WriteErrorResponseAsync(context, ex);
        }
    }

    private static async Task WriteErrorResponseAsync(HttpContext context, Exception ex)
    {
        // Don't overwrite a response that's already started streaming
        if (context.Response.HasStarted) return;

        context.Response.Clear();
        context.Response.ContentType = "application/json";

        var (statusCode, message) = ex switch
        {
            ArgumentException => (HttpStatusCode.BadRequest, "Invalid request."),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized."),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found."),
            OperationCanceledException => (HttpStatusCode.ServiceUnavailable, "Request was cancelled."),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        context.Response.StatusCode = (int)statusCode;

        var body = JsonSerializer.Serialize(new
        {
            error = message,
            status = (int)statusCode,
            path = context.Request.Path.Value,
            traceId = context.TraceIdentifier   // safe to expose — just a correlation ID
        });

        await context.Response.WriteAsync(body);
    }
}