using Models.Booking;
using Models.Snickeri;

namespace Services.Src.Mail;

public static class EmailTemplate
{
    private const string SiteUrl    = "https://terrysallbygg.se";
    private const string PrivacyUrl = SiteUrl + "/integritetspolicy";

    // Kundens namn hamnar i mejl som skickas till den adress kunden själv angav.
    // Radbrytningar och extra blanksteg tas bort så att ingen kan bygga ihop en
    // egen text i mejlet via namnfältet.
    public static string OneLine(string? value, int max = 100)
    {
        var text = string.Join(' ', (value ?? "").Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        return text.Length <= max ? text : text[..max];
    }

    private const string PrivacyFooter = $@"
        Dina uppgifter används bara för att besvara din förfrågan.
        Läs mer om hur vi hanterar dem och om dina rättigheter:
        {PrivacyUrl}";

    // ── Booking ────────────────────────────────────────────

    public static string BookingAdmin(BookingRequest b) => $@"
        Ny konsultationsförfrågan – Terrys Allbygg

        Namn:        {b.Name}
        E-post:      {b.Email}
        Telefon:     {b.PhoneNumber ?? "–"}
        Plats:       {b.Placement}{(string.IsNullOrWhiteSpace(b.Other1) ? "" : $" – {b.Other1}")}
        Projekt:     {b.Project}{(string.IsNullOrWhiteSpace(b.Other2) ? "" : $" – {b.Other2}")}
        Adress:      {b.Address}

        Beskrivning:
        {b.Description}

        Skickades: {DateTime.Now:yyyy-MM-dd HH:mm}
    ";

    public static string BookingConfirmation(string name) => $@"
        Hej {OneLine(name)},

        Tack för att du har skickat en konsultationsförfrågan till Terrys Allbygg.
        Vi har mottagit din förfrågan och återkommer inom 24 timmar på vardagar.

        Med vänliga hälsningar,
        Terrys Allbygg
        E-post: info@terrysallbygg.se
        {PrivacyFooter}
    ";

    // ── Snickeri inquiry ───────────────────────────────────

    public static string SnickeriInquiryAdmin(SnickeriInquiryRequest r, DetailedSnickeri s) => $@"
        Ny förfrågan om snickeri – Terrys Allbygg

        Titel:   {s.Title}
        Pris:    {s.Price:N0} kr
        Länk:    {SiteUrl}/snickerier/{s.Id}

        Namn:    {r.Name}
        E-post:  {r.Email}
        Telefon: {r.PhoneNumber ?? "–"}

        Meddelande:
        {(string.IsNullOrWhiteSpace(r.Notes) ? "Inget meddelande." : r.Notes)}

        Skickades: {DateTime.Now:yyyy-MM-dd HH:mm}
    ";

    public static string SnickeriInquiryConfirmation(string name, string title, decimal price) => $@"
        Hej {OneLine(name)},

        Tack för din förfrågan om ""{title}"" ({price:N0} kr).
        Vi återkommer inom 24 timmar på vardagar.

        Med vänliga hälsningar,
        Terrys Allbygg
        {PrivacyFooter}
    ";

    // ── Admin invite ───────────────────────────────────────

    public static string AdminInvite(string inviteLink) => $@"
        Hej,

        Du har bjudits in som administratör för Terrys Allbygg.

        Klicka på länken nedan för att skapa ditt konto.
        Länken är giltig i 1 timme.

        {inviteLink}

        Om du inte känner igen denna inbjudan kan du ignorera detta mail.

        Med vänliga hälsningar,
        Terrys Allbygg
    ";

    // ── Password reset ─────────────────────────────────────

    public static string PasswordReset(string resetLink) => $@"
        Hej,

        En begäran om lösenordsåterställning har gjorts för ditt admin-konto på Terrys Allbygg.

        Klicka på länken nedan för att sätta ett nytt lösenord.
        Länken är giltig i 24 timmar.

        {resetLink}

        Om du inte begärt detta kan du ignorera detta mail — ditt lösenord ändras inte.

        Med vänliga hälsningar,
        Terrys Allbygg
    ";
}