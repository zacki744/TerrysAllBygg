using Models.Snickeri;
using Services.Src.DB;
using System.Text.Json;

namespace Services.Src.Snickerier;

public class SnickeriService(IDatabase db) : ISnickeriService
{
    private readonly IDatabase _db = db;

    // ── Public ──────────────────────────────────────────────

    public async Task<List<SnickeriOverview>> GetOverviewAsync(CancellationToken ct = default)
    {
        var rows = await _db.ReadAsync<SnickeriDbDto>("snickerier", null, ct);

        return [.. rows.Select(s => new SnickeriOverview
        {
            Id = Guid.Parse(s.Id),
            Title = s.Title,
            Description = s.Description,
            Price = s.Price,
            Image = s.MainImage ?? "/placeholder.jpg"
        })];
    }

    public async Task<DetailedSnickeri?> GetByIdPublicAsync(Guid id, CancellationToken ct = default)
    {
        return await GetByIdAsync(id, ct);
    }

    // ── Admin ────────────────────────────────────────────────

    public async Task<List<SnickeriOverview>> GetAllAdminAsync(CancellationToken ct = default)
    {
        return await GetOverviewAsync(ct);
    }

    public async Task<DetailedSnickeri?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var row = await _db.ReadSingleAsync<SnickeriDbDto>(
            "snickerier",
            new { Id = id.ToString() },
            ct
        );

        if (row == null)
            return null;

        var allImages = new List<string>();
        if (!string.IsNullOrEmpty(row.MainImage))
            allImages.Add(row.MainImage);

        if (!string.IsNullOrEmpty(row.Images))
        {
            try
            {
                var additional = JsonSerializer.Deserialize<List<string>>(row.Images);
                if (additional != null)
                    allImages.AddRange(additional);
            }
            catch
            {
                // Ignore malformed JSON
            }
        }

        return new DetailedSnickeri
        {
            Id = Guid.Parse(row.Id),
            Title = row.Title,
            Description = row.Description,
            Price = row.Price,
            Images = allImages.ToArray()
        };
    }

    public async Task<Guid> CreateAsync(CreateSnickeriRequest request, CancellationToken ct = default)
    {
        var id = Guid.NewGuid();

        string? imagesJson = null;
        if (request.AdditionalImages != null && request.AdditionalImages.Count != 0)
            imagesJson = JsonSerializer.Serialize(request.AdditionalImages);

        var dto = new
        {
            Id = id.ToString(),
            request.Title,
            request.Description,
            request.Price,
            request.MainImage,
            Images = imagesJson
        };

        await _db.InsertAsync("snickerier", dto, ct);

        return id;
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateSnickeriRequest request, CancellationToken ct = default)
    {
        string? imagesJson = null;
        if (request.AdditionalImages != null && request.AdditionalImages.Any())
            imagesJson = JsonSerializer.Serialize(request.AdditionalImages);

        var dto = new
        {
            request.Title,
            request.Description,
            request.Price,
            request.MainImage,
            Images = imagesJson
        };

        var rowsAffected = await _db.UpdateAsync(
            "snickerier",
            new { Id = id.ToString() },
            dto,
            ct
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var rowsAffected = await _db.DeleteAsync(
            "snickerier",
            new { Id = id.ToString() },
            ct
        );

        return rowsAffected > 0;
    }
}
