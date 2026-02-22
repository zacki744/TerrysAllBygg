namespace Models.Project;
public class CreateProjectRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }
}