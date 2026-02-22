namespace Models.Admin;
public class LoginResponse
{
    public required string Token { get; init; }
    public required string Username { get; init; }
}