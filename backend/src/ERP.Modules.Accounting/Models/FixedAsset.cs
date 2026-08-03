using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

/// <summary>
/// 固定資產卡 — an asset depreciated over its useful life (straight-line). A monthly
/// depreciation run posts Dr 折舊費用 / Cr 累計折舊 and advances AccumulatedDepreciation.
/// </summary>
public class FixedAsset
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string AssetNo { get; set; } = string.Empty; // FA-0001

    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Category { get; set; } = string.Empty; // 辦公設備 / 機器設備 / 運輸設備 / 其他

    public DateTime AcquisitionDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AcquisitionCost { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SalvageValue { get; set; }

    /// <summary>Useful life in months (straight-line).</summary>
    public int UsefulLifeMonths { get; set; } = 60;

    [Column(TypeName = "decimal(18,2)")]
    public decimal AccumulatedDepreciation { get; set; }

    /// <summary>Last period depreciated, encoded as year*100+month (0 = never).</summary>
    public int LastDepreciatedPeriod { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "InUse"; // InUse, FullyDepreciated, Disposed

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Depreciable base ÷ life, i.e. the standard monthly charge.</summary>
    [NotMapped]
    public decimal MonthlyDepreciation =>
        UsefulLifeMonths > 0 ? Math.Round((AcquisitionCost - SalvageValue) / UsefulLifeMonths, 2) : 0;

    [NotMapped]
    public decimal BookValue => AcquisitionCost - AccumulatedDepreciation;
}
