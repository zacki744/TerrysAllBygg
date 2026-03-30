using Models.Booking;
using Models.Snickeri;

namespace Services.Src.Mail;

public interface IEmailService
{
    Task SendBookingEmailsAsync(BookingRequest booking);
    Task SendSnickeriInquiryAsync(SnickeriInquiryRequest inquiry);
}