using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class PayrollsController : ControllerBase
{
    private readonly HRDbContext _context;

    public PayrollsController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PayrollRecord>>> GetPayrolls()
    {
        return await _context.Payrolls
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<PayrollRecord>>> GetEmployeePayrolls(int employeeId)
    {
        return await _context.Payrolls
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<PayrollRecord>> CreatePayroll(PayrollRecord record)
    {
        _context.Payrolls.Add(record);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPayrolls), new { id = record.Id }, record);
    }

    [HttpPost("generate/{year}/{month}")]
    public async Task<IActionResult> GeneratePayrolls(int year, int month)
    {
        var employees = await _context.Employees.Where(e => e.Status == EmployeeStatus.Active).ToListAsync();
        
        foreach (var emp in employees)
        {
            var existing = await _context.Payrolls.FirstOrDefaultAsync(p => p.EmployeeId == emp.Id && p.Year == year && p.Month == month);
            if (existing == null)
            {
                var payroll = new PayrollRecord
                {
                    EmployeeId = emp.Id,
                    Year = year,
                    Month = month,
                    BaseSalary = emp.BaseSalary,
                    Bonus = 0,
                    Deductions = 0,
                    NetSalary = emp.BaseSalary,
                    Status = "Draft"
                };
                _context.Payrolls.Add(payroll);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Payrolls generated successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayroll(int id, PayrollRecord record)
    {
        if (id != record.Id) return BadRequest();

        var existing = await _context.Payrolls.FindAsync(id);
        if (existing == null) return NotFound();

        // Calculate NetSalary
        record.NetSalary = record.BaseSalary + record.Bonus - record.Deductions;

        _context.Entry(existing).CurrentValues.SetValues(record);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Payrolls.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayroll(int id)
    {
        var record = await _context.Payrolls.FindAsync(id);
        if (record == null) return NotFound();

        _context.Payrolls.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
