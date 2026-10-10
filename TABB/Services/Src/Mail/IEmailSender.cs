namespace Services.Src.Mail;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body, bool isHtml = false);
}
