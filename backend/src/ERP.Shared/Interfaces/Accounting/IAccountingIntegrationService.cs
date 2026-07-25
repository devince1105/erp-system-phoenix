using System;
using System.Threading.Tasks;

namespace ERP.Shared.Interfaces.Accounting;

public interface IAccountingIntegrationService
{
    /// <summary>
    /// Creates a draft journal voucher for a sales order.
    /// </summary>
    /// <param name="orderNo">The sales order number (e.g. SO-2026...)</param>
    /// <param name="orderDate">The date of the order</param>
    /// <param name="totalRevenue">The total sales revenue</param>
    /// <param name="totalCost">The total cost of goods sold</param>
    /// <returns>True if successful, otherwise false</returns>
    Task<bool> CreateSalesVoucherAsync(string orderNo, DateTime orderDate, decimal totalRevenue, decimal totalCost);
}
