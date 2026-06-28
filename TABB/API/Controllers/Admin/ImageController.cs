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
    ILogger<ImageController> logger
) : ControllerBase
{
    private readonly IWebHostEnvironment _environment = environment;
    private readonly ILogger<ImageController> _logger = logger;

    private static readonly HashSet<string> HeicExtensions = [".heic", ".heif", ".hif"];

    private const int MaxWidth = 1600;
    private const int JpegQuality = 82;

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

        var fileName = $"{Guid.NewGuid()}.jpg";
        var folder = Path.Combine(UploadsRoot, "projects");
        Directory.CreateDirectory(folder);

        var finalPath = Path.Combine(folder, fileName);
        var tempPath = finalPath + ".tmp";

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
            // 3. PROCESS IMAGE
            // -------------------------
            using var codec = SKCodec.Create(input)
                ?? throw new InvalidOperationException("Invalid image format.");

            using var decoded = new SKBitmap(codec.Info);

            var result = codec.GetPixels(decoded.Info, decoded.GetPixels());
            if (result != SKCodecResult.Success &&
                result != SKCodecResult.IncompleteInput)
            {
                throw new InvalidOperationException($"Decode failed: {result}");
            }

            using var oriented = ApplyExifOrientation(decoded, codec.EncodedOrigin);

            SKBitmap final;

            if (oriented.Width > MaxWidth)
            {
                var scale = MaxWidth / (float)oriented.Width;

                var info = new SKImageInfo(
                    MaxWidth,
                    Math.Max(1, (int)(oriented.Height * scale)),
                    SKColorType.Bgra8888,
                    SKAlphaType.Premul);

                final = oriented.Resize(
                    info,
                    new SKSamplingOptions(SKFilterMode.Linear, SKMipmapMode.Linear))
                    ?? throw new InvalidOperationException("Resize failed.");
            }
            else
            {
                final = oriented.Copy(SKColorType.Bgra8888)
                    ?? throw new InvalidOperationException("Copy failed.");
            }

            using (final)
            {
                // -------------------------
                // 4. DIRECT JPEG ENCODE
                // -------------------------
                using var data = final.Encode(SKEncodedImageFormat.Jpeg, JpegQuality)
                    ?? throw new InvalidOperationException("JPEG encode failed.");

                await System.IO.File.WriteAllBytesAsync(
                    tempPath,
                    data.ToArray(),
                    ct);
                System.IO.File.Move(tempPath, finalPath, overwrite: true);
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
    // EXIF ORIENTATION
    // -------------------------
    private static SKBitmap ApplyExifOrientation(SKBitmap src, SKEncodedOrigin origin)
    {
        if (origin is SKEncodedOrigin.TopLeft or SKEncodedOrigin.Default)
            return src.Copy(SKColorType.Bgra8888);

        bool swap = origin is
            SKEncodedOrigin.LeftTop or
            SKEncodedOrigin.RightTop or
            SKEncodedOrigin.RightBottom or
            SKEncodedOrigin.LeftBottom;

        int w = swap ? src.Height : src.Width;
        int h = swap ? src.Width : src.Height;

        var dst = new SKBitmap(
            new SKImageInfo(w, h, SKColorType.Bgra8888, SKAlphaType.Premul));

        using var canvas = new SKCanvas(dst);

        var matrix = origin switch
        {
            SKEncodedOrigin.TopRight =>
                SKMatrix.CreateScale(-1, 1, w / 2f, h / 2f),

            SKEncodedOrigin.BottomRight =>
                SKMatrix.CreateRotationDegrees(180, w / 2f, h / 2f),

            SKEncodedOrigin.BottomLeft =>
                SKMatrix.CreateScale(1, -1, w / 2f, h / 2f),

            SKEncodedOrigin.RightTop =>
                SKMatrix.CreateRotationDegrees(90, w / 2f, h / 2f),

            SKEncodedOrigin.LeftBottom =>
                SKMatrix.CreateRotationDegrees(270, w / 2f, h / 2f),

            _ => SKMatrix.Identity
        };

        canvas.SetMatrix(matrix);
        canvas.DrawBitmap(src, 0, 0);

        return dst;
    }
}