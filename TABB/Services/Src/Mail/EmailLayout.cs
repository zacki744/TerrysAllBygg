using System.Net;
using System.Text;

namespace Services.Src.Mail;

/// <summary>Ett färdigt mejl: textversion + HTML-version av samma innehåll.</summary>
public sealed record MailContent(string Text, string Html);

/// <summary>
/// Företagsuppgifter och färger för mejlen. Håll i synk med
/// frontend/src/lib/contact.ts och färgerna i frontend/src/index.css.
/// </summary>
public static class Brand
{
    public const string Company   = "Terrys Allbygg";
    public const string Tagline   = "Bygg & snickeri på Österlen";
    public const string Phone     = "076-820 59 61";
    public const string PhoneHref = "tel:+46768205961";
    public const string Email     = "terrysallbygg@gmail.com";
    public const string SiteUrl   = "https://terrysallbygg.se";
    public const string SiteLabel = "terrysallbygg.se";
    public const string OrgNumber = "570303-9395";
    public const string LogoUrl   = SiteUrl + "/apple-touch-icon.png";
    public const string PrivacyUrl = SiteUrl + "/integritetspolicy";

    // Samma toner som sajten (index.css)
    internal const string Paper     = "#F5F0E8";   // --background
    internal const string Ink       = "#2C2416";   // --foreground
    internal const string Muted     = "#6B5D4F";   // mörkare än --secondary, klarar 4,5:1 på vitt
    internal const string Border    = "#D9D0C1";   // --border
    internal const string Primary   = "#C86B3C";   // --primary (dekor)
    internal const string PrimaryInk = "#A4512A";  // --primary-ink (text/knappar)
    internal const string Font      = "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif";
}

// ── Byggstenar ────────────────────────────────────────────
// Ett mejl beskrivs som en lista block. Samma lista blir både HTML och text,
// så de två versionerna kan aldrig glida isär. All text in här är RÅ text —
// HTML-kodning sker vid renderingen.

public abstract record MailBlock;
public sealed record Paragraph(string Text) : MailBlock;
public sealed record Fields(IReadOnlyList<(string Label, string Value)> Rows) : MailBlock;
public sealed record Quote(string Label, string Text) : MailBlock;
public sealed record Buttons(IReadOnlyList<(string Label, string Url)> Items) : MailBlock;
public sealed record Note(string Text) : MailBlock;
public sealed record LinkFallback(string Url) : MailBlock;

public sealed class MailSpec
{
    public required string Preheader { get; init; }   // förhandstext i inkorgen
    public required string Heading { get; init; }
    public required IReadOnlyList<MailBlock> Blocks { get; init; }
    /// <summary>Kundmejl får integritetstext i sidfoten; interna mejl gör det inte.</summary>
    public bool PrivacyFooter { get; init; }
    /// <summary>"Med vänliga hälsningar" — av för interna mejl till Terry.</summary>
    public bool Signature { get; init; } = true;
}

public static class EmailLayout
{
    private static string E(string? s) => WebUtility.HtmlEncode(s ?? "");

    /// <summary>Flerradig text → kodad HTML med &lt;br&gt;.</summary>
    private static string Multiline(string s) =>
        E(s.Replace("\r\n", "\n").Trim()).Replace("\n", "<br>");

    public static MailContent Render(MailSpec spec) => new(RenderText(spec), RenderHtml(spec));

    // ── Text ──────────────────────────────────────────────

