using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

public class InventoryStock
{
    [Key]
    public int Id { get; set; }
    
    public int ProductId { get; set; }
    [ForeignKey("ProductId")]
    public Product? Product { get; set; }
    
    public int WarehouseId { get; set; }
    [ForeignKey("WarehouseId")]
    public Warehouse? Warehouse { get; set; }
    
    public int Quantity { get; set; }
    
    public int SafetyStock { get; set; }
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
