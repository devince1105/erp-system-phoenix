using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

public enum CustomReportType
{
    IncomeStatementStyle = 0, // 損益型 (期間流量)
    BalanceSheetStyle = 1     // 資產負債型 (時點存量)
}

/// <summary>
/// 自訂財務與經營報表範本 (CustomReportTemplate)
/// </summary>
public class CustomReportTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }

    public CustomReportType ReportType { get; set; } = CustomReportType.IncomeStatementStyle;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<CustomReportSection> Sections { get; set; } = new List<CustomReportSection>();
}

/// <summary>
/// 自訂報表段落或行次 (CustomReportSection)
/// </summary>
public class CustomReportSection
{
    [Key]
    public int Id { get; set; }

    public int TemplateId { get; set; }
    [ForeignKey(nameof(TemplateId))]
    public CustomReportTemplate? Template { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty; // e.g. "一、營業收入", "二、營業費用 - 人事支出"

    public int OrderIndex { get; set; } = 1;

    /// <summary>
    /// 包含的科目代碼前綴 (以逗號分隔，例如 "61,62" 或 "6101,6201")
    /// 若為小計列則可為空
    /// </summary>
    [MaxLength(200)]
    public string? AccountCodePrefixes { get; set; }

    /// <summary>
    /// 借方金額是否為正數 (true: 借增正/貸減負，如費用/資產；false: 貸增正/借減負，如收入/負債/權益)
    /// </summary>
    public bool IsDebitPositive { get; set; } = true;

    /// <summary>
    /// 是否為小計或公式計算列
    /// </summary>
    public bool IsSubtotal { get; set; }

    /// <summary>
    /// 公式表示式 (例如: "1-2" 或 "+1+2"，數字代表段落的 OrderIndex；若留空且 IsSubtotal=true 則自動累計前面所有段落)
    /// </summary>
    [MaxLength(100)]
    public string? FormulaExpression { get; set; }
}
