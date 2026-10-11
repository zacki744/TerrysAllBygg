namespace Models;

// Maxlängder för publika formulär och admin-konton. Samma värden finns i
// frontend/src/lib/formLimits.ts (maxLength på fälten) — ändra på båda ställena.
public static class FormLimits
{
    public const int Name        = 100;
    public const int Email       = 254;   // RFC 5321
    public const int Phone       = 30;
    public const int Choice      = 50;    // värden från <select>
    public const int ShortText   = 200;   // "annat"-fält, adress
    public const int LongText    = 3000;  // beskrivning, meddelande

    // BCrypt använder bara de första 72 byten — längre lösenord ger falsk trygghet.
    public const int PasswordMin = 8;
    public const int PasswordMax = 72;
}
