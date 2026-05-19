using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Models.Booking;
using Models.Mail;
using Models.Snickeri;

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

        await TrySendAsync(_smtp.AdminTo, "Ny konsultationsförfrågan",
            EmailTemplate.BookingAdmin(booking));

        await TrySendAsync(booking.Email, "Vi har mottagit din förfrågan",
            EmailTemplate.BookingConfirmation(booking.Name));
    }

    public async Task SendSnickeriInquiryAsync(SnickeriInquiryRequest inquiry)
    {
        if (string.IsNullOrWhiteSpace(inquiry.Email))
            throw new ArgumentException("Inquiry must include a valid email");

        await TrySendAsync(_smtp.AdminTo,
            $"Förfrågan om snickeri: {inquiry.SnickeriTitle}",
            EmailTemplate.SnickeriInquiryAdmin(inquiry));

        await TrySendAsync(inquiry.Email, "Vi har mottagit din förfrågan",
            EmailTemplate.SnickeriInquiryConfirmation(
                inquiry.Name, inquiry.SnickeriTitle, inquiry.SnickeriPrice));
    }

    public async Task SendInviteEmailAsync(string toEmail, string inviteLink)
    {
        await TrySendAsync(
            toEmail,
            "Inbjudan till Terrys All Bygg Admin",
            EmailTemplate.AdminInvite(inviteLink)
        );
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        await TrySendAsync(
            toEmail,
            "Återställ ditt lösenord – Terrys All Bygg",
            EmailTemplate.PasswordReset(resetLink)
        );
    }

    private async Task TrySendAsync(string to, string subject, string body)
    {
        try
        {
            await _sender.SendAsync(to, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Misslyckades att skicka e-post till {Recipient} med ämne '{Subject}'",
                to, subject);
        }
    }
}