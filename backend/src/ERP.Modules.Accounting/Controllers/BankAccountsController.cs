using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

public class CreateBankAccountDto
{
    public string BankCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string? BranchName { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string Currency { get; set; } = "TWD";
    public decimal Balance { get; set; }
    public int? AccountTitleId { get; set; }
    public BankApiIntegrationType ApiType { get; set; } = BankApiIntegrationType.None;
    public string? ApiEndpoint { get; set; }
    public string? ApiClientId { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class BankAccountsController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public BankAccountsController(AccountingDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 取得所有銀行帳戶
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BankAccount>>> GetBankAccounts()
    {
        return await _context.BankAccounts
            .Include(b => b.AccountTitle)
            .OrderBy(b => b.BankCode)
            .ToListAsync();
    }

    /// <summary>
    /// 依 ID 取得單一銀行帳戶
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BankAccount>> GetBankAccount(int id)
    {
        var account = await _context.BankAccounts
            .Include(b => b.AccountTitle)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (account == null) return NotFound();
        return account;
    }

    /// <summary>
    /// 新增銀行帳戶與 Open API 設定
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BankAccount>> CreateBankAccount(CreateBankAccountDto dto)
    {
        if (await _context.BankAccounts.AnyAsync(b => b.AccountNumber == dto.AccountNumber))
        {
            return BadRequest($"銀行帳號 '{dto.AccountNumber}' 已存在！");
        }

        var account = new BankAccount
        {
            BankCode = dto.BankCode,
            BankName = dto.BankName,
            BranchName = dto.BranchName,
            AccountNumber = dto.AccountNumber,
            AccountName = dto.AccountName,
            Currency = dto.Currency,
            Balance = dto.Balance,
            AccountTitleId = dto.AccountTitleId,
            ApiType = dto.ApiType,
            ApiEndpoint = dto.ApiEndpoint,
            ApiClientId = dto.ApiClientId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.BankAccounts.Add(account);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBankAccount), new { id = account.Id }, account);
    }

    /// <summary>
    /// 修改銀行帳戶設定與 API 金鑰
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBankAccount(int id, CreateBankAccountDto dto)
    {
        var account = await _context.BankAccounts.FindAsync(id);
        if (account == null) return NotFound();

        account.BankCode = dto.BankCode;
        account.BankName = dto.BankName;
        account.BranchName = dto.BranchName;
        account.AccountNumber = dto.AccountNumber;
        account.AccountName = dto.AccountName;
        account.Currency = dto.Currency;
        account.Balance = dto.Balance;
        account.AccountTitleId = dto.AccountTitleId;
        account.ApiType = dto.ApiType;
        account.ApiEndpoint = dto.ApiEndpoint;
        account.ApiClientId = dto.ApiClientId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 一鍵與銀行 API 連線同步帳戶餘額 (Bank Open API Sync Simulation)
    /// </summary>
    [HttpPost("{id}/sync")]
    public async Task<IActionResult> SyncBankApi(int id)
    {
        var account = await _context.BankAccounts.FindAsync(id);
        if (account == null) return NotFound();

        if (account.ApiType == BankApiIntegrationType.None)
        {
            return BadRequest("該帳戶尚未啟用 Bank Open API 串接模式！請先至設定中設定 API 連線模式。");
        }

        // 模擬串接 Open Banking API 同步
        account.LastSyncedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"已成功與 {account.BankName} Open API 連線同步！",
            syncedAt = account.LastSyncedAt,
            currentBalance = account.Balance
        });
    }

    /// <summary>
    /// 刪除/停用銀行帳戶
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBankAccount(int id)
    {
        var account = await _context.BankAccounts.FindAsync(id);
        if (account == null) return NotFound();

        _context.BankAccounts.Remove(account);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
