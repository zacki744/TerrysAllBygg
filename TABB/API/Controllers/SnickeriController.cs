using Microsoft.AspNetCore.Mvc;
using Services.Src.Snickerier;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SnickeriController : ControllerBase
{
    private readonly ISnickeriService _snickeriService;

    public SnickeriController(ISnickeriService snickeriService)
    {
        _snickeriService = snickeriService;
    }

    // GET: api/snickerier (overview list)
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
}
