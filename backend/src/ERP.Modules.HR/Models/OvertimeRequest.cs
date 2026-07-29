using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class OvertimeRequest
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public DateTime Date { get; set; }

    [Range(0.5, 4.0)]
    public decimal Hours { get; set; }

    [Required]
    [MaxLength(200)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // ── Approval Audit Trail ─────────────────────────────────────────────────
    /// <summary>Soft reference to Identity.User who approved/rejected this request.</summary>
    public int? ApprovedByUserId { get; set; }

    /// <summary>Timestamp when the request was approved or rejected.</summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>Reason provided when the request is rejected.</summary>
    [MaxLength(500)]
    public string? RejectedReason { get; set; }
}
