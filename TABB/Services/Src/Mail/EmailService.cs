using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Models.Booking;
using Models.Mail;
using Models.Snickeri;
using Services.Src.Logging;

namespace Services.Src.Mail;

public class EmailService : IEmailService
{
    private readonly IEmailSender _sender;
    private readonly SmtpSettings _smtp;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IEmailSender sender,
        IOptions<SmtpSettings> smtpOptions,
        ILogger<EmailService> logger)
    {
        _sender = sender;
        _smtp = smtpOptions.Value;
        _logger = logger;
    }

    public async Task SendBookingEmailsAsync(BookingRequest booking)
    {
        if (string.IsNullOrWhiteSpace(booking.Email))
            throw new ArgumentException("Booking must include a valid email");

        // Adminmejlet ÄR förfrågan (inget sparas i databasen). Misslyckas det
        // ska felet gå vidare så att kunden får veta det.
        await _sender.SendAsync(_smtp.AdminTo, "Ny konsultationsförfrågan",
            EmailTemplate.BookingAdmin(booking), replyTo: booking.Email);

        await TrySendAsync(booking.Email, "Vi har mottagit din förfrågan",
            EmailTemplate.BookingConfirmation(booking.Name));
    }

    public async Task SendSnickeriInquiryAsync(SnickeriInquiryRequest inquiry, DetailedSnickeri snickeri)
    {
        if (string.IsNullOrWhiteSpace(inquiry.Email))
            throw new ArgumentException("Inquiry must include a valid email");

        await _sender.SendAsync(_smtp.AdminTo,
            $"Förfrågan om snickeri: {snickeri.Title}",
            EmailTemplate.SnickeriInquiryAdmin(inquiry, snickeri), replyTo: inquiry.Email);

        await TrySendAsync(inquiry.Email, "Vi har mottagit din förfrågan",
            EmailTemplate.SnickeriInquiryConfirmation(inquiry.Name, snickeri));
    }

    // Inbjudan och återställning skickas utan TrySend: misslyckas de ska admin
    // se ett fel i stället för "skickad" när inget mejl kom fram.
    public Task SendInviteEmailAsync(string toEmail, string inviteLink, int validHours) =>
        _sender.SendAsync(toEmail, "Inbjudan till Terrys Allbygg Admin",
            EmailTemplate.AdminInvite(inviteLink, validHours));

    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, int validHours) =>
        _sender.SendAsync(toEmail, "Återställ ditt lösenord – Terrys Allbygg",
            EmailTemplate.PasswordReset(resetLink, validHours));

    private async Task TrySendAsync(string to, string subject, MailContent content)
    {
        try
        {
            await _sender.SendAsync(to, subject, content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Misslyckades att skicka e-post till {Recipient} med ämne '{Subject}'",
                PiiMask.Email(to), subject);
        }
    }
}