using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.Inventory.Domain.Entities;

public enum PartnerType
{
    Customer = 1,
    Supplier = 2
}

public class Partner
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public PartnerType Type { get; set; }
    
    [MaxLength(20)]
    public string? TaxId { get; set; } // 統一編號
    
    [MaxLength(100)]
    public string? ContactPerson { get; set; }
    
    [MaxLength(50)]
    public string? Phone { get; set; }
    
    [MaxLength(200)]
    public string? Address { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Soft reference to MDM.BusinessPartner (cross-module, no FK constraint).
    /// Null = legacy record not yet linked to unified BP master.
    /// When set, MDM.BusinessPartner.Roles should be the authoritative role source.
    /// </summary>
    public int? BusinessPartnerId { get; set; }
}
