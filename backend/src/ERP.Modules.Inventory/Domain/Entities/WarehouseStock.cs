using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

/// <summary>
/// 倉庫庫存映射表 (WarehouseStock)
/// 記錄每座倉庫中各商品的庫存量與安全庫存警戒值
/// </summary>
public class WarehouseStock
{
    [Key]
    public int Id { get; set; }

    public int WarehouseId { get; set; }
    [ForeignKey(nameof(WarehouseId))]
    public Warehouse? Warehouse { get; set; }

    public int ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    /// <summary>該倉庫現有庫存量</summary>
    public int Quantity { get; set; }

    /// <summary>安全庫存警戒值（低於此值告警，0 表示不設限）</summary>
    public int SafetyStock { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
