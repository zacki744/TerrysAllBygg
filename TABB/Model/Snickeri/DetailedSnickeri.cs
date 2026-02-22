namespace Models.Snickeri;
public class DetailedSnickeri
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public required string[] Images { get; init; }
}