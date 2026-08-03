using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

/// <summary>
/// A persisted approval-workflow step for a form type (簽核流程設定). Replaces the
/// hardcoded registry: when rows exist for a form type they drive the flow that
/// <c>ApprovalService.CreateAsync</c> expands; otherwise it falls back to defaults.
/// </summary>
public class WorkflowStepDefinition
{
    [Key]
    public int Id { get; set; }

    [MaxLength(50)]
    public string FormType { get; set; } = string.Empty;

    /// <summary>1-based order of this step within the form type's flow.</summary>
    public int StepOrder { get; set; }

    /// <summary>Approver role. Must be one the resolver understands
    /// (DirectSupervisor / DepartmentManager / Finance) or only Admin can decide it.</summary>
    [MaxLength(40)]
    public string Role { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Label { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
