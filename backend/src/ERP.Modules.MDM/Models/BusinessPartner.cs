using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.MDM.Models;

/// <summary>
/// Master Data Management — unified business partner record.
/// Replaces the split CRM.Customer / Inventory.Partner silos.
/// Design follows SAP Business Partner (BP) model.
/// </summary>
public class BusinessPartner
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// 統一編號 (Taiwan Business Tax ID) — the single unique identifier.
    /// One legal entity = one BusinessPartner, regardless of role.
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string TaxId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    /// <summary>Bank account info for payment processing</summary>
    [MaxLength(200)]
    public string? BankInfo { get; set; }

    [MaxLength(200)]
    public string? Remark { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// BP roles: a company can be Customer, Supplier, or both simultaneously.
    /// </summary>
    public ICollection<BPRole> Roles { get; set; } = new List<BPRole>();
}
