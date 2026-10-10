using API.Controllers;

namespace Tests;

/// <summary>
/// Samma fall som frontend/src/lib/routes.test.ts — sitemapen och
/// frontend måste bygga identiska URL:er, annars pekar sitemapen fel.
/// </summary>
public class SlugifyTests
{
    [Theory]
    [InlineData("Utomhusbastu i lärk", "utomhusbastu-i-lark")]
    [InlineData("Förråd & Garage", "forrad-garage")]
    [InlineData("Ölands Café", "olands-cafe")]
    [InlineData("  --Bänk i ek!--  ", "bank-i-ek")]
    [InlineData("Altan med pergola", "altan-med-pergola")]
    public void Slugify_matchar_frontend(string title, string expected)
        => Assert.Equal(expected, SitemapController.Slugify(title));

    [Fact]
    public void Slugify_kortar_till_60_tecken()
        => Assert.Equal(60, SitemapController.Slugify(new string('a', 100)).Length);
}
