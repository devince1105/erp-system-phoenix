using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

/// <summary>
/// 職級 — a job grade with a salary band. An employee's base salary must fall within
/// the band of their assigned grade.
/// </summary>
public class JobGrade
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string Code { get; set; } = string.Empty; // L1, M2, C1…

    [Required]
    [MaxLength(60)]
    public string Title { get; set; } = string.Empty; // 助理 / 專員

    [Range(0, 99999999)]
    public decimal MinSalary { get; set; }

    [Range(0, 99999999)]
    public decimal MaxSalary { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
