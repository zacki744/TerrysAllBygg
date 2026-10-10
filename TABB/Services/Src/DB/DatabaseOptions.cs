namespace Services.Src.DB;

public sealed class DatabaseOptions
{
    public string Host { get; init; } = "";
    public int Port { get; init; } = 3306;
    public string Username { get; init; } = "";
    public string Password { get; init; } = "";
    public string Database { get; init; } = "";
}