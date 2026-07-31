using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using ERP.Modules.HR.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class ExpenseClaimsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly ApprovalService _approvals;

    public ExpenseClaimsController(HRDbContext context, ApprovalService approvals)
    {
        _context = context;
        _approvals = approvals;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseClaim>>> GetExpenseClaims()
    {
        return await _context.ExpenseClaims
            .Include(e => e.Employee)
            .OrderByDescending(e => e.ClaimDate)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<ExpenseClaim>>> GetEmployeeExpenseClaims(int employeeId)
    {
        return await _context.ExpenseClaims
            .Where(e => e.EmployeeId == employeeId)
            .OrderByDescending(e => e.ClaimDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseClaim>> GetExpenseClaim(int id)
    {
        var expenseClaim = await _context.ExpenseClaims
            .Include(e => e.Employee)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expenseClaim == null)
            return NotFound();

        return expenseClaim;
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseClaim>> CreateExpenseClaim(ExpenseClaim expenseClaim)
    {
        expenseClaim.CreatedAt = DateTime.UtcNow;
        expenseClaim.Employee = null;

        _context.ExpenseClaims.Add(expenseClaim);
        await _context.SaveChangesAsync();

        // Kick off the approval workflow for this claim.
        await _approvals.CreateAsync("ExpenseClaim", expenseClaim.Id);

        return CreatedAtAction(nameof(GetExpenseClaim), new { id = expenseClaim.Id }, expenseClaim);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpenseClaim(int id, ExpenseClaim expenseClaim)
    {
        if (id != expenseClaim.Id)
            return BadRequest();

        var existing = await _context.ExpenseClaims.FindAsync(id);
        if (existing == null)
            return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(expenseClaim);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ExpenseClaimExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateExpenseClaimStatus(int id, [FromBody] string status)
    {
        var existing = await _context.ExpenseClaims.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.Status = status;
        existing.ProcessedDate = DateTime.UtcNow;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpenseClaim(int id)
    {
        var expenseClaim = await _context.ExpenseClaims.FindAsync(id);
        if (expenseClaim == null)
            return NotFound();

        _context.ExpenseClaims.Remove(expenseClaim);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ExpenseClaimExists(int id)
    {
        return _context.ExpenseClaims.Any(e => e.Id == id);
    }
}
