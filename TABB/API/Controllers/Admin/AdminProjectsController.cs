using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Project;
using Services.Src.Projects;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/projects")]
[Authorize(Roles = "Admin")]
public class AdminProjectsController : ControllerBase
{
    private readonly IProjectsService _projectsService;

    public AdminProjectsController(IProjectsService projectsService)
    {
        _projectsService = projectsService;
    }

    // GET: api/admin/projects
    [HttpGet]
    public async Task<IActionResult> GetAllProjects(CancellationToken ct)
    {
        var projects = await _projectsService.GetAllProjectsAdminAsync(ct);
        return Ok(projects);
    }

    // GET: api/admin/projects/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProject(Guid id, CancellationToken ct)
    {
        var project = await _projectsService.GetProjectByIdAsync(id, ct);

        if (project == null)
            return NotFound(new { error = "Project not found" });

        return Ok(project);
    }

    // POST: api/admin/projects
    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var id = await _projectsService.CreateProjectAsync(request, ct);

        return CreatedAtAction(
            nameof(GetProject),
            new { id },
            new { id, message = "Project created successfully" }
        );
    }

    // PUT: api/admin/projects/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var success = await _projectsService.UpdateProjectAsync(id, request, ct);

        if (!success)
            return NotFound(new { error = "Project not found" });

        return Ok(new { message = "Project updated successfully" });
    }

    // DELETE: api/admin/projects/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken ct)
    {
        var success = await _projectsService.DeleteProjectAsync(id, ct);

        if (!success)
            return NotFound(new { error = "Project not found" });

        return Ok(new { message = "Project deleted successfully" });
    }
}