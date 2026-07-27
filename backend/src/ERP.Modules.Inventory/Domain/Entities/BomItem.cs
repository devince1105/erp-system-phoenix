using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Inventory.Domain.Entities;

public class BomItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int BomId { get; set; }
    
    public Bom? Bom { get; set; }

    [Required]
    public int ComponentProductId { get; set; } // The raw material
    
    public Product? ComponentProduct { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,4)")]
    public decimal Quantity { get; set; }

    [MaxLength(20)]
    public string Unit { get; set; } = "pcs";
}
