using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

/// <summary>
/// 常用分錄範本 — a reusable journal-entry template. Applying it on the voucher
/// screen pre-fills the debit/credit lines (accounts, sides, optional default
/// amounts), so recurring entries (rent, utilities, cash withdrawals) are one click.
/// </summary>
public class JournalTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = string.Empty; // e.g. 支付租金

    [MaxLength(200)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<JournalTemplateLine> Lines { get; set; } = new List<JournalTemplateLine>();
}

public class JournalTemplateLine
{
    [Key]
    public int Id { get; set; }

    public int JournalTemplateId { get; set; }
    [ForeignKey(nameof(JournalTemplateId))]
    public JournalTemplate? JournalTemplate { get; set; }

    public int AccountTitleId { get; set; }
    [ForeignKey(nameof(AccountTitleId))]
    public AccountTitle? AccountTitle { get; set; }

    public bool IsDebit { get; set; }

    /// <summary>Optional default amount; 0 means "fill in when applied".</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(200)]
    public string? Summary { get; set; }
}
