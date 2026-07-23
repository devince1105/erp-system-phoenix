using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

public enum VoucherType
{
    General = 1,    // 轉帳分錄傳票
    CashIn = 2,     // 現金收入傳票
    CashOut = 3     // 現金支出傳票
}

public enum VoucherStatus
{
    Draft = 1,      // 草稿
    Approved = 2,   // 已審核
    Posted = 3      // 已過帳
}

public class Voucher
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string VoucherNo { get; set; } = string.Empty;

    public DateTime VoucherDate { get; set; } = DateTime.Today;

    public VoucherType Type { get; set; } = VoucherType.General;

    public VoucherStatus Status { get; set; } = VoucherStatus.Draft;

    [Column(TypeName = "decimal(18,4)")]
    public decimal TotalAmount { get; set; }

    [MaxLength(255)]
    public string? Memo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<VoucherDetail> Details { get; set; } = new();
}
