using System.ComponentModel.DataAnnotations;

namespace Models.Snickeri;

public class SnickeriInquiryRequest
{
    // Bara id skickas — titel och pris slås upp i databasen, så att ingen kan
    // skicka en förfrågan på "Hammock – 1 kr".
    public required Guid SnickeriId { get; init; }
    [MaxLength(FormLimits.Name)]
    public required string Name { get; init; }
    [EmailAddress, MaxLength(FormLimits.Email)]
    public required string Email { get; init; }
    // Se BookingRequest.PhoneNumber — tom sträng blir null.
    [Phone, MaxLength(FormLimits.Phone)]
    public string? PhoneNumber
    {
        get => _phoneNumber;
        init => _phoneNumber = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
    private readonly string? _phoneNumber;
    [MaxLength(FormLimits.LongText)]
    public string? Notes { get; init; }

    // Se BookingRequest.Website
    public string? Website { get; init; }

    // Se BookingRequest.PrivacyAccepted
    [AllowedValues(true, ErrorMessage = "Integritetspolicyn måste bekräftas.")]
    public bool PrivacyAccepted { get; init; }
}