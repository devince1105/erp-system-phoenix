using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class LeaveBalance
{
    [Key]
    public int Id { get; set; }
    
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    
    public int Year { get; set; }
    
    public decimal AnnualTotal { get; set; }
    public decimal AnnualUsed { get; set; }
    
    public decimal SickTotal { get; set; }
    public decimal SickUsed { get; set; }
    
    public decimal PersonalTotal { get; set; }
    public decimal PersonalUsed { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
