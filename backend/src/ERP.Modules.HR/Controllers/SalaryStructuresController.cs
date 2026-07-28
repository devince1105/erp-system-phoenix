using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class SalaryStructuresController : ControllerBase
{
    private readonly HRDbContext _context;

    public SalaryStructuresController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalaryStructure>>> GetSalaryStructures()
    {
        return await _context.SalaryStructures
            .Include(s => s.Employee)
            .Where(s => s.IsActive)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<SalaryStructure>>> GetEmployeeSalaryStructures(int employeeId)
    {
        return await _context.SalaryStructures
            .Where(s => s.EmployeeId == employeeId)
            .OrderByDescending(s => s.EffectiveFrom)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalaryStructure>> GetSalaryStructure(int id)
    {
        var salaryStructure = await _context.SalaryStructures
            .Include(s => s.Employee)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (salaryStructure == null)
            return NotFound();

        return salaryStructure;
    }

    [HttpPost]
    public async Task<ActionResult<SalaryStructure>> CreateSalaryStructure(SalaryStructure salaryStructure)
    {
        salaryStructure.CreatedAt = DateTime.UtcNow;
        salaryStructure.Employee = null;

        _context.SalaryStructures.Add(salaryStructure);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSalaryStructure), new { id = salaryStructure.Id }, salaryStructure);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSalaryStructure(int id, SalaryStructure salaryStructure)
    {
        if (id != salaryStructure.Id)
            return BadRequest();

        var existing = await _context.SalaryStructures.FindAsync(id);
        if (existing == null)
            return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(salaryStructure);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SalaryStructureExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalaryStructure(int id)
    {
        var salaryStructure = await _context.SalaryStructures.FindAsync(id);
        if (salaryStructure == null)
            return NotFound();

        _context.SalaryStructures.Remove(salaryStructure);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SalaryStructureExists(int id)
    {
        return _context.SalaryStructures.Any(s => s.Id == id);
    }
}
