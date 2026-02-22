namespace Models.Snickeri;
public class UpdateSnickeriRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }
}