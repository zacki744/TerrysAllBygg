using System.ComponentModel.DataAnnotations;

namespace Models.Booking;
public class BookingRequest
{
    public required string Name { get; set; }
    [EmailAddress]
    public required string Email { get; set; }
    [Phone]
    public string? PhoneNumber { get; set; }   // optional — matches the frontend form
    public required string Placement { get; set; }
    public string? Other1 { get; set; }
    public required string Project { get; set; }
    public string? Other2 { get; set; }
    public required string Address { get; set; }
    public required string Description { get; set; }

    // Bekräftelse på att integritetsinformationen visats (GDPR art. 13).
    // Rättslig grund är art. 6.1 b, inte samtycke — men formuläret ska inte
    // kunna skickas utan att informationen visats och bekräftats.
    [AllowedValues(true, ErrorMessage = "Integritetspolicyn måste bekräftas.")]
    public bool PrivacyAccepted { get; set; }
}