using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly HRDbContext _context;

    public EmployeesController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Educations)
            .Include(e => e.Experiences)
            .Include(e => e.JobHistories).ThenInclude(h => h.Department)
            .OrderByDescending(e => e.Id)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Educations)
            .Include(e => e.Experiences)
            .Include(e => e.JobHistories).ThenInclude(h => h.Department)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound();

        return employee;
    }

    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
    {
        employee.CreatedAt = DateTime.UtcNow;
        // EF Core handles relations, so make sure navigation prop is null if only ID is provided
        employee.Department = null;
        
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
    {
        if (id != employee.Id)
            return BadRequest();

        var existingEmployee = await _context.Employees
            .Include(e => e.Educations)
            .Include(e => e.Experiences)
            .Include(e => e.JobHistories)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (existingEmployee == null)
            return NotFound();

        // Update basic properties
        _context.Entry(existingEmployee).CurrentValues.SetValues(employee);
        existingEmployee.UpdatedAt = DateTime.UtcNow;

        // Update Educations
        _context.Educations.RemoveRange(existingEmployee.Educations);
        if (employee.Educations != null)
        {
            foreach (var edu in employee.Educations)
            {
                edu.Id = 0; // ensure it's added as new
                existingEmployee.Educations.Add(edu);
            }
        }

        // Update Experiences
        _context.Experiences.RemoveRange(existingEmployee.Experiences);
        if (employee.Experiences != null)
        {
            foreach (var exp in employee.Experiences)
            {
                exp.Id = 0; // ensure it's added as new
                existingEmployee.Experiences.Add(exp);
            }
        }

        // Update JobHistories
        _context.JobHistories.RemoveRange(existingEmployee.JobHistories);
        if (employee.JobHistories != null)
        {
            foreach (var jh in employee.JobHistories)
            {
                jh.Id = 0; // ensure it's added as new
                jh.Department = null; // Do not try to insert Department
                existingEmployee.JobHistories.Add(jh);
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EmployeeExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EmployeeExists(int id)
    {
        return _context.Employees.Any(e => e.Id == id);
    }
}
