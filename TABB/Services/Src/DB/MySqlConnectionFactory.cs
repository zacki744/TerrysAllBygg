using System.Data;
using Microsoft.Extensions.Options;
using MySqlConnector;

namespace Services.Src.DB;

public sealed class MySqlConnectionFactory(IOptions<DatabaseOptions> options) : IDbConnectionFactory
{
    private readonly DatabaseOptions _options = options.Value;

    public async Task<IDbConnection> CreateOpenConnectionAsync(CancellationToken ct = default)
    {
        var cs = new MySqlConnectionStringBuilder
        {
            Server = _options.Host,
            Port = (uint)_options.Port,
            UserID = _options.Username,
            Password = _options.Password,
            Database = _options.Database,
            SslMode = MySqlSslMode.Required,
            ConnectionTimeout = 10,
        }.ConnectionString;

        var conn = new MySqlConnection(cs);
        await conn.OpenAsync(ct);
        return conn;
    }
}
