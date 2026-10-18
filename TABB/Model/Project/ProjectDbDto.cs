namespace Models.Project;
public class ProjectDbDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public string? MainImage { get; init; }
    public string? Images { get; init; }  // JSON array as string
    public string? Category { get; init; } // slug, se SiteSettings.Categories
    public string? Location { get; init; }
    public int? Year { get; init; }
    public string? Scope { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

