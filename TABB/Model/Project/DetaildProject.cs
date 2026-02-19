namespace Models.Project;
public class DetaildProject
{
    public required Guid Id { get; init; } = Guid.NewGuid();
    public required string Herf { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required DateOnly ConstructionDate { get; init; }
    public required string[] Images { get; init; }
}
