using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class SalaryStructure
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public decimal BaseSalary { get; set; }
    public decimal HousingAllowance { get; set; } = 0;
    public decimal MealAllowance { get; set; } = 0;
    public decimal TransportationAllowance { get; set; } = 0;
    public decimal OtherAllowances { get; set; } = 0;

    // Insurance deductions
    public decimal LaborInsuranceDeduction { get; set; } = 0;
    public decimal HealthInsuranceDeduction { get; set; } = 0;
    public decimal OtherDeductions { get; set; } = 0;

    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
