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

    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

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

    public ICollection<Education> Educations { get; set; } = new List<Education>();
    public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    public ICollection<JobHistory> JobHistories { get; set; } = new List<JobHistory>();
    public ICollection<AttendanceRecord> Attendances { get; set; } = new List<AttendanceRecord>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<OvertimeRequest> OvertimeRequests { get; set; } = new List<OvertimeRequest>();
    public ICollection<PayrollRecord> Payrolls { get; set; } = new List<PayrollRecord>();
    
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
    public ICollection<SalaryStructure> SalaryStructures { get; set; } = new List<SalaryStructure>();
    public ICollection<ExpenseClaim> ExpenseClaims { get; set; } = new List<ExpenseClaim>();
}

public enum EmployeeStatus
{
    Active = 1,
    OnLeave = 2,
    Terminated = 3
}
