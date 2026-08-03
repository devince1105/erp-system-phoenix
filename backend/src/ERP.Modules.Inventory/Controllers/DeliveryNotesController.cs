using System.Transactions;
using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using ERP.Shared.Interfaces.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

/// <summary>
/// 出貨單 — shipping goods against a confirmed 銷售訂單. Shipping deducts stock and
/// posts the receivable (Dr 應收 / Cr 銷貨 + Dr 銷貨成本 / Cr 存貨).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeliveryNotesController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IAccountingIntegrationService _accounting;

    public DeliveryNotesController(InventoryDbContext context, IAccountingIntegrationService accounting)
    {
        _context = context;
        _accounting = accounting;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeliveryNote>>> GetAll()
    {
        return await _context.DeliveryNotes
            .Include(d => d.SalesOrder).ThenInclude(o => o!.Customer)
            .Include(d => d.Items).ThenInclude(i => i.Product)
            .OrderByDescending(d => d.DeliveryDate)
            .ToListAsync();
    }

    /// <summary>Ship the full quantity of a confirmed sales order (出貨).</summary>
    [HttpPost("from-order/{salesOrderId}")]
    public async Task<IActionResult> ShipFromOrder(int salesOrderId)
    {
        var order = await _context.SalesOrders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == salesOrderId);

        if (order == null) return NotFound();
        if (order.Status != OrderStatus.Confirmed) return BadRequest("只有已確認的銷售訂單可以出貨。");
        if (order.DeliveredAt != null) return BadRequest("此訂單已出貨。");

        // Stock check before shipping.
        foreach (var item in order.Items)
            if (item.Product != null && item.Product.StockQuantity < item.Quantity)
                return BadRequest($"商品 [{item.Product.Name}] 庫存不足！現庫存 {item.Product.StockQuantity}，需求 {item.Quantity}。");

        using var scope = new TransactionScope(
            TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted },
            TransactionScopeAsyncFlowOption.Enabled);

        try
        {
            var datePrefix = $"DN-{DateTime.UtcNow:yyyyMMdd}-";
            var countToday = await _context.DeliveryNotes.CountAsync(d => d.DeliveryNo.StartsWith(datePrefix));
            var note = new DeliveryNote
            {
                DeliveryNo = $"{datePrefix}{(countToday + 1):D3}",
                SalesOrderId = order.Id,
                DeliveryDate = DateTime.UtcNow,
                TotalAmount = order.TotalAmount,
                Memo = $"銷售訂單 {order.OrderNo} 出貨",
            };

            decimal totalCost = 0;
            foreach (var item in order.Items)
            {
                note.Items.Add(new DeliveryNoteItem { ProductId = item.ProductId, Quantity = item.Quantity, UnitPrice = item.UnitPrice });

                var product = item.Product;
                if (product != null)
                {
                    var before = product.StockQuantity;
                    product.StockQuantity -= item.Quantity;
                    totalCost += item.Quantity * product.CostPrice;
                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = product.Id,
                        MovementType = StockMovementType.SalesOut,
                        Quantity = -item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = product.StockQuantity,
                        ReferenceNo = note.DeliveryNo,
                        Remark = $"出貨單 {note.DeliveryNo} 出庫",
                    });
                }
            }

            order.DeliveredAt = DateTime.UtcNow;
            _context.DeliveryNotes.Add(note);
            await _context.SaveChangesAsync();

            // Post the receivable: Dr 應收 / Cr 銷貨 (+ Dr 銷貨成本 / Cr 存貨).
            var voucherOk = await _accounting.CreateSalesVoucherAsync(order.OrderNo, order.OrderDate, order.TotalAmount, totalCost);
            if (!voucherOk) throw new InvalidOperationException("拋轉應收傳票失敗,已回滾出貨。");

            scope.Complete();
            return Ok(new { note.Id, note.DeliveryNo });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return StatusCode(500, "出貨時發生未預期錯誤,已回滾。");
        }
    }
}
