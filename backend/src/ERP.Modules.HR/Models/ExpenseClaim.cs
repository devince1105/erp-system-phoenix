using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class ExpenseClaim
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    // Optional link to an approved 出差申請單 — pre-authorises this reimbursement.
    public int? BusinessTripId { get; set; }
    public BusinessTrip? BusinessTrip { get; set; }

    // Optional link to an approved 採購申請單 — pre-authorises this reimbursement (費用報銷).
    public int? PurchaseRequestId { get; set; }
    public PurchaseRequest? PurchaseRequest { get; set; }

    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Travel (差旅報支, trip-related) or General (費用報銷, daily office spend).</summary>
    [MaxLength(20)]
    public string ExpenseType { get; set; } = "Travel";

    [MaxLength(50)]
    public string Category { get; set; } = string.Empty; // Travel, Meal, Equipment, etc.

    public decimal Amount { get; set; }

    [MaxLength(500)]
    public string? ReceiptUrl { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime ClaimDate { get; set; }
    public DateTime? ProcessedDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
