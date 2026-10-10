using Models.Admin;

namespace Services.Src.Auth;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
    string GenerateJwtToken(AdminUser user);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}