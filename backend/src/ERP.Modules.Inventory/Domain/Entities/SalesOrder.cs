using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

public class SalesOrder
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string OrderNo { get; set; } = string.Empty; // SO-20260725-001
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    public int CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public Partner? Customer { get; set; }
    
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    
    public string? Memo { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Payment due date (應收到期日). Used for receivables aging.</summary>
    public DateTime? DueDate { get; set; }

    /// <summary>Amount received against this order so far (已收款). Outstanding = TotalAmount − SettledAmount.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal SettledAmount { get; set; }

    public ICollection<SalesOrderItem> Items { get; set; } = new List<SalesOrderItem>();
}

public class SalesOrderItem
{
    [Key]
    public int Id { get; set; }
    
    public int SalesOrderId { get; set; }
    [ForeignKey("SalesOrderId")]
    public SalesOrder? SalesOrder { get; set; }
    
    public int ProductId { get; set; }
    [ForeignKey("ProductId")]
    public Product? Product { get; set; }
    
    public int Quantity { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal => Quantity * UnitPrice;
}
