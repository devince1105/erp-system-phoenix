using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountTitlesController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public AccountTitlesController(AccountingDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 取得所有會計科目
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AccountTitle>>> GetAccountTitles([FromQuery] AccountCategory? category)
    {
        var query = _context.AccountTitles.AsQueryable();

        if (category.HasValue)
        {
            query = query.Where(t => t.Category == category.Value);
        }

        return await query.OrderBy(t => t.Code).ToListAsync();
    }

    /// <summary>
    /// 依 ID 取得會計科目
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AccountTitle>> GetAccountTitle(int id)
    {
        var title = await _context.AccountTitles.FindAsync(id);
        if (title == null) return NotFound();
        return title;
    }

    /// <summary>
    /// 新增會計科目
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AccountTitle>> CreateAccountTitle(AccountTitle accountTitle)
    {
        if (await _context.AccountTitles.AnyAsync(t => t.Code == accountTitle.Code))
        {
            return BadRequest($"科目代碼 '{accountTitle.Code}' 已存在！");
        }

        _context.AccountTitles.Add(accountTitle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAccountTitle), new { id = accountTitle.Id }, accountTitle);
    }
}
