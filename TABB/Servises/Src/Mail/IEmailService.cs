using Models.Booking;
namespace Services.Src.Mail;
public interface IEmailService
{
    Task SendBookingEmailsAsync(BookingRequest booking);
}