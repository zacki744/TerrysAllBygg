namespace Models.Snickeri;

public class SnickeriInquiryRequest
{
    public required string SnickeriId { get; init; }
    public required string SnickeriTitle { get; init; }
    public required decimal SnickeriPrice { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public string? PhoneNumber { get; init; }
    public string? Notes { get; init; }
}