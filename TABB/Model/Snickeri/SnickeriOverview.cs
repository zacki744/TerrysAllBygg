namespace Models.Snickeri;
public class SnickeriOverview
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public required string Image { get; init; }
}