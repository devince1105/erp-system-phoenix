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

    /// <summary>
    /// 現金流量表（間接法）。由既有傳票推導:自本期損益出發,依會計科目分類（現金 / 流動 /
    /// 非流動 / 權益,由科目代碼推得）彙總營業、投資、理財三段。因本帳未將損益結轉權益,
    /// 三段淨額之和恰等於現金科目的實際期間變動（reconciles 供對帳）。
    /// </summary>
    [HttpGet("cash-flow")]
    public async Task<IActionResult> GetCashFlow([FromQuery] string startDate, [FromQuery] string endDate)
    {
        if (!DateTime.TryParse(startDate, out var start) || !DateTime.TryParse(endDate, out var end))
            return BadRequest("無效的日期格式");

        // Period movement of every account, expressed as the increase in its own balance.
        var periodVouchers = await _context.Vouchers
            .Include(v => v.Details).ThenInclude(d => d.AccountTitle)
            .Where(v => v.VoucherDate >= start && v.VoucherDate <= end && v.Status != VoucherStatus.Draft)
            .ToListAsync();

        var move = new Dictionary<int, (string Code, string Name, AccountCategory Cat, decimal Amount)>();
        foreach (var v in periodVouchers)
            foreach (var d in v.Details)
            {
                if (d.AccountTitle is null) continue;
                var a = d.AccountTitle;
                bool debitNormal = a.Category is AccountCategory.Asset or AccountCategory.Expense;
                decimal signed = (d.IsDebit == debitNormal) ? d.Amount : -d.Amount;
                var cur = move.TryGetValue(a.Id, out var e) ? e.Amount : 0m;
                move[a.Id] = (a.Code, a.Name, a.Category, cur + signed);
            }

        bool IsCash(string code, string name, AccountCategory cat) =>
            cat == AccountCategory.Asset && (name.Contains("現金") || name.Contains("約當") || name.Contains("銀行"));

        var rows = move.Values.ToList();
        decimal netIncome = rows.Where(r => r.Cat == AccountCategory.Revenue).Sum(r => r.Amount)
                          - rows.Where(r => r.Cat == AccountCategory.Expense).Sum(r => r.Amount);

        // Operating: add back non-cash expenses (折舊/攤銷/呆帳), then working-capital changes.
        var addbacks = rows
            .Where(r => r.Cat == AccountCategory.Expense && (r.Name.Contains("折舊") || r.Name.Contains("攤銷") || r.Name.Contains("呆帳")))
            .Select(r => new { r.Code, Title = r.Name, Amount = r.Amount })
            .Where(x => x.Amount != 0).ToList();

        var workingCapital = rows
            .Where(r => (r.Cat == AccountCategory.Asset && r.Code.StartsWith("11") && !IsCash(r.Code, r.Name, r.Cat))
                     || (r.Cat == AccountCategory.Liability && r.Code.StartsWith("21")))
            .Select(r => new
            {
                r.Code, Title = r.Name,
                // current-asset increase uses cash (−); current-liability increase provides cash (+)
                Amount = r.Cat == AccountCategory.Asset ? -r.Amount : r.Amount
            })
            .Where(x => x.Amount != 0).ToList();

        decimal operatingTotal = netIncome + addbacks.Sum(x => x.Amount) + workingCapital.Sum(x => x.Amount);

        // Investing: non-current assets (increase uses cash → −)
        var investingItems = rows
            .Where(r => r.Cat == AccountCategory.Asset && !r.Code.StartsWith("11") && !IsCash(r.Code, r.Name, r.Cat))
            .Select(r => new { r.Code, Title = r.Name, Amount = -r.Amount })
            .Where(x => x.Amount != 0).ToList();
        decimal investingTotal = investingItems.Sum(x => x.Amount);

        // Financing: non-current liabilities + equity (increase provides cash → +)
        var financingItems = rows
            .Where(r => (r.Cat == AccountCategory.Liability && !r.Code.StartsWith("21")) || r.Cat == AccountCategory.Equity)
            .Select(r => new { r.Code, Title = r.Name, Amount = r.Amount })
            .Where(x => x.Amount != 0).ToList();
        decimal financingTotal = financingItems.Sum(x => x.Amount);

        decimal netChange = operatingTotal + investingTotal + financingTotal;

        // Opening cash = signed cash movement from all posted vouchers before the period.
        var priorVouchers = await _context.Vouchers
            .Include(v => v.Details).ThenInclude(d => d.AccountTitle)
            .Where(v => v.VoucherDate < start && v.Status != VoucherStatus.Draft)
            .ToListAsync();
        decimal SignedCash(IEnumerable<Voucher> vs) => vs.SelectMany(v => v.Details)
            .Where(d => d.AccountTitle != null && IsCash(d.AccountTitle.Code, d.AccountTitle.Name, d.AccountTitle.Category))
            .Sum(d => d.IsDebit ? d.Amount : -d.Amount);
        decimal openingCash = SignedCash(priorVouchers);
        decimal periodCashMovement = SignedCash(periodVouchers); // independent reconciliation check
        decimal endingCash = openingCash + netChange;

        return Ok(new
        {
            StartDate = start.ToString("yyyy-MM-dd"),
            EndDate = end.ToString("yyyy-MM-dd"),
            NetIncome = netIncome,
            Operating = new { Addbacks = addbacks, WorkingCapital = workingCapital, Total = operatingTotal },
            Investing = new { Items = investingItems, Total = investingTotal },
            Financing = new { Items = financingItems, Total = financingTotal },
            NetChange = netChange,
            OpeningCash = openingCash,
            EndingCash = endingCash,
            Reconciles = Math.Abs(periodCashMovement - netChange) < 0.005m,
            CashMovementCheck = periodCashMovement
        });
    }
}
