using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Services.Src.Settings;

namespace API.Controllers;

[ApiController]
[Route("api/settings")]
[EnableRateLimiting(RateLimitingExtensions.GeneralApi)]
public class SettingsController(ISettingsService settings) : ControllerBase
{
    // GET: api/settings — läses av varje sida och av förrenderingen vid bygget
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        Response.Headers.CacheControl = "no-cache";   // alltid färskt efter att Terry sparat
        return Ok(await settings.GetAsync(ct));
    }
}
