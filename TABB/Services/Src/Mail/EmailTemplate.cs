using System.Globalization;
using Models.Booking;
using Models.Snickeri;

namespace Services.Src.Mail;

/// <summary>
/// Innehållet i alla mejl. Utseendet (logga, färger, sidfot) ligger i
/// <see cref="EmailLayout"/> — här beskrivs bara vad varje mejl säger.
/// </summary>
public static class EmailTemplate
{
    private static readonly CultureInfo Sv = CultureInfo.GetCultureInfo("sv-SE");

    // Kundens namn hamnar i mejl som skickas till den adress kunden själv angav.
    // Radbrytningar och extra blanksteg tas bort så att ingen kan bygga ihop en
    // egen text i mejlet via namnfältet.
    public static string OneLine(string? value, int max = 100)
    {
        var text = string.Join(' ', (value ?? "").Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        return text.Length <= max ? text : text[..max];
    }

    public static string Price(decimal price) => price.ToString("N0", Sv) + " kr";

    private static string FirstName(string name) => OneLine(name, 40).Split(' ')[0];

    // Servern kan stå i en annan tidszon — visa alltid svensk tid.
    private static string Now()
    {
        var utc = DateTime.UtcNow;
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Stockholm");
            return TimeZoneInfo.ConvertTimeFromUtc(utc, tz).ToString("yyyy-MM-dd HH:mm", Sv);
        }
        catch (TimeZoneNotFoundException)
        {
            return utc.ToString("yyyy-MM-dd HH:mm", Sv) + " UTC";
        }
    }

    private static string ReplyLink(string email, string subject) =>
        $"mailto:{email}?subject={Uri.EscapeDataString(subject)}";

    private static string TelLink(string phone) =>
        "tel:" + new string(phone.Where(c => char.IsDigit(c) || c == '+').ToArray());

    private static (string, string) WithOther(string label, string value, string? other) =>
        (label, string.IsNullOrWhiteSpace(other) ? value : $"{value} – {other}");

    // ── Bokning ────────────────────────────────────────────

    public static MailContent BookingAdmin(BookingRequest b)
    {
        var buttons = new List<(string, string)>
        {
            ($"Svara {FirstName(b.Name)}", ReplyLink(b.Email, "Din konsultationsförfrågan – Terrys Allbygg")),
        };
        if (!string.IsNullOrWhiteSpace(b.PhoneNumber))
            buttons.Add(($"Ring {b.PhoneNumber}", TelLink(b.PhoneNumber)));

        return EmailLayout.Render(new MailSpec
        {
            Preheader = $"{OneLine(b.Name)} – {b.Project}, {OneLine(b.Address)}",
            Heading = "Ny konsultationsförfrågan",
            Signature = false,
            Blocks =
            [
                new Paragraph($"{OneLine(b.Name)} vill boka en kostnadsfri konsultation. Svarar du på mejlet går svaret direkt till kunden."),
                new Fields(
                [
                    ("Namn", b.Name),
                    ("E-post", b.Email),
                    ("Telefon", b.PhoneNumber ?? "–"),
                    WithOther("Byggplats", b.Placement, b.Other1),
                    WithOther("Projekt", b.Project, b.Other2),
                    ("Adress", b.Address),
                    ("Skickad", Now()),
                ]),
                new Quote("Beskrivning", b.Description),
                new Buttons(buttons),
            ],
        });
    }

    public static MailContent BookingConfirmation(string name) => EmailLayout.Render(new MailSpec
    {
        Preheader = "Vi återkommer inom 24 timmar på vardagar.",
        Heading = $"Tack för din förfrågan, {FirstName(name)}!",
        PrivacyFooter = true,
        Blocks =
        [
            new Paragraph("Vi har tagit emot din förfrågan om en kostnadsfri konsultation och återkommer inom 24 timmar på vardagar."),
            new Paragraph("Vi går igenom det du har berättat om projektet och hör av oss för att boka en tid. Har du bilder eller ritningar får du gärna svara på det här mejlet och skicka med dem."),
            new Note($"Brådskande? Ring oss på {Brand.Phone}."),
            new Buttons([("Se våra projekt", Brand.SiteUrl + "/projekt")]),
        ],
    });

