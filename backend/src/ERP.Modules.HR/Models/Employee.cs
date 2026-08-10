using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models;

public class Employee
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    public int? DepartmentId { get; set; }

    public Department? Department { get; set; }

    /// <summary>Direct supervisor (直屬主管). When null, "直屬主管" steps fall back to the department manager.</summary>
    public int? ManagerId { get; set; }

    /// <summary>Approval delegate (簽核代理人): while set, this person may sign in place of this
    /// employee — used when a manager is away. Clear it when they return.</summary>
    public int? DelegateEmployeeId { get; set; }

    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    /// <summary>職級 — its salary band constrains BaseSalary. Null = ungraded (no band check).</summary>
    public int? JobGradeId { get; set; }
    public JobGrade? JobGrade { get; set; }

    public decimal BaseSalary { get; set; } = 30000;

    public DateTime HireDate { get; set; }

    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;

    // --- Personal & Contact Info ---
    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? Mobile { get; set; }

    [MaxLength(50)]
    public string? LineId { get; set; }

    [MaxLength(200)]
    public string? RegisteredAddress { get; set; }

    [MaxLength(200)]
    public string? ContactAddress { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(10)]
    public string? BloodType { get; set; }

    [MaxLength(50)]
    public string? EmergencyContactName { get; set; }

    [MaxLength(20)]
    public string? EmergencyContactPhone { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Soft reference to Identity.User (cross-module, no FK constraint).
    /// Null means the employee has no system login account yet.
    /// </summary>
    public int? UserId { get; set; }

    public ICollection<Education> Educations { get; set; } = new List<Education>();
    public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    public ICollection<JobHistory> JobHistories { get; set; } = new List<JobHistory>();
    public ICollection<AttendanceRecord> Attendances { get; set; } = new List<AttendanceRecord>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<OvertimeRequest> OvertimeRequests { get; set; } = new List<OvertimeRequest>();
    public ICollection<PayrollRecord> Payrolls { get; set; } = new List<PayrollRecord>();
}

public enum EmployeeStatus
{
    Active = 1,
    OnLeave = 2,
    Terminated = 3
}
