using Microsoft.Extensions.Options;
using Models.Booking;
using Models.Mail;

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

    public async Task SendBookingEmailsAsync(BookingRequest booking)
    {
        if (string.IsNullOrWhiteSpace(booking.Email))
            throw new ArgumentException("Booking must include a valid email");

        // Send admin notification
        try
        {
            await _sender.SendAsync(
                _smtp.AdminTo,
                "New booking request",
                EmailTemplate.BookingAdmin(booking)
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send admin email: {ex}");
        }

        // Send confirmation to user
        try
        {
            await _sender.SendAsync(
                booking.Email,
                "We received your booking request",
                EmailTemplate.BookingConfirmation(booking.Name)
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send confirmation email: {ex}");
        }
    }
}
