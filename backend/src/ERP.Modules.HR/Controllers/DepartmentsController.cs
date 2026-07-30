using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "departments_list";

    public DepartmentsController(HRDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
    {
        if (_cache.TryGetValue(CacheKey, out IEnumerable<Department>? cachedDepartments))
        {
            return Ok(cachedDepartments);
        }

        var departments = await _context.Departments
            .Include(d => d.Manager)
            .OrderBy(d => d.Id)
            .ToListAsync();

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

        _cache.Set(CacheKey, departments, cacheEntryOptions);

        return Ok(departments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Manager)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (department == null)
            return NotFound();

        return department;
    }

    [HttpPost]
    public async Task<ActionResult<Department>> CreateDepartment(Department department)
    {
        department.CreatedAt = DateTime.UtcNow;
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        _cache.Remove(CacheKey);

        return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDepartment(int id, Department department)
    {
        if (id != department.Id)
            return BadRequest();

        department.UpdatedAt = DateTime.UtcNow;
        _context.Entry(department).State = EntityState.Modified;
        // Do not overwrite CreatedAt
        _context.Entry(department).Property(x => x.CreatedAt).IsModified = false;

        try
        {
            await _context.SaveChangesAsync();
            _cache.Remove(CacheKey);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!DepartmentExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null) return NotFound();

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        _cache.Remove(CacheKey);

        return NoContent();
    }

    private bool DepartmentExists(int id)
    {
        return _context.Departments.Any(e => e.Id == id);
    }
}
