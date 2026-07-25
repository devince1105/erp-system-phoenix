using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class LeaveRequest
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    [MaxLength(50)]
    public string LeaveType { get; set; } = "Annual"; // Annual, Sick, Personal, Official

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
