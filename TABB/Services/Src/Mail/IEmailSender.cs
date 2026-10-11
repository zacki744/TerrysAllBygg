namespace Services.Src.Mail;

public interface IEmailSender
{
    // Skickar en text- och en HTML-version (multipart/alternative); klienten väljer.
    // replyTo: när Terry trycker "Svara" går svaret dit (kunden) i stället för till sajtens egen adress.
    Task SendAsync(string to, string subject, MailContent content, string? replyTo = null);
}
