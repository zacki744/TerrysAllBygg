namespace Models.Snickeri;
public class SnickeriDbDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public string? MainImage { get; init; }
    public string? Images { get; init; }  // JSON array as string
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}