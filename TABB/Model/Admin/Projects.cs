using System.Text.Json;

namespace Models.Project;

public class ProjectDbDto
{
    public required string Id { get; init; }
    public required string Href { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public string? MainImage { get; init; }
    public string? Images { get; init; }  // JSON array as string
    public required DateOnly ConstructionDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class CreateProjectRequest
{
    public required string Href { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required DateOnly ConstructionDate { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }
}

public class UpdateProjectRequest
{
    public required string Href { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required DateOnly ConstructionDate { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }
}