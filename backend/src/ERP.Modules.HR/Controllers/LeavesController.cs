using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class LeavesController : ControllerBase
{
    private readonly HRDbContext _context;

    public LeavesController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaveRequest>>> GetLeaves()
    {
        return await _context.LeaveRequests
            .Include(l => l.Employee)
                .ThenInclude(e => e.Department)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<LeaveRequest>>> GetEmployeeLeaves(int employeeId)
    {
        return await _context.LeaveRequests
            .Include(l => l.Employee)
                .ThenInclude(e => e.Department)
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<LeaveRequest>> CreateLeave(LeaveRequest request)
    {
        _context.LeaveRequests.Add(request);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetLeaves), new { id = request.Id }, request);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLeave(int id, LeaveRequest request)
    {
        if (id != request.Id) return BadRequest();

        var existing = await _context.LeaveRequests.FindAsync(id);
        if (existing == null) return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(request);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.LeaveRequests.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLeave(int id)
    {
        var request = await _context.LeaveRequests.FindAsync(id);
        if (request == null) return NotFound();

        _context.LeaveRequests.Remove(request);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
