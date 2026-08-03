using ERP.Modules.Accounting.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Data;

public class AccountingDbContext : DbContext
{
    public AccountingDbContext(DbContextOptions<AccountingDbContext> options)
        : base(options)
    {
    }

    public DbSet<AccountTitle> AccountTitles => Set<AccountTitle>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<VoucherDetail> VoucherDetails => Set<VoucherDetail>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<JournalTemplate> JournalTemplates => Set<JournalTemplate>();
    public DbSet<JournalTemplateLine> JournalTemplateLines => Set<JournalTemplateLine>();
    public DbSet<FixedAsset> FixedAssets => Set<FixedAsset>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Define module schema
        modelBuilder.HasDefaultSchema("acc");

        // Seed Default Taiwan Chart of Accounts (標準會計科目表)
        modelBuilder.Entity<AccountTitle>().HasData(
            // 資產類 (1xxx)
            new AccountTitle { Id = 1, Code = "1101", Name = "現金及約當現金", Category = AccountCategory.Asset, Level = 1 },
            new AccountTitle { Id = 2, Code = "1102", Name = "銀行存款", Category = AccountCategory.Asset, Level = 1 },
            new AccountTitle { Id = 3, Code = "1103", Name = "應收帳款", Category = AccountCategory.Asset, Level = 1 },
            new AccountTitle { Id = 4, Code = "1104", Name = "存貨", Category = AccountCategory.Asset, Level = 1 },
            new AccountTitle { Id = 5, Code = "1401", Name = "不動產、廠房及設備", Category = AccountCategory.Asset, Level = 1 },

            // 負債類 (2xxx)
            new AccountTitle { Id = 6, Code = "2101", Name = "應付帳款", Category = AccountCategory.Liability, Level = 1 },
            new AccountTitle { Id = 7, Code = "2102", Name = "應付薪資", Category = AccountCategory.Liability, Level = 1 },
            new AccountTitle { Id = 8, Code = "2103", Name = "應付稅額", Category = AccountCategory.Liability, Level = 1 },
            new AccountTitle { Id = 9, Code = "2201", Name = "長期借款", Category = AccountCategory.Liability, Level = 1 },

            // 權益類 (3xxx)
            new AccountTitle { Id = 10, Code = "3101", Name = "普通股股本", Category = AccountCategory.Equity, Level = 1 },
            new AccountTitle { Id = 11, Code = "3201", Name = "保留盈餘", Category = AccountCategory.Equity, Level = 1 },

            // 營業收入類 (4xxx)
            new AccountTitle { Id = 12, Code = "4101", Name = "銷貨收入", Category = AccountCategory.Revenue, Level = 1 },
            new AccountTitle { Id = 13, Code = "4201", Name = "勞務收入", Category = AccountCategory.Revenue, Level = 1 },

            // 營業成本與費用類 (5xxx-6xxx)
            new AccountTitle { Id = 14, Code = "5101", Name = "銷貨成本", Category = AccountCategory.Expense, Level = 1 },
            new AccountTitle { Id = 15, Code = "6101", Name = "薪資支出", Category = AccountCategory.Expense, Level = 1 },
            new AccountTitle { Id = 16, Code = "6201", Name = "租金支出", Category = AccountCategory.Expense, Level = 1 },
            new AccountTitle { Id = 17, Code = "6301", Name = "水電瓦斯費", Category = AccountCategory.Expense, Level = 1 },
            new AccountTitle { Id = 18, Code = "6401", Name = "文具用品", Category = AccountCategory.Expense, Level = 1 }
        );

        // Seed Default Bank Accounts (預設銀行帳戶)
        modelBuilder.Entity<BankAccount>().HasData(
            new BankAccount
            {
                Id = 1,
                BankCode = "808",
                BankName = "玉山銀行",
                BranchName = "營業部",
                AccountNumber = "0808-988-123456",
                AccountName = "○○企業股份有限公司",
                Currency = "TWD",
                Balance = 1280500m,
                AccountTitleId = 2, // 1102 銀行存款
                ApiType = BankApiIntegrationType.OpenBankingFWI,
                ApiEndpoint = "https://api.esunbank.com.tw/open-banking/v1",
                ApiClientId = "ESUN_ERP_CLIENT_2026",
                IsActive = true,
                LastSyncedAt = DateTime.UtcNow
            },
            new BankAccount
            {
                Id = 2,
                BankCode = "013",
                BankName = "國泰世華銀行",
                BranchName = "敦南分行",
                AccountNumber = "0130-100-888999",
                AccountName = "○○企業股份有限公司",
                Currency = "TWD",
                Balance = 650000m,
                AccountTitleId = 2,
                ApiType = BankApiIntegrationType.MockBankApi,
                ApiEndpoint = "https://sandbox.cathaybk.com.tw/v1",
                ApiClientId = "CATHAY_SANDBOX_KEY",
                IsActive = true,
                LastSyncedAt = DateTime.UtcNow
            }
        );

        // Seed Default System Settings
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Key = "Accounting:ClosedUntilDate", Value = "2000-01-01" }
        );
    }
}
