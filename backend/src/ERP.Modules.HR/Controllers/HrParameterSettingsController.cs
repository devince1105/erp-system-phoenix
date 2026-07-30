using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class HrParameterSettingsController : ControllerBase
{
    private readonly HRDbContext _context;

    public HrParameterSettingsController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HrParameterSetting>>> GetSettings()
    {
        return await _context.HrParameterSettings.ToListAsync();
    }

    [HttpGet("{group}")]
    public async Task<ActionResult<IEnumerable<HrParameterSetting>>> GetByGroup(string group)
    {
        return await _context.HrParameterSettings.Where(x => x.SettingGroup == group).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<HrParameterSetting>> PostSetting(HrParameterSetting setting)
    {
        _context.HrParameterSettings.Add(setting);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSettings), new { id = setting.Id }, setting);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutSetting(int id, HrParameterSetting setting)
    {
        if (id != setting.Id) return BadRequest();
        _context.Entry(setting).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSetting(int id)
    {
        var setting = await _context.HrParameterSettings.FindAsync(id);
        if (setting == null) return NotFound();
        _context.HrParameterSettings.Remove(setting);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
