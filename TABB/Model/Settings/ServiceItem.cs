using System.ComponentModel.DataAnnotations;

namespace Models.Settings;

/// <summary>
/// En tjänst på sajten (admin → Tjänster). Blir en egen sida på
/// /tjanster/{Slug} och ett val i bokningsformuläret.
/// </summary>
public class ServiceItem
{
    // Adressen. Ändras inte efter att tjänsten skapats (länkar och Google).
    [Required, RegularExpression("^[a-z0-9]+(-[a-z0-9]+)*$", ErrorMessage = "Adressen får bara innehålla a–z, 0–9 och bindestreck.")]
    [MaxLength(60)]
    public string Slug { get; set; } = "";

    [Required(ErrorMessage = "Tjänsten behöver ett namn."), MaxLength(50)]
    public string Name { get; set; } = "";

    [MaxLength(100)] public string? Detail { get; set; }        // "utomhus och inomhus"
    [MaxLength(120)] public string? Title { get; set; }         // rubrik på sidan
    [MaxLength(170)] public string? Description { get; set; }   // text i Googles sökresultat
    [MaxLength(3000)] public string? Intro { get; set; }        // tom rad = nytt stycke
    [MaxLength(15)] public List<string> Includes { get; set; } = [];
    [MaxLength(1500)] public string? GoodToKnow { get; set; }

    internal void Normalize()
    {
        static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim().Replace("\r\n", "\n");
        Slug = Slug.Trim().ToLowerInvariant();
        Name = Name.Trim();
        Detail = Clean(Detail);
        Title = Clean(Title);
        Description = Clean(Description);
        Intro = Clean(Intro);
        GoodToKnow = Clean(GoodToKnow);
        Includes = [.. Includes.Select(i => i.Trim()).Where(i => i.Length > 0).Select(i => i.Length > 150 ? i[..150] : i)];
    }
}
