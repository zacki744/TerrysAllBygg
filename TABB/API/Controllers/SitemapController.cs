using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Services.Src.Projects;
using Services.Src.Settings;
using Services.Src.Snickerier;

namespace API.Controllers;

/// <summary>
/// Genererar /sitemap.xml från databasen, så att varje projekt och snickeri
/// blir upptäckbart för sökmotorer direkt när det publiceras i admin.
///
/// URL-formatet måste matcha frontend (src/lib/routes.ts):
///   /projekt/{id}/{slug}  och  /snickerier/{id}/{slug}
/// </summary>
[ApiController]
[EnableRateLimiting(RateLimitingExtensions.GeneralApi)]
public class SitemapController(
    IProjectsService projectsService,
    ISnickeriService snickeriService,
    ISettingsService settingsService,
    IWebHostEnvironment environment,
    IConfiguration config) : ControllerBase
{
    private static readonly XNamespace Ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
    private static readonly XNamespace ImageNs = "http://www.google.com/schemas/sitemap-image/1.1";

    // Reserv om det förrenderade bygget saknas (t.ex. lokalt utan frontend-bygge).
    // I drift hämtas listan från de förrenderade sidorna, se PrerenderedPaths.
    private static readonly string[] StaticPaths =
        ["/", "/tjanster", "/projekt", "/snickerier", "/about", "/book", "/integritetspolicy"];

    [HttpGet("/sitemap.xml")]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var baseUrl = (config["App:BaseUrl"] ?? "https://terrysallbygg.se").TrimEnd('/');

        var projects  = await projectsService.GetOverviewInformationAsync(ct);
        var snickerier = await snickeriService.GetOverviewAsync(ct);

        var urls = new List<XElement>();

        var frontend = Path.Combine(environment.ContentRootPath, "wwwroot", "app");
        var pages = PrerenderedPaths(frontend);
        var paths = pages.Count > 0 ? pages : [.. StaticPaths];

        // Tjänster som lagts till i admin efter senaste deploy har ingen
        // förrenderad sida än, men ska ändå finnas i sitemapen.
        var settings = await settingsService.GetAsync(ct);
        foreach (var service in settings.Services ?? [])
        {
            var path = "/tjanster/" + service.Slug;
            if (!paths.Contains(path)) paths.Add(path);
        }

        urls.AddRange(paths.Select(path => Url(baseUrl + path)));

        urls.AddRange(projects.Select(p =>
            Url($"{baseUrl}/projekt/{p.Id}/{Slugify(p.Title)}", AbsoluteImage(baseUrl, p.Image))));

        urls.AddRange(snickerier.Select(s =>
            Url($"{baseUrl}/snickerier/{s.Id}/{Slugify(s.Title)}", AbsoluteImage(baseUrl, s.Image))));

        var doc = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            new XElement(Ns + "urlset",
                new XAttribute(XNamespace.Xmlns + "image", ImageNs),
                urls));

        return Content(doc.Declaration + "\n" + doc.Root, "application/xml", Encoding.UTF8);
    }

    /// <summary>
    /// Sidorna som förrenderats vid bygget (scripts/prerender.mjs): varje mapp
    /// med en index.html blir en URL, t.ex. tjanster/bastu/index.html →
    /// /tjanster/bastu. Nya fasta sidor hamnar då i sitemapen automatiskt.
    /// </summary>
    internal static List<string> PrerenderedPaths(string frontendRoot)
    {
        if (!Directory.Exists(frontendRoot)) return [];

        return Directory.EnumerateFiles(frontendRoot, "index.html", SearchOption.AllDirectories)
            .Select(file => Path.GetRelativePath(frontendRoot, Path.GetDirectoryName(file)!))
            .Where(dir => !dir.Split(Path.DirectorySeparatorChar).Any(part => part.StartsWith('.') && part != "."))
            .Select(dir => dir == "." ? "/" : "/" + dir.Replace(Path.DirectorySeparatorChar, '/'))
            .OrderBy(path => path == "/" ? "" : path, StringComparer.Ordinal)
            .ToList();
    }

    private static XElement Url(string loc, string? image = null)
    {
        var url = new XElement(Ns + "url", new XElement(Ns + "loc", loc));
        if (!string.IsNullOrWhiteSpace(image))
            url.Add(new XElement(ImageNs + "image", new XElement(ImageNs + "loc", image)));
        return url;
    }

    private static string? AbsoluteImage(string baseUrl, string? image) =>
        string.IsNullOrWhiteSpace(image) ? null
        : image.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? image
        : baseUrl + (image.StartsWith('/') ? image : "/" + image);

    /// <summary>Samma regler som slugify() i frontend/src/lib/routes.ts.</summary>
    internal static string Slugify(string text)
    {
        var s = text.ToLowerInvariant()
            .Replace('å', 'a').Replace('ä', 'a').Replace('ö', 'o');

        // Ta bort övriga diakriter (é → e)
        var normalized = s.Normalize(NormalizationForm.FormKD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);

        s = Regex.Replace(sb.ToString(), "[^a-z0-9]+", "-").Trim('-');
        return s.Length > 60 ? s[..60] : s;
    }
}
