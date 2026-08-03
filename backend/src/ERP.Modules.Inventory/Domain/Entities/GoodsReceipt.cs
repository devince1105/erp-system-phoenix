using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

/// <summary>
/// 進貨單 — records receipt of goods against a confirmed 採購單 (PurchaseOrder).
/// Receiving adds stock (StockMovement) and posts the payable voucher; this is the
/// step that makes the goods (and the liability) real, separate from placing the order.
/// </summary>
public class GoodsReceipt
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string ReceiptNo { get; set; } = string.Empty; // GR-20260803-001

    public int PurchaseOrderId { get; set; }
    [ForeignKey(nameof(PurchaseOrderId))]
    public PurchaseOrder? PurchaseOrder { get; set; }

    public DateTime ReceiptDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public string? Memo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<GoodsReceiptItem> Items { get; set; } = new List<GoodsReceiptItem>();
}

public class GoodsReceiptItem
{
    [Key]
    public int Id { get; set; }

    public int GoodsReceiptId { get; set; }
    [ForeignKey(nameof(GoodsReceiptId))]
    public GoodsReceipt? GoodsReceipt { get; set; }

    public int ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
}
