using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Models.Admin;
using Services.Src.Auth;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/auth")]
[EnableRateLimiting(RateLimitingExtensions.AdminLogin)]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly ILogger<AuthController> _logger = logger;

    // POST: api/admin/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                _logger.LogWarning("Misslyckat inloggningsförsök för användare {Username}", request.Username);
                return Unauthorized(new { error = "Fel användarnamn eller lösenord" });
            }

            // Set httpOnly cookie — not accessible from JavaScript
            Response.Cookies.Append("auth_token", response.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,          // HTTPS only
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(24),
                Path = "/"
            });

            _logger.LogInformation("Inloggning lyckades för användare {Username}", request.Username);

            // Don't return the token in the body — it's in the cookie
            return Ok(new { username = response.Username });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fel vid inloggning för användare {Username}", request.Username);
            return StatusCode(500, new { error = "Inloggning misslyckades" });
        }
    }

    // POST: api/admin/auth/logout
    [HttpPost("logout")]
    [Authorize(Roles = "Admin")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("auth_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });

        _logger.LogInformation("Användare loggade ut");
        return Ok(new { message = "Utloggad" });
    }

    // GET: api/admin/auth/me — check if still authenticated
    [HttpGet("me")]
    [Authorize(Roles = "Admin")]
    public IActionResult Me()
    {
        var username = User.Identity?.Name ?? "okänd";
        return Ok(new { username, authenticated = true });
    }
}