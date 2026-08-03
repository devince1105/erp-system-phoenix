using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

/// <summary>
/// 出貨單 — records shipment of goods against a confirmed 銷售訂單 (SalesOrder).
/// Shipping is what deducts stock and posts the receivable (Dr 應收 / Cr 銷貨 + 銷貨成本 / 存貨),
/// separate from taking the order.
/// </summary>
public class DeliveryNote
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string DeliveryNo { get; set; } = string.Empty; // DN-20260803-001

    public int SalesOrderId { get; set; }
    [ForeignKey(nameof(SalesOrderId))]
    public SalesOrder? SalesOrder { get; set; }

    public DateTime DeliveryDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public string? Memo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<DeliveryNoteItem> Items { get; set; } = new List<DeliveryNoteItem>();
}

public class DeliveryNoteItem
{
    [Key]
    public int Id { get; set; }

    public int DeliveryNoteId { get; set; }
    [ForeignKey(nameof(DeliveryNoteId))]
    public DeliveryNote? DeliveryNote { get; set; }

    public int ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
}
