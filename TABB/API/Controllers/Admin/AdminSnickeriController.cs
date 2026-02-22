using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Snickeri;
using Services.Src.Snickerier;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/snickerier")]
[Authorize(Roles = "Admin")]
public class AdminSnickeriController : ControllerBase
{
    private readonly ISnickeriService _snickeriService;

    public AdminSnickeriController(ISnickeriService snickeriService)
    {
        _snickeriService = snickeriService;
    }

    // GET: api/admin/snickerier
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var items = await _snickeriService.GetAllAdminAsync(ct);
        return Ok(items);
    }

    // GET: api/admin/snickerier/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var item = await _snickeriService.GetByIdAsync(id, ct);
        if (item == null)
            return NotFound(new { error = "Snickeri not found" });
        return Ok(item);
    }

    // POST: api/admin/snickerier
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSnickeriRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var id = await _snickeriService.CreateAsync(request, ct);
        return CreatedAtAction(
            nameof(GetById),
            new { id },
            new { id, message = "Snickeri created successfully" }
        );
    }

    // PUT: api/admin/snickerier/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSnickeriRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var success = await _snickeriService.UpdateAsync(id, request, ct);
        if (!success)
            return NotFound(new { error = "Snickeri not found" });

        return Ok(new { message = "Snickeri updated successfully" });
    }

    // DELETE: api/admin/snickerier/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var success = await _snickeriService.DeleteAsync(id, ct);
        if (!success)
            return NotFound(new { error = "Snickeri not found" });

        return Ok(new { message = "Snickeri deleted successfully" });
    }
}
