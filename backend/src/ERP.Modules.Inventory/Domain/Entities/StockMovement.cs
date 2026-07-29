using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.Inventory.Domain.Entities;

public enum StockMovementType
{
    PurchaseIn = 1,       // 採購入庫
    SalesOut = 2,         // 銷貨出庫
    ManualAdjustment = 3, // 人工調整
    ReturnIn = 4,         // 退貨入庫
    ReturnOut = 5         // 退貨出庫
}

/// <summary>
/// Immutable ledger of all inventory movements.
/// Never delete or update — append-only to ensure full traceability.
/// </summary>
public class StockMovement
{
    [Key]
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public StockMovementType MovementType { get; set; }

    /// <summary>Positive = inbound, Negative = outbound</summary>
    public int Quantity { get; set; }

    /// <summary>Stock level immediately BEFORE this movement</summary>
    public int QuantityBefore { get; set; }

    /// <summary>Stock level immediately AFTER this movement</summary>
    public int QuantityAfter { get; set; }

    /// <summary>Reference document number (e.g. SO-20260729001, PO-20260729001)</summary>
    [MaxLength(50)]
    public string? ReferenceNo { get; set; }

    [MaxLength(255)]
    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
