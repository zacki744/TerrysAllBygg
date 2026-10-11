using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Models.Mail;
using Services.Src.Logging;

namespace Services.Src.Mail;

internal class SmtpEmailSender(IOptions<SmtpSettings> smtpOptions, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    private readonly SmtpSettings _smtp = smtpOptions.Value;
    private readonly ILogger<SmtpEmailSender> _logger = logger;

    public async Task SendAsync(string to, string subject, MailContent content, string? replyTo = null)
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

        // Textversionen är huvuddelen och HTML läggs till som alternativ vy.
        // Det ger multipart/alternative: klienter som visar HTML visar den
        // stylade versionen, övriga (och spamfilter) har en ren text att läsa.
        using var mail = new MailMessage
        {
            From = new MailAddress(_smtp.From, "Terrys Allbygg"),
            Subject = subject,
            SubjectEncoding = Encoding.UTF8,
            Body = content.Text,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = false
        };
        mail.AlternateViews.Add(
            AlternateView.CreateAlternateViewFromString(content.Html, Encoding.UTF8, MediaTypeNames.Text.Html));

        mail.To.Add(to);
        if (!string.IsNullOrWhiteSpace(replyTo))
            mail.ReplyToList.Add(new MailAddress(replyTo));

        try
        {
            await client.SendMailAsync(mail);
            _logger.LogInformation("Email sent to {Recipient} — subject: '{Subject}'", PiiMask.Email(to), subject);
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "SMTP error sending to {Recipient} — subject: '{Subject}'", PiiMask.Email(to), subject);
            throw; // rethrow so EmailService.TrySendAsync can log it at the right level
        }
    }
}