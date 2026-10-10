namespace Services.Src.Logging;

/// <summary>
/// Maskerar personuppgifter innan de skrivs till loggar (GDPR: dataminimering).
/// Loggfiler sparas i 14 dagar och ska inte innehålla fullständiga
/// e-postadresser till kunder som skickat förfrågningar.
/// </summary>
public static class PiiMask
{
    /// <summary>"anna.svensson@gmail.com" → "a***@gmail.com"</summary>
    public static string Email(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "–";

        var at = email.IndexOf('@');
        if (at <= 0)
            return "***";

        return $"{email[0]}***{email[at..]}";
    }
}