    // ── Snickeriförfrågan ──────────────────────────────────

    private static string SnickeriUrl(DetailedSnickeri s) => $"{Brand.SiteUrl}/snickerier/{s.Id}";

    public static MailContent SnickeriInquiryAdmin(SnickeriInquiryRequest r, DetailedSnickeri s)
    {
        var buttons = new List<(string, string)>
        {
            ($"Svara {FirstName(r.Name)}", ReplyLink(r.Email, $"Din förfrågan om {s.Title} – Terrys Allbygg")),
        };
        if (!string.IsNullOrWhiteSpace(r.PhoneNumber))
            buttons.Add(($"Ring {r.PhoneNumber}", TelLink(r.PhoneNumber)));
        buttons.Add(("Visa snickeriet", SnickeriUrl(s)));

        return EmailLayout.Render(new MailSpec
        {
            Preheader = $"{OneLine(r.Name)} är intresserad av {s.Title} ({Price(s.Price)})",
            Heading = $"Förfrågan om {s.Title}",
            Signature = false,
            Blocks =
            [
                new Paragraph($"{OneLine(r.Name)} är intresserad av {s.Title}. Svarar du på mejlet går svaret direkt till kunden."),
                new Fields(
                [
                    ("Snickeri", s.Title),
                    ("Pris", Price(s.Price)),
                    ("Namn", r.Name),
                    ("E-post", r.Email),
                    ("Telefon", r.PhoneNumber ?? "–"),
                    ("Skickad", Now()),
                ]),
                string.IsNullOrWhiteSpace(r.Notes)
                    ? (MailBlock)new Note("Inget meddelande.")
                    : new Quote("Meddelande", r.Notes),
                new Buttons(buttons),
            ],
        });
    }

    public static MailContent SnickeriInquiryConfirmation(string name, DetailedSnickeri s) => EmailLayout.Render(new MailSpec
    {
        Preheader = "Vi återkommer inom 24 timmar på vardagar.",
        Heading = $"Tack för din förfrågan, {FirstName(name)}!",
        PrivacyFooter = true,
        Blocks =
        [
            new Paragraph($"Vi har tagit emot din förfrågan om {s.Title} och återkommer inom 24 timmar på vardagar."),
            new Fields([("Snickeri", s.Title), ("Pris", Price(s.Price))]),
            new Paragraph("Vill du ändra något i färg, storlek eller material kan du svara på det här mejlet, så tar vi med det när vi hör av oss."),
            new Note($"Brådskande? Ring oss på {Brand.Phone}."),
            new Buttons([($"Visa {s.Title}", SnickeriUrl(s))]),
        ],
    });

    // ── Admin: inbjudan och lösenord ───────────────────────

    public static MailContent AdminInvite(string inviteLink, int validHours) => EmailLayout.Render(new MailSpec
    {
        Preheader = "Skapa ditt konto för att hantera projekt och snickerier.",
        Heading = "Du är inbjuden som administratör",
        Blocks =
        [
            new Paragraph($"Du har bjudits in att hantera webbplatsen för {Brand.Company}: projekt, snickerier och bilder."),
            new Buttons([("Skapa ditt konto", inviteLink)]),
            new LinkFallback(inviteLink),
            new Note($"Länken gäller i {Hours(validHours)}. Känner du inte igen inbjudan kan du ignorera mejlet."),
        ],
    });

    public static MailContent PasswordReset(string resetLink, int validHours) => EmailLayout.Render(new MailSpec
    {
        Preheader = "Välj ett nytt lösenord för ditt admin-konto.",
        Heading = "Återställ ditt lösenord",
        Blocks =
        [
            new Paragraph($"Någon har begärt ett nytt lösenord för ditt admin-konto på {Brand.SiteLabel}."),
            new Buttons([("Välj nytt lösenord", resetLink)]),
            new LinkFallback(resetLink),
            new Note($"Länken gäller i {Hours(validHours)}. Har du inte begärt detta kan du ignorera mejlet – ditt lösenord ändras inte."),
        ],
    });

    private static string Hours(int h) => h == 1 ? "1 timme" : $"{h} timmar";
}
