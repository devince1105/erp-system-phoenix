using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.Modules.Accounting.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Data;

public static class CustomReportSeeder
{
    public static async Task SeedAsync(AccountingDbContext context)
    {
        if (await context.CustomReportTemplates.AnyAsync())
        {
            return; // 冪等：已有範本則不再重複植入
        }

        // 範本 1：營業費用明細與佔比分析表
        var expenseReport = new CustomReportTemplate
        {
            Name = "營業費用明細與佔比分析表",
            Description = "細分人事、租金水電、辦公文具與折舊等營運費用項目，監控管理開銷比例。",
            ReportType = CustomReportType.IncomeStatementStyle,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        expenseReport.Sections.Add(new CustomReportSection
        {
            Title = "一、薪資與人事支出",
            OrderIndex = 1,
            AccountCodePrefixes = "61",
            IsDebitPositive = true,
            IsSubtotal = false
        });

        expenseReport.Sections.Add(new CustomReportSection
        {
            Title = "二、租金與公用事業費 (水電瓦斯)",
            OrderIndex = 2,
            AccountCodePrefixes = "62,63",
            IsDebitPositive = true,
            IsSubtotal = false
        });

        expenseReport.Sections.Add(new CustomReportSection
        {
            Title = "三、行政文具與日常消耗",
            OrderIndex = 3,
            AccountCodePrefixes = "64",
            IsDebitPositive = true,
            IsSubtotal = false
        });

        expenseReport.Sections.Add(new CustomReportSection
        {
            Title = "四、折舊與其他營運支出",
            OrderIndex = 4,
            AccountCodePrefixes = "65,69",
            IsDebitPositive = true,
            IsSubtotal = false
        });

        expenseReport.Sections.Add(new CustomReportSection
        {
            Title = "【合計】營業費用總額",
            OrderIndex = 5,
            IsDebitPositive = true,
            IsSubtotal = true,
            FormulaExpression = "+1+2+3+4"
        });

        // 範本 2：營運毛利與營業損益分析表
        var contributionReport = new CustomReportTemplate
        {
            Name = "營運毛利與營業損益分析表",
            Description = "從銷貨營收出發，扣減銷貨成本推導營業毛利，再扣除營運費用得出本期營業淨利。",
            ReportType = CustomReportType.IncomeStatementStyle,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        contributionReport.Sections.Add(new CustomReportSection
        {
            Title = "一、營業收入總額 (銷貨與勞務)",
            OrderIndex = 1,
            AccountCodePrefixes = "41,42",
            IsDebitPositive = false, // 貸方為正
            IsSubtotal = false
        });

        contributionReport.Sections.Add(new CustomReportSection
        {
            Title = "二、營業成本 (銷貨成本)",
            OrderIndex = 2,
            AccountCodePrefixes = "51",
            IsDebitPositive = true, // 借方為正
            IsSubtotal = false
        });

        contributionReport.Sections.Add(new CustomReportSection
        {
            Title = "【小計】營業毛利 (毛利額)",
            OrderIndex = 3,
            IsDebitPositive = false,
            IsSubtotal = true,
            FormulaExpression = "1-2"
        });

        contributionReport.Sections.Add(new CustomReportSection
        {
            Title = "三、營業費用總計",
            OrderIndex = 4,
            AccountCodePrefixes = "61,62,63,64,65,69",
            IsDebitPositive = true,
            IsSubtotal = false
        });

        contributionReport.Sections.Add(new CustomReportSection
        {
            Title = "【淨利】本期營業淨利",
            OrderIndex = 5,
            IsDebitPositive = false,
            IsSubtotal = true,
            FormulaExpression = "3-4"
        });

        context.CustomReportTemplates.AddRange(expenseReport, contributionReport);
        await context.SaveChangesAsync();
    }
}
