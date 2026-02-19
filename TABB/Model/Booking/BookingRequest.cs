using System.ComponentModel.DataAnnotations;

namespace Models.Booking;
public class BookingRequest
{
    public required string Name { get; set; }
    [EmailAddress]
    public required string Email { get; set; }
    [Phone]
    public required string PhoneNumber { get; set; }
    public required string Placement { get; set; }
    public string? Otther1 { get; set; }
    public required string Project { get; set; }
    public string? Otther2 { get; set; }
    public required string Address { get; set; }
    public required string Description { get; set; }
}