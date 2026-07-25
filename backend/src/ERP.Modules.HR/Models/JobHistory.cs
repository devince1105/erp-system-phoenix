using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models;

public class JobHistory
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    public int? DepartmentId { get; set; }

    public Department? Department { get; set; }

    [Required]
    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
}
