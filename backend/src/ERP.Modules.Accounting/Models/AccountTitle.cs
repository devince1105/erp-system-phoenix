using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

public enum AccountCategory
{
    Asset = 1,      // 資產
    Liability = 2,  // 負債
    Equity = 3,     // 權益
    Revenue = 4,    // 收入
    Expense = 5     // 費用
}

public class AccountTitle
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public AccountCategory Category { get; set; }

    public int Level { get; set; } = 1;

    public int? ParentId { get; set; }

    [ForeignKey(nameof(ParentId))]
    public AccountTitle? Parent { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
