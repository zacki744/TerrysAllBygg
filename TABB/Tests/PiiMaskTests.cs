using Services.Src.Logging;

namespace Tests;

public class PiiMaskTests
{
    [Theory]
    [InlineData("anna.svensson@gmail.com", "a***@gmail.com")]
    [InlineData("x@terrysallbygg.se", "x***@terrysallbygg.se")]
    [InlineData(null, "–")]
    [InlineData("", "–")]
    [InlineData("inte-en-adress", "***")]
    [InlineData("@utan-namn.se", "***")]
    public void Email_maskerar_allt_utom_första_tecknet_och_domänen(string? input, string expected)
        => Assert.Equal(expected, PiiMask.Email(input));
}
