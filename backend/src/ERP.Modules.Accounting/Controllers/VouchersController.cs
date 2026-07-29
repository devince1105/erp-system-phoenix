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
    [Authorize(Roles = "Admin,Accountant")]
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
    [Authorize(Roles = "Admin,Accountant")]
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
    [Authorize(Roles = "Admin,Accountant")] // Accountants can create vouchers for Admin review
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

    /// <summary>
    /// 過帳會計傳票 (Post Voucher)
    /// </summary>
    [HttpPost("{id}/post")]
    public async Task<IActionResult> PostVoucher(int id)
    {
        var voucher = await _context.Vouchers
            .Include(v => v.Details)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null) return NotFound($"找不到 ID 為 {id} 的傳票！");

        if (voucher.Status == VoucherStatus.Posted)
        {
            return BadRequest("已過帳之傳票不得重複過帳！");
        }

        // 0. 檢核關帳日
        var closedSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "Accounting:ClosedUntilDate");
        if (closedSetting != null && DateTime.TryParse(closedSetting.Value, out var closedDate))
        {
            if (voucher.VoucherDate <= closedDate)
            {
                return BadRequest($"此傳票日期已關帳 (關帳日: {closedDate:yyyy-MM-dd})，無法過帳！");
            }
        }

        // 1. 檢核借貸餘額是否平衡
        var totalDebit = voucher.Details.Where(d => d.IsDebit).Sum(d => d.Amount);
        var totalCredit = voucher.Details.Where(d => !d.IsDebit).Sum(d => d.Amount);

        if (totalDebit != totalCredit)
        {
            return BadRequest($"傳票借貸不平衡，無法過帳！借方總額: ${totalDebit}, 貸方總額: ${totalCredit}");
        }

        // 2. 更改狀態為已過帳
        voucher.Status = VoucherStatus.Posted;
        await _context.SaveChangesAsync();

        return Ok(voucher);
    }

    /// <summary>
    /// 審核傳票：將狀態從 Draft → Approved，並記錄審核人與時間。
    /// 僅 Admin 可執行。已審核或已過帳的傳票不得重複審核。
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveVoucher(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();

        if (voucher.Status != VoucherStatus.Draft)
            return BadRequest($"只有草稿狀態的傳票可以審核。目前狀態: {voucher.Status}");

        // Extract approver's UserId from JWT claim (sub = user ID)
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

        voucher.Status = VoucherStatus.Approved;
        voucher.ApprovedByUserId = userIdClaim != null && int.TryParse(userIdClaim.Value, out var uid) ? uid : null;
        voucher.ApprovedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"傳票 {voucher.VoucherNo} 已審核通過。",
            voucher.Status,
            voucher.ApprovedByUserId,
            voucher.ApprovedAt
        });
    }
}
