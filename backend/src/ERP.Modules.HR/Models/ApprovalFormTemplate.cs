using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models;

/// <summary>
/// 萬用申請表單範本 — a manager-defined approval form. Its approval steps are stored
/// as WorkflowStepDefinition rows keyed by FormType "Tpl{Id}", so the whole approval
/// engine (routing, inbox, report, delegation) works for it with no per-form code.
/// </summary>
public class ApprovalFormTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = string.Empty; // e.g. 電腦物品領用申請單

    [MaxLength(300)]
    public string? Description { get; set; }

    /// <summary>Show a quantity field on the form (e.g. 領用數量).</summary>
    public bool RequireQuantity { get; set; }

    /// <summary>Show an amount field on the form (e.g. 預估金額).</summary>
    public bool RequireAmount { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>The engine form-type key for this template's instances and steps.</summary>
    [NotMapped]
    public string FormType => $"Tpl{Id}";
}
