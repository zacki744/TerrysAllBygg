using System.ComponentModel.DataAnnotations;

namespace Models.Snickeri;
public class CreateSnickeriRequest
{
    [MaxLength(200)]
    public required string Title { get; init; }
    [MaxLength(4000)]
    public required string Description { get; init; }
    // Pris inklusive moms (prisinformationslagen)
    [Range(0, 10_000_000, ErrorMessage = "Priset måste vara mellan 0 och 10 000 000 kr.")]
    public required decimal Price { get; init; }
    [MaxLength(300), RegularExpression(ImagePath.Pattern, ErrorMessage = ImagePath.Error)]
    public string? MainImage { get; init; }
    [MaxLength(20)]
    public List<string>? AdditionalImages { get; init; }
}