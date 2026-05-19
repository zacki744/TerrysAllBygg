using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Models.Admin;
using Services.Src.DB;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services.Src.Auth;

public class AuthService(IDatabase db, IConfiguration config, ILogger<AuthService> logger) : IAuthService
{
    private readonly IDatabase _db = db;
    private readonly IConfiguration _config = config;
    private readonly ILogger<AuthService> _logger = logger;

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Inloggningsförsök för e-post {Email}", request.Email);

        // Look up by Email, not Username
        var user = await _db.ReadSingleAsync<AdminUser>(
            "admin_users",
            new { Email = request.Email },
            ct
        );

        if (user == null)
        {
            _logger.LogWarning("Inloggning misslyckades — e-post hittades ej: {Email}", request.Email);
            return null;
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            _logger.LogWarning("Inloggning misslyckades — lösenordshash saknas för: {Email}", request.Email);
            return null;
        }

        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Inloggning misslyckades — fel lösenord för: {Email}", request.Email);
            return null;
        }

        _logger.LogInformation("Inloggning lyckades för {Email}", request.Email);

        var token = GenerateJwtToken(user);
        return new LoginResponse
        {
            Token = token,
            Username = user.Email,   // use email as display name
            Email = user.Email
        };
    }

    public string GenerateJwtToken(AdminUser user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key not configured"))
        );

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name,           user.Email),  // email as name claim
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Role,           "Admin")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(int.Parse(_config["Jwt:ExpiryHours"] ?? "24")),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string HashPassword(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password);

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BCrypt-verifieringsfel");
            return false;
        }
    }
}