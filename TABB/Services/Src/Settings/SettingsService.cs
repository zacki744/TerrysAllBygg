using System.Text.Json;
using Microsoft.Extensions.Logging;
using Models.Settings;
using Services.Src.DB;

namespace Services.Src.Settings;

public interface ISettingsService
{
    Task<SiteSettings> GetAsync(CancellationToken ct = default);
    Task<SiteSettings> SaveAsync(SiteSettings settings, CancellationToken ct = default);
}

/// <summary>Raden i site_settings: hela inställningsobjektet som JSON.</summary>
public sealed class SettingsRow
{
    public int Id { get; set; }
    public string Data { get; set; } = "";
    public DateTime Updated { get; set; }
}

/// <summary>
/// Delad cache (singleton). Inställningarna läses på varje sidvisning men
/// ändras sällan, så en minuts cache sparar databasanrop. Sparande uppdaterar
/// cachen direkt.
/// </summary>
public sealed class SettingsCache
{
    internal sealed record Entry(SiteSettings Value, DateTime At);
    private volatile Entry? _entry;

    internal Entry? Current => _entry;
    internal void Set(SiteSettings value) => _entry = new Entry(value, DateTime.UtcNow);
}

public sealed class SettingsService(IDatabase db, SettingsCache cache, ILogger<SettingsService> logger) : ISettingsService
{
    private const string Table = "site_settings";
    private const int RowId = 1;   // en enda rad
    private static readonly TimeSpan CacheTime = TimeSpan.FromMinutes(1);
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<SiteSettings> GetAsync(CancellationToken ct = default)
    {
        var cached = cache.Current;
        if (cached != null && DateTime.UtcNow - cached.At < CacheTime)
            return cached.Value;

        SiteSettings settings;
        try
        {
            var row = await db.ReadSingleAsync<SettingsRow>(Table, new { Id = RowId }, ct);
            settings = row == null ? new SiteSettings() : Deserialize(row.Data);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Sajten ska fungera även om tabellen inte är skapad än — då
            // gäller standardvärdena. Felet cachas i en minut så loggen inte svämmar över.
            logger.LogError(ex, "Kunde inte läsa {Table} — standardvärden används. Är tabellen skapad (TABB/db/site_settings.sql)?", Table);
            settings = new SiteSettings();
        }

        cache.Set(settings);
        return settings;
    }

    public async Task<SiteSettings> SaveAsync(SiteSettings settings, CancellationToken ct = default)
    {
        settings.Normalize();
        var data = JsonSerializer.Serialize(settings, Json);
        var now = DateTime.UtcNow;

        var existing = await db.ReadSingleAsync<SettingsRow>(Table, new { Id = RowId }, ct);
        if (existing == null)
            await db.InsertAsync(Table, new SettingsRow { Id = RowId, Data = data, Updated = now }, ct);
        else
            await db.UpdateAsync(Table, new { Id = RowId }, new { Data = data, Updated = now }, ct);

        cache.Set(settings);
        logger.LogInformation("Webbplatsinställningar sparade");
        return settings;
    }

    private SiteSettings Deserialize(string data)
    {
        try
        {
            return JsonSerializer.Deserialize<SiteSettings>(data, Json) ?? new SiteSettings();
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Ogiltig JSON i {Table} — standardvärden används", Table);
            return new SiteSettings();
        }
    }
}
