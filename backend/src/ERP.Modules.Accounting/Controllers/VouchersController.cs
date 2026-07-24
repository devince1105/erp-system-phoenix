using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

public class CreateVoucherDto
{
    public DateTime VoucherDate { get; set; } = DateTime.Today;
    public VoucherType Type { get; set; } = VoucherType.General;
    public string? Memo { get; set; }
    public List<CreateVoucherDetailDto> Details { get; set; } = new();
}

public class CreateVoucherDetailDto
{
    public int AccountTitleId { get; set; }
    public bool IsDebit { get; set; }
    public decimal Amount { get; set; }
    public string? Summary { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VouchersController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public VouchersController(AccountingDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 取得所有傳票
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchers()
    {
        return await _context.Vouchers
            .Include(v => v.Details)
            .ThenInclude(d => d.AccountTitle)
            .OrderByDescending(v => v.VoucherDate)
            .ThenByDescending(v => v.Id)
            .ToListAsync();
    }

    /// <summary>
    /// 依 ID 取得傳票詳細資訊
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Voucher>> GetVoucher(int id)
    {
        var voucher = await _context.Vouchers
            .Include(v => v.Details)
            .ThenInclude(d => d.AccountTitle)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null) return NotFound();
        return voucher;
    }

    /// <summary>
    /// 新增會計傳票（含借貸平衡檢核）
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Voucher>> CreateVoucher(CreateVoucherDto dto)
    {
        if (dto.Details == null || !dto.Details.Any())
        {
            return BadRequest("傳票必須包含至少一筆明細！");
        }

        // 0. 檢核關帳日
        var closedSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Accounting:ClosedUntilDate");
        if (closedSetting != null && DateTime.TryParse(closedSetting.Value, out var closedDate))
        {
            if (dto.VoucherDate <= closedDate)
            {
                return BadRequest($"此傳票日期已關帳 (關帳日: {closedDate:yyyy-MM-dd})，不得新增！");
            }
        }

        // 1. 檢核借貸金額是否平衡 (Debit Total == Credit Total)
        var totalDebit = dto.Details.Where(d => d.IsDebit).Sum(d => d.Amount);
        var totalCredit = dto.Details.Where(d => !d.IsDebit).Sum(d => d.Amount);

        if (totalDebit != totalCredit)
        {
            return BadRequest($"傳票借貸不平衡！借方總額: ${totalDebit}, 貸方總額: ${totalCredit}，差額: ${Math.Abs(totalDebit - totalCredit)}");
        }

        if (totalDebit <= 0)
        {
            return BadRequest("傳票金額必須大於 0！");
        }

        // 2. 自動產生傳票單號 (格式: V + YYYYMMDD + 3位流水號)
        var datePrefix = $"V{dto.VoucherDate:yyyyMMdd}";
        var countToday = await _context.Vouchers.CountAsync(v => v.VoucherNo.StartsWith(datePrefix));
        var voucherNo = $"{datePrefix}{(countToday + 1):D3}";

        var voucher = new Voucher
        {
            VoucherNo = voucherNo,
            VoucherDate = dto.VoucherDate,
            Type = dto.Type,
            Status = VoucherStatus.Draft,
            TotalAmount = totalDebit,
            Memo = dto.Memo,
            CreatedAt = DateTime.UtcNow,
            Details = dto.Details.Select((d, idx) => new VoucherDetail
            {
                SeqNo = idx + 1,
                AccountTitleId = d.AccountTitleId,
                IsDebit = d.IsDebit,
                Amount = d.Amount,
                Summary = d.Summary
            }).ToList()
        };

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVoucher), new { id = voucher.Id }, voucher);
    }

    /// <summary>
    /// 修改會計傳票（草稿狀態下可修改，含借貸平衡檢核）
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVoucher(int id, CreateVoucherDto dto)
    {
        var voucher = await _context.Vouchers
            .Include(v => v.Details)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null) return NotFound($"找不到 ID 為 {id} 的傳票！");

        if (voucher.Status == VoucherStatus.Posted)
        {
            return BadRequest("已過帳之傳票基於商業會計法規範不得直接修改！請開立沖銷傳票。");
        }

        if (dto.Details == null || !dto.Details.Any())
        {
            return BadRequest("傳票必須包含至少一筆明細！");
        }

        // 0. 檢核關帳日
        var closedSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Accounting:ClosedUntilDate");
        if (closedSetting != null && DateTime.TryParse(closedSetting.Value, out var closedDate))
        {
            if (voucher.VoucherDate <= closedDate || dto.VoucherDate <= closedDate)
            {
                return BadRequest($"此傳票日期已關帳 (關帳日: {closedDate:yyyy-MM-dd})，不得修改！");
            }
        }

        // 1. 檢核借貸金額平衡
        var totalDebit = dto.Details.Where(d => d.IsDebit).Sum(d => d.Amount);
        var totalCredit = dto.Details.Where(d => !d.IsDebit).Sum(d => d.Amount);

        if (totalDebit != totalCredit)
        {
            return BadRequest($"傳票借貸不平衡！借方總額: ${totalDebit}, 貸方總額: ${totalCredit}，差額: ${Math.Abs(totalDebit - totalCredit)}");
        }

        if (totalDebit <= 0)
        {
            return BadRequest("傳票金額必須大於 0！");
        }

        // 2. 更新主檔與明細
        voucher.VoucherDate = dto.VoucherDate;
        voucher.Type = dto.Type;
        voucher.Memo = dto.Memo;
        voucher.TotalAmount = totalDebit;

        // 清除舊明細，寫入新明細
        _context.VoucherDetails.RemoveRange(voucher.Details);
        voucher.Details = dto.Details.Select((d, idx) => new VoucherDetail
        {
            VoucherId = voucher.Id,
            SeqNo = idx + 1,
            AccountTitleId = d.AccountTitleId,
            IsDebit = d.IsDebit,
            Amount = d.Amount,
            Summary = d.Summary
        }).ToList();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// 刪除會計傳票（僅限草稿狀態）
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVoucher(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();

        if (voucher.Status == VoucherStatus.Posted)
        {
            return BadRequest("已過帳之傳票不得刪除！");
        }

        // 0. 檢核關帳日
        var closedSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Accounting:ClosedUntilDate");
        if (closedSetting != null && DateTime.TryParse(closedSetting.Value, out var closedDate))
        {
            if (voucher.VoucherDate <= closedDate)
            {
                return BadRequest($"此傳票日期已關帳 (關帳日: {closedDate:yyyy-MM-dd})，不得刪除！");
            }
        }

        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
