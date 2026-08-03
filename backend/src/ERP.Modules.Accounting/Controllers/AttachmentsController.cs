using ERP.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERP.Modules.Accounting.Controllers;

/// <summary>
/// Uploads supporting-document images/PDFs (憑證) and returns a stored URL. The
/// actual storage (local disk or Cloudflare R2) is provided by the configured
/// IReceiptStorage — the same pluggable backend HR receipts use.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private const long MaxBytes = 6 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf",
    };

    private readonly IReceiptStorage _storage;

    public AttachmentsController(IReceiptStorage storage) => _storage = storage;

    [HttpPost("upload")]
    [RequestSizeLimit(MaxBytes)]
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

        var url = stored.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? stored
            : $"{Request.Scheme}://{Request.Host}{stored}";

        return Ok(new { url });
    }
}
