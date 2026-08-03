using ERP.Modules.Accounting.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Data;

/// <summary>Seeds a few common journal templates (rent, utilities, cash withdrawal…) if none exist. Idempotent.</summary>
public static class JournalTemplateSeeder
{
    public static async Task SeedAsync(AccountingDbContext db)
    {
        if (await db.JournalTemplates.AnyAsync()) return;

        var byCode = await db.AccountTitles.ToDictionaryAsync(a => a.Code, a => a.Id);
        int? Id(string code) => byCode.TryGetValue(code, out var v) ? v : null;

        // (name, description, lines: (code, isDebit, summary))
        var defaults = new (string Name, string Desc, (string Code, bool Debit, string Summary)[] Lines)[]
        {
            ("支付租金", "以現金支付辦公室租金", new[] { ("6201", true, "租金支出"), ("1101", false, "現金支付") }),
            ("支付水電費", "以現金支付水電瓦斯費", new[] { ("6301", true, "水電瓦斯費"), ("1101", false, "現金支付") }),
            ("購買文具用品", "以現金購買辦公文具", new[] { ("6401", true, "文具用品"), ("1101", false, "現金支付") }),
            ("銀行提領現金", "自銀行存款提領至庫存現金", new[] { ("1101", true, "提領現金"), ("1102", false, "銀行存款減少") }),
            ("現金存入銀行", "庫存現金存入銀行", new[] { ("1102", true, "存入銀行"), ("1101", false, "庫存現金減少") }),
        };

        foreach (var t in defaults)
        {
            if (t.Lines.Any(l => Id(l.Code) is null)) continue; // skip if any account missing
            var template = new JournalTemplate { Name = t.Name, Description = t.Desc, IsActive = true };
            foreach (var (code, debit, summary) in t.Lines)
                template.Lines.Add(new JournalTemplateLine { AccountTitleId = Id(code)!.Value, IsDebit = debit, Amount = 0, Summary = summary });
            db.JournalTemplates.Add(template);
        }
        await db.SaveChangesAsync();
    }
}
