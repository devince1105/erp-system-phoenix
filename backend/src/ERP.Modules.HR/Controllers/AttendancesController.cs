using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class AttendancesController : ControllerBase
{
    private readonly HRDbContext _context;

    public AttendancesController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetAttendances()
    {
        return await _context.Attendances
            .Include(a => a.Employee)
                .ThenInclude(e => e.Department)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.Id)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetEmployeeAttendances(int employeeId)
    {
        return await _context.Attendances
            .Include(a => a.Employee)
                .ThenInclude(e => e.Department)
            .Where(a => a.EmployeeId == employeeId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<AttendanceRecord>> CreateAttendance(AttendanceRecord record)
    {
        _context.Attendances.Add(record);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAttendances), new { id = record.Id }, record);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAttendance(int id, AttendanceRecord record)
    {
        if (id != record.Id) return BadRequest();

        var existing = await _context.Attendances.FindAsync(id);
        if (existing == null) return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(record);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Attendances.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttendance(int id)
    {
        var record = await _context.Attendances.FindAsync(id);
        if (record == null) return NotFound();

        _context.Attendances.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
