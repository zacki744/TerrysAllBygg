using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkiaSharp;
using ImageMagick;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class ImageController(
    IWebHostEnvironment environment,
    ImageMaintenance maintenance,
    ILogger<ImageController> logger
) : ControllerBase
{
    private readonly ImageMaintenance _maintenance = maintenance;
    private readonly IWebHostEnvironment _environment = environment;
    private readonly ILogger<ImageController> _logger = logger;

    private static readonly HashSet<string> HeicExtensions = [".heic", ".heif", ".hif"];

    private string UploadsRoot =>
        Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "uploads"));

    [HttpPost("upload")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> UploadImage(IFormFile image, CancellationToken ct)
    {
        var error = await ImageUploadHelper.ValidateAsync(image);
        if (error != null)
            return BadRequest(new { error });

        var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
        var isHeic = HeicExtensions.Contains(ext);

        var fileName = $"{Guid.NewGuid()}.webp";
        var folder = Path.Combine(UploadsRoot, "projects");
        Directory.CreateDirectory(folder);

        var finalPath = Path.Combine(folder, fileName);
        var tempPath = finalPath + ".tmp";   // används av WriteAtomicAsync

        MemoryStream? ms = null;
        MemoryStream? heicStream = null;

        try
        {
            // -------------------------
            // 1. BUFFER INPUT
            // -------------------------
            if (image.Length > int.MaxValue)
                throw new InvalidOperationException("File too large for processing.");

            ms = new MemoryStream((int)image.Length);
            await image.OpenReadStream().CopyToAsync(ms, ct);
            ms.Position = 0;

            Stream input = ms;

            // -------------------------
            // 2. HEIC CONVERSION
            // -------------------------
            if (isHeic)
            {
                heicStream = await ConvertHeicToJpegAsync(ms, ct);
                input = heicStream;
                input.Position = 0;
            }

            // -------------------------
            // 3. PROCESS IMAGE → WebP 1600 px + miniatyr 640 px
            // -------------------------
            using var oriented = ImageProcessor.LoadOriented(input);

            using (var full = ImageProcessor.ResizeToWidth(oriented, ImageProcessor.FullWidth))
            {
                var bytes = ImageProcessor.Encode(full, SKEncodedImageFormat.Webp, ImageProcessor.WebpQuality);
                await ImageProcessor.WriteAtomicAsync(finalPath, bytes, ct);
            }

            using (var thumb = ImageProcessor.ResizeToWidth(oriented, ImageProcessor.ThumbWidth))
            {
                var bytes = ImageProcessor.Encode(thumb, SKEncodedImageFormat.Webp, ImageProcessor.ThumbWebpQuality);
                await ImageProcessor.WriteAtomicAsync(ImageProcessor.ThumbPathFor(finalPath), bytes, ct);
            }

            _logger.LogInformation(
                "Image uploaded: {File} ({Original})",
                fileName,
                image.FileName);

            return Ok(new
            {
                success = true,
                path = $"/uploads/projects/{fileName}",
                fileName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Image upload failed: {File}", image.FileName);

            try
            {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);
            }
            catch { }

            return StatusCode(500, new { error = "Upload failed." });
        }
        finally
        {
            ms?.Dispose();
            heicStream?.Dispose();
        }
    }

    // -------------------------
    // HEIC → JPEG
    // -------------------------
    private static async Task<MemoryStream> ConvertHeicToJpegAsync(
        Stream input,
        CancellationToken ct)
    {
        var output = new MemoryStream();

        using (var img = new MagickImage(input))
        {
            img.AutoOrient();
            img.Format = MagickFormat.Jpeg;
            img.Quality = 95;
            img.Strip();

            await img.WriteAsync(output, ct);
        }

        output.Position = 0;
        return output;
    }

    // -------------------------
    // DELETE (anropas när en bild tas bort i admin-formuläret)
    // -------------------------
    public record DeleteImageRequest(string Path);

    /// <summary>
    /// Flyttar en bild till uploads/projects/.oanvanda — men bara om inget projekt
    /// eller snickeri längre använder den. Formuläret anropar detta innan det
    /// sparats, så en bild som fortfarande finns i databasen (t.ex. om
    /// redigeringen avbryts) får ligga kvar. Bildunderhållet städar resten.
    /// </summary>
    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteImage([FromBody] DeleteImageRequest request, CancellationToken ct)
    {
        var name = System.IO.Path.GetFileName(request.Path ?? "");
        var expectedPrefix = $"/uploads/{ImageMaintenance.UploadsSubfolder}/";

        // Bara filnamn direkt i uploads/projects — inga ../ eller andra mappar
        if (string.IsNullOrEmpty(name) ||
            !request.Path!.StartsWith(expectedPrefix, StringComparison.OrdinalIgnoreCase) ||
            request.Path.Length != expectedPrefix.Length + name.Length)
            return BadRequest(new { error = "Ogiltig sökväg." });

        var file = System.IO.Path.Combine(_maintenance.ProjectsFolder, name);
        if (!System.IO.File.Exists(file))
            return Ok(new { moved = false });

        var referenced = await _maintenance.GetReferencedFileNamesAsync(ct);
        if (referenced.Contains(name))
            return Ok(new { moved = false, reason = "Används fortfarande" });

        _maintenance.MoveToUnused(file);
        _logger.LogInformation("Bild flyttad till {Folder}: {File}", ImageMaintenance.UnusedFolder, name);
        return Ok(new { moved = true });
    }

    // -------------------------
    // BILDUNDERHÅLL
    // -------------------------

    /// <summary>Provkörning: visar vad underhållet skulle göra, ändrar inget.</summary>
    [HttpGet("maintenance")]
    public async Task<IActionResult> PreviewMaintenance(CancellationToken ct)
        => Ok(await _maintenance.RunAsync(dryRun: true, ct));

    /// <summary>
    /// Krymper stora bilder, skapar miniatyrer och flyttar oanvända bilder.
    /// Arbetar i omgångar (se ImageMaintenance.TimeBudget); anropa igen så
    /// länge svaret har Remaining &gt; 0.
    /// </summary>
    [HttpPost("maintenance")]
    public async Task<IActionResult> RunMaintenance(CancellationToken ct)
        => Ok(await _maintenance.RunAsync(dryRun: false, ct));
}
