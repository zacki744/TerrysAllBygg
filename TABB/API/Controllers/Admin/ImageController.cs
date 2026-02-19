using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class ImageController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public ImageController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(10_485_760)] // 10MB
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Invalid file type" });

        var fileName = $"{Guid.NewGuid()}{extension}";
        var uploadsBasePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "projects");
        Directory.CreateDirectory(uploadsBasePath);

        var filePath = Path.Combine(uploadsBasePath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/projects/{fileName}";

        return Ok(new { success = true, path = relativePath, fileName });
    }

    [HttpDelete("delete")]
    public IActionResult DeleteImage([FromBody] DeleteImageRequest request)
    {
        if (string.IsNullOrEmpty(request.Path))
            return BadRequest(new { error = "Path required" });

        var uploadsBasePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var filePath = Path.Combine(uploadsBasePath, request.Path.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
            return Ok(new { success = true });
        }

        return NotFound(new { error = "File not found" });
    }
}

public class DeleteImageRequest
{
    public string Path { get; set; } = string.Empty;
}