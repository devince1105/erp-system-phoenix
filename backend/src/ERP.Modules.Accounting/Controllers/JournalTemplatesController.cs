using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

/// <summary>常用分錄範本 CRUD. Any authenticated user can read; Admin/Accountant manage.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JournalTemplatesController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public JournalTemplatesController(AccountingDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JournalTemplate>>> GetAll()
    {
        return await _context.JournalTemplates
            .Include(t => t.Lines).ThenInclude(l => l.AccountTitle)
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public record LineDto(int AccountTitleId, bool IsDebit, decimal Amount, string? Summary);
    public record TemplateDto(string Name, string? Description, bool IsActive, List<LineDto> Lines);

    [HttpPost]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<JournalTemplate>> Create([FromBody] TemplateDto dto)
    {
        var err = Validate(dto);
        if (err != null) return BadRequest(new { message = err });

        var template = new JournalTemplate { Name = dto.Name.Trim(), Description = dto.Description, IsActive = dto.IsActive };
        foreach (var l in dto.Lines)
            template.Lines.Add(new JournalTemplateLine { AccountTitleId = l.AccountTitleId, IsDebit = l.IsDebit, Amount = l.Amount, Summary = l.Summary });

        _context.JournalTemplates.Add(template);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = template.Id }, template);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Update(int id, [FromBody] TemplateDto dto)
    {
        var template = await _context.JournalTemplates.Include(t => t.Lines).FirstOrDefaultAsync(t => t.Id == id);
        if (template == null) return NotFound();
        var err = Validate(dto);
        if (err != null) return BadRequest(new { message = err });

        template.Name = dto.Name.Trim();
        template.Description = dto.Description;
        template.IsActive = dto.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        _context.JournalTemplateLines.RemoveRange(template.Lines);
        template.Lines = dto.Lines.Select(l => new JournalTemplateLine
        {
            AccountTitleId = l.AccountTitleId, IsDebit = l.IsDebit, Amount = l.Amount, Summary = l.Summary
        }).ToList();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Delete(int id)
    {
        var template = await _context.JournalTemplates.FindAsync(id);
        if (template == null) return NotFound();
        _context.JournalTemplates.Remove(template);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static string? Validate(TemplateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return "請填寫範本名稱。";
        if (dto.Lines == null || dto.Lines.Count < 2) return "分錄範本至少需要兩行(一借一貸)。";
        if (!dto.Lines.Any(l => l.IsDebit) || !dto.Lines.Any(l => !l.IsDebit)) return "範本需同時包含借方與貸方。";
        return null;
    }
}
