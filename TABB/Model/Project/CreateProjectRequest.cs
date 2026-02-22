namespace Models.Admin;
public class CreateProjectRequest
{
    public required string Href { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required DateOnly ConstructionDate { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }
}