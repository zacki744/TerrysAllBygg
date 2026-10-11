using System.ComponentModel.DataAnnotations;

namespace Models.Admin;

// ── DB DTOs ────────────────────────────────────────────────

public class AdminUser
{
    public required string Id { get; init; }
    public required string Username { get; init; }  // kept for JWT compat
    public required string Email { get; init; }
    public required string PasswordHash { get; init; }
    public DateTime CreatedAt { get; init; }
}

public class AdminInvitation
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }
    public DateTime CreatedAt { get; init; }
}

public class PasswordResetToken
{
    public required string Id { get; init; }
    public required string AdminUserId { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }
    public DateTime CreatedAt { get; init; }
}

public class InviteAdminRequest
{
    [EmailAddress, MaxLength(FormLimits.Email)]
    public required string Email { get; init; }
}

public class AcceptInviteRequest
{
    [MaxLength(200)]
    public required string Token { get; init; }
    [MinLength(FormLimits.PasswordMin, ErrorMessage = "Lösenordet måste vara minst 8 tecken.")]
    [MaxLength(FormLimits.PasswordMax, ErrorMessage = "Lösenordet får vara högst 72 tecken.")]
    public required string Password { get; init; }
}

public class RequestPasswordResetRequest
{
    [EmailAddress, MaxLength(FormLimits.Email)]
    public required string Email { get; init; }
}

public class ResetPasswordRequest
{
    [MaxLength(200)]
    public required string Token { get; init; }
    [MinLength(FormLimits.PasswordMin, ErrorMessage = "Lösenordet måste vara minst 8 tecken.")]
    [MaxLength(FormLimits.PasswordMax, ErrorMessage = "Lösenordet får vara högst 72 tecken.")]
    public required string NewPassword { get; init; }
}

public class AdminUserSummary
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required DateTime CreatedAt { get; init; }
}