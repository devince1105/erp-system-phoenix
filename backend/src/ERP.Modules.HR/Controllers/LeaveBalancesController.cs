using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class LeaveBalancesController : ControllerBase
{
    private readonly HRDbContext _context;

    public LeaveBalancesController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaveBalance>>> GetLeaveBalances()
    {
        return await _context.LeaveBalances
            .Include(l => l.Employee)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<LeaveBalance>>> GetEmployeeLeaveBalances(int employeeId)
    {
        return await _context.LeaveBalances
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.Year)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LeaveBalance>> GetLeaveBalance(int id)
    {
        var leaveBalance = await _context.LeaveBalances
            .Include(l => l.Employee)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (leaveBalance == null)
            return NotFound();

        return leaveBalance;
    }

    [HttpPost]
    public async Task<ActionResult<LeaveBalance>> CreateLeaveBalance(LeaveBalance leaveBalance)
    {
        leaveBalance.CreatedAt = DateTime.UtcNow;
        leaveBalance.RemainingDays = leaveBalance.TotalDays - leaveBalance.UsedDays;
        leaveBalance.Employee = null;

        _context.LeaveBalances.Add(leaveBalance);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLeaveBalance), new { id = leaveBalance.Id }, leaveBalance);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLeaveBalance(int id, LeaveBalance leaveBalance)
    {
        if (id != leaveBalance.Id)
            return BadRequest();

        var existing = await _context.LeaveBalances.FindAsync(id);
        if (existing == null)
            return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(leaveBalance);
        existing.RemainingDays = leaveBalance.TotalDays - leaveBalance.UsedDays;
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!LeaveBalanceExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLeaveBalance(int id)
    {
        var leaveBalance = await _context.LeaveBalances.FindAsync(id);
        if (leaveBalance == null)
            return NotFound();

        _context.LeaveBalances.Remove(leaveBalance);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool LeaveBalanceExists(int id)
    {
        return _context.LeaveBalances.Any(l => l.Id == id);
    }
}
