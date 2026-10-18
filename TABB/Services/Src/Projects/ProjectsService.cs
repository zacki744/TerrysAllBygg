using Models.Project;
using Services.Src.DB;
using System.Text.Json;

namespace Services.Src.Projects;

public class ProjectsService(IDatabase db) : IProjectsService
{
    private readonly IDatabase _db = db;

    // Visas om ett projekt saknar bild (delningsbilden finns alltid)
    internal const string NoImage = "/og-image.jpg";

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    // Public routes
    public async Task<List<ProjectOverview>> GetOverviewInformationAsync(CancellationToken ct = default)
    {
        var projects = await _db.ReadAsync<ProjectDbDto>("projects", null, ct);

        return [.. projects.Select(p => new ProjectOverview
        {
            Id = Guid.Parse(p.Id),
            Title = p.Title,
            Description = p.Description,
            Image = p.MainImage ?? NoImage,
            Category = p.Category,
            Location = p.Location,
        })];
    }

    // Add this public method
    public async Task<DetailedProject?> GetProjectByIdPublicAsync(Guid id, CancellationToken ct = default)
    {
        return await GetProjectByIdAsync(id, ct);
    }

    // Admin routes
    public async Task<List<ProjectOverview>> GetAllProjectsAdminAsync(CancellationToken ct = default)
    {
        return await GetOverviewInformationAsync(ct);
    }

    public async Task<DetailedProject?> GetProjectByIdAsync(Guid id, CancellationToken ct = default)
    {
        var project = await _db.ReadSingleAsync<ProjectDbDto>(
            "projects",
            new { Id = id.ToString() },
            ct
        );

        if (project == null)
            return null;

        // Combine MainImage + Images JSON array
        var allImages = new List<string>();
        if (!string.IsNullOrEmpty(project.MainImage))
            allImages.Add(project.MainImage);

        if (!string.IsNullOrEmpty(project.Images))
        {
            try
            {
                var additionalImages = JsonSerializer.Deserialize<List<string>>(project.Images);
                if (additionalImages != null)
                    allImages.AddRange(additionalImages);
            }
            catch
            {
                // If JSON parse fails, ignore
            }
        }

        return new DetailedProject
        {
            Id = Guid.Parse(project.Id),
            Title = project.Title,
            Description = project.Description,
            Images = [.. allImages],
            Category = project.Category,
            Location = project.Location,
            Year = project.Year,
            Scope = project.Scope,
        };
    }

    public async Task<Guid> CreateProjectAsync(CreateProjectRequest request, CancellationToken ct = default)
    {
        var id = Guid.NewGuid();

        // Serialize additional images to JSON
        string? imagesJson = null;
        if (request.AdditionalImages != null && request.AdditionalImages.Any())
        {
            imagesJson = JsonSerializer.Serialize(request.AdditionalImages);
        }

        var dto = new
        {
            Id = id.ToString(),
            request.Title,
            request.Description,
            request.MainImage,
            Images = imagesJson,
            Category = Clean(request.Category),
            Location = Clean(request.Location),
            request.Year,
            Scope = Clean(request.Scope),
        };

        await _db.InsertAsync("projects", dto, ct);

        return id;
    }

    public async Task<bool> UpdateProjectAsync(Guid id, UpdateProjectRequest request, CancellationToken ct = default)
    {
        // Serialize additional images to JSON
        string? imagesJson = null;
        if (request.AdditionalImages != null && request.AdditionalImages.Count != 0)
        {
            imagesJson = JsonSerializer.Serialize(request.AdditionalImages);
        }

        var dto = new
        {
            request.Title,
            request.Description,
            request.MainImage,
            Images = imagesJson,
            Category = Clean(request.Category),
            Location = Clean(request.Location),
            request.Year,
            Scope = Clean(request.Scope),
        };

        var rowsAffected = await _db.UpdateAsync(
            "projects",
            new { Id = id.ToString() },
            dto,
            ct
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteProjectAsync(Guid id, CancellationToken ct = default)
    {
        var rowsAffected = await _db.DeleteAsync(
            "projects",
            new { Id = id.ToString() },
            ct
        );

        return rowsAffected > 0;
    }
}