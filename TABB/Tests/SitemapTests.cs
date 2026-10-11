using API.Controllers;

namespace Tests;

public class SitemapTests
{
    [Fact]
    public void Förrenderade_sidor_blir_sitemapadresser()
    {
        var root = Path.Combine(Path.GetTempPath(), "sitemap-" + Guid.NewGuid().ToString("N"));
        try
        {
            foreach (var dir in new[] { "", "tjanster", "tjanster/bastu", "about", ".well-known", "assets" })
                Directory.CreateDirectory(Path.Combine(root, dir));
            foreach (var file in new[] { "index.html", "index.spa.html", "tjanster/index.html", "tjanster/bastu/index.html",
                                         "about/index.html", ".well-known/index.html", "assets/app.js" })
                File.WriteAllText(Path.Combine(root, file), "");

            Assert.Equal(new[] { "/", "/about", "/tjanster", "/tjanster/bastu" }, SitemapController.PrerenderedPaths(root));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    [Fact]
    public void Saknad_frontendmapp_ger_tom_lista()
        => Assert.Empty(SitemapController.PrerenderedPaths(Path.Combine(Path.GetTempPath(), "finns-inte-" + Guid.NewGuid())));
}
