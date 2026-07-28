using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class HrParameterSetting
{
    [Key]
    public int Id { get; set; }

    [MaxLength(100)]
    public string ParameterName { get; set; } = string.Empty; // e.g., "OvertimeMultiplier", "AnnualLeaveDays"

    [MaxLength(500)]
    public string ParameterValue { get; set; } = string.Empty; // JSON or string value

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