    private static string RenderText(MailSpec spec)
    {
        var sb = new StringBuilder();
        sb.AppendLine(spec.Heading).AppendLine();

        foreach (var block in spec.Blocks)
        {
            switch (block)
            {
                case Paragraph p:
                    sb.AppendLine(p.Text).AppendLine();
                    break;
                case Fields f:
                    var width = f.Rows.Max(r => r.Label.Length) + 2;
                    foreach (var (label, value) in f.Rows)
                        sb.Append((label + ":").PadRight(width)).AppendLine(value);
                    sb.AppendLine();
                    break;
                case Quote q:
                    sb.AppendLine(q.Label + ":").AppendLine(q.Text.Trim()).AppendLine();
                    break;
                case Buttons b:
                    // tel:/mailto: är bara genvägar — numret och adressen står redan i texten
                    var links = b.Items.Where(i => i.Url.StartsWith("http")).ToList();
                    foreach (var (label, url) in links)
                        sb.Append(label).Append(": ").AppendLine(url);
                    if (links.Count > 0) sb.AppendLine();
                    break;
                case Note n:
                    sb.AppendLine(n.Text).AppendLine();
                    break;
                case LinkFallback:
                    break;   // länken står redan på knappraden i textversionen
            }
        }

        if (spec.Signature)
            sb.AppendLine("Med vänliga hälsningar,").AppendLine(Brand.Company);
        sb.AppendLine("--").AppendLine($"{Brand.Company} · {Brand.Phone} · {Brand.Email} · {Brand.SiteLabel}");

        if (spec.PrivacyFooter)
            sb.AppendLine()
              .AppendLine("Dina uppgifter används bara för att besvara din förfrågan.")
              .AppendLine($"Läs mer om hur vi hanterar dem och om dina rättigheter: {Brand.PrivacyUrl}");

        return sb.ToString();
    }

    // ── HTML ──────────────────────────────────────────────
    // Tabellbaserad layout med inline-stilar: det enda som fungerar likadant i
    // Gmail, Outlook (Word-motorn) och Apple Mail. Ingen extern CSS, inga
    // webbfonter, inga skript.

