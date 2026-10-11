// IEmailService.cs
using Models.Booking;
using Models.Snickeri;

namespace Services.Src.Mail;

public interface IEmailService
{
    Task SendBookingEmailsAsync(BookingRequest booking);   // kastar om adminmejlet misslyckas
    // Kastar om mejlet till admin inte går iväg — då ska kunden få ett fel och
    // uppmanas ringa, i stället för ett "Skickat!" som ingen läser.
    Task SendSnickeriInquiryAsync(SnickeriInquiryRequest inquiry, DetailedSnickeri snickeri);
    Task SendInviteEmailAsync(string toEmail, string inviteLink);
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}