using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

/// <summary>職級表 (job grades / salary bands). Read: any authenticated; manage: Admin/HR.</summary>
[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class JobGradesController : ControllerBase
{
    private readonly HRDbContext _context;

    public JobGradesController(HRDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobGrade>>> GetAll()
    {
        return await _context.JobGrades.OrderBy(g => g.SortOrder).ThenBy(g => g.Code).ToListAsync();
    }

    public record GradeDto(string Code, string Title, decimal MinSalary, decimal MaxSalary, int SortOrder, bool IsActive);

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<JobGrade>> Create([FromBody] GradeDto dto)
    {
        var err = Validate(dto);
        if (err != null) return BadRequest(new { message = err });
        var grade = new JobGrade { Code = dto.Code.Trim(), Title = dto.Title.Trim(), MinSalary = dto.MinSalary, MaxSalary = dto.MaxSalary, SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        _context.JobGrades.Add(grade);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = grade.Id }, grade);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(int id, [FromBody] GradeDto dto)
    {
        var grade = await _context.JobGrades.FindAsync(id);
        if (grade == null) return NotFound();
        var err = Validate(dto);
        if (err != null) return BadRequest(new { message = err });
        grade.Code = dto.Code.Trim(); grade.Title = dto.Title.Trim();
        grade.MinSalary = dto.MinSalary; grade.MaxSalary = dto.MaxSalary;
        grade.SortOrder = dto.SortOrder; grade.IsActive = dto.IsActive;
        grade.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Delete(int id)
    {
        var grade = await _context.JobGrades.FindAsync(id);
        if (grade == null) return NotFound();
        if (await _context.Employees.AnyAsync(e => e.JobGradeId == id))
            return BadRequest(new { message = "此職級已有員工使用,請先改派職級。" });
        _context.JobGrades.Remove(grade);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static string? Validate(GradeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code)) return "請填寫職級代碼。";
        if (string.IsNullOrWhiteSpace(dto.Title)) return "請填寫職級名稱。";
        if (dto.MinSalary < 0 || dto.MaxSalary < 0) return "薪資不可為負。";
        if (dto.MaxSalary < dto.MinSalary) return "薪資上限不可小於下限。";
        return null;
    }
}
