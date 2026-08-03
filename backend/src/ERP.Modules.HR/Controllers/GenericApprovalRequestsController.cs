using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using ERP.Modules.HR.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

/// <summary>
/// 萬用申請單 — instances submitted against an <see cref="ApprovalFormTemplate"/>.
/// Submitting runs the template's configured approval flow via the shared engine.
/// </summary>
[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class GenericApprovalRequestsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly ApprovalService _approvals;

    public GenericApprovalRequestsController(HRDbContext context, ApprovalService approvals)
    {
        _context = context;
        _approvals = approvals;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GenericApprovalRequest>>> GetAll()
    {
        return await _context.GenericApprovalRequests
            .Include(r => r.Template)
            .Include(r => r.Employee)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GenericApprovalRequest>> Get(int id)
    {
        var request = await _context.GenericApprovalRequests
            .Include(r => r.Template)
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == id);
        return request == null ? NotFound() : request;
    }

    public record CreateGenericRequestDto(int TemplateId, int EmployeeId, string Title, int? Quantity, decimal? Amount, string? Reason, string? AttachmentUrl);

    [HttpPost]
    public async Task<ActionResult<GenericApprovalRequest>> Create([FromBody] CreateGenericRequestDto dto)
    {
        var template = await _context.ApprovalFormTemplates.FindAsync(dto.TemplateId);
        if (template == null || !template.IsActive) return BadRequest(new { message = "找不到或已停用的申請表單。" });
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest(new { message = "請填寫主旨。" });

        var request = new GenericApprovalRequest
        {
            TemplateId = dto.TemplateId,
            EmployeeId = dto.EmployeeId,
            Title = dto.Title.Trim(),
            Quantity = template.RequireQuantity ? dto.Quantity : null,
            Amount = template.RequireAmount ? dto.Amount : null,
            Reason = dto.Reason,
            AttachmentUrl = dto.AttachmentUrl,
            Status = "Pending",
        };
        _context.GenericApprovalRequests.Add(request);
        await _context.SaveChangesAsync();

        // Run the template's approval flow (FormType "Tpl{templateId}").
        await _approvals.CreateAsync(template.FormType, request.Id);

        return CreatedAtAction(nameof(Get), new { id = request.Id }, request);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await _context.GenericApprovalRequests.FindAsync(id);
        if (request == null) return NotFound();
        _context.GenericApprovalRequests.Remove(request);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
