using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

public enum StockTransferStatus
{
    Draft = 0,       // 草稿
    Completed = 1,   // 已調撥完成
    Cancelled = 2    // 已取消
}

/// <summary>
/// 庫存調撥單 (StockTransfer)
/// </summary>
public class StockTransfer
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string TransferNo { get; set; } = string.Empty; // e.g. TR-20260914-001

    public int FromWarehouseId { get; set; }
    [ForeignKey(nameof(FromWarehouseId))]
    public Warehouse? FromWarehouse { get; set; }

    public int ToWarehouseId { get; set; }
    [ForeignKey(nameof(ToWarehouseId))]
    public Warehouse? ToWarehouse { get; set; }

    public DateTime TransferDate { get; set; } = DateTime.UtcNow;

    public StockTransferStatus Status { get; set; } = StockTransferStatus.Draft;

    [MaxLength(500)]
    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public ICollection<StockTransferItem> Items { get; set; } = new List<StockTransferItem>();
}

/// <summary>
/// 庫存調撥明細項
/// </summary>
public class StockTransferItem
{
    [Key]
    public int Id { get; set; }

    public int StockTransferId { get; set; }
    [ForeignKey(nameof(StockTransferId))]
    public StockTransfer? StockTransfer { get; set; }

    public int ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    [Required]
    public int Quantity { get; set; }
}
