using System.ComponentModel.DataAnnotations;

namespace Models.Project;
public class UpdateProjectRequest
{
    [MaxLength(200)]
    public required string Title { get; init; }
    [MaxLength(4000)]
    public required string Description { get; init; }
    [MaxLength(300), RegularExpression(ImagePath.Pattern, ErrorMessage = ImagePath.Error)]
    public string? MainImage { get; init; }
    [MaxLength(20)]
    public List<string>? AdditionalImages { get; init; }

    // Kategori (slug från admin → Inställningar → Kategorier), eller null
    [MaxLength(60), RegularExpression("^[a-z0-9-]+$", ErrorMessage = "Ogiltig kategori.")]
    public string? Category { get; init; }

    // Valfria fakta som visas på projektsidan
    [MaxLength(100)] public string? Location { get; init; }   // "Kivik"
    [Range(1950, 2100, ErrorMessage = "Ange ett årtal, t.ex. 2025.")] public int? Year { get; init; }
    [MaxLength(100)] public string? Scope { get; init; }      // "6 veckor", "ca 40 m²"
}