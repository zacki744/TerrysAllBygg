using Models.Project;

namespace Services.Src.Projects;

public interface IProjectsService
{
    // Public routes
    Task<List<ProjectOverview>> GetOverviewInformationAsync(CancellationToken ct = default);
    Task<DetailedProject?> GetProjectByIdPublicAsync(Guid id, CancellationToken ct = default);


    // Admin routes
    Task<List<ProjectOverview>> GetAllProjectsAdminAsync(CancellationToken ct = default);
    Task<DetailedProject?> GetProjectByIdAsync(Guid id, CancellationToken ct = default);
    Task<Guid> CreateProjectAsync(CreateProjectRequest request, CancellationToken ct = default);
    Task<bool> UpdateProjectAsync(Guid id, UpdateProjectRequest request, CancellationToken ct = default);
    Task<bool> DeleteProjectAsync(Guid id, CancellationToken ct = default);
}