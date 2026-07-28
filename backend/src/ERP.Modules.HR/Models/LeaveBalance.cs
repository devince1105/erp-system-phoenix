using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class LeaveBalance
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    [MaxLength(50)]
    public string LeaveType { get; set; } = string.Empty; // Annual, Sick, Personal, etc.

    public int Year { get; set; }

    public decimal TotalDays { get; set; } // Total allocated days
    public decimal UsedDays { get; set; } = 0; // Days already used
    public decimal RemainingDays { get; set; } // Calculated: TotalDays - UsedDays

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
