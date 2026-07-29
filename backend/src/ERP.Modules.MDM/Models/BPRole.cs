using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ERP.Modules.MDM.Models;

public enum BPRoleType
{
    Customer = 1,  // 客戶 — can place sales orders
    Supplier = 2   // 供應商 — can receive purchase orders
}

/// <summary>
/// A BusinessPartner's activated role with role-specific attributes.
/// One BP can have both Customer and Supplier roles simultaneously.
/// </summary>
public class BPRole
{
    [Key]
    public int Id { get; set; }

    public int BusinessPartnerId { get; set; }

    [ForeignKey(nameof(BusinessPartnerId))]
    [JsonIgnore]
    public BusinessPartner? BP { get; set; }

    public BPRoleType RoleType { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime ActivatedAt { get; set; } = DateTime.UtcNow;

    // ── Customer-Specific Fields ──────────────────────────────────────────────
    /// <summary>Maximum credit the customer can accumulate before requiring payment</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? CreditLimit { get; set; }

    /// <summary>Price tier (e.g. VIP, Standard, Wholesale)</summary>
    [MaxLength(20)]
    public string? PriceLevel { get; set; }

    /// <summary>Assigned sales representative name or ID</summary>
    [MaxLength(100)]
    public string? SalesRep { get; set; }

    // ── Supplier-Specific Fields ──────────────────────────────────────────────
    /// <summary>Net 30, Net 60, etc.</summary>
    [MaxLength(50)]
    public string? PaymentTerms { get; set; }

    /// <summary>Days from order to delivery</summary>
    public int? LeadTimeDays { get; set; }

    /// <summary>Minimum order quantity required by supplier</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinOrderQuantity { get; set; }
}