    private static string RenderHtml(MailSpec spec)
    {
        var body = new StringBuilder();
        foreach (var block in spec.Blocks)
            body.Append(RenderBlock(block));

        var privacy = spec.PrivacyFooter
            ? $@"<p style=""margin:12px 0 0;"">Dina uppgifter används bara för att besvara din förfrågan.
                 <a href=""{Brand.PrivacyUrl}"" style=""color:{Brand.Muted};text-decoration:underline;"">Läs vår integritetspolicy</a>.</p>"
            : "";

        var signature = spec.Signature
            ? $@"<p style=""margin:24px 0 0;font-size:16px;line-height:1.6;"">Med vänliga hälsningar,<br><strong>{Brand.Company}</strong></p>"
            : "";

        return $@"<!DOCTYPE html>
<html lang=""sv"">
<head>
<meta charset=""utf-8"">
<meta name=""viewport"" content=""width=device-width, initial-scale=1"">
<meta name=""color-scheme"" content=""light"">
<meta name=""supported-color-schemes"" content=""light"">
<title>{E(spec.Heading)}</title>
</head>
<body style=""margin:0;padding:0;background:{Brand.Paper};"">
<div style=""display:none;max-height:0;overflow:hidden;opacity:0;color:{Brand.Paper};"">{E(spec.Preheader)}</div>
<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background:{Brand.Paper};"">
<tr><td align=""center"" style=""padding:32px 16px;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""max-width:600px;font-family:{Brand.Font};color:{Brand.Ink};"">

    <!-- Logga -->
    <tr><td style=""padding:0 4px 20px;"">
      <a href=""{Brand.SiteUrl}"" style=""text-decoration:none;color:{Brand.PrimaryInk};"">
        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>
          <td style=""padding-right:12px;vertical-align:middle;"">
            <img src=""{Brand.LogoUrl}"" width=""48"" height=""48"" alt="""" style=""display:block;border:0;border-radius:50%;"">
          </td>
          <td style=""vertical-align:middle;"">
            <div style=""font-size:22px;line-height:1.1;font-weight:800;letter-spacing:-0.3px;color:{Brand.PrimaryInk};"">{Brand.Company}</div>
            <div style=""font-size:13px;line-height:1.4;color:{Brand.Muted};padding-top:2px;"">{E(Brand.Tagline)}</div>
          </td>
        </tr></table>
      </a>
    </td></tr>

    <!-- Kort -->
    <tr><td style=""background:#FFFFFF;border:1px solid {Brand.Border};border-radius:16px;padding:32px 28px;"">
      <div style=""width:40px;height:4px;background:{Brand.Primary};border-radius:2px;font-size:0;line-height:0;"">&nbsp;</div>
      <h1 style=""margin:16px 0 20px;font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-0.3px;color:{Brand.Ink};"">{E(spec.Heading)}</h1>
      {body}
      {signature}
    </td></tr>

    <!-- Sidfot -->
    <tr><td align=""center"" style=""padding:24px 8px 0;font-size:13px;line-height:1.6;color:{Brand.Muted};"">
      <p style=""margin:0;"">
        <a href=""{Brand.PhoneHref}"" style=""color:{Brand.Muted};text-decoration:none;"">{Brand.Phone}</a> &middot;
        <a href=""mailto:{Brand.Email}"" style=""color:{Brand.Muted};text-decoration:none;"">{Brand.Email}</a> &middot;
        <a href=""{Brand.SiteUrl}"" style=""color:{Brand.Muted};text-decoration:none;"">{Brand.SiteLabel}</a>
      </p>
      <p style=""margin:4px 0 0;"">{Brand.Company} &middot; Org.nr {Brand.OrgNumber} &middot; Österlen, Skåne</p>
      {privacy}
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>";
    }

    private static string RenderBlock(MailBlock block) => block switch
    {
        Paragraph p    => $@"<p style=""margin:0 0 16px;font-size:16px;line-height:1.6;"">{Multiline(p.Text)}</p>",
        Fields f       => RenderFields(f),
        Quote q        => RenderQuote(q),
        Buttons b      => RenderButtons(b),
        Note n         => $@"<p style=""margin:0 0 16px;font-size:14px;line-height:1.6;color:{Brand.Muted};"">{Multiline(n.Text)}</p>",
        LinkFallback l => RenderLinkFallback(l),
        _ => "",
    };

    private static string RenderFields(Fields f)
    {
        var rows = new StringBuilder();
        foreach (var (label, value) in f.Rows)
        {
            rows.Append($@"<tr><td style=""padding:10px 12px 10px 0;border-bottom:1px solid {Brand.Border};font-size:14px;color:{Brand.Muted};white-space:nowrap;vertical-align:top;width:1%;"">{E(label)}</td>");
            rows.Append($@"<td style=""padding:10px 0;border-bottom:1px solid {Brand.Border};font-size:15px;line-height:1.5;color:{Brand.Ink};vertical-align:top;word-break:break-word;"">{Multiline(value)}</td></tr>");
        }
        return $@"<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:0 0 20px;border-top:1px solid {Brand.Border};"">{rows}</table>";
    }

    private static string RenderQuote(Quote q) =>
        $@"<p style=""margin:0 0 6px;font-size:14px;color:{Brand.Muted};"">{E(q.Label)}</p>" +
        $@"<div style=""margin:0 0 20px;padding:14px 16px;background:{Brand.Paper};border-left:4px solid {Brand.Primary};border-radius:4px;font-size:15px;line-height:1.6;word-break:break-word;"">{Multiline(q.Text)}</div>";

    // Första knappen är huvudknappen (fylld), övriga är sekundära (kantade) — som på sajten.
    private static string RenderButtons(Buttons b)
    {
        var cells = new StringBuilder();
        for (var i = 0; i < b.Items.Count; i++)
        {
            var (label, url) = b.Items[i];
            var style = i == 0
                ? $"background:{Brand.PrimaryInk};color:#FFFFFF;border:1px solid {Brand.PrimaryInk};"
                : $"background:#FFFFFF;color:{Brand.Ink};border:1px solid {Brand.Border};";
            cells.Append($@"<td style=""padding:0 8px 8px 0;""><a href=""{E(url)}"" style=""display:inline-block;{style}font-size:15px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:999px;"">{E(label)}</a></td>");
        }
        return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:4px 0 12px;""><tr>{cells}</tr></table>";
    }

    private static string RenderLinkFallback(LinkFallback l) =>
        $@"<p style=""margin:0 0 16px;font-size:13px;line-height:1.5;color:{Brand.Muted};word-break:break-all;"">Fungerar inte knappen? Kopiera länken:<br><a href=""{E(l.Url)}"" style=""color:{Brand.PrimaryInk};"">{E(l.Url)}</a></p>";
}
