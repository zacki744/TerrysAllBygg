using System.ComponentModel.DataAnnotations;

namespace Models.Settings;

/// <summary>
/// Webbplatsinställningar som ändras i admin (Inställningar). Null betyder
/// "använd sajtens standardvärde" — standardtexterna finns i
/// frontend/src/lib/settings.ts, så att de bara står på ett ställe.
/// </summary>
public class SiteSettings
{
    // ── Startsidan ────────────────────────────────────────
    [MaxLength(120)] public string? HeroTitle { get; set; }
    [MaxLength(400)] public string? HeroLead { get; set; }

    // Bara bilder som laddats upp via admin (uploads/site/hero-<id>.webp)
    [RegularExpression(@"^/uploads/site/hero-[0-9a-f]{32}\.webp$", ErrorMessage = "Ogiltig bildsökväg.")]
    public string? HeroImage { get; set; }
    [Range(1, 10_000)] public int? HeroImageWidth { get; set; }
    [Range(1, 10_000)] public int? HeroImageHeight { get; set; }
    [MaxLength(200)] public string? HeroImageAlt { get; set; }
    // Vilken del av bilden som ska synas när den beskärs (texten står till höger på dator)
    [RegularExpression("^(left|center|right)$")] public string? HeroImageFocus { get; set; }

    // ── Förtroenderaden — sätt bara det som faktiskt stämmer ──
    public bool TrustRot { get; set; }
    public bool TrustFTax { get; set; }
    public bool TrustInsured { get; set; }

    // ── Omdömen ───────────────────────────────────────────
    public bool ShowReviews { get; set; }
    [MaxLength(300), HttpsUrl] public string? GoogleReviewsUrl { get; set; }

    // ── Kontakt och sociala medier ────────────────────────
    [MaxLength(200)] public string? Address { get; set; }
    [MaxLength(300), HttpsUrl] public string? Facebook { get; set; }
    [MaxLength(300), HttpsUrl] public string? Instagram { get; set; }

    // ── Om oss ────────────────────────────────────────────
    [MaxLength(4000)] public string? AboutStory { get; set; }

    /// <summary>Trimmar texter och gör tomma fält till null (= standardvärde).</summary>
    public void Normalize()
    {
        static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim().Replace("\r\n", "\n");

        HeroTitle        = Clean(HeroTitle);
        HeroLead         = Clean(HeroLead);
        HeroImage        = Clean(HeroImage);
        HeroImageAlt     = Clean(HeroImageAlt);
        HeroImageFocus   = Clean(HeroImageFocus);
        GoogleReviewsUrl = Clean(GoogleReviewsUrl);
        Address          = Clean(Address);
        Facebook         = Clean(Facebook);
        Instagram        = Clean(Instagram);
        AboutStory       = Clean(AboutStory);

        if (HeroImage == null)
            HeroImageWidth = HeroImageHeight = null;

        // Omdömen kan inte visas utan en länk att visa
        if (GoogleReviewsUrl == null)
            ShowReviews = false;
    }
}

/// <summary>Tom eller en absolut https-adress — stoppar t.ex. javascript:-länkar.</summary>
public sealed class HttpsUrlAttribute() : ValidationAttribute("Länken måste vara en fullständig adress som börjar med https://")
{
    public override bool IsValid(object? value) =>
        value is null ||
        (value is string s && (s.Length == 0 ||
            (Uri.TryCreate(s, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps)));
}
