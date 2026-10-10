using Models.Admin;

namespace Services.Src.Auth;

public interface IUserManagementService
{
    Task<List<AdminUserSummary>> GetAllAdminsAsync(CancellationToken ct = default);
    Task<bool> DeleteAdminAsync(string id, CancellationToken ct = default);

    // Invite flow
    Task InviteAdminAsync(string email, CancellationToken ct = default);
    Task<bool> AcceptInviteAsync(string token, string password, CancellationToken ct = default);
    Task<AdminInvitation?> GetInvitationByTokenAsync(string token, CancellationToken ct = default);

    // Password reset flow
    Task<bool> SendPasswordResetAsync(string email, CancellationToken ct = default);
    Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);
}