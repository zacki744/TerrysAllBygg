namespace Models.Snickeri;
public class CreateSnickeriRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }
}