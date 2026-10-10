using System.Reflection;
using Dapper;

namespace Services.Src.DB;

public sealed class MySqlDatabase(IDbConnectionFactory factory) : IDatabase
{
    private readonly IDbConnectionFactory _factory = factory;

    // Tabellnamn kan inte skickas som SQL-parametrar och interpoleras därför
    // in i frågan. Vitlistan gör att bara kända tabeller kan nås, även om ett
    // framtida anrop skulle råka skicka in ett namn från användaren.
    // Lägg till nya tabeller här när de skapas.
    private static readonly HashSet<string> AllowedTables = new(StringComparer.Ordinal)
    {
        "projects",
        "snickerier",
        "admin_users",
        "admin_invitations",
        "password_reset_tokens",
    };

    private static string QuoteTable(string table)
    {
        if (!AllowedTables.Contains(table))
            throw new ArgumentException($"Okänd tabell: '{table}'", nameof(table));

        return $"`{table}`";
    }

    public async Task<IReadOnlyList<TDto>> ReadAsync<TDto>(
        string table,
        object? where = null,
        CancellationToken ct = default)
    {
        var (whereSql, parameters) = SqlWhere(where);

        var sql = $"SELECT * FROM {QuoteTable(table)} {whereSql};";

        using var conn = await _factory.CreateOpenConnectionAsync(ct);
        var rows = await conn.QueryAsync<TDto>(new CommandDefinition(sql, parameters, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<TDto?> ReadSingleAsync<TDto>(
        string table,
        object where,
        CancellationToken ct = default)
    {
        var (whereSql, parameters) = SqlWhere(where);
        var sql = $"SELECT * FROM {QuoteTable(table)} {whereSql} LIMIT 1;";

        using var conn = await _factory.CreateOpenConnectionAsync(ct);
        return await conn.QueryFirstOrDefaultAsync<TDto>(
            new CommandDefinition(sql, parameters, cancellationToken: ct));
    }

    public async Task<int> InsertAsync<TDto>(
        string table,
        TDto dto,
        CancellationToken ct = default)
    {
        var props = GetDtoProps(dto);

        var columns = string.Join(", ", props.Select(p => $"`{p.Name}`"));
        var values = string.Join(", ", props.Select(p => $"@{p.Name}"));

        var sql = $"INSERT INTO {QuoteTable(table)} ({columns}) VALUES ({values});";

        using var conn = await _factory.CreateOpenConnectionAsync(ct);
        return await conn.ExecuteAsync(new CommandDefinition(sql, dto, cancellationToken: ct));
    }

    public async Task<int> UpdateAsync<TDto>(
        string table,
        object where,
        TDto dto,
        CancellationToken ct = default)
    {
        var props = GetDtoProps(dto);
        var setSql = string.Join(", ", props.Select(p => $"`{p.Name}`=@{p.Name}"));

        var (whereSql, whereParams) = SqlWhere(where);

        // merge dto + where params
        var parameters = new DynamicParameters(dto);
        foreach (var name in whereParams.ParameterNames)
            parameters.Add(name, whereParams.Get<object>(name));

        var sql = $"UPDATE {QuoteTable(table)} SET {setSql} {whereSql};";

        using var conn = await _factory.CreateOpenConnectionAsync(ct);
        return await conn.ExecuteAsync(new CommandDefinition(sql, parameters, cancellationToken: ct));
    }

    public async Task<int> DeleteAsync(
        string table,
        object where,
        CancellationToken ct = default)
    {
        var (whereSql, parameters) = SqlWhere(where);
        var sql = $"DELETE FROM {QuoteTable(table)} {whereSql};";

        using var conn = await _factory.CreateOpenConnectionAsync(ct);
        return await conn.ExecuteAsync(new CommandDefinition(sql, parameters, cancellationToken: ct));
    }

    private static (string whereSql, DynamicParameters parameters) SqlWhere(object? where)
    {
        if (where is null) return ("", new DynamicParameters());

        var props = where.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
        if (props.Length == 0) return ("", new DynamicParameters());

        var parts = props.Select(p => $"`{p.Name}`=@w_{p.Name}");
        var sql = "WHERE " + string.Join(" AND ", parts);

        var parameters = new DynamicParameters();
        foreach (var p in props)
            parameters.Add("w_" + p.Name, p.GetValue(where));

        return (sql, parameters);
    }

    private static PropertyInfo[] GetDtoProps<TDto>(TDto dto)
    {
        return [.. dto!.GetType()
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && p.GetMethod is not null)];
    }
}
