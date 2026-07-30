using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class PayrollRecord
{
    [Key]
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public int Year { get; set; }
    public int Month { get; set; }

    public decimal BaseSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal ExpenseReimbursements { get; set; }
    public decimal Bonus { get; set; }
    public decimal LeaveDeductions { get; set; }
    public decimal Deductions { get; set; } // General deductions like insurance
    public decimal NetSalary { get; set; }
    
    public ICollection<ExpenseClaim> ExpenseClaims { get; set; } = new List<ExpenseClaim>();

    public DateTime? PaymentDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Processed, Paid

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
