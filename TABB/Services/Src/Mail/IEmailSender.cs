namespace Services.Src.Mail;

public interface IEmailSender
{
    // replyTo: när Terry trycker "Svara" går svaret dit (kunden) i stället för till sajtens egen adress.
    Task SendAsync(string to, string subject, string body, bool isHtml = false, string? replyTo = null);
}
