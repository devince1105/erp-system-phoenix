using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public ReportsController(AccountingDbContext context)
    {
        _context = context;
    }

    [HttpGet("profit-and-loss")]
    public async Task<IActionResult> GetProfitAndLoss([FromQuery] string startDate, [FromQuery] string endDate)
    {
        if (!DateTime.TryParse(startDate, out var start) || !DateTime.TryParse(endDate, out var end))
        {
            return BadRequest("無效的日期格式");
        }

        var vouchers = await _context.Vouchers
            .Include(v => v.Details)
            .ThenInclude(d => d.AccountTitle)
            .Where(v => v.VoucherDate >= start && v.VoucherDate <= end && v.Status != VoucherStatus.Draft)
            .ToListAsync();

        var revenues = new Dictionary<string, decimal>();
        var expenses = new Dictionary<string, decimal>();

        foreach (var v in vouchers)
        {
            foreach (var d in v.Details)
            {
                if (d.AccountTitle == null) continue;

                if (d.AccountTitle.Category == AccountCategory.Revenue)
                {
                    // 貸方為增加收入，借方為減少收入
                    var netAmount = d.IsDebit ? -d.Amount : d.Amount;
                    if (!revenues.ContainsKey(d.AccountTitle.Name)) revenues[d.AccountTitle.Name] = 0;
                    revenues[d.AccountTitle.Name] += netAmount;
                }
                else if (d.AccountTitle.Category == AccountCategory.Expense)
                {
                    // 借方為增加費用，貸方為減少費用
                    var netAmount = d.IsDebit ? d.Amount : -d.Amount;
                    if (!expenses.ContainsKey(d.AccountTitle.Name)) expenses[d.AccountTitle.Name] = 0;
                    expenses[d.AccountTitle.Name] += netAmount;
                }
            }
        }

        var totalRevenue = revenues.Values.Sum();
        var totalExpense = expenses.Values.Sum();
        var netProfit = totalRevenue - totalExpense;

        return Ok(new
        {
            StartDate = start.ToString("yyyy-MM-dd"),
            EndDate = end.ToString("yyyy-MM-dd"),
            Revenues = revenues.Select(kvp => new { Title = kvp.Key, Amount = kvp.Value }).ToList(),
            Expenses = expenses.Select(kvp => new { Title = kvp.Key, Amount = kvp.Value }).ToList(),
            TotalRevenue = totalRevenue,
            TotalExpense = totalExpense,
            NetProfit = netProfit
        });
    }

    [HttpGet("balance-sheet")]
    public async Task<IActionResult> GetBalanceSheet([FromQuery] string asOfDate)
    {
        if (!DateTime.TryParse(asOfDate, out var date))
        {
            return BadRequest("無效的日期格式");
        }

        // Get all posted/approved vouchers up to asOfDate
        var vouchers = await _context.Vouchers
            .Include(v => v.Details)
            .ThenInclude(d => d.AccountTitle)
            .Where(v => v.VoucherDate <= date && v.Status != VoucherStatus.Draft)
            .ToListAsync();

        var assets = new Dictionary<string, decimal>();
        var liabilities = new Dictionary<string, decimal>();
        var equity = new Dictionary<string, decimal>();

        decimal currentYearNetProfit = 0; // Simplified handling for retained earnings calculation

        foreach (var v in vouchers)
        {
            foreach (var d in v.Details)
            {
                if (d.AccountTitle == null) continue;

                if (d.AccountTitle.Category == AccountCategory.Asset)
                {
                    // 借方增加，貸方減少
                    var netAmount = d.IsDebit ? d.Amount : -d.Amount;
                    if (!assets.ContainsKey(d.AccountTitle.Name)) assets[d.AccountTitle.Name] = 0;
                    assets[d.AccountTitle.Name] += netAmount;
                }
                else if (d.AccountTitle.Category == AccountCategory.Liability)
                {
                    // 貸方增加，借方減少
                    var netAmount = d.IsDebit ? -d.Amount : d.Amount;
                    if (!liabilities.ContainsKey(d.AccountTitle.Name)) liabilities[d.AccountTitle.Name] = 0;
                    liabilities[d.AccountTitle.Name] += netAmount;
                }
                else if (d.AccountTitle.Category == AccountCategory.Equity)
                {
                    // 貸方增加，借方減少
                    var netAmount = d.IsDebit ? -d.Amount : d.Amount;
                    if (!equity.ContainsKey(d.AccountTitle.Name)) equity[d.AccountTitle.Name] = 0;
                    equity[d.AccountTitle.Name] += netAmount;
                }
                else if (d.AccountTitle.Category == AccountCategory.Revenue)
                {
                    currentYearNetProfit += (d.IsDebit ? -d.Amount : d.Amount);
                }
                else if (d.AccountTitle.Category == AccountCategory.Expense)
                {
                    currentYearNetProfit -= (d.IsDebit ? d.Amount : -d.Amount);
                }
            }
        }

        // Add net profit to equity automatically (Retained Earnings)
        if (currentYearNetProfit != 0)
        {
            if (!equity.ContainsKey("本期淨利 (自動結算)")) equity["本期淨利 (自動結算)"] = 0;
            equity["本期淨利 (自動結算)"] += currentYearNetProfit;
        }

        var totalAssets = assets.Values.Sum();
        var totalLiabilities = liabilities.Values.Sum();
        var totalEquity = equity.Values.Sum();

        return Ok(new
        {
            AsOfDate = date.ToString("yyyy-MM-dd"),
            Assets = assets.Select(kvp => new { Title = kvp.Key, Amount = kvp.Value }).ToList(),
            Liabilities = liabilities.Select(kvp => new { Title = kvp.Key, Amount = kvp.Value }).ToList(),
            Equity = equity.Select(kvp => new { Title = kvp.Key, Amount = kvp.Value }).ToList(),
            TotalAssets = totalAssets,
            TotalLiabilities = totalLiabilities,
            TotalEquity = totalEquity,
            TotalLiabilitiesAndEquity = totalLiabilities + totalEquity
        });
    }
}
