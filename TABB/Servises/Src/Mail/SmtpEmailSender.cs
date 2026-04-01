using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Models.Mail;

namespace Services.Src.Mail;

internal class SmtpEmailSender(IOptions<SmtpSettings> smtpOptions, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    private readonly SmtpSettings _smtp = smtpOptions.Value;
    private readonly ILogger<SmtpEmailSender> _logger = logger;

    public async Task SendAsync(string to, string subject, string body, bool isHtml = false)
    {
        if (string.IsNullOrEmpty(to))
            throw new ArgumentException("Recipient email address is required", nameof(to));

        if (string.IsNullOrEmpty(_smtp.From))
            throw new InvalidOperationException("SMTP 'From' address is not configured");

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
            _logger.LogInformation("Email sent to {Recipient} — subject: '{Subject}'", to, subject);
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "SMTP error sending to {Recipient} — subject: '{Subject}'", to, subject);
            throw; // rethrow so EmailService.TrySendAsync can log it at the right level
        }
    }
}