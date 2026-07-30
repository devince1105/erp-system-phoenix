using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
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
        return await _context.SalaryStructures.ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<SalaryStructure>> GetByEmployee(int employeeId)
    {
        var ss = await _context.SalaryStructures.FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
        if (ss == null) return NotFound();
        return ss;
    }

    [HttpPost]
    public async Task<ActionResult<SalaryStructure>> PostSalaryStructure(SalaryStructure ss)
    {
        _context.SalaryStructures.Add(ss);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSalaryStructures), new { id = ss.Id }, ss);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutSalaryStructure(int id, SalaryStructure ss)
    {
        if (id != ss.Id) return BadRequest();
        _context.Entry(ss).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
