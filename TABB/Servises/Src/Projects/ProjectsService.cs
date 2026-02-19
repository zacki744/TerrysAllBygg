using Models.Project;
using Services.Src.DB;
using System.Text.Json;

namespace Services.Src.Projects;

public class ProjectsService : IProjectsService
{
    private readonly IDatabase _db;

    public ProjectsService(IDatabase db)
    {
        _db = db;
    }

    // Public routes
    public async Task<List<ProjectOverview>> GetOverviewInformationAsync(CancellationToken ct = default)
    {
        var projects = await _db.ReadAsync<ProjectDbDto>("projects", null, ct);

        return projects.Select(p => new ProjectOverview
        {
            Id = Guid.Parse(p.Id),
            Herf = p.Href,
            Title = p.Title,
            Description = p.Description,
            Image = p.MainImage ?? "/placeholder.jpg"
        }).ToList();
    }

    // Add this public method
    public async Task<DetaildProject?> GetProjectByIdPublicAsync(Guid id, CancellationToken ct = default)
    {
        return await GetProjectByIdAsync(id, ct);
    }

    // Admin routes
    public async Task<List<ProjectOverview>> GetAllProjectsAdminAsync(CancellationToken ct = default)
    {
        return await GetOverviewInformationAsync(ct);
    }

    public async Task<DetaildProject?> GetProjectByIdAsync(Guid id, CancellationToken ct = default)
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

        return new DetaildProject
        {
            Id = Guid.Parse(project.Id),
            Herf = project.Href,
            Title = project.Title,
            Description = project.Description,
            ConstructionDate = project.ConstructionDate,
            Images = allImages.ToArray()
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
            request.Href,
            request.Title,
            request.Description,
            request.ConstructionDate,
            request.MainImage,
            Images = imagesJson
        };

        await _db.InsertAsync("projects", dto, ct);

        return id;
    }

    public async Task<bool> UpdateProjectAsync(Guid id, UpdateProjectRequest request, CancellationToken ct = default)
    {
        // Serialize additional images to JSON
        string? imagesJson = null;
        if (request.AdditionalImages != null && request.AdditionalImages.Any())
        {
            imagesJson = JsonSerializer.Serialize(request.AdditionalImages);
        }

        var dto = new
        {
            Href = request.Href,
            Title = request.Title,
            Description = request.Description,
            ConstructionDate = request.ConstructionDate,
            MainImage = request.MainImage,
            Images = imagesJson
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