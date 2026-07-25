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

        var revenues = new Dictionary<int, (string Code, string Title, decimal Amount)>();
        var expenses = new Dictionary<int, (string Code, string Title, decimal Amount)>();

        foreach (var v in vouchers)
        {
            foreach (var d in v.Details)
            {
                if (d.AccountTitle == null) continue;
                var accId = d.AccountTitle.Id;

                if (d.AccountTitle.Category == AccountCategory.Revenue)
                {
                    // 貸方為增加收入，借方為減少收入
                    var netAmount = d.IsDebit ? -d.Amount : d.Amount;
                    if (!revenues.ContainsKey(accId)) revenues[accId] = (d.AccountTitle.Code, d.AccountTitle.Name, 0);
                    var entry = revenues[accId];
                    revenues[accId] = (entry.Code, entry.Title, entry.Amount + netAmount);
                }
                else if (d.AccountTitle.Category == AccountCategory.Expense)
                {
                    // 借方為增加費用，貸方為減少費用
                    var netAmount = d.IsDebit ? d.Amount : -d.Amount;
                    if (!expenses.ContainsKey(accId)) expenses[accId] = (d.AccountTitle.Code, d.AccountTitle.Name, 0);
                    var entry = expenses[accId];
                    expenses[accId] = (entry.Code, entry.Title, entry.Amount + netAmount);
                }
            }
        }

        var totalRevenue = revenues.Values.Sum(x => x.Amount);
        var totalExpense = expenses.Values.Sum(x => x.Amount);
        var netProfit = totalRevenue - totalExpense;

        return Ok(new
        {
            StartDate = start.ToString("yyyy-MM-dd"),
            EndDate = end.ToString("yyyy-MM-dd"),
            Revenues = revenues.Values.Select(v => new { Code = v.Code, Title = v.Title, Amount = v.Amount }).OrderBy(x => x.Code).ToList(),
            Expenses = expenses.Values.Select(v => new { Code = v.Code, Title = v.Title, Amount = v.Amount }).OrderBy(x => x.Code).ToList(),
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

        var assets = new Dictionary<int, (string Code, string Title, decimal Amount)>();
        var liabilities = new Dictionary<int, (string Code, string Title, decimal Amount)>();
        var equity = new Dictionary<int, (string Code, string Title, decimal Amount)>();

        decimal currentYearNetProfit = 0; // Simplified handling for retained earnings calculation

        foreach (var v in vouchers)
        {
            foreach (var d in v.Details)
            {
                if (d.AccountTitle == null) continue;
                var accId = d.AccountTitle.Id;

                if (d.AccountTitle.Category == AccountCategory.Asset)
                {
                    // 借方增加，貸方減少
                    var netAmount = d.IsDebit ? d.Amount : -d.Amount;
                    if (!assets.ContainsKey(accId)) assets[accId] = (d.AccountTitle.Code, d.AccountTitle.Name, 0);
                    var entry = assets[accId];
                    assets[accId] = (entry.Code, entry.Title, entry.Amount + netAmount);
                }
                else if (d.AccountTitle.Category == AccountCategory.Liability)
                {
                    // 貸方增加，借方減少
                    var netAmount = d.IsDebit ? -d.Amount : d.Amount;
                    if (!liabilities.ContainsKey(accId)) liabilities[accId] = (d.AccountTitle.Code, d.AccountTitle.Name, 0);
                    var entry = liabilities[accId];
                    liabilities[accId] = (entry.Code, entry.Title, entry.Amount + netAmount);
                }
                else if (d.AccountTitle.Category == AccountCategory.Equity)
                {
                    // 貸方增加，借方減少
                    var netAmount = d.IsDebit ? -d.Amount : d.Amount;
                    if (!equity.ContainsKey(accId)) equity[accId] = (d.AccountTitle.Code, d.AccountTitle.Name, 0);
                    var entry = equity[accId];
                    equity[accId] = (entry.Code, entry.Title, entry.Amount + netAmount);
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
            equity[-1] = ("3301", "本期淨利 (自動結算)", currentYearNetProfit);
        }

        var totalAssets = assets.Values.Sum(x => x.Amount);
        var totalLiabilities = liabilities.Values.Sum(x => x.Amount);
        var totalEquity = equity.Values.Sum(x => x.Amount);

        return Ok(new
        {
            AsOfDate = date.ToString("yyyy-MM-dd"),
            Assets = assets.Values.Select(v => new { Code = v.Code, Title = v.Title, Amount = v.Amount }).OrderBy(x => x.Code).ToList(),
            Liabilities = liabilities.Values.Select(v => new { Code = v.Code, Title = v.Title, Amount = v.Amount }).OrderBy(x => x.Code).ToList(),
            Equity = equity.Values.Select(v => new { Code = v.Code, Title = v.Title, Amount = v.Amount }).OrderBy(x => x.Code).ToList(),
            TotalAssets = totalAssets,
            TotalLiabilities = totalLiabilities,
            TotalEquity = totalEquity,
            TotalLiabilitiesAndEquity = totalLiabilities + totalEquity
        });
    }
}
