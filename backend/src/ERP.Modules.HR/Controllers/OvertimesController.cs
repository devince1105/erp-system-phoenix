using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class OvertimesController : ControllerBase
{
    private readonly HRDbContext _context;

    public OvertimesController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OvertimeRequest>>> GetOvertimes()
    {
        return await _context.OvertimeRequests
            .Include(o => o.Employee)
                .ThenInclude(e => e!.Department)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<OvertimeRequest>>> GetEmployeeOvertimes(int employeeId)
    {
        return await _context.OvertimeRequests
            .Include(o => o.Employee)
                .ThenInclude(e => e!.Department)
            .Where(o => o.EmployeeId == employeeId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<OvertimeRequest>> CreateOvertime(OvertimeRequest request)
    {
        if (request.Hours > 4)
        {
            return BadRequest("Overtime hours cannot exceed 4 hours per day according to labor laws.");
        }

        _context.OvertimeRequests.Add(request);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOvertimes), new { id = request.Id }, request);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOvertime(int id, OvertimeRequest request)
    {
        if (id != request.Id) return BadRequest();
        if (request.Hours > 4) return BadRequest("Overtime hours cannot exceed 4 hours per day according to labor laws.");

        var existing = await _context.OvertimeRequests.FindAsync(id);
        if (existing == null) return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(request);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.OvertimeRequests.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOvertime(int id)
    {
        var request = await _context.OvertimeRequests.FindAsync(id);
        if (request == null) return NotFound();

        _context.OvertimeRequests.Remove(request);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
