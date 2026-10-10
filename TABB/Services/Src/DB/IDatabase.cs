namespace Services.Src.DB;

public interface IDatabase
{
    Task<IReadOnlyList<TDto>> ReadAsync<TDto>(
        string table,
        object? where = null,
        CancellationToken ct = default);

    Task<TDto?> ReadSingleAsync<TDto>(
        string table,
        object where,
        CancellationToken ct = default);

    Task<int> InsertAsync<TDto>(
        string table,
        TDto dto,
        CancellationToken ct = default);

    Task<int> DeleteAsync(
        string table,
        object where,
        CancellationToken ct = default);

    Task<int> UpdateAsync<TDto>(
        string table,
        object where,
        TDto dto,
        CancellationToken ct = default);
}
