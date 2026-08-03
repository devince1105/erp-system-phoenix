using ERP.Modules.Accounting.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Data;

/// <summary>Ensures the accounts fixed-asset depreciation posts to exist. Idempotent.</summary>
public static class DepreciationAccountSeeder
{
    public static async Task SeedAsync(AccountingDbContext db)
    {
        // 累計折舊 is a contra-asset (credit-normal); categorising it Asset makes its
        // credit balance reduce total assets in the balance sheet, which is correct.
        var wanted = new[]
        {
            (Code: "1501", Name: "累計折舊", Cat: AccountCategory.Asset),
            (Code: "6501", Name: "折舊費用", Cat: AccountCategory.Expense),
        };
        foreach (var w in wanted)
        {
            if (!await db.AccountTitles.AnyAsync(a => a.Code == w.Code))
                db.AccountTitles.Add(new AccountTitle { Code = w.Code, Name = w.Name, Category = w.Cat, Level = 1, IsActive = true });
        }
        await db.SaveChangesAsync();
    }
}
