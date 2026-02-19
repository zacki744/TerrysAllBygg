using Microsoft.AspNetCore.Mvc;
using Services.Src.Projects;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectsService _projectsService;

    public ProjectsController(IProjectsService projectsService)
    {
        _projectsService = projectsService;
    }

    // GET: api/projects (overview list)
    [HttpGet]
    public async Task<IActionResult> GetProjects(CancellationToken ct)
    {
        var projects = await _projectsService.GetOverviewInformationAsync(ct);
        return Ok(projects);
    }

    // GET: api/projects/details/{id} (detailed project by ID)
    [HttpGet("details/{id:guid}")]
    public async Task<IActionResult> GetProjectById(Guid id, CancellationToken ct)
    {
        var project = await _projectsService.GetProjectByIdPublicAsync(id, ct);

        if (project == null)
            return NotFound(new { error = "Project not found" });

        return Ok(project);
    }
}