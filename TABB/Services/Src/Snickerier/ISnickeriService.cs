using Models.Snickeri;

namespace Services.Src.Snickerier;

public interface ISnickeriService
{
    // Public
    Task<List<SnickeriOverview>> GetOverviewAsync(CancellationToken ct = default);
    Task<DetailedSnickeri?> GetByIdPublicAsync(Guid id, CancellationToken ct = default);

    // Admin
    Task<List<SnickeriOverview>> GetAllAdminAsync(CancellationToken ct = default);
    Task<DetailedSnickeri?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Guid> CreateAsync(CreateSnickeriRequest request, CancellationToken ct = default);
    Task<bool> UpdateAsync(Guid id, UpdateSnickeriRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
