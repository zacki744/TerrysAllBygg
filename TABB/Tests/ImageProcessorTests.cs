using API.Helpers;
using SkiaSharp;

namespace Tests;

public class ImageProcessorTests
{
    private static SKBitmap Solid(int width, int height)
    {
        var bmp = new SKBitmap(new SKImageInfo(width, height, SKColorType.Bgra8888, SKAlphaType.Premul));
        bmp.Erase(SKColors.SaddleBrown);
        return bmp;
    }

    [Fact]
    public void ResizeToWidth_skalar_ner_och_behåller_proportioner()
    {
        using var src = Solid(4000, 3000);
        using var result = ImageProcessor.ResizeToWidth(src, ImageProcessor.FullWidth);

        Assert.Equal(1600, result.Width);
        Assert.Equal(1200, result.Height);
    }

    [Fact]
    public void ResizeToWidth_förstorar_aldrig_små_bilder()
    {
        using var src = Solid(500, 300);
        using var result = ImageProcessor.ResizeToWidth(src, ImageProcessor.ThumbWidth);

        Assert.Equal(500, result.Width);
        Assert.Equal(300, result.Height);
    }

    [Fact]
    public void Encode_webp_ger_en_giltig_webp_fil()
    {
        using var src = Solid(64, 48);
        var bytes = ImageProcessor.Encode(src, SKEncodedImageFormat.Webp, ImageProcessor.WebpQuality);

        // RIFF....WEBP
        Assert.Equal("RIFF", System.Text.Encoding.ASCII.GetString(bytes, 0, 4));
        Assert.Equal("WEBP", System.Text.Encoding.ASCII.GetString(bytes, 8, 4));
    }

    [Fact]
    public void LoadOriented_läser_tillbaka_en_kodad_bild()
    {
        using var src = Solid(120, 80);
        var jpeg = ImageProcessor.Encode(src, SKEncodedImageFormat.Jpeg, 90);

        using var stream = new MemoryStream(jpeg);
        using var loaded = ImageProcessor.LoadOriented(stream);

        Assert.Equal(120, loaded.Width);
        Assert.Equal(80, loaded.Height);
    }

    [Theory]
    [InlineData(".jpg", SKEncodedImageFormat.Jpeg)]
    [InlineData(".JPEG", SKEncodedImageFormat.Jpeg)]
    [InlineData(".webp", SKEncodedImageFormat.Webp)]
    [InlineData(".png", SKEncodedImageFormat.Png)]
    public void FormatFor_behåller_filtypen(string extension, SKEncodedImageFormat expected)
        => Assert.Equal(expected, ImageProcessor.FormatFor(extension).Format);

    [Fact]
    public void FormatFor_avvisar_okända_filtyper()
        => Assert.Throws<NotSupportedException>(() => ImageProcessor.FormatFor(".gif"));

    [Fact]
    public void ThumbPathFor_lägger_webp_i_thumbs()
    {
        var full = Path.Combine("uploads", "projects", "abc.jpg");
        var expected = Path.Combine("uploads", "projects", "thumbs", "abc.webp");

        Assert.Equal(expected, ImageProcessor.ThumbPathFor(full));
    }
}
