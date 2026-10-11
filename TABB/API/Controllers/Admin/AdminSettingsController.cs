using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Settings;
using Services.Src.Settings;
using SkiaSharp;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController(
    ISettingsService settings,
    IWebHostEnvironment environment,
    ILogger<AdminSettingsController> logger) : ControllerBase
{
    // Hero-bilden sparas i två bredder: stor för dator, mindre för mobil (srcset).
    public const int HeroWidth      = 1920;
    public const int HeroSmallWidth = 960;
    private const int HeroQuality   = 80;

    private string SiteFolder =>
        Path.Combine(Path.GetFullPath(Path.Combine(environment.ContentRootPath, "uploads")), "site");

    // GET: api/admin/settings
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok(await settings.GetAsync(ct));

    // PUT: api/admin/settings
    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SiteSettings request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Bilden måste finnas på disk — annars skulle sajten visa en trasig bild
        if (request.HeroImage != null &&
            !System.IO.File.Exists(Path.Combine(SiteFolder, Path.GetFileName(request.HeroImage))))
            return BadRequest(new { error = "Hero-bilden finns inte längre. Ladda upp den igen." });

        try
        {
            return Ok(await settings.SaveAsync(request, ct));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Kunde inte spara webbplatsinställningar");
            return StatusCode(500, new { error = "Kunde inte spara. Är tabellen site_settings skapad?" });
        }
    }

    // POST: api/admin/settings/hero-image
    // Sparar bilden och returnerar sökvägen. Den används på sajten först när
    // formuläret sparas, så en uppladdning går att ångra.
    [HttpPost("hero-image")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> UploadHero(IFormFile image, CancellationToken ct)
    {
        var error = await ImageUploadHelper.ValidateAsync(image);
        if (error != null)
            return BadRequest(new { error });

        var id = Guid.NewGuid().ToString("N");
        Directory.CreateDirectory(SiteFolder);
        var fullPath  = Path.Combine(SiteFolder, $"hero-{id}.webp");
        var smallPath = Path.Combine(SiteFolder, $"hero-{id}-{HeroSmallWidth}.webp");

        MemoryStream? heic = null;
        try
        {
            using var ms = new MemoryStream();
            await image.OpenReadStream().CopyToAsync(ms, ct);
            ms.Position = 0;

            Stream input = ms;
            if (ImageController.HeicExtensions.Contains(Path.GetExtension(image.FileName).ToLowerInvariant()))
            {
                heic = await ImageController.ConvertHeicToJpegAsync(ms, ct);
                input = heic;
            }

            using var oriented = ImageProcessor.LoadOriented(input);
            int width, height;

            using (var full = ImageProcessor.ResizeToWidth(oriented, HeroWidth))
            {
                (width, height) = (full.Width, full.Height);
                await ImageProcessor.WriteAtomicAsync(fullPath,
                    ImageProcessor.Encode(full, SKEncodedImageFormat.Webp, HeroQuality), ct);
            }
            using (var small = ImageProcessor.ResizeToWidth(oriented, HeroSmallWidth))
            {
                await ImageProcessor.WriteAtomicAsync(smallPath,
                    ImageProcessor.Encode(small, SKEncodedImageFormat.Webp, HeroQuality), ct);
            }

            logger.LogInformation("Hero-bild uppladdad: hero-{Id} ({Width}×{Height})", id, width, height);
            return Ok(new { path = $"/uploads/site/hero-{id}.webp", width, height });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Uppladdning av hero-bild misslyckades: {File}", image.FileName);
            foreach (var f in new[] { fullPath, smallPath, fullPath + ".tmp", smallPath + ".tmp" })
                try { if (System.IO.File.Exists(f)) System.IO.File.Delete(f); } catch { }
            return StatusCode(500, new { error = "Bilden kunde inte bearbetas." });
        }
        finally
        {
            heic?.Dispose();
        }
    }
}
