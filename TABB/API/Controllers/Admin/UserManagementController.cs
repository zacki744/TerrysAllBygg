using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Models.Admin;
using Services.Src.Auth;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
[EnableRateLimiting(RateLimitingExtensions.GeneralApi)]
public class UserManagementController(
    IUserManagementService userService,
    ILogger<UserManagementController> logger) : ControllerBase
{
    private readonly IUserManagementService _userService = userService;
    private readonly ILogger<UserManagementController> _logger = logger;

    // GET: api/admin/users
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var users = await _userService.GetAllAdminsAsync(ct);
        return Ok(users);
    }

    // POST: api/admin/users/invite
    [HttpPost("invite")]
    public async Task<IActionResult> Invite([FromBody] InviteAdminRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            await _userService.InviteAdminAsync(request.Email, ct);
            return Ok(new { message = $"Inbjudan skickad till {request.Email}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fel vid inbjudan av {Email}", request.Email);
            return StatusCode(500, new { error = "Kunde inte skicka inbjudan" });
        }
    }

    // DELETE: api/admin/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var success = await _userService.DeleteAdminAsync(id, ct);

        if (!success)
            return BadRequest(new { error = "Kan inte radera det sista admin-kontot" });

        return Ok(new { message = "Admin-konto raderat" });
    }

    // POST: api/admin/users/{id}/reset-password
    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> SendReset(string id, CancellationToken ct)
    {
        // We need the email — fetch the user first
        var users = await _userService.GetAllAdminsAsync(ct);
        var user = users.FirstOrDefault(u => u.Id == id);

        if (user == null)
            return NotFound(new { error = "Användare hittades inte" });

        await _userService.SendPasswordResetAsync(user.Email, ct);
        return Ok(new { message = "Återställningslänk skickad" });
    }
}

// ── Public endpoints (no auth required) ───────────────────

[ApiController]
[Route("api/admin/auth")]
public class UserSetupController(
    IUserManagementService userService,
    ILogger<UserSetupController> logger) : ControllerBase
{
    private readonly IUserManagementService _userService = userService;
    private readonly ILogger<UserSetupController> _logger = logger;

    // POST: api/admin/auth/accept-invite
    [HttpPost("accept-invite")]
    [EnableRateLimiting("admin-login")]
    public async Task<IActionResult> AcceptInvite(
        [FromBody] AcceptInviteRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var success = await _userService.AcceptInviteAsync(request.Token, request.Password, ct);

        if (!success)
            return BadRequest(new { error = "Inbjudningslänken är ogiltig eller har gått ut" });

        return Ok(new { message = "Konto skapat! Du kan nu logga in." });
    }

    // POST: api/admin/auth/reset-password
    [HttpPost("reset-password")]
    [EnableRateLimiting("admin-login")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var success = await _userService.ResetPasswordAsync(request.Token, request.NewPassword, ct);

        if (!success)
            return BadRequest(new { error = "Återställningslänken är ogiltig eller har gått ut" });

        return Ok(new { message = "Lösenord uppdaterat! Du kan nu logga in." });
    }

    // GET: api/admin/auth/validate-token?token=xxx&type=invite|reset
    [HttpGet("validate-token")]
    public async Task<IActionResult> ValidateToken(
        [FromQuery] string token,
        [FromQuery] string type,
        CancellationToken ct)
    {
        if (type == "invite")
        {
            var invite = await _userService.GetInvitationByTokenAsync(token, ct);
            if (invite == null)
                return BadRequest(new { valid = false, error = "Ogiltig eller utgången länk" });
            return Ok(new { valid = true, email = invite.Email });
        }

        return BadRequest(new { error = "Okänd token-typ" });
    }
}