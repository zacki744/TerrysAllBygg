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
                _logger.LogWarning("Misslyckat inloggningsförsök för {Email}", request.Email);
                return Unauthorized(new { error = "Fel e-post eller lösenord" });
            }

            Response.Cookies.Append("auth_token", response.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(24),
                Path = "/"
            });

            _logger.LogInformation("Inloggning lyckades för {Email}", request.Email);

            // Return email (not token) for display purposes
            return Ok(new { email = response.Email });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fel vid inloggning för {Email}", request.Email);
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

        _logger.LogInformation("Utloggning genomförd");
        return Ok(new { message = "Utloggad" });
    }

    // GET: api/admin/auth/me
    [HttpGet("me")]
    [Authorize(Roles = "Admin")]
    public IActionResult Me()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                 ?? User.Identity?.Name
                 ?? "okänd";
        return Ok(new { email, authenticated = true });
    }
}