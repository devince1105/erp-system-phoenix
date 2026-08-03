using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

public enum OrderStatus
{
    Draft = 0,
    Confirmed = 1,
    Cancelled = 2
}

public class PurchaseOrder
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string OrderNo { get; set; } = string.Empty; // PO-20260725-001
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    public int SupplierId { get; set; }
    [ForeignKey("SupplierId")]
    public Partner? Supplier { get; set; }
    
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    
    public string? Memo { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Payment due date (應付到期日). Used for payables aging.</summary>
    public DateTime? DueDate { get; set; }

    /// <summary>Amount paid against this order so far (已付款). Outstanding = TotalAmount − SettledAmount.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal SettledAmount { get; set; }

    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}

public class PurchaseOrderItem
{
    [Key]
    public int Id { get; set; }
    
    public int PurchaseOrderId { get; set; }
    [ForeignKey("PurchaseOrderId")]
    public PurchaseOrder? PurchaseOrder { get; set; }
    
    public int ProductId { get; set; }
    [ForeignKey("ProductId")]
    public Product? Product { get; set; }
    
    public int Quantity { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal => Quantity * UnitPrice;
}
