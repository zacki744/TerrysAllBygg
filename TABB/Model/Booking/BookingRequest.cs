using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Models.Booking;
public class BookingRequest
{
    public required string Name { get; set; }
    [EmailAddress]
    public required string Email { get; set; }
    [Phone]
    public string? PhoneNumber { get; set; }   // optional — matches the frontend form
    public required string Placement { get; set; }
    [JsonPropertyName("other1")]   // frontend skickar "other1"
    public string? Otther1 { get; set; }
    public required string Project { get; set; }
    [JsonPropertyName("other2")]   // frontend skickar "other2"
    public string? Otther2 { get; set; }
    public required string Address { get; set; }
    public required string Description { get; set; }

    // Bekräftelse på att integritetsinformationen visats (GDPR art. 13).
    // Rättslig grund är art. 6.1 b, inte samtycke — men formuläret ska inte
    // kunna skickas utan att informationen visats och bekräftats.
    [AllowedValues(true, ErrorMessage = "Integritetspolicyn måste bekräftas.")]
    public bool PrivacyAccepted { get; set; }
}