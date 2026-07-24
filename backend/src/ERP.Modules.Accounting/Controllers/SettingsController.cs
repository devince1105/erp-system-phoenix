using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public SettingsController(AccountingDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 取得關帳日
    /// </summary>
    [HttpGet("closing-date")]
    public async Task<ActionResult<string>> GetClosingDate()
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Accounting:ClosedUntilDate");
        if (setting == null)
        {
            return "2000-01-01";
        }
        return setting.Value;
    }

    /// <summary>
    /// 設定關帳日
    /// </summary>
    [HttpPost("closing-date")]
    public async Task<IActionResult> SetClosingDate([FromBody] string closingDate)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Accounting:ClosedUntilDate");
        
        if (setting == null)
        {
            setting = new SystemSetting { Key = "Accounting:ClosedUntilDate", Value = closingDate };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = closingDate;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "關帳日已成功更新", ClosingDate = closingDate });
    }

    /// <summary>
    /// 取得公司名稱
    /// </summary>
    [HttpGet("company-name")]
    [AllowAnonymous] // Allow reports to fetch this easily, or keep it authorized. Keeping authorized is fine since frontend uses axiosClient.
    public async Task<ActionResult<string>> GetCompanyName()
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Core:CompanyName");
        if (setting == null || string.IsNullOrWhiteSpace(setting.Value))
        {
            return "Phoenix ERP"; // Default name
        }
        return setting.Value;
    }

    /// <summary>
    /// 設定公司名稱
    /// </summary>
    [HttpPost("company-name")]
    public async Task<IActionResult> SetCompanyName([FromBody] string companyName)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Core:CompanyName");
        
        if (setting == null)
        {
            setting = new SystemSetting { Key = "Core:CompanyName", Value = companyName };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = companyName;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "公司名稱已成功更新", CompanyName = companyName });
    }
}
