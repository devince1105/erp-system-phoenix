using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.Inventory.Domain.Entities;

public class Bom
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProductId { get; set; } // The finished good
    
    public Product? Product { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Version { get; set; } = "1.0";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BomItem> Items { get; set; } = new List<BomItem>();
}
