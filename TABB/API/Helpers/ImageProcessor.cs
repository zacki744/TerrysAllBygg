using SkiaSharp;

namespace API.Helpers;

/// <summary>
/// Gemensam bildbehandling för uppladdning och underhåll.
///
/// Sparade versioner:
///   uploads/projects/{namn}.webp          — max 1600 px bred, visas i galleri/lightbox
///   uploads/projects/thumbs/{namn}.webp   — max 640 px bred, visas på kort
///
/// Omkodningen tar bort all metadata (EXIF), inklusive GPS-position från
/// mobilkameran — viktigt eftersom bilderna ofta visar kunders hem.
/// </summary>
public static class ImageProcessor
{
    public const int FullWidth  = 1600;
    public const int ThumbWidth = 640;

    public const int WebpQuality      = 78;
    public const int ThumbWebpQuality = 72;
    public const int JpegQuality      = 80;   // bara för befintliga .jpg som måste behålla filnamnet

    public const string ThumbFolder = "thumbs";

    /// <summary>Avkodar en bild och roterar den enligt EXIF-orienteringen.</summary>
    public static SKBitmap LoadOriented(Stream input)
    {
        using var codec = SKCodec.Create(input)
            ?? throw new InvalidOperationException("Okänt bildformat.");

        using var decoded = new SKBitmap(codec.Info);
        var result = codec.GetPixels(decoded.Info, decoded.GetPixels());
        if (result != SKCodecResult.Success && result != SKCodecResult.IncompleteInput)
            throw new InvalidOperationException($"Avkodning misslyckades: {result}");

        return ApplyExifOrientation(decoded, codec.EncodedOrigin);
    }

    /// <summary>Skalar ner till maxWidth (behåller proportioner). Mindre bilder kopieras oförändrade.</summary>
    public static SKBitmap ResizeToWidth(SKBitmap src, int maxWidth)
    {
        if (src.Width <= maxWidth)
            return src.Copy(SKColorType.Bgra8888)
                ?? throw new InvalidOperationException("Kopiering misslyckades.");

        var scale = maxWidth / (float)src.Width;
        var info = new SKImageInfo(
            maxWidth,
            Math.Max(1, (int)Math.Round(src.Height * scale)),
            SKColorType.Bgra8888,
            SKAlphaType.Premul);

        // Mitchell-kubisk sampling ger skarpare nedskalning än linjär
        return src.Resize(info, new SKSamplingOptions(SKCubicResampler.Mitchell))
            ?? throw new InvalidOperationException("Skalning misslyckades.");
    }

    public static byte[] Encode(SKBitmap bitmap, SKEncodedImageFormat format, int quality)
    {
        using var data = bitmap.Encode(format, quality)
            ?? throw new InvalidOperationException($"Kodning till {format} misslyckades.");
        return data.ToArray();
    }

    /// <summary>Format som motsvarar filändelsen (befintliga filer måste behålla sitt namn).</summary>
    public static (SKEncodedImageFormat Format, int Quality) FormatFor(string extension) =>
        extension.ToLowerInvariant() switch
        {
            ".webp"           => (SKEncodedImageFormat.Webp, WebpQuality),
            ".png"            => (SKEncodedImageFormat.Png, 100),
            ".jpg" or ".jpeg" => (SKEncodedImageFormat.Jpeg, JpegQuality),
            _ => throw new NotSupportedException($"Filtypen {extension} stöds inte."),
        };

    /// <summary>Sökväg till miniatyren för en bild i samma mapp.</summary>
    public static string ThumbPathFor(string fullPath) =>
        Path.Combine(
            Path.GetDirectoryName(fullPath)!,
            ThumbFolder,
            Path.GetFileNameWithoutExtension(fullPath) + ".webp");

    /// <summary>Skriver atomiskt: först till .tmp, sedan byter namn.</summary>
    public static async Task WriteAtomicAsync(string path, byte[] bytes, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var tmp = path + ".tmp";
        await File.WriteAllBytesAsync(tmp, bytes, ct);
        File.Move(tmp, path, overwrite: true);
    }

    private static SKBitmap ApplyExifOrientation(SKBitmap src, SKEncodedOrigin origin)
    {
        if (origin is SKEncodedOrigin.TopLeft or SKEncodedOrigin.Default)
            return src.Copy(SKColorType.Bgra8888)
                ?? throw new InvalidOperationException("Kopiering misslyckades.");

        bool swap = origin is
            SKEncodedOrigin.LeftTop or
            SKEncodedOrigin.RightTop or
            SKEncodedOrigin.RightBottom or
            SKEncodedOrigin.LeftBottom;

        int w = swap ? src.Height : src.Width;
        int h = swap ? src.Width : src.Height;

        var dst = new SKBitmap(new SKImageInfo(w, h, SKColorType.Bgra8888, SKAlphaType.Premul));
        using var canvas = new SKCanvas(dst);

        // Varje fall: flytta bilden så att den hamnar inom den nya ytan efter
        // rotation/spegling. (Den tidigare versionen roterade runt mitten av
        // den nya ytan, vilket förskjuter bilden när bredd och höjd byts.)
        switch (origin)
        {
            case SKEncodedOrigin.TopRight:       // spegling horisontellt
                canvas.Translate(w, 0);
                canvas.Scale(-1, 1);
                break;
            case SKEncodedOrigin.BottomRight:    // 180°
                canvas.Translate(w, h);
                canvas.RotateDegrees(180);
                break;
            case SKEncodedOrigin.BottomLeft:     // spegling vertikalt
                canvas.Translate(0, h);
                canvas.Scale(1, -1);
                break;
            case SKEncodedOrigin.LeftTop:        // transponera
                canvas.RotateDegrees(90);
                canvas.Scale(1, -1);
                break;
            case SKEncodedOrigin.RightTop:       // 90° medurs (vanligast: stående mobilfoto)
                canvas.Translate(w, 0);
                canvas.RotateDegrees(90);
                break;
            case SKEncodedOrigin.RightBottom:    // transversera
                canvas.Translate(w, 0);
                canvas.RotateDegrees(90);
                canvas.Scale(-1, 1);
                canvas.Translate(-h, 0);
                break;
            case SKEncodedOrigin.LeftBottom:     // 90° moturs
                canvas.Translate(0, h);
                canvas.RotateDegrees(270);
                break;
        }

        canvas.DrawBitmap(src, 0, 0);
        return dst;
    }
}
