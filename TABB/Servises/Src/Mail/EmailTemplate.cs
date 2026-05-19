using Models.Booking;
using Models.Snickeri;

namespace Services.Src.Mail;

public static class EmailTemplate
{
    // ── Booking ────────────────────────────────────────────

    public static string BookingAdmin(BookingRequest b) => $@"
        Ny konsultationsförfrågan – Terrys All Bygg

        Namn:        {b.Name}
        E-post:      {b.Email}
        Telefon:     {b.PhoneNumber ?? "–"}
        Projekt:     {b.Project}
        Adress:      {b.Address}

        Beskrivning:
        {b.Description}

        Skickades: {DateTime.Now:yyyy-MM-dd HH:mm}
    ";

    public static string BookingConfirmation(string name) => $@"
        Hej {name},

        Tack för att du har skickat en konsultationsförfrågan till Terrys All Bygg.
        Vi har mottagit din förfrågan och återkommer inom 1–2 arbetsdagar.

        Med vänliga hälsningar,
        Terrys All Bygg
        E-post: info@terrysallbygg.se
    ";

    // ── Snickeri inquiry ───────────────────────────────────

    public static string SnickeriInquiryAdmin(SnickeriInquiryRequest r) => $@"
        Ny förfrågan om snickeri – Terrys All Bygg

        Titel:   {r.SnickeriTitle}
        Pris:    {r.SnickeriPrice:N0} kr
        ID:      {r.SnickeriId}

        Namn:    {r.Name}
        E-post:  {r.Email}
        Telefon: {r.PhoneNumber ?? "–"}

        Meddelande:
        {(string.IsNullOrWhiteSpace(r.Notes) ? "Inget meddelande." : r.Notes)}

        Skickades: {DateTime.Now:yyyy-MM-dd HH:mm}
    ";

    public static string SnickeriInquiryConfirmation(string name, string title, decimal price) => $@"
        Hej {name},

        Tack för din förfrågan om ""{title}"" ({price:N0} kr).
        Vi återkommer inom 24 timmar.

        Med vänliga hälsningar,
        Terrys All Bygg
    ";

    // ── Admin invite ───────────────────────────────────────

    public static string AdminInvite(string inviteLink) => $@"
        Hej,

        Du har bjudits in som administratör för Terrys All Bygg.

        Klicka på länken nedan för att skapa ditt konto.
        Länken är giltig i 1 timme.

        {inviteLink}

        Om du inte känner igen denna inbjudan kan du ignorera detta mail.

        Med vänliga hälsningar,
        Terrys All Bygg
    ";

    // ── Password reset ─────────────────────────────────────

    public static string PasswordReset(string resetLink) => $@"
        Hej,

        En begäran om lösenordsåterställning har gjorts för ditt admin-konto på Terrys All Bygg.

        Klicka på länken nedan för att sätta ett nytt lösenord.
        Länken är giltig i 24 timmar.

        {resetLink}

        Om du inte begärt detta kan du ignorera detta mail — ditt lösenord ändras inte.

        Med vänliga hälsningar,
        Terrys All Bygg
    ";
}