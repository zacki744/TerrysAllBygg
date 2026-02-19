namespace Models.Mail;
public class SmtpSettings
{
    public required string Host { get; set; }
    public required int Port { get; set; }
    public required string UserName { get; set; }
    public required string Password { get; set; }
    public required string From { get; set; }
    public required string AdminTo { get; set; } = null!;

}