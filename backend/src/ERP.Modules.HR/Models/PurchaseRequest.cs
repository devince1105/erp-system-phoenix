using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

/// <summary>
/// 採購申請單（請購單）— a pre-purchase request. When approved it pre-authorises
/// the spend; office-expense reimbursements (費用報銷) may optionally link back to
/// it, which streamlines their approval. Symmetric to 出差申請 ↔ 差旅報支.
/// </summary>
public class PurchaseRequest
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    [MaxLength(200)]
    public string ItemName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Category { get; set; } = string.Empty; // 辦公用品 / 設備 / 軟體授權 / 其他

    public int Quantity { get; set; } = 1;

    /// <summary>Employee's up-front estimated total cost.</summary>
    public decimal EstimatedCost { get; set; }

    [MaxLength(500)]
    public string Purpose { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Completed

    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Reimbursement claims filed against this request (optional link).</summary>
    public ICollection<ExpenseClaim> ExpenseClaims { get; set; } = new List<ExpenseClaim>();
}
