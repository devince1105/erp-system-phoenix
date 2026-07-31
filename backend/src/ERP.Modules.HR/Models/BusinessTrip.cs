using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

/// <summary>
/// 出差申請單 — a pre-trip travel request. When approved it pre-authorises the
/// employee's travel; expense claims (差旅報支) may optionally link back to it,
/// which streamlines their approval.
/// </summary>
public class BusinessTrip
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    [MaxLength(200)]
    public string Destination { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Purpose { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    /// <summary>Employee's up-front estimated cost for the trip.</summary>
    public decimal EstimatedCost { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Completed

    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Reimbursement claims filed against this trip (optional link).</summary>
    public ICollection<ExpenseClaim> ExpenseClaims { get; set; } = new List<ExpenseClaim>();
}
