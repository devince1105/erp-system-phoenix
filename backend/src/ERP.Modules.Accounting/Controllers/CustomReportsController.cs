using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

public class CustomReportSectionDto
{
    public int? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
    public string? AccountCodePrefixes { get; set; }
    public bool IsDebitPositive { get; set; } = true;
    public bool IsSubtotal { get; set; }
    public string? FormulaExpression { get; set; }
}

public class SaveCustomReportTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CustomReportType ReportType { get; set; } = CustomReportType.IncomeStatementStyle;
    public bool IsActive { get; set; } = true;
    public List<CustomReportSectionDto> Sections { get; set; } = new();
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Accountant")]
public class CustomReportsController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public CustomReportsController(AccountingDbContext context)
    {
        _context = context;
    }

    [HttpGet("templates")]
    public async Task<ActionResult<IEnumerable<CustomReportTemplate>>> GetTemplates([FromQuery] bool activeOnly = true)
    {
        var query = _context.CustomReportTemplates
            .Include(t => t.Sections.OrderBy(s => s.OrderIndex))
            .AsQueryable();

        if (activeOnly)
        {
            query = query.Where(t => t.IsActive);
        }

        return await query.OrderBy(t => t.Id).ToListAsync();
    }

    [HttpGet("templates/{id}")]
    public async Task<ActionResult<CustomReportTemplate>> GetTemplate(int id)
    {
        var template = await _context.CustomReportTemplates
            .Include(t => t.Sections.OrderBy(s => s.OrderIndex))
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null) return NotFound("找不到指定的自訂報表範本。");
        return template;
    }

    [HttpPost("templates")]
    public async Task<ActionResult<CustomReportTemplate>> CreateTemplate([FromBody] SaveCustomReportTemplateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("報表名稱為必填項目。");
        }

        var template = new CustomReportTemplate
        {
            Name = dto.Name.Trim(),
            Description = dto.Description,
            ReportType = dto.ReportType,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var s in dto.Sections)
        {
            template.Sections.Add(new CustomReportSection
            {
                Title = s.Title.Trim(),
                OrderIndex = s.OrderIndex,
                AccountCodePrefixes = s.AccountCodePrefixes?.Trim(),
                IsDebitPositive = s.IsDebitPositive,
                IsSubtotal = s.IsSubtotal,
                FormulaExpression = s.FormulaExpression?.Trim()
            });
        }

        _context.CustomReportTemplates.Add(template);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, template);
    }

    [HttpPut("templates/{id}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] SaveCustomReportTemplateDto dto)
    {
        var template = await _context.CustomReportTemplates
            .Include(t => t.Sections)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null) return NotFound("找不到指定的自訂報表範本。");

        template.Name = dto.Name.Trim();
        template.Description = dto.Description;
        template.ReportType = dto.ReportType;
        template.IsActive = dto.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        // 清理現有 Sections 重建
        _context.CustomReportSections.RemoveRange(template.Sections);
        template.Sections.Clear();

        foreach (var s in dto.Sections)
        {
            template.Sections.Add(new CustomReportSection
            {
                TemplateId = template.Id,
                Title = s.Title.Trim(),
                OrderIndex = s.OrderIndex,
                AccountCodePrefixes = s.AccountCodePrefixes?.Trim(),
                IsDebitPositive = s.IsDebitPositive,
                IsSubtotal = s.IsSubtotal,
                FormulaExpression = s.FormulaExpression?.Trim()
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("templates/{id}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var template = await _context.CustomReportTemplates.FindAsync(id);
        if (template == null) return NotFound("找不到指定的自訂報表範本。");

        _context.CustomReportTemplates.Remove(template);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 執行自訂財務/經營報表運算
    /// </summary>
    [HttpGet("{templateId}/run")]
    public async Task<IActionResult> RunReport(
        int templateId,
        [FromQuery] string startDate,
        [FromQuery] string endDate,
        [FromQuery] string? compareStartDate = null,
        [FromQuery] string? compareEndDate = null)
    {
        if (!DateTime.TryParse(startDate, out var start) || !DateTime.TryParse(endDate, out var end))
        {
            return BadRequest("請提供有效的起訖日期 (yyyy-MM-dd)。");
        }

        var template = await _context.CustomReportTemplates
            .Include(t => t.Sections.OrderBy(s => s.OrderIndex))
            .FirstOrDefaultAsync(t => t.Id == templateId);

        if (template == null) return NotFound("找不到指定的報表範本。");

        bool hasComparison = false;
        DateTime compStart = default;
        DateTime compEnd = default;
        if (!string.IsNullOrEmpty(compareStartDate) && !string.IsNullOrEmpty(compareEndDate))
        {
            hasComparison = DateTime.TryParse(compareStartDate, out compStart) &&
                            DateTime.TryParse(compareEndDate, out compEnd);
        }

        // 1. 取得主期間傳票分錄
        var mainVouchers = await _context.Vouchers
            .Include(v => v.Details).ThenInclude(d => d.AccountTitle)
            .Where(v => v.VoucherDate >= start && v.VoucherDate <= end && v.Status != VoucherStatus.Draft)
            .ToListAsync();

        var mainDetails = mainVouchers.SelectMany(v => v.Details)
            .Where(d => d.AccountTitle != null)
            .ToList();

        // 2. 取得比較期間傳票分錄
        var compDetails = new List<VoucherDetail>();
        if (hasComparison)
        {
            var compVouchers = await _context.Vouchers
                .Include(v => v.Details).ThenInclude(d => d.AccountTitle)
                .Where(v => v.VoucherDate >= compStart && v.VoucherDate <= compEnd && v.Status != VoucherStatus.Draft)
                .ToListAsync();

            compDetails = compVouchers.SelectMany(v => v.Details)
                .Where(d => d.AccountTitle != null)
                .ToList();
        }

        // 段落金額快照字典 (OrderIndex -> Amount)
        var sectionAmounts = new Dictionary<int, decimal>();
        var sectionCompAmounts = new Dictionary<int, decimal>();

        var renderedSections = new List<object>();

        foreach (var section in template.Sections)
        {
            if (section.IsSubtotal)
            {
                // 小計段落計算
                decimal subtotalAmount = CalculateSubtotal(section.FormulaExpression, section.OrderIndex, sectionAmounts);
                decimal subtotalComp = hasComparison
                    ? CalculateSubtotal(section.FormulaExpression, section.OrderIndex, sectionCompAmounts)
                    : 0m;

                sectionAmounts[section.OrderIndex] = subtotalAmount;
                if (hasComparison) sectionCompAmounts[section.OrderIndex] = subtotalComp;

                decimal changeAmount = subtotalAmount - subtotalComp;
                decimal? changePercent = (hasComparison && subtotalComp != 0)
                    ? Math.Round((changeAmount / Math.Abs(subtotalComp)) * 100, 1)
                    : null;

                renderedSections.Add(new
                {
                    section.Id,
                    section.Title,
                    section.OrderIndex,
                    section.IsSubtotal,
                    section.FormulaExpression,
                    Amount = subtotalAmount,
                    CompareAmount = hasComparison ? subtotalComp : (decimal?)null,
                    ChangeAmount = hasComparison ? changeAmount : (decimal?)null,
                    ChangePercent = changePercent,
                    Accounts = new List<object>() // 小計段落無獨立科目清單
                });
            }
            else
            {
                // 一般段落：根據前綴過濾科目
                var prefixes = (section.AccountCodePrefixes ?? "")
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(p => p.Trim())
                    .Where(p => !string.IsNullOrEmpty(p))
                    .ToList();

                var matchedMain = mainDetails.Where(d => prefixes.Count == 0 || prefixes.Any(p => d.AccountTitle!.Code.StartsWith(p))).ToList();
                var matchedComp = compDetails.Where(d => prefixes.Count == 0 || prefixes.Any(p => d.AccountTitle!.Code.StartsWith(p))).ToList();

                // 按科目代碼彙總
                var accountMap = new Dictionary<string, (string Code, string Name, decimal MainAmt, decimal CompAmt)>();

                foreach (var d in matchedMain)
                {
                    var code = d.AccountTitle!.Code;
                    var name = d.AccountTitle!.Name;
                    decimal net = section.IsDebitPositive ? (d.IsDebit ? d.Amount : -d.Amount) : (d.IsDebit ? -d.Amount : d.Amount);

                    if (!accountMap.ContainsKey(code))
                    {
                        accountMap[code] = (code, name, 0, 0);
                    }
                    var cur = accountMap[code];
                    accountMap[code] = (cur.Code, cur.Name, cur.MainAmt + net, cur.CompAmt);
                }

                if (hasComparison)
                {
                    foreach (var d in matchedComp)
                    {
                        var code = d.AccountTitle!.Code;
                        var name = d.AccountTitle!.Name;
                        decimal net = section.IsDebitPositive ? (d.IsDebit ? d.Amount : -d.Amount) : (d.IsDebit ? -d.Amount : d.Amount);

                        if (!accountMap.ContainsKey(code))
                        {
                            accountMap[code] = (code, name, 0, 0);
                        }
                        var cur = accountMap[code];
                        accountMap[code] = (cur.Code, cur.Name, cur.MainAmt, cur.CompAmt + net);
                    }
                }

                var accountRows = accountMap.Values
                    .OrderBy(a => a.Code)
                    .Select(a =>
                    {
                        var diff = a.MainAmt - a.CompAmt;
                        decimal? pct = (hasComparison && a.CompAmt != 0)
                            ? Math.Round((diff / Math.Abs(a.CompAmt)) * 100, 1)
                            : null;

                        return new
                        {
                            Code = a.Code,
                            Title = a.Name,
                            Amount = a.MainAmt,
                            CompareAmount = hasComparison ? a.CompAmt : (decimal?)null,
                            ChangeAmount = hasComparison ? diff : (decimal?)null,
                            ChangePercent = pct
                        };
                    })
                    .ToList();

                decimal totalMain = accountRows.Sum(a => a.Amount);
                decimal totalComp = hasComparison ? accountRows.Sum(a => a.CompareAmount ?? 0) : 0m;

                sectionAmounts[section.OrderIndex] = totalMain;
                if (hasComparison) sectionCompAmounts[section.OrderIndex] = totalComp;

                decimal secDiff = totalMain - totalComp;
                decimal? secPct = (hasComparison && totalComp != 0)
                    ? Math.Round((secDiff / Math.Abs(totalComp)) * 100, 1)
                    : null;

                renderedSections.Add(new
                {
                    section.Id,
                    section.Title,
                    section.OrderIndex,
                    section.IsSubtotal,
                    section.AccountCodePrefixes,
                    section.IsDebitPositive,
                    Amount = totalMain,
                    CompareAmount = hasComparison ? totalComp : (decimal?)null,
                    ChangeAmount = hasComparison ? secDiff : (decimal?)null,
                    ChangePercent = secPct,
                    Accounts = accountRows
                });
            }
        }

        return Ok(new
        {
            TemplateId = template.Id,
            TemplateName = template.Name,
            template.Description,
            ReportType = template.ReportType.ToString(),
            StartDate = start.ToString("yyyy-MM-dd"),
            EndDate = end.ToString("yyyy-MM-dd"),
            CompareStartDate = hasComparison ? compStart.ToString("yyyy-MM-dd") : null,
            CompareEndDate = hasComparison ? compEnd.ToString("yyyy-MM-dd") : null,
            HasComparison = hasComparison,
            Sections = renderedSections
        });
    }

    private static decimal CalculateSubtotal(string? formula, int currentOrder, Dictionary<int, decimal> amounts)
    {
        if (string.IsNullOrWhiteSpace(formula))
        {
            // 預設累計此段落之前的所有一般段落金額
            return amounts.Where(kv => kv.Key < currentOrder).Sum(kv => kv.Value);
        }

        // 解析類似 "1-2" 或 "+1+2+3+4" 或 "3-4" 的公式
        // 匹配運算子 (+ 或 -) 與數字段落編號
        var pattern = @"([+-]?\s*\d+)";
        var matches = Regex.Matches(formula.Replace(" ", ""), pattern);

        decimal result = 0m;
        foreach (Match match in matches)
        {
            var token = match.Value.Trim();
            bool isNegative = token.StartsWith("-");
            var numStr = token.TrimStart('+', '-');

            if (int.TryParse(numStr, out int targetIndex))
            {
                amounts.TryGetValue(targetIndex, out decimal val);
                result += isNegative ? -val : val;
            }
        }

        return result;
    }
}
