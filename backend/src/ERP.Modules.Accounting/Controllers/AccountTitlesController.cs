using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    [Authorize(Roles = "Admin,Accountant")]
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
    [Authorize(Roles = "Admin,Accountant")]
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
    [Authorize(Roles = "Admin")]
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
    /// <summary>
    /// 更新會計科目
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAccountTitle(int id, AccountTitle accountTitle)
    {
        if (id != accountTitle.Id)
        {
            return BadRequest();
        }

        var existing = await _context.AccountTitles.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (existing == null)
        {
            return NotFound();
        }

        // Check if code changed and is duplicate
        if (existing.Code != accountTitle.Code)
        {
            if (await _context.AccountTitles.AnyAsync(t => t.Code == accountTitle.Code))
            {
                return BadRequest($"科目代碼 '{accountTitle.Code}' 已存在！");
            }
        }

        _context.Entry(accountTitle).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.AccountTitles.AnyAsync(e => e.Id == id))
                return NotFound();
            else
                throw;
        }

        return NoContent();
    }

    /// <summary>
    /// 刪除會計科目
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAccountTitle(int id)
    {
        var accountTitle = await _context.AccountTitles.FindAsync(id);
        if (accountTitle == null)
        {
            return NotFound();
        }

        _context.AccountTitles.Remove(accountTitle);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
