using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
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
        return await _context.LeaveBalances.ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<LeaveBalance>>> GetByEmployee(int employeeId)
    {
        return await _context.LeaveBalances.Where(x => x.EmployeeId == employeeId).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<LeaveBalance>> PostLeaveBalance(LeaveBalance lb)
    {
        _context.LeaveBalances.Add(lb);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetLeaveBalances), new { id = lb.Id }, lb);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutLeaveBalance(int id, LeaveBalance lb)
    {
        if (id != lb.Id) return BadRequest();
        _context.Entry(lb).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
