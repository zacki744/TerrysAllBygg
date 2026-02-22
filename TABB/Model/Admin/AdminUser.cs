namespace Models.Admin;
public class AdminUser
{
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string PasswordHash { get; init; }
    public DateTime CreatedAt { get; init; }
}