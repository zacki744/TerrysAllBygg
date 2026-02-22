using Microsoft.AspNetCore.Mvc;
using Models.Booking;
using Services.Src.Mail;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingController(IEmailService emailService) : ControllerBase
{
    private readonly IEmailService _emailService = emailService;

    [HttpPost("create")]
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
            // TODO: replace with proper logging
            Console.WriteLine(ex);
            return StatusCode(500, new { error = "Failed to send booking email", detail = ex.Message });
        }
    }
}
