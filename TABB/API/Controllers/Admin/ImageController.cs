using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class ImageController(IWebHostEnvironment environment) : ControllerBase
{
    private readonly IWebHostEnvironment _environment = environment;

    // The uploads folder lives outside wwwroot — sibling to the app root.
    private static string UploadsRoot =>
        Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads"));

    // ── POST api/admin/image/upload ────────────────────────────

    [HttpPost("upload")]
    [RequestSizeLimit(10_485_760)] // 10 MB — hard ceiling at the HTTP level
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        // Delegate all validation to the helper
        var error = await ImageUploadHelper.ValidateAsync(image);
        if (error != null)
            return BadRequest(new { error });

        // Safe randomised filename — original name is discarded
        var fileName = ImageUploadHelper.GenerateSafeFileName(image);
        var folder = Path.Combine(UploadsRoot, "projects");
        Directory.CreateDirectory(folder);

        var filePath = Path.Combine(folder, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await image.CopyToAsync(stream);

        var relativePath = $"/uploads/projects/{fileName}";
        return Ok(new { success = true, path = relativePath, fileName });
    }

    // ── DELETE api/admin/image/delete ──────────────────────────

    [HttpDelete("delete")]
    public IActionResult DeleteImage([FromBody] DeleteImageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Path))
            return BadRequest(new { error = "Path required." });

        // Resolve and validate path — blocks traversal attacks
        var filePath = ImageUploadHelper.ResolveSafePath(UploadsRoot, request.Path);
        if (filePath == null)
            return BadRequest(new { error = "Invalid path." });

        if (!System.IO.File.Exists(filePath))
            return NotFound(new { error = "File not found." });

        System.IO.File.Delete(filePath);
        return Ok(new { success = true });
    }
}

public class DeleteImageRequest
{
    public string Path { get; set; } = string.Empty;
}