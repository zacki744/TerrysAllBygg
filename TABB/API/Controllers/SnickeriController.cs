using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Models.Snickeri;
using Services.Src.Mail;
using Services.Src.Snickerier;

namespace API.Controllers;

[ApiController]
[Route("api/snickerier")]
[EnableRateLimiting(RateLimitingExtensions.GeneralApi)]
public class SnickeriController(
    ISnickeriService snickeriService,
    IEmailService emailService,
    ILogger<SnickeriController> logger) : ControllerBase
{
    private readonly ISnickeriService _snickeriService = snickeriService;
    private readonly IEmailService _emailService = emailService;
    private readonly ILogger<SnickeriController> _logger = logger;

    // GET: api/snickerier
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var items = await _snickeriService.GetOverviewAsync(ct);
        return Ok(items);
    }

    // GET: api/snickerier/details/{id}
    [HttpGet("details/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var item = await _snickeriService.GetByIdPublicAsync(id, ct);
        if (item == null)
            return NotFound(new { error = "Snickeri not found" });
        return Ok(item);
    }

    // POST: api/snickerier/inquire
    [HttpPost("inquire")]
    [EnableRateLimiting(RateLimitingExtensions.PublicForm)]  // overrides class-level
    public async Task<IActionResult> Inquire(
        [FromBody] SnickeriInquiryRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _emailService.SendSnickeriInquiryAsync(request);
            return Ok(new { message = "Förfrågan skickad!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process snickeri inquiry from {Email}", request.Email);
            return StatusCode(500, new { error = "Kunde inte skicka förfrågan" });
        }
    }
}