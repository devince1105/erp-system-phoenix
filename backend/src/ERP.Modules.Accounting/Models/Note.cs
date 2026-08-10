using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

/// <summary>
/// 票據 — a cheque/promissory note, receivable (收票) or payable (付票). Tracks the
/// instrument and its due date; clearing (兌現) posts a bank voucher against A/R or A/P.
/// </summary>
public class Note
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string NoteNo { get; set; } = string.Empty; // 票號

    /// <summary>Receivable (收票, from a customer) or Payable (付票, issued to a supplier).</summary>
    [MaxLength(20)]
    public string Direction { get; set; } = "Receivable";

    [MaxLength(20)]
    public string Instrument { get; set; } = "支票"; // 支票 / 本票 / 匯票

    [MaxLength(80)]
    public string PartnerName { get; set; } = string.Empty; // 客戶 / 供應商

    [MaxLength(60)]
    public string? BankName { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Cleared, Bounced

    public DateTime? ClearedDate { get; set; }

    [MaxLength(200)]
    public string? Memo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
