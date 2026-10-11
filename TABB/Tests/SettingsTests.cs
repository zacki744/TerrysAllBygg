using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging.Abstractions;
using Models.Settings;
using Services.Src.DB;
using Services.Src.Settings;

namespace Tests;

public class SettingsTests
{
    private static List<string> Invalid(SiteSettings s)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(s, new ValidationContext(s), results, validateAllProperties: true);
        return results.SelectMany(r => r.MemberNames).ToList();
    }

    [Theory]
    [InlineData("https://g.page/r/abc", true)]
    [InlineData("", true)]
    [InlineData("http://g.page/r/abc", false)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("g.page/r/abc", false)]
    public void Länkar_måste_vara_https(string url, bool valid)
        => Assert.Equal(valid, !Invalid(new SiteSettings { GoogleReviewsUrl = url }).Any());

    [Theory]
    [InlineData("/uploads/site/hero-0123456789abcdef0123456789abcdef.webp", true)]
    [InlineData("/uploads/projects/hero-0123456789abcdef0123456789abcdef.webp", false)]
    [InlineData("https://example.com/bild.webp", false)]
    [InlineData("/uploads/site/../appsettings.json", false)]
    public void Herobild_måste_vara_en_uppladdad_bild(string path, bool valid)
        => Assert.Equal(valid, !Invalid(new SiteSettings { HeroImage = path }).Any());

    [Fact]
    public void Normalize_gör_tomma_fält_till_standardvärden()
    {
        var s = new SiteSettings
        {
            HeroTitle = "   ", AboutStory = " Rad ett\r\n\r\nRad två ",
            HeroImageWidth = 1920, ShowReviews = true, GoogleReviewsUrl = "",
        };
        s.Normalize();

        Assert.Null(s.HeroTitle);
        Assert.Equal("Rad ett\n\nRad två", s.AboutStory);
        Assert.Null(s.HeroImageWidth);   // ingen bild → inga mått
        Assert.False(s.ShowReviews);     // omdömen kräver en länk
    }

    // ── SettingsService mot en databas i minnet ──

    private sealed class FakeDb : IDatabase
    {
        public SettingsRow? Row;
        public bool Fail;

        public Task<TDto?> ReadSingleAsync<TDto>(string table, object where, CancellationToken ct = default)
            => Fail ? throw new InvalidOperationException("Table doesn't exist") : Task.FromResult((TDto?)(object?)Row);

        public Task<int> InsertAsync<TDto>(string table, TDto dto, CancellationToken ct = default)
        {
            Row = (SettingsRow)(object)dto!;
            return Task.FromResult(1);
        }

        public Task<int> UpdateAsync<TDto>(string table, object where, TDto dto, CancellationToken ct = default)
        {
            Row!.Data = (string)dto!.GetType().GetProperty("Data")!.GetValue(dto)!;
            return Task.FromResult(1);
        }

        public Task<IReadOnlyList<TDto>> ReadAsync<TDto>(string table, object? where = null, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<int> DeleteAsync(string table, object where, CancellationToken ct = default) => throw new NotImplementedException();
    }

    private static SettingsService Service(FakeDb db, SettingsCache? cache = null)
        => new(db, cache ?? new SettingsCache(), NullLogger<SettingsService>.Instance);

    [Fact]
    public async Task Sparade_inställningar_läses_tillbaka()
    {
        var db = new FakeDb();
        await Service(db).SaveAsync(new SiteSettings { HeroTitle = "Nya altaner", TrustFTax = true });
        await Service(db).SaveAsync(new SiteSettings { HeroTitle = "Ännu nyare", TrustFTax = true });   // uppdatering

        var read = await Service(db).GetAsync();   // ny cache → läser från "databasen"
        Assert.Equal("Ännu nyare", read.HeroTitle);
        Assert.True(read.TrustFTax);
        Assert.Contains("\"heroTitle\"", db.Row!.Data);   // camelCase som API:t
    }

    [Fact]
    public async Task Saknad_tabell_ger_standardvärden_i_stället_för_fel()
    {
        var settings = await Service(new FakeDb { Fail = true }).GetAsync();
        Assert.Null(settings.HeroTitle);
        Assert.False(settings.ShowReviews);
    }

    [Fact]
    public async Task Sparande_uppdaterar_cachen_direkt()
    {
        var db = new FakeDb();
        var cache = new SettingsCache();
        await Service(db, cache).GetAsync();                                     // cachar tomma värden
        await Service(db, cache).SaveAsync(new SiteSettings { Address = "Storgatan 1" });

        Assert.Equal("Storgatan 1", (await Service(db, cache).GetAsync()).Address);
    }
}
