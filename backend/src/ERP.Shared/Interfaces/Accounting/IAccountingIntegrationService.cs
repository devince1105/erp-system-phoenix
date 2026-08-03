using System;
using System.Threading.Tasks;

namespace ERP.Shared.Interfaces.Accounting;

public interface IAccountingIntegrationService
{
    /// <summary>
    /// Creates a draft journal voucher for a sales order.
    /// Dr: 應收帳款 / Cr: 銷貨收入 + 存貨
    /// </summary>
    Task<bool> CreateSalesVoucherAsync(string orderNo, DateTime orderDate, decimal totalRevenue, decimal totalCost);

    /// <summary>
    /// Creates a draft journal voucher for a confirmed purchase order.
    /// Dr: 存貨 / Cr: 應付帳款
    /// </summary>
    /// <param name="orderNo">The purchase order number (e.g. PO-2026...)</param>
    /// <param name="orderDate">The date of the order</param>
    /// <param name="totalAmount">The total payable amount to supplier</param>
    Task<bool> CreatePurchaseVoucherAsync(string orderNo, DateTime orderDate, decimal totalAmount);

    /// <summary>
    /// Creates a draft journal voucher for a processed payroll batch.
    /// Dr: 薪資費用 / Cr: 應付薪資
    /// </summary>
    /// <param name="year">Payroll year</param>
    /// <param name="month">Payroll month</param>
    /// <param name="totalNetSalary">Total net salary to be paid</param>
    /// <param name="totalBonus">Total bonus amount</param>
    /// <param name="totalDeductions">Total deduction amount</param>
    Task<bool> CreatePayrollVoucherAsync(int year, int month, decimal totalNetSalary, decimal totalBonus, decimal totalDeductions);

    /// <summary>
    /// Creates a draft journal voucher for a receipt/payment against an order.
    /// Receipt (收款): Dr 現金 / Cr 應收帳款. Payment (付款): Dr 應付帳款 / Cr 現金.
    /// </summary>
    Task<bool> CreateSettlementVoucherAsync(bool isReceipt, string orderNo, DateTime date, decimal amount);
}
