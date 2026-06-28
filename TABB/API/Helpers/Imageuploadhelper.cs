namespace API.Helpers;

public static class ImageUploadHelper
{
    // ── Constants ──────────────────────────────────────────────

    public const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB

    // Magic byte signatures for allowed image types.
    // HEIC/HEIF use ISO Base Media File Format — ftyp box at offset 4.
    // We check offset 0-3 for box size (any value), then bytes 4-7 for "ftyp",
    // then bytes 8-11 for the brand. We handle this separately below.
    private static readonly Dictionary<string, byte[][]> AllowedSignatures = new()
    {
        [".jpg"] = [[0xFF, 0xD8, 0xFF]],
        [".jpeg"] = [[0xFF, 0xD8, 0xFF]],
        [".png"] = [[0x89, 0x50, 0x4E, 0x47]],
        [".gif"] = [[0x47, 0x49, 0x46, 0x38]],
        [".webp"] = [[0x52, 0x49, 0x46, 0x46]], // RIFF — checked further below
        // HEIC/HEIF checked via ftyp brand — handled separately
        [".heic"] = [],
        [".heif"] = [],
        [".hif"] = [],
    };

    // Known ftyp brands used by HEIC/HEIF files
    private static readonly HashSet<string> HeicBrands =
    [
        "heic", "heix", "hevc", "hevx", // HEIC
        "mif1", "msf1",                 // HEIF
        "avif", "avis",                 // AVIF (subset of HEIF)
    ];

    // ── Validation ─────────────────────────────────────────────

    public static async Task<string?> ValidateAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return "No file provided.";

        if (file.Length > MaxFileSizeBytes)
            return $"File exceeds maximum size of {MaxFileSizeBytes / 1024 / 1024} MB.";

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedSignatures.ContainsKey(ext))
            return $"File type '{ext}' is not allowed. Accepted: jpg, png, gif, webp, heic, heif.";

        // Read first 16 bytes — enough for all signatures + HEIC ftyp brand
        var header = new byte[16];
        using var stream = file.OpenReadStream();
        var bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length));

        // HEIC/HEIF: check ftyp box
        if (ext is ".heic" or ".heif" or ".hif")
        {
            if (!IsValidHeic(header, bytesRead))
                return "File content does not match its extension.";
            return null;
        }

        if (!MatchesSignature(ext, header, bytesRead))
            return "File content does not match its extension.";

        // Extra WEBP check — bytes 8-11 must be "WEBP"
        if (ext == ".webp" && bytesRead >= 12)
        {
            var webpMarker = System.Text.Encoding.ASCII.GetString(header, 8, 4);
            if (webpMarker != "WEBP")
                return "File content does not match its extension.";
        }

        return null;
    }

    // ── Filename ───────────────────────────────────────────────

    public static string GenerateSafeFileName(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        return $"{Guid.NewGuid()}{ext}";
    }

    // ── Path safety ────────────────────────────────────────────

    public static string? ResolveSafePath(string uploadsRoot, string requestedPath)
    {
        var relative = requestedPath
            .TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar)
            .Replace('\\', Path.DirectorySeparatorChar);

        var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, relative));

        if (!fullPath.StartsWith(Path.GetFullPath(uploadsRoot), StringComparison.OrdinalIgnoreCase))
            return null;

        return fullPath;
    }

    // ── Private helpers ────────────────────────────────────────

    private static bool MatchesSignature(string ext, byte[] header, int bytesRead)
    {
        if (!AllowedSignatures.TryGetValue(ext, out var signatures))
            return false;

        if (signatures.Length == 0) return true; // handled separately

        foreach (var sig in signatures)
        {
            if (bytesRead < sig.Length) continue;
            if (header.Take(sig.Length).SequenceEqual(sig))
                return true;
        }

        return false;
    }

    // HEIC/HEIF files have an ISO BMFF ftyp box:
    // bytes 0-3: box size (big-endian uint32, any value)
    // bytes 4-7: "ftyp" (0x66 0x74 0x79 0x70)
    // bytes 8-11: major brand (4 ASCII chars)
    private static bool IsValidHeic(byte[] header, int bytesRead)
    {
        if (bytesRead < 12) return false;

        // Check "ftyp" marker at offset 4
        var ftyp = System.Text.Encoding.ASCII.GetString(header, 4, 4);
        if (ftyp != "ftyp") return false;

        // Check major brand
        var brand = System.Text.Encoding.ASCII.GetString(header, 8, 4).ToLowerInvariant().Trim();
        return HeicBrands.Contains(brand);
    }
}