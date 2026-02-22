namespace API.Helpers;

public static class ImageUploadHelper
{
    // ── Constants ──────────────────────────────────────────────

    public const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    // Magic byte signatures for allowed image types
    private static readonly Dictionary<string, byte[][]> AllowedSignatures = new()
    {
        [".jpg"] = [[0xFF, 0xD8, 0xFF]],
        [".jpeg"] = [[0xFF, 0xD8, 0xFF]],
        [".png"] = [[0x89, 0x50, 0x4E, 0x47]],
        [".gif"] = [[0x47, 0x49, 0x46, 0x38]],
        [".webp"] = [[0x52, 0x49, 0x46, 0x46]], // RIFF header — verified further below
    };

    // ── Validation ─────────────────────────────────────────────

    /// <summary>
    /// Validates size, extension, and magic bytes.
    /// Returns null on success, or an error message string on failure.
    /// </summary>
    public static async Task<string?> ValidateAsync(IFormFile file)
    {
        // 1. Empty check
        if (file == null || file.Length == 0)
            return "No file provided.";

        // 2. Size
        if (file.Length > MaxFileSizeBytes)
            return $"File exceeds maximum size of {MaxFileSizeBytes / 1024 / 1024} MB.";

        // 3. Extension whitelist
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedSignatures.ContainsKey(ext))
            return $"File type '{ext}' is not allowed. Accepted: jpg, png, gif, webp.";

        // 4. Magic bytes — read first 12 bytes to cover all signatures
        var header = new byte[12];
        using var stream = file.OpenReadStream();
        var bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length));

        if (!MatchesSignature(ext, header, bytesRead))
            return "File content does not match its extension.";

        // 5. Extra WEBP check — bytes 8-11 must be "WEBP"
        if (ext == ".webp" && bytesRead >= 12)
        {
            var webpMarker = System.Text.Encoding.ASCII.GetString(header, 8, 4);
            if (webpMarker != "WEBP")
                return "File content does not match its extension.";
        }

        return null; // all good
    }

    // ── Filename ───────────────────────────────────────────────

    /// <summary>
    /// Generates a safe, randomised filename preserving the original extension.
    /// </summary>
    public static string GenerateSafeFileName(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        return $"{Guid.NewGuid()}{ext}";
    }

    // ── Path safety ────────────────────────────────────────────

    /// <summary>
    /// Ensures a requested delete path cannot escape the uploads root
    /// via path traversal (e.g. ../../etc/passwd).
    /// Returns the resolved absolute path, or null if the path is unsafe.
    /// </summary>
    public static string? ResolveSafePath(string uploadsRoot, string requestedPath)
    {
        // Normalise: strip leading slash, convert to OS separator
        var relative = requestedPath
            .TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar)
            .Replace('\\', Path.DirectorySeparatorChar);

        var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, relative));

        // Ensure the resolved path is still inside uploadsRoot
        if (!fullPath.StartsWith(Path.GetFullPath(uploadsRoot), StringComparison.OrdinalIgnoreCase))
            return null; // path traversal attempt

        return fullPath;
    }

    // ── Private helpers ────────────────────────────────────────

    private static bool MatchesSignature(string ext, byte[] header, int bytesRead)
    {
        if (!AllowedSignatures.TryGetValue(ext, out var signatures))
            return false;

        foreach (var sig in signatures)
        {
            if (bytesRead < sig.Length) continue;
            if (header.Take(sig.Length).SequenceEqual(sig))
                return true;
        }

        return false;
    }
}