using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Models.Booking;
using Services.Src.Mail;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[EnableRateLimiting(RateLimitingExtensions.GeneralApi)]
public class BookingController(IEmailService emailService, ILogger<BookingController> logger) : ControllerBase
{
    private readonly IEmailService _emailService = emailService;
    private readonly ILogger<BookingController> _logger = logger;

    [HttpPost("create")]
    [EnableRateLimiting(RateLimitingExtensions.PublicForm)]  // overrides class-level policy
    public async Task<IActionResult> CreateBooking([FromBody] BookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _emailService.SendBookingEmailsAsync(request);
            return Ok(new { message = "Booking request sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process booking request from {Email}", request.Email);
            return StatusCode(500, new { error = "Failed to send booking email" });
        }
    }
}