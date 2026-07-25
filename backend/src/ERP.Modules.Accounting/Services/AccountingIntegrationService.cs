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
            // Generate a unique Voucher No
            var today = DateTime.UtcNow;
            var count = await _context.Vouchers.CountAsync(v => v.VoucherDate.Date == today.Date);
            string voucherNo = $"V-{today:yyyyMMdd}-{(count + 1):D3}";

            var voucher = new Voucher
            {
                VoucherNo = voucherNo,
                VoucherDate = orderDate,
                Type = VoucherType.General,
                Status = VoucherStatus.Draft, // Auto-generated vouchers start as Draft for accountant review
                TotalAmount = totalRevenue + totalCost,
                Memo = $"銷貨單 {orderNo} 自動拋轉",
                CreatedAt = DateTime.UtcNow,
                Details = new List<VoucherDetail>()
            };

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

            // If cost of goods sold is recorded
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

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            // Log exception here in a real production system
            return false;
        }
    }
}
