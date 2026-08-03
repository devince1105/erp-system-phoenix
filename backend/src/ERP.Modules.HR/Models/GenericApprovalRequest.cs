using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

/// <summary>
/// 萬用申請單 — an instance an employee submits against an <see cref="ApprovalFormTemplate"/>.
/// Runs the template's configured approval flow via the shared engine.
/// </summary>
public class GenericApprovalRequest
{
    [Key]
    public int Id { get; set; }

    public int TemplateId { get; set; }
    public ApprovalFormTemplate? Template { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty; // 主旨 / 品名

    public int? Quantity { get; set; }

    public decimal? Amount { get; set; }

    [MaxLength(1000)]
    public string? Reason { get; set; } // 事由 / 說明

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
