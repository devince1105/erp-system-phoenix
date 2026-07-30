using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class ExpenseClaimsController : ControllerBase
{
    private readonly HRDbContext _context;

    public ExpenseClaimsController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseClaim>>> GetExpenseClaims()
    {
        return await _context.ExpenseClaims.ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<ExpenseClaim>>> GetByEmployee(int employeeId)
    {
        return await _context.ExpenseClaims.Where(x => x.EmployeeId == employeeId).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseClaim>> PostExpenseClaim(ExpenseClaim ec)
    {
        _context.ExpenseClaims.Add(ec);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetExpenseClaims), new { id = ec.Id }, ec);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutExpenseClaim(int id, ExpenseClaim ec)
    {
        if (id != ec.Id) return BadRequest();
        _context.Entry(ec).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpenseClaim(int id)
    {
        var ec = await _context.ExpenseClaims.FindAsync(id);
        if (ec == null) return NotFound();
        _context.ExpenseClaims.Remove(ec);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
