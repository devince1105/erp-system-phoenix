using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class SalaryStructure
{
    [Key]
    public int Id { get; set; }
    
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    
    public decimal BaseSalary { get; set; }
    public decimal MealAllowance { get; set; } // 伙食津貼
    public decimal PositionAllowance { get; set; } // 職務加給
    
    public decimal LaborInsuranceDeduction { get; set; } // 勞保自付額
    public decimal HealthInsuranceDeduction { get; set; } // 健保自付額
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
