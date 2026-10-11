using Models.Admin;

namespace Services.Src.Auth;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
    string GenerateJwtToken(AdminUser user);
    // Används vid varje admin-anrop: en borttagen admin ska inte kunna fortsätta med en giltig token.
    Task<bool> UserExistsAsync(string userId, CancellationToken ct = default);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}