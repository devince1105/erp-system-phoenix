using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using ERP.Shared.Interfaces.Accounting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Modules.Accounting.Services;

public class AccountingIntegrationService : IAccountingIntegrationService
{
    private readonly AccountingDbContext _context;

    public AccountingIntegrationService(AccountingDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CreateSalesVoucherAsync(string orderNo, DateTime orderDate, decimal totalRevenue, decimal totalCost)
    {
        try
        {
            var voucher = await BuildVoucherAsync(
                date: orderDate,
                memo: $"銷貨單 {orderNo} 自動拋轉");

            int seq = 1;

            // 1. Dr: 應收帳款 (Accounts Receivable) - ID: 3
            voucher.Details.Add(new VoucherDetail
            {
                SeqNo = seq++,
                AccountTitleId = 3,
                IsDebit = true,
                Amount = totalRevenue,
                Summary = $"銷貨收入應收款 - {orderNo}"
            });

            // 2. Cr: 銷貨收入 (Sales Revenue) - ID: 12
            voucher.Details.Add(new VoucherDetail
            {
                SeqNo = seq++,
                AccountTitleId = 12,
                IsDebit = false,
                Amount = totalRevenue,
                Summary = $"銷貨收入 - {orderNo}"
            });

            if (totalCost > 0)
            {
                // 3. Dr: 銷貨成本 (Cost of Goods Sold) - ID: 14
                voucher.Details.Add(new VoucherDetail
                {
                    SeqNo = seq++,
                    AccountTitleId = 14,
                    IsDebit = true,
                    Amount = totalCost,
                    Summary = $"銷貨成本 - {orderNo}"
                });

                // 4. Cr: 存貨 (Inventory) - ID: 4
                voucher.Details.Add(new VoucherDetail
                {
                    SeqNo = seq++,
                    AccountTitleId = 4,
                    IsDebit = false,
                    Amount = totalCost,
                    Summary = $"存貨轉出 - {orderNo}"
                });
            }

            voucher.TotalAmount = totalRevenue + totalCost;
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> CreatePurchaseVoucherAsync(string orderNo, DateTime orderDate, decimal totalAmount)
    {
        try
        {
            var voucher = await BuildVoucherAsync(
                date: orderDate,
                memo: $"採購單 {orderNo} 自動拋轉");

            // 1. Dr: 存貨 (Inventory) - ID: 4
            // 入庫增加存貨資產
            voucher.Details.Add(new VoucherDetail
            {
                SeqNo = 1,
                AccountTitleId = 4,
                IsDebit = true,
                Amount = totalAmount,
                Summary = $"採購入庫存貨 - {orderNo}"
            });

            // 2. Cr: 應付帳款 (Accounts Payable) - ID: 6
            // 尚未付款，產生應付供應商的負債
            voucher.Details.Add(new VoucherDetail
            {
                SeqNo = 2,
                AccountTitleId = 6,
                IsDebit = false,
                Amount = totalAmount,
                Summary = $"採購應付帳款 - {orderNo}"
            });

            voucher.TotalAmount = totalAmount;
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> CreatePayrollVoucherAsync(int year, int month, decimal totalNetSalary, decimal totalBonus, decimal totalDeductions)
    {
        try
        {
            var payrollDate = new DateTime(year, month, 1).AddMonths(1).AddDays(-1); // Last day of month
            var totalGross = totalNetSalary + totalDeductions; // Gross = Net + Deductions

            var voucher = await BuildVoucherAsync(
                date: payrollDate,
                memo: $"{year}年{month:D2}月 薪資費用自動拋轉");

            int seq = 1;

            // 1. Dr: 薪資支出 (Salaries Expense) - ID: 15
            // 公司承擔的總薪資費用（含加班費）
            voucher.Details.Add(new VoucherDetail
            {
                SeqNo = seq++,
                AccountTitleId = 15,
                IsDebit = true,
                Amount = totalGross,
                Summary = $"{year}/{month:D2} 薪資費用（本薪 + 加班費）"
            });

            // 2. Cr: 應付薪資 (Accrued Payroll) - ID: 7
            // 淨薪資（實際應匯給員工的金額）
            voucher.Details.Add(new VoucherDetail
            {
                SeqNo = seq++,
                AccountTitleId = 7,
                IsDebit = false,
                Amount = totalNetSalary,
                Summary = $"{year}/{month:D2} 應付員工薪資淨額"
            });

            // 3. Cr: 應付稅額 (Tax Payable) - ID: 8
            // 代扣所得稅及勞健保等（Deductions 視為代扣代繳項目）
            if (totalDeductions > 0)
            {
                voucher.Details.Add(new VoucherDetail
                {
                    SeqNo = seq++,
                    AccountTitleId = 8,
                    IsDebit = false,
                    Amount = totalDeductions,
                    Summary = $"{year}/{month:D2} 代扣勞健保/所得稅"
                });
            }

            voucher.TotalAmount = totalGross;
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    /// <summary>
    /// Builds a new Voucher with an auto-generated VoucherNo.
    /// </summary>
    private async Task<Voucher> BuildVoucherAsync(DateTime date, string memo)
    {
        var datePrefix = $"V{date:yyyyMMdd}";
        var countToday = await _context.Vouchers.CountAsync(v => v.VoucherNo.StartsWith(datePrefix));
        var voucherNo = $"{datePrefix}{(countToday + 1):D3}";

        return new Voucher
        {
            VoucherNo = voucherNo,
            VoucherDate = date,
            Type = VoucherType.General,
            Status = VoucherStatus.Draft,
            Memo = memo,
            CreatedAt = DateTime.UtcNow,
            Details = new List<VoucherDetail>()
        };
    }
}
