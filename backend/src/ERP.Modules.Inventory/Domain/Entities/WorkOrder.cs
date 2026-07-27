using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.Inventory.Domain.Entities;

public enum WorkOrderStatus
{
    Draft = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

public class WorkOrder
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string OrderNo { get; set; } = string.Empty;

    [Required]
    public int ProductId { get; set; } // The finished good being produced
    
    public Product? Product { get; set; }

    [Required]
    public int BomId { get; set; }
    
    public Bom? Bom { get; set; }

    [Required]
    public int PlannedQuantity { get; set; }

    public int CompletedQuantity { get; set; } = 0;

    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Draft;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
