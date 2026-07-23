using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.Accounting.Models;

public enum BankApiIntegrationType
{
    None = 0,               // 未串接 (人工對帳)
    MockBankApi = 1,        // 模擬測試 API (沙盒 Sandbox)
    OpenBankingFWI = 2,     // 財金公司 Open Banking 開放銀行 API
    DirectWebAPI = 3        // 銀行直連 Enterprise Web API
}

public class BankAccount
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string BankCode { get; set; } = string.Empty; // 銀行代碼 (如 808, 013, 812)

    [Required]
    [MaxLength(100)]
    public string BankName { get; set; } = string.Empty; // 銀行名稱 (如 玉山銀行)

    [MaxLength(100)]
    public string? BranchName { get; set; } // 分行名稱

    [Required]
    [MaxLength(50)]
    public string AccountNumber { get; set; } = string.Empty; // 銀行帳號

    [Required]
    [MaxLength(100)]
    public string AccountName { get; set; } = string.Empty; // 戶名

    [MaxLength(10)]
    public string Currency { get; set; } = "TWD"; // 幣別

    [Column(TypeName = "decimal(18,4)")]
    public decimal Balance { get; set; } // 帳戶餘額

    public int? AccountTitleId { get; set; } // 關聯會計科目 (如 1102 銀行存款)

    [ForeignKey(nameof(AccountTitleId))]
    public AccountTitle? AccountTitle { get; set; }

    public BankApiIntegrationType ApiType { get; set; } = BankApiIntegrationType.None; // API 串接模式

    [MaxLength(255)]
    public string? ApiEndpoint { get; set; } // 未來銀行 API Endpoint URL

    [MaxLength(255)]
    public string? ApiClientId { get; set; } // API App Client ID

    public bool IsActive { get; set; } = true;

    public DateTime? LastSyncedAt { get; set; } // 最後一次與銀行 API 同步時間

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
