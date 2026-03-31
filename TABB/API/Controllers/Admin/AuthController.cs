using API.Extensions;
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
                _logger.LogWarning("Failed login attempt for user {Username}", request.Username);
                return Unauthorized(new { error = "Invalid credentials" });
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user {Username}", request.Username);
            return StatusCode(500, new { error = "Login failed" });
        }
    }
}