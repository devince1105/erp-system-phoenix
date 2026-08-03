using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

/// <summary>
/// 萬用申請表單範本 CRUD (簽核流程設定 → 自訂申請單). Managing templates is Admin-only;
/// the active list is readable by any authenticated user (for the submit screen).
/// Steps are edited through /hr/workflows/Tpl{id} (the shared workflow editor).
/// </summary>
[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class ApprovalFormTemplatesController : ControllerBase
{
    private readonly HRDbContext _context;

    public ApprovalFormTemplatesController(HRDbContext context) => _context = context;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<ApprovalFormTemplate>>> GetAll()
    {
        return await _context.ApprovalFormTemplates.OrderBy(t => t.Name).ToListAsync();
    }

    /// <summary>Active templates for the submit screen (any authenticated user).</summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<ApprovalFormTemplate>>> GetActive()
    {
        return await _context.ApprovalFormTemplates.Where(t => t.IsActive).OrderBy(t => t.Name).ToListAsync();
    }

    public record TemplateDto(string Name, string? Description, bool RequireQuantity, bool RequireAmount, bool IsActive);

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApprovalFormTemplate>> Create([FromBody] TemplateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { message = "請填寫表單名稱。" });

        var template = new ApprovalFormTemplate
        {
            Name = dto.Name.Trim(),
            Description = dto.Description,
            RequireQuantity = dto.RequireQuantity,
            RequireAmount = dto.RequireAmount,
            IsActive = dto.IsActive,
        };
        _context.ApprovalFormTemplates.Add(template);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = template.Id }, template);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] TemplateDto dto)
    {
        var template = await _context.ApprovalFormTemplates.FindAsync(id);
        if (template == null) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { message = "請填寫表單名稱。" });

        template.Name = dto.Name.Trim();
        template.Description = dto.Description;
        template.RequireQuantity = dto.RequireQuantity;
        template.RequireAmount = dto.RequireAmount;
        template.IsActive = dto.IsActive;
        template.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var template = await _context.ApprovalFormTemplates.FindAsync(id);
        if (template == null) return NotFound();

        if (await _context.GenericApprovalRequests.AnyAsync(r => r.TemplateId == id))
            return BadRequest(new { message = "此範本已有申請單,請改為停用而非刪除。" });

        var steps = await _context.WorkflowStepDefinitions.Where(w => w.FormType == template.FormType).ToListAsync();
        _context.WorkflowStepDefinitions.RemoveRange(steps);
        _context.ApprovalFormTemplates.Remove(template);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
