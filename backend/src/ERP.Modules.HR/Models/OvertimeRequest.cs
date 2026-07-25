using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class OvertimeRequest
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public DateTime Date { get; set; }

    [Range(0.5, 4.0)]
    public decimal Hours { get; set; }

    [Required]
    [MaxLength(200)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
