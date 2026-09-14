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
    public async Task<IActionResult> ShipFromOrder(int salesOrderId, [FromQuery] int? warehouseId = null)
    {
        var order = await _context.SalesOrders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == salesOrderId);

        if (order == null) return NotFound();
        if (order.Status != OrderStatus.Confirmed) return BadRequest("只有已確認的銷售訂單可以出貨。");
        if (order.DeliveredAt != null) return BadRequest("此訂單已出貨。");

        // 決定出貨倉庫（未指定時抓預設倉庫或第一座啟用倉庫）
        Warehouse? targetWarehouse = null;
        if (warehouseId.HasValue)
        {
            targetWarehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == warehouseId.Value && w.IsActive);
            if (targetWarehouse == null) return BadRequest("指定之出貨倉庫不存在或已停用。");
        }
        else
        {
            targetWarehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.IsDefault && w.IsActive)
                ?? await _context.Warehouses.FirstOrDefaultAsync(w => w.IsActive);
        }

        // 檢查該倉庫庫存
        if (targetWarehouse != null)
        {
            foreach (var item in order.Items)
            {
                var whStock = await _context.WarehouseStocks
                    .FirstOrDefaultAsync(ws => ws.WarehouseId == targetWarehouse.Id && ws.ProductId == item.ProductId);
                var available = whStock?.Quantity ?? 0;
                if (available < item.Quantity)
                {
                    var prodName = item.Product?.Name ?? $"ID {item.ProductId}";
                    return BadRequest($"倉庫 [{targetWarehouse.Name}] 之商品 [{prodName}] 庫存不足！現存 {available}，需求 {item.Quantity}。請先調撥或更換出貨倉庫。");
                }
            }
        }
        else
        {
            // 若完全無倉庫則檢查商品總庫存
            foreach (var item in order.Items)
                if (item.Product != null && item.Product.StockQuantity < item.Quantity)
                    return BadRequest($"商品 [{item.Product.Name}] 庫存不足！現庫存 {item.Product.StockQuantity}，需求 {item.Quantity}。");
        }

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
                WarehouseId = targetWarehouse?.Id,
                DeliveryDate = DateTime.UtcNow,
                TotalAmount = order.TotalAmount,
                Memo = $"銷售訂單 {order.OrderNo} 出貨{(targetWarehouse != null ? $" [出貨倉: {targetWarehouse.Name}]" : "")}",
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

                    // 扣減指定倉庫庫存
                    if (targetWarehouse != null)
                    {
                        var whStock = await _context.WarehouseStocks
                            .FirstOrDefaultAsync(ws => ws.WarehouseId == targetWarehouse.Id && ws.ProductId == product.Id);
                        if (whStock != null)
                        {
                            whStock.Quantity -= item.Quantity;
                            whStock.UpdatedAt = DateTime.UtcNow;
                        }
                    }

                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = product.Id,
                        WarehouseId = targetWarehouse?.Id,
                        MovementType = StockMovementType.SalesOut,
                        Quantity = -item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = product.StockQuantity,
                        ReferenceNo = note.DeliveryNo,
                        Remark = $"出貨單 {note.DeliveryNo} 出庫{(targetWarehouse != null ? $"自 {targetWarehouse.Name}" : "")}",
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
