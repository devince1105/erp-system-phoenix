using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

/// <summary>固定資產管理 + 折舊. Read: any authenticated; manage + depreciation: Admin/Accountant.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FixedAssetsController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public FixedAssetsController(AccountingDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var assets = await _context.FixedAssets.OrderBy(a => a.AssetNo).ToListAsync();
        return Ok(assets.Select(Project));
    }

    private static object Project(FixedAsset a) => new
    {
        a.Id, a.AssetNo, a.Name, a.Category, a.AcquisitionDate, a.AcquisitionCost, a.SalvageValue,
        a.UsefulLifeMonths, a.AccumulatedDepreciation, a.LastDepreciatedPeriod, a.Status,
        a.MonthlyDepreciation, a.BookValue,
    };

    public record AssetDto(string Name, string Category, DateTime AcquisitionDate, decimal AcquisitionCost, decimal SalvageValue, int UsefulLifeMonths, string? Status);

    [HttpPost]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Create([FromBody] AssetDto dto)
    {
        var err = Validate(dto);
        if (err != null) return BadRequest(new { message = err });

        var count = await _context.FixedAssets.CountAsync();
        var asset = new FixedAsset
        {
            AssetNo = $"FA-{(count + 1):D4}",
            Name = dto.Name.Trim(), Category = dto.Category,
            AcquisitionDate = dto.AcquisitionDate, AcquisitionCost = dto.AcquisitionCost,
            SalvageValue = dto.SalvageValue, UsefulLifeMonths = dto.UsefulLifeMonths,
            Status = "InUse",
        };
        _context.FixedAssets.Add(asset);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = asset.Id }, Project(asset));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Update(int id, [FromBody] AssetDto dto)
    {
        var asset = await _context.FixedAssets.FindAsync(id);
        if (asset == null) return NotFound();
        var err = Validate(dto);
        if (err != null) return BadRequest(new { message = err });

        asset.Name = dto.Name.Trim(); asset.Category = dto.Category;
        asset.AcquisitionDate = dto.AcquisitionDate; asset.AcquisitionCost = dto.AcquisitionCost;
        asset.SalvageValue = dto.SalvageValue; asset.UsefulLifeMonths = dto.UsefulLifeMonths;
        if (!string.IsNullOrWhiteSpace(dto.Status)) asset.Status = dto.Status!;
        asset.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Delete(int id)
    {
        var asset = await _context.FixedAssets.FindAsync(id);
        if (asset == null) return NotFound();
        if (asset.AccumulatedDepreciation > 0) return BadRequest(new { message = "已提列折舊的資產不可刪除,請改為處分。" });
        _context.FixedAssets.Remove(asset);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Run straight-line depreciation for a period. For each in-use asset acquired on or
    /// before the period and not yet depreciated for it, book one month's charge (capped
    /// at the depreciable base) and post one aggregate voucher Dr 折舊費用 / Cr 累計折舊.
    /// Idempotent per period.
    /// </summary>
    [HttpPost("depreciate/{year}/{month}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Depreciate(int year, int month)
    {
        if (month is < 1 or > 12) return BadRequest(new { message = "月份無效。" });
        var period = year * 100 + month;
        var periodEnd = new DateTime(year, month, 1).AddMonths(1).AddDays(-1);

        var assets = await _context.FixedAssets
            .Where(a => a.Status == "InUse" && a.AcquisitionDate <= periodEnd && a.LastDepreciatedPeriod < period)
            .ToListAsync();

        decimal total = 0;
        int count = 0;
        foreach (var a in assets)
        {
            var remaining = (a.AcquisitionCost - a.SalvageValue) - a.AccumulatedDepreciation;
            if (remaining <= 0) { a.Status = "FullyDepreciated"; continue; }
            var charge = Math.Min(a.MonthlyDepreciation, remaining);
            if (charge <= 0) continue;
            a.AccumulatedDepreciation += charge;
            a.LastDepreciatedPeriod = period;
            if (a.AccumulatedDepreciation >= a.AcquisitionCost - a.SalvageValue) a.Status = "FullyDepreciated";
            a.UpdatedAt = DateTime.UtcNow;
            total += charge;
            count++;
        }

        var voucherCreated = false;
        if (total > 0)
        {
            var depExpenseId = await _context.AccountTitles.Where(x => x.Code == "6501").Select(x => (int?)x.Id).FirstOrDefaultAsync();
            var accDepId = await _context.AccountTitles.Where(x => x.Code == "1501").Select(x => (int?)x.Id).FirstOrDefaultAsync();
            if (depExpenseId != null && accDepId != null)
            {
                var datePrefix = $"V{periodEnd:yyyyMMdd}";
                var todayCount = await _context.Vouchers.CountAsync(v => v.VoucherNo.StartsWith(datePrefix));
                _context.Vouchers.Add(new Voucher
                {
                    VoucherNo = $"{datePrefix}{(todayCount + 1):D3}",
                    VoucherDate = periodEnd,
                    Type = VoucherType.General,
                    Status = VoucherStatus.Draft,
                    Memo = $"{year}年{month:D2}月 固定資產折舊提列（{count} 項）",
                    TotalAmount = total,
                    Details = new List<VoucherDetail>
                    {
                        new() { SeqNo = 1, AccountTitleId = depExpenseId.Value, IsDebit = true,  Amount = total, Summary = $"{year}/{month:D2} 折舊費用" },
                        new() { SeqNo = 2, AccountTitleId = accDepId.Value,     IsDebit = false, Amount = total, Summary = $"{year}/{month:D2} 累計折舊" },
                    },
                });
                voucherCreated = true;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { year, month, assetsDepreciated = count, totalDepreciation = total, voucherCreated });
    }

    private static string? Validate(AssetDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return "請填寫資產名稱。";
        if (dto.AcquisitionCost <= 0) return "取得成本須大於 0。";
        if (dto.SalvageValue < 0 || dto.SalvageValue >= dto.AcquisitionCost) return "殘值須介於 0 與取得成本之間。";
        if (dto.UsefulLifeMonths <= 0) return "耐用月數須大於 0。";
        return null;
    }
}
