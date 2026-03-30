using Microsoft.Extensions.Options;
using Models.Booking;
using Models.Mail;
using Models.Snickeri;

namespace Services.Src.Mail;

public class EmailService : IEmailService
{
    private readonly IEmailSender _sender;
    private readonly SmtpSettings _smtp;

    public EmailService(IEmailSender sender, IOptions<SmtpSettings> smtpOptions)
    {
        _sender = sender;
        _smtp = smtpOptions.Value;
    }

    // ── Booking ────────────────────────────────────────────────

    public async Task SendBookingEmailsAsync(BookingRequest booking)
    {
        if (string.IsNullOrWhiteSpace(booking.Email))
            throw new ArgumentException("Booking must include a valid email");

        await TrySendAsync(
            _smtp.AdminTo,
            "Ny konsultationsförfrågan",
            EmailTemplate.BookingAdmin(booking)
        );

        await TrySendAsync(
            booking.Email,
            "Vi har mottagit din förfrågan",
            EmailTemplate.BookingConfirmation(booking.Name)
        );
    }

    // ── Snickeri inquiry ───────────────────────────────────────

    public async Task SendSnickeriInquiryAsync(SnickeriInquiryRequest inquiry)
    {
        if (string.IsNullOrWhiteSpace(inquiry.Email))
            throw new ArgumentException("Inquiry must include a valid email");

        await TrySendAsync(
            _smtp.AdminTo,
            $"Förfrågan om snickeri: {inquiry.SnickeriTitle}",
            EmailTemplate.SnickeriInquiryAdmin(inquiry)
        );

        await TrySendAsync(
            inquiry.Email,
            "Vi har mottagit din förfrågan",
            EmailTemplate.SnickeriInquiryConfirmation(
                inquiry.Name,
                inquiry.SnickeriTitle,
                inquiry.SnickeriPrice)
        );
    }

    // ── Shared helper ──────────────────────────────────────────

    private async Task TrySendAsync(string to, string subject, string body)
    {
        try
        {
            await _sender.SendAsync(to, subject, body);
        }
        catch (Exception ex)
        {
            // TODO: replace with proper logging (ILogger)
            Console.WriteLine($"Failed to send email to {to}: {ex}");
        }
    }
}