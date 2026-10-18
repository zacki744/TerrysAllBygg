namespace Models.Project;
public class DetailedProject
{
    public required Guid Id { get; init; } = Guid.NewGuid();
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required string[] Images { get; init; }
    public string? Category { get; init; }
    public string? Location { get; init; }
    public int? Year { get; init; }
    public string? Scope { get; init; }
}
