using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models;

/// <summary>
/// A running approval for a single document (簽核實例). Its steps are expanded
/// from the workflow defined for the document's form type; approvals advance
/// through the steps in order until the instance is Approved or Rejected.
/// </summary>
public class ApprovalInstance
{
    [Key]
    public int Id { get; set; }

    /// <summary>Form type key, e.g. "BusinessTrip", "ExpenseClaim".</summary>
    [MaxLength(50)]
    public string FormType { get; set; } = string.Empty;

    /// <summary>Id of the underlying document (trip / claim / ...).</summary>
    public int DocumentId { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    /// <summary>Order (1-based) of the step currently awaiting a decision.</summary>
    public int CurrentStepOrder { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public ICollection<ApprovalStep> Steps { get; set; } = new List<ApprovalStep>();
}

/// <summary>One approval level within an <see cref="ApprovalInstance"/>.</summary>
public class ApprovalStep
{
    [Key]
    public int Id { get; set; }

    public int ApprovalInstanceId { get; set; }
    public ApprovalInstance? ApprovalInstance { get; set; }

    public int StepOrder { get; set; }

    /// <summary>Organisational role expected to sign this step
    /// (DirectSupervisor, DepartmentManager, Finance, ...).</summary>
    [MaxLength(40)]
    public string Role { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Label { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Skipped

    public int? ApproverUserId { get; set; }
    public DateTime? DecidedAt { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }

    /// <summary>The employee expected to sign this step (resolved from the role at creation).</summary>
    public int? ApproverEmployeeId { get; set; }

    /// <summary>The employee who actually signed. Differs from the approver when a delegate signed (代簽).</summary>
    public int? SignedByEmployeeId { get; set; }

    /// <summary>Resolved display name of <see cref="ApproverEmployeeId"/> (not stored).</summary>
    [NotMapped]
    public string? ApproverName { get; set; }

    /// <summary>Resolved display name of <see cref="SignedByEmployeeId"/> (not stored).</summary>
    [NotMapped]
    public string? SignedByName { get; set; }
}
