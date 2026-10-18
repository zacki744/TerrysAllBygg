using System.ComponentModel.DataAnnotations;

namespace Models.Settings;

/// <summary>
/// En kategori av arbeten (admin → Inställningar → Kategorier). Används som
/// etikett på projekt, filter på projektsidan, val i bokningsformuläret och
/// i listan "Det här bygger vi" på startsidan.
/// </summary>
public class CategoryItem
{
    // Används i filter-länkar (/projekt?kategori=altaner). Ändras inte efter att kategorin sparats.
    [Required, MaxLength(60)]
    [RegularExpression("^[a-z0-9]+(-[a-z0-9]+)*$", ErrorMessage = "Adressen får bara innehålla a–z, 0–9 och bindestreck.")]
    public string Slug { get; set; } = "";

    [Required(ErrorMessage = "Kategorin behöver ett namn."), MaxLength(50)]
    public string Name { get; set; } = "";

    [MaxLength(100)]
    public string? Detail { get; set; }   // "och uteplatser" — står efter namnet i listor

    internal void Normalize()
    {
        Slug = Slug.Trim().ToLowerInvariant();
        Name = Name.Trim();
        Detail = string.IsNullOrWhiteSpace(Detail) ? null : Detail.Trim();
    }
}
