using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models.Admin;
using Services.Src.DB;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services.Src.Auth;

public class AuthService(IDatabase db, IConfiguration config) : IAuthService
{
    private readonly IDatabase _db = db;
    private readonly IConfiguration _config = config;

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        // Find user by username
        var user = await _db.ReadSingleAsync<AdminUser>(
            "admin_users",
            new {request.Username },  // Changed to explicitly use property name
            ct
        );

        // Check if user exists
        if (user == null)
        {
            Console.WriteLine($"User not found: {request.Username}");
            return null;
        }

        // Check if password hash is null
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            Console.WriteLine($"Password hash is null for user: {request.Username}");
            return null;
        }

        // Verify password
        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            Console.WriteLine($"Invalid password for user: {request.Username}");
            return null;
        }

        var token = GenerateJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            Username = user.Username
        };
    }

    public string GenerateJwtToken(AdminUser user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"))
        );

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, "Admin")
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

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"BCrypt verification error: {ex.Message}");
            return false;
        }
    }
}