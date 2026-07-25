using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class AttendanceRecord
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public DateTime Date { get; set; }

    public DateTime? CheckInTime { get; set; }
    
    // 午休時間
    public DateTime? BreakOutTime { get; set; }
    public DateTime? BreakInTime { get; set; }
    
    public DateTime? CheckOutTime { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Present"; // Present, Absent, Late, Leave

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
