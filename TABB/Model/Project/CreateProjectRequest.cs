using System.ComponentModel.DataAnnotations;

namespace Models.Project;
public class CreateProjectRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public string? MainImage { get; init; }
    public List<string>? AdditionalImages { get; init; }

    // Tjänsten projektet hör till (slug från Inställningar → Tjänster), eller null
    [MaxLength(60), RegularExpression("^[a-z0-9-]+$", ErrorMessage = "Ogiltig tjänst.")]
    public string? Service { get; init; }
}