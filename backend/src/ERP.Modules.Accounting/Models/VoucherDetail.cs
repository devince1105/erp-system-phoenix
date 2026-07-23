using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ERP.Modules.Accounting.Models;

public class VoucherDetail
{
    [Key]
    public int Id { get; set; }

    public int VoucherId { get; set; }

    [ForeignKey(nameof(VoucherId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public Voucher? Voucher { get; set; }

    public int SeqNo { get; set; }

    public int AccountTitleId { get; set; }

    [ForeignKey(nameof(AccountTitleId))]
    public AccountTitle? AccountTitle { get; set; }

    /// <summary>
    /// True: 借方 (Debit), False: 貸方 (Credit)
    /// </summary>
    public bool IsDebit { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Amount { get; set; }

    [MaxLength(255)]
    public string? Summary { get; set; }
}
