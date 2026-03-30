using Models.Booking;
using Models.Snickeri;

namespace Services.Src.Mail;

public static class EmailTemplate
{
    // ── Booking ────────────────────────────────────────────────

    public static string BookingAdmin(BookingRequest b) => $@"
        Ny konsultationsförfrågan – Terrys All Bygg

        Namn:        {b.Name}
        E-post:      {b.Email}
        Telefon:     {b.PhoneNumber}
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

        Är ditt ärende brådskande är du välkommen att kontakta oss direkt via telefon.

        Med vänliga hälsningar,
        Terrys All Bygg
        E-post: info@terrysallbygg.se
        Telefon: 07X-XXX XX XX
    ";

    // ── Snickeri inquiry ───────────────────────────────────────

    public static string SnickeriInquiryAdmin(SnickeriInquiryRequest r) => $@"
        Ny förfrågan om snickeri – Terrys All Bygg

        ── Snickeri ──────────────────────────
        Titel: {r.SnickeriTitle}
        Pris:  {r.SnickeriPrice:N0} kr
        ID:    {r.SnickeriId}

        ── Kund ──────────────────────────────
        Namn:    {r.Name}
        E-post:  {r.Email}
        Telefon: {r.PhoneNumber ?? "–"}

        ── Meddelande ────────────────────────
        {(string.IsNullOrWhiteSpace(r.Notes) ? "Inget meddelande." : r.Notes)}

        Skickades: {DateTime.Now:yyyy-MM-dd HH:mm}
    ";

    public static string SnickeriInquiryConfirmation(string name, string title, decimal price) => $@"
        Hej {name},

        Tack för din förfrågan om ""{title}"" ({price:N0} kr).

        Vi har mottagit din förfrågan och återkommer inom 24 timmar med mer information.

        Med vänliga hälsningar,
        Terrys All Bygg
        E-post: info@terrysallbygg.se
        Telefon: 07X-XXX XX XX
    ";
}