using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Models.Admin;
using Services.Src.DB;
using Services.Src.Mail;

namespace Services.Src.Auth;

public class UserManagementService : IUserManagementService
{
    private readonly IDatabase _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly ILogger<UserManagementService> _logger;

    private const int InviteExpiryHours = 1;
    private const int ResetExpiryHours = 24;

    public UserManagementService(
        IDatabase db,
        IEmailService email,
        IConfiguration config,
        ILogger<UserManagementService> logger)
    {
        _db = db;
        _email = email;
        _config = config;
        _logger = logger;
    }

    // ── List / Delete ──────────────────────────────────────

    public async Task<List<AdminUserSummary>> GetAllAdminsAsync(CancellationToken ct = default)
    {
        var users = await _db.ReadAsync<AdminUser>("admin_users", null, ct);
        return users.Select(u => new AdminUserSummary
        {
            Id = u.Id,
            Email = u.Email,
            CreatedAt = u.CreatedAt
        }).ToList();
    }

    public async Task<bool> DeleteAdminAsync(string id, CancellationToken ct = default)
    {
        // Block deletion if this is the last admin
        var all = await _db.ReadAsync<AdminUser>("admin_users", null, ct);
        if (all.Count <= 1)
        {
            _logger.LogWarning("Blockerade radering av sista admin-kontot {Id}", id);
            return false;
        }

        var rows = await _db.DeleteAsync("admin_users", new { Id = id }, ct);
        return rows > 0;
    }

    // ── Invite flow ────────────────────────────────────────

    public async Task InviteAdminAsync(string email, CancellationToken ct = default)
    {
        // Delete any existing invitation for this email
        await _db.DeleteAsync("admin_invitations", new { Email = email }, ct);

        var token = GenerateSecureToken();
        var invitation = new
        {
            Id = Guid.NewGuid().ToString(),
            Email = email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(InviteExpiryHours)
        };

        await _db.InsertAsync("admin_invitations", invitation, ct);

        var baseUrl = _config["App:BaseUrl"] ?? "https://terrysallbygg.se";
        var link = $"{baseUrl}/admin/accept-invite?token={token}";

        await _email.SendInviteEmailAsync(email, link);
        _logger.LogInformation("Inbjudan skickad till {Email}", email);
    }

    public async Task<AdminInvitation?> GetInvitationByTokenAsync(string token, CancellationToken ct = default)
    {
        var invitation = await _db.ReadSingleAsync<AdminInvitation>(
            "admin_invitations",
            new { Token = token },
            ct
        );

        if (invitation == null) return null;
        if (invitation.ExpiresAt < DateTime.UtcNow) return null; // expired

        return invitation;
    }

    public async Task<bool> AcceptInviteAsync(string token, string password, CancellationToken ct = default)
    {
        var invitation = await GetInvitationByTokenAsync(token, ct);
        if (invitation == null)
        {
            _logger.LogWarning("Ogiltigt eller utgånget inbjudningstoken användes");
            return false;
        }

        // Create the admin user
        var newUser = new
        {
            Id = Guid.NewGuid().ToString(),
            Username = invitation.Email, // use email as username
            Email = invitation.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        await _db.InsertAsync("admin_users", newUser, ct);

        // Delete the used invitation
        await _db.DeleteAsync("admin_invitations", new { Token = token }, ct);

        _logger.LogInformation("Nytt admin-konto skapat för {Email}", invitation.Email);
        return true;
    }

    // ── Password reset flow ────────────────────────────────

    public async Task<bool> SendPasswordResetAsync(string email, CancellationToken ct = default)
    {
        var user = await _db.ReadSingleAsync<AdminUser>(
            "admin_users",
            new { Email = email },
            ct
        );

        if (user == null)
        {
            // Don't reveal whether the email exists
            _logger.LogWarning("Återställning begärd för okänd e-post {Email}", email);
            return true; // return true to avoid email enumeration
        }

        // Delete any existing reset token for this user
        await _db.DeleteAsync("password_reset_tokens", new { AdminUserId = user.Id }, ct);

        var token = GenerateSecureToken();
        var resetToken = new
        {
            Id = Guid.NewGuid().ToString(),
            AdminUserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(ResetExpiryHours)
        };

        await _db.InsertAsync("password_reset_tokens", resetToken, ct);

        var baseUrl = _config["App:BaseUrl"] ?? "https://terrysallbygg.se";
        var link = $"{baseUrl}/admin/reset-password?token={token}";

        await _email.SendPasswordResetEmailAsync(email, link);
        _logger.LogInformation("Återställningslänk skickad till {Email}", email);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
    {
        var resetToken = await _db.ReadSingleAsync<PasswordResetToken>(
            "password_reset_tokens",
            new { Token = token },
            ct
        );

        if (resetToken == null || resetToken.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Ogiltigt eller utgånget återställningstoken användes");
            return false;
        }

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        await _db.UpdateAsync(
            "admin_users",
            new { Id = resetToken.AdminUserId },
            new { PasswordHash = newHash },
            ct
        );

        // Delete the used token
        await _db.DeleteAsync("password_reset_tokens", new { Token = token }, ct);

        _logger.LogInformation("Lösenord återställt för admin {UserId}", resetToken.AdminUserId);
        return true;
    }

    // ── Helpers ────────────────────────────────────────────

    private static string GenerateSecureToken()
    {
        var bytes = new byte[48];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", ""); // URL-safe base64
    }
}