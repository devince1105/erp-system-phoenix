using ERP.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERP.Modules.HR.Controllers;

/// <summary>
/// Handles receipt image/PDF uploads for expense claims. The actual storage
/// (local disk or Cloudflare R2) is provided by the configured IReceiptStorage.
/// </summary>
[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class ReceiptsController : ControllerBase
{
    private readonly IReceiptStorage _storage;
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf" };
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

    public ReceiptsController(IReceiptStorage storage) => _storage = storage;

    [HttpPost("upload")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("未收到檔案");
        if (file.Length > MaxBytes)
            return BadRequest("檔案超過 5MB 上限");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest("僅支援 jpg / png / webp / gif / pdf");

        var fileName = $"{Guid.NewGuid():N}{ext}";
        await using var stream = file.OpenReadStream();
        var stored = await _storage.SaveAsync(stream, fileName, file.ContentType);

        // Cloud storage returns an absolute URL; local storage returns a
        // site-relative path that we turn into an absolute URL here.
        var url = stored.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? stored
            : $"{Request.Scheme}://{Request.Host}{stored}";

        return Ok(new { url });
    }
}
