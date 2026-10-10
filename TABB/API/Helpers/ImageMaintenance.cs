using System.Text.Json;
using Models.Project;
using Models.Snickeri;
using Services.Src.DB;

namespace API.Helpers;

/// <summary>
/// Underhåll av uploads/projects:
///   1. Krymper bilder som är större än 1600 px eller onödigt tunga.
///      Äldre JPEG/PNG konverteras till WebP och databasens sökvägar
///      uppdateras; WebP-filer krymps med filnamnet kvar.
///   2. Skapar miniatyrer som saknas
///   3. Flyttar bilder som inget projekt eller snickeri använder till
///      uploads/projects/.oanvanda — de raderas inte, så inget försvinner av misstag
///
/// Körs från admin (Bildunderhåll). Säker att köra flera gånger.
/// </summary>
public class ImageMaintenance(IDatabase db, IWebHostEnvironment env, ILogger<ImageMaintenance> logger)
{
    public const string UploadsSubfolder = "projects";
    // Punkt först: PhysicalFileProvider serverar inte dolda mappar, så de
    // undanflyttade bilderna nås inte via /uploads. Ligger i projects/ så att
    // den följer med när uploads/projects säkerhetskopieras vid deploy.
    public const string UnusedFolder = ".oanvanda";

    // Under denna storlek lämnas en befintlig bild orörd (miniatyr skapas ändå)
    private const long OkBytes = 450 * 1024;

    // Ett anrop arbetar högst så här länge, så att IIS inte avbryter det.
    // Admin-sidan anropar igen tills Remaining är 0.
    private static readonly TimeSpan TimeBudget = TimeSpan.FromSeconds(40);

    private static readonly HashSet<string> ImageExtensions = [".jpg", ".jpeg", ".webp", ".png"];

    public string UploadsRoot => Path.GetFullPath(Path.Combine(env.ContentRootPath, "uploads"));
    public string ProjectsFolder => Path.Combine(UploadsRoot, UploadsSubfolder);

    public record Report(
        int Scanned,
        int Remaining,
        int Optimized,
        int Converted,
        int ThumbnailsCreated,
        int MovedUnused,
        long BytesBefore,
        long BytesAfter,
        List<string> Errors,
        bool DryRun);

    /// <summary>Alla filnamn som används av projekt och snickerier.</summary>
    public async Task<HashSet<string>> GetReferencedFileNamesAsync(CancellationToken ct)
    {
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        void Add(string? mainImage, string? imagesJson)
        {
            if (!string.IsNullOrWhiteSpace(mainImage))
                names.Add(Path.GetFileName(mainImage));

            if (string.IsNullOrWhiteSpace(imagesJson)) return;
            try
            {
                foreach (var path in JsonSerializer.Deserialize<List<string>>(imagesJson) ?? [])
                    if (!string.IsNullOrWhiteSpace(path))
                        names.Add(Path.GetFileName(path));
            }
            catch (JsonException) { /* trasig JSON — hoppa över, rör inga filer i onödan */ }
        }

        foreach (var p in await db.ReadAsync<ProjectDbDto>("projects", null, ct))
            Add(p.MainImage, p.Images);
        foreach (var s in await db.ReadAsync<SnickeriDbDto>("snickerier", null, ct))
            Add(s.MainImage, s.Images);

        return names;
    }

