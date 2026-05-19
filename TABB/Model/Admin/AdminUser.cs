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
    public required string Email { get; init; }
}

public class AcceptInviteRequest
{
    public required string Token { get; init; }
    public required string Password { get; init; }
}

public class RequestPasswordResetRequest
{
    public required string Email { get; init; }
}

public class ResetPasswordRequest
{
    public required string Token { get; init; }
    public required string NewPassword { get; init; }
}

public class AdminUserSummary
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required DateTime CreatedAt { get; init; }
}