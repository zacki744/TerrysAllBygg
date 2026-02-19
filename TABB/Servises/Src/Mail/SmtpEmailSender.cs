using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Models.Mail;

namespace Services.Src.Mail;

internal class SmtpEmailSender : IEmailSender
{
    private readonly SmtpSettings _smtp;

    public SmtpEmailSender(IOptions<SmtpSettings> smtpOptions)
    {
        _smtp = smtpOptions.Value;
    }

    public async Task SendAsync(string to, string subject, string body, bool isHtml = false)
    {
        if (string.IsNullOrEmpty(to))
            throw new ArgumentException("Recipient email address is required", nameof(to));
        if (string.IsNullOrEmpty(_smtp.From))
            throw new ArgumentException("SMTP 'From' address is not configured");

        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_smtp.UserName, _smtp.Password)
        };

        using var mail = new MailMessage
        {
            From = new MailAddress(_smtp.From),
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };
        mail.To.Add(to);

        try
        {
            await client.SendMailAsync(mail);
        }
        catch (SmtpException ex)
        {
            Console.WriteLine($"SMTP error sending to {to}: {ex}");
            throw;
        }
    }
}