    public async Task<Report> RunAsync(bool dryRun, CancellationToken ct)
    {
        var errors = new List<string>();
        int scanned = 0, optimized = 0, converted = 0, thumbs = 0, moved = 0;

        // Gamla filnamn → nya .webp-namn, uppdateras i databasen efter loopen
        var renamed = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        long before = 0, after = 0;

        if (!Directory.Exists(ProjectsFolder))
            return new Report(0, 0, 0, 0, 0, 0, 0, 0, errors, dryRun);

        var referenced = await GetReferencedFileNamesAsync(ct);

        // Säkerhetsspärr: om databasen inte gav några bilder alls är något fel
        // (t.ex. tom databas lokalt) — flytta då inget.
        var allowMove = referenced.Count > 0;
        if (!allowMove)
            errors.Add("Inga bilder hittades i databasen — inga filer flyttas.");

        var files = Directory.EnumerateFiles(ProjectsFolder)
            .Where(f => ImageExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
            .ToList();

        var started = DateTime.UtcNow;
        var remaining = 0;

        foreach (var file in files)
        {
            ct.ThrowIfCancellationRequested();

            // Provkörningen avkodar inga bilder i onödan men måste ändå räkna;
            // den riktiga körningen stoppar när tidsbudgeten är slut.
            if (!dryRun && DateTime.UtcNow - started > TimeBudget)
            {
                remaining++;
                continue;
            }

            scanned++;
            var name = Path.GetFileName(file);
            var size = new FileInfo(file).Length;
            before += size;

            try
            {
                // ── 3. Oanvänd bild → flytta undan ────────────────
                if (allowMove && !referenced.Contains(name))
                {
                    moved++;
                    if (!dryRun) MoveToUnused(file);
                    continue;
                }

                // ── 1–2. Krymp och skapa miniatyr ──────────────────
                // En bild som har miniatyr och är högst 1600 px räknas som klar.
                // Det gör körningen idempotent: ingen bild kodas om två gånger
                // (JPEG tappar kvalitet för varje omkodning).
                var thumbPath  = ImageProcessor.ThumbPathFor(file);
                var needsThumb = !File.Exists(thumbPath);
                var width      = ReadWidth(file);
                var tooWide    = width > ImageProcessor.FullWidth;
                var shrink     = tooWide || (needsThumb && size > OkBytes);

                // Äldre tunga JPEG/PNG blir WebP oavsett om miniatyren redan
                // finns. Idempotent: originalet flyttas undan efteråt.
                var ext      = Path.GetExtension(file).ToLowerInvariant();
                var webpPath = Path.ChangeExtension(file, ".webp");
                var convert  = ext != ".webp" && (tooWide || size > OkBytes) && !File.Exists(webpPath);

                if (!needsThumb && !shrink && !convert)
                {
                    after += size;
                    continue;
                }

                // Provkörningen avkodar inget (tar för lång tid) — den räknar bara
                if (dryRun)
                {
                    if (convert) converted++;
                    else if (shrink) optimized++;
                    if (needsThumb) thumbs++;
                    after += size;
                    continue;
                }

                using var loaded = await SKBitmapHolder.LoadAsync(file, ct);
                var newSize = size;

                if (convert)
                {
                    // Äldre JPEG/PNG → WebP under samma namn. Originalet ligger
                    // kvar tills databasen pekar på den nya filen (se nedan).
                    using var full = ImageProcessor.ResizeToWidth(loaded.Bitmap, ImageProcessor.FullWidth);
                    var bytes = ImageProcessor.Encode(full, SkiaSharp.SKEncodedImageFormat.Webp, ImageProcessor.WebpQuality);
                    await ImageProcessor.WriteAtomicAsync(webpPath, bytes, ct);
                    renamed[name] = Path.GetFileName(webpPath);
                    converted++;
                    newSize = bytes.Length;
                }
                else if (shrink)
                {
                    using var full = ImageProcessor.ResizeToWidth(loaded.Bitmap, ImageProcessor.FullWidth);
                    var (format, quality) = ImageProcessor.FormatFor(Path.GetExtension(file));
                    var bytes = ImageProcessor.Encode(full, format, quality);

                    // Spara bara om det ger minst 10 % — annars är originalet bättre
                    if (tooWide || bytes.Length < size * 0.9)
                    {
                        optimized++;
                        newSize = bytes.Length;
                        await ImageProcessor.WriteAtomicAsync(file, bytes, ct);
                    }
                }

                if (needsThumb)
                {
                    using var thumb = ImageProcessor.ResizeToWidth(loaded.Bitmap, ImageProcessor.ThumbWidth);
                    var bytes = ImageProcessor.Encode(thumb, SkiaSharp.SKEncodedImageFormat.Webp, ImageProcessor.ThumbWebpQuality);
                    thumbs++;
                    await ImageProcessor.WriteAtomicAsync(thumbPath, bytes, ct);
                }

                after += newSize;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                after += size;
                errors.Add($"{name}: {ex.Message}");
                logger.LogWarning(ex, "Bildunderhåll misslyckades för {File}", name);
            }
        }

        // ── Peka om databasen till de konverterade filerna ─────────
        // Först när det lyckats flyttas originalen undan. Misslyckas det
        // ligger båda versionerna kvar och nästa körning försöker igen.
        if (renamed.Count > 0)
        {
            try
            {
                await UpdateReferencesAsync(renamed, ct);
                foreach (var oldName in renamed.Keys)
                    MoveToUnused(Path.Combine(ProjectsFolder, oldName), deleteThumb: false);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                errors.Add($"Kunde inte uppdatera databasen efter konvertering: {ex.Message}");
                logger.LogError(ex, "Bildunderhåll: uppdatering av bildsökvägar misslyckades");
            }
        }

        logger.LogInformation(
            "Bildunderhåll{Dry}: {Scanned} filer, {Optimized} krympta, {Converted} till WebP, {Thumbs} miniatyrer, {Moved} oanvända, {Before} → {After} byte",
            dryRun ? " (provkörning)" : "", scanned, optimized, converted, thumbs, moved, before, after);

        return new Report(scanned, remaining, optimized, converted, thumbs, moved, before, after, errors, dryRun);
    }

    /// <summary>Byter filnamn i MainImage och Images (JSON) för projekt och snickerier.</summary>
    private async Task UpdateReferencesAsync(IReadOnlyDictionary<string, string> renamed, CancellationToken ct)
    {
        string? Swap(string? path) =>
            path is not null && renamed.TryGetValue(Path.GetFileName(path), out var newName)
                ? path[..^Path.GetFileName(path).Length] + newName
                : path;

        (string? Main, string? Json, bool Changed) Rewrite(string? main, string? json)
        {
            var newMain = Swap(main);
            var changed = newMain != main;

            if (string.IsNullOrWhiteSpace(json)) return (newMain, json, changed);

            List<string>? list;
            try { list = JsonSerializer.Deserialize<List<string>>(json); }
            catch (JsonException) { return (newMain, json, changed); }
            if (list is null) return (newMain, json, changed);

            var newList = list.Select(p => Swap(p) ?? p).ToList();
            if (!newList.SequenceEqual(list)) changed = true;
            return (newMain, changed ? JsonSerializer.Serialize(newList) : json, changed);
        }

        foreach (var p in await db.ReadAsync<ProjectDbDto>("projects", null, ct))
        {
            var (main, json, changed) = Rewrite(p.MainImage, p.Images);
            if (changed)
                await db.UpdateAsync("projects", new { Id = p.Id }, new { MainImage = main, Images = json }, ct);
        }

        foreach (var s in await db.ReadAsync<SnickeriDbDto>("snickerier", null, ct))
        {
            var (main, json, changed) = Rewrite(s.MainImage, s.Images);
            if (changed)
                await db.UpdateAsync("snickerier", new { Id = s.Id }, new { MainImage = main, Images = json }, ct);
        }
    }

    /// <summary>Flyttar en bild till uploads/projects/.oanvanda och tar bort dess miniatyr.</summary>
    /// <param name="deleteThumb">false när en konverterad .webp med samma namnstam använder miniatyren</param>
    public void MoveToUnused(string file, bool deleteThumb = true)
    {
        var target = Path.Combine(ProjectsFolder, UnusedFolder);
        Directory.CreateDirectory(target);
        File.Move(file, Path.Combine(target, Path.GetFileName(file)), overwrite: true);

        var thumb = ImageProcessor.ThumbPathFor(file);
        if (deleteThumb && File.Exists(thumb))
            File.Delete(thumb);   // miniatyren kan alltid återskapas
    }

    /// <summary>Läser bara bildhuvudet (snabbt) — bredd efter EXIF-rotation.</summary>
    private static int ReadWidth(string path)
    {
        using var fs = File.OpenRead(path);
        using var codec = SkiaSharp.SKCodec.Create(fs);
        if (codec is null) return 0;

        var rotated = codec.EncodedOrigin is
            SkiaSharp.SKEncodedOrigin.LeftTop or SkiaSharp.SKEncodedOrigin.RightTop or
            SkiaSharp.SKEncodedOrigin.RightBottom or SkiaSharp.SKEncodedOrigin.LeftBottom;
        return rotated ? codec.Info.Height : codec.Info.Width;
    }

    /// <summary>Håller den avkodade bilden så att den bara läses från disk en gång.</summary>
    private sealed class SKBitmapHolder : IDisposable
    {
        public required SkiaSharp.SKBitmap Bitmap { get; init; }

        public static async Task<SKBitmapHolder> LoadAsync(string path, CancellationToken ct)
        {
            await using var fs = File.OpenRead(path);
            using var ms = new MemoryStream();
            await fs.CopyToAsync(ms, ct);
            ms.Position = 0;
            return new SKBitmapHolder { Bitmap = ImageProcessor.LoadOriented(ms) };
        }

        public void Dispose() => Bitmap.Dispose();
    }
}
