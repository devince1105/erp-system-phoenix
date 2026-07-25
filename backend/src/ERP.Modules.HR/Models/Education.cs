using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models;

public class Education
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    [Required]
    [MaxLength(100)]
    public string SchoolName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Degree { get; set; }

    [MaxLength(100)]
    public string? Major { get; set; }

    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
}
