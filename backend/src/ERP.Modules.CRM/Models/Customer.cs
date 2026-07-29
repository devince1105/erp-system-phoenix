using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.CRM.Models;

public class Customer
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Type { get; set; } = "B2B"; // B2B or B2C
    
    [MaxLength(100)]
    public string ContactPerson { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Industry { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Soft reference to MDM.BusinessPartner (cross-module, no FK constraint).
    /// Null = legacy record not yet linked to unified BP master.
    /// </summary>
    public int? BusinessPartnerId { get; set; }

    public ICollection<SalesOpportunity> Opportunities { get; set; } = new List<SalesOpportunity>();
}
