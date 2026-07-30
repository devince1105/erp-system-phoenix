using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class ExpenseClaim
{
    [Key]
    public int Id { get; set; }
    
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    
    public DateTime ClaimDate { get; set; }
    
    [MaxLength(50)]
    public string ExpenseType { get; set; } = "Travel"; // Travel, Meal, OfficeSupply, Other
    
    public decimal Amount { get; set; }
    
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Paid
    
    // Optional: link to a payroll record if paid via payroll
    public int? PayrollRecordId { get; set; }
    public PayrollRecord? PayrollRecord { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
