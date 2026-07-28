using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class HrParameterSettingsController : ControllerBase
{
    private readonly HRDbContext _context;

    public HrParameterSettingsController(HRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HrParameterSetting>>> GetHrParameterSettings()
    {
        return await _context.HrParameterSettings
            .Where(p => p.IsActive)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HrParameterSetting>> GetHrParameterSetting(int id)
    {
        var setting = await _context.HrParameterSettings.FindAsync(id);
        if (setting == null)
            return NotFound();

        return setting;
    }

    [HttpGet("by-name/{parameterName}")]
    public async Task<ActionResult<HrParameterSetting>> GetHrParameterSettingByName(string parameterName)
    {
        var setting = await _context.HrParameterSettings
            .FirstOrDefaultAsync(p => p.ParameterName == parameterName && p.IsActive);

        if (setting == null)
            return NotFound();

        return setting;
    }

    [HttpPost]
    public async Task<ActionResult<HrParameterSetting>> CreateHrParameterSetting(HrParameterSetting setting)
    {
        setting.CreatedAt = DateTime.UtcNow;

        _context.HrParameterSettings.Add(setting);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHrParameterSetting), new { id = setting.Id }, setting);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHrParameterSetting(int id, HrParameterSetting setting)
    {
        if (id != setting.Id)
            return BadRequest();

        var existing = await _context.HrParameterSettings.FindAsync(id);
        if (existing == null)
            return NotFound();

        _context.Entry(existing).CurrentValues.SetValues(setting);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!HrParameterSettingExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHrParameterSetting(int id)
    {
        var setting = await _context.HrParameterSettings.FindAsync(id);
        if (setting == null)
            return NotFound();

        _context.HrParameterSettings.Remove(setting);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool HrParameterSettingExists(int id)
    {
        return _context.HrParameterSettings.Any(p => p.Id == id);
    }
}
