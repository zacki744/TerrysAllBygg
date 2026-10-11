using System.ComponentModel.DataAnnotations;

namespace Models.Booking;
public class BookingRequest
{
    [MaxLength(FormLimits.Name)]
    public required string Name { get; set; }
    [EmailAddress, MaxLength(FormLimits.Email)]
    public required string Email { get; set; }
    // Valfritt fält. Formuläret skickar "" när det lämnas tomt, och [Phone]
    // underkänner tom sträng — därför görs "" om till null här. Utan det gick
    // det inte att skicka en bokning utan telefonnummer (400 Bad Request).
    [Phone, MaxLength(FormLimits.Phone)]
    public string? PhoneNumber
    {
        get => _phoneNumber;
        set => _phoneNumber = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
    private string? _phoneNumber;
    [MaxLength(FormLimits.Choice)]
    public required string Placement { get; set; }
    [MaxLength(FormLimits.ShortText)]
    public string? Other1 { get; set; }
    [MaxLength(FormLimits.Choice)]
    public required string Project { get; set; }
    [MaxLength(FormLimits.ShortText)]
    public string? Other2 { get; set; }
    [MaxLength(FormLimits.ShortText)]
    public required string Address { get; set; }
    [MaxLength(FormLimits.LongText)]
    public required string Description { get; set; }

    // Honeypot: dolt fält som människor aldrig ser. Är det ifyllt är det en bot,
    // och förfrågan kastas tyst (svaret ser ut som ett lyckat anrop).
    public string? Website { get; set; }

    // Bekräftelse på att integritetsinformationen visats (GDPR art. 13).
    // Rättslig grund är art. 6.1 b, inte samtycke — men formuläret ska inte
    // kunna skickas utan att informationen visats och bekräftats.
    [AllowedValues(true, ErrorMessage = "Integritetspolicyn måste bekräftas.")]
    public bool PrivacyAccepted { get; set; }
}