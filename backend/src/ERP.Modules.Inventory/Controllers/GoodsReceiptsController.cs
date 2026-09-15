using System.Transactions;
using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using ERP.Shared.Interfaces.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

/// <summary>
/// 進貨單 — receiving goods against a confirmed 採購單. Receiving is what adds stock
/// and posts the payable (Dr 存貨 / Cr 應付帳款), separate from placing the order.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoodsReceiptsController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IAccountingIntegrationService _accounting;

    public GoodsReceiptsController(InventoryDbContext context, IAccountingIntegrationService accounting)
    {
        _context = context;
        _accounting = accounting;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GoodsReceipt>>> GetAll()
    {
        return await _context.GoodsReceipts
            .Include(r => r.PurchaseOrder).ThenInclude(o => o!.Supplier)
            .Include(r => r.Warehouse)
            .Include(r => r.Items).ThenInclude(i => i.Product)
            .OrderByDescending(r => r.ReceiptDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoodsReceipt>> GetById(int id)
    {
        var receipt = await _context.GoodsReceipts
            .Include(r => r.PurchaseOrder).ThenInclude(o => o!.Supplier)
            .Include(r => r.Warehouse)
            .Include(r => r.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null) return NotFound();
        return receipt;
    }

    /// <summary>Receive the full quantity of a confirmed purchase order (進貨).</summary>
    [HttpPost("from-order/{purchaseOrderId}")]
    public async Task<IActionResult> ReceiveFromOrder(int purchaseOrderId, [FromQuery] int? warehouseId = null)
    {
        var order = await _context.PurchaseOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == purchaseOrderId);

        if (order == null) return NotFound();
        if (order.Status != OrderStatus.Confirmed) return BadRequest("只有已確認的採購單可以進貨。");
        if (order.ReceivedAt != null) return BadRequest("此採購單已進貨。");

        // 決定入庫倉庫（未指定時落入預設倉庫或第一座啟用倉庫）
        Warehouse? targetWarehouse = null;
        if (warehouseId.HasValue)
        {
            targetWarehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == warehouseId.Value && w.IsActive);
            if (targetWarehouse == null) return BadRequest("指定的進貨入庫倉庫不存在或已停用。");
        }
        else
        {
            targetWarehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.IsDefault && w.IsActive)
                ?? await _context.Warehouses.FirstOrDefaultAsync(w => w.IsActive);
        }

        using var scope = new TransactionScope(
            TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted },
            TransactionScopeAsyncFlowOption.Enabled);

        try
        {
            var datePrefix = $"GR-{DateTime.UtcNow:yyyyMMdd}-";
            var countToday = await _context.GoodsReceipts.CountAsync(r => r.ReceiptNo.StartsWith(datePrefix));
            var receipt = new GoodsReceipt
            {
                ReceiptNo = $"{datePrefix}{(countToday + 1):D3}",
                PurchaseOrderId = order.Id,
                WarehouseId = targetWarehouse?.Id,
                ReceiptDate = DateTime.UtcNow,
                TotalAmount = order.TotalAmount,
                Memo = $"採購單 {order.OrderNo} 進貨{(targetWarehouse != null ? $" [入庫: {targetWarehouse.Name}]" : "")}",
            };

            foreach (var item in order.Items)
            {
                receipt.Items.Add(new GoodsReceiptItem { ProductId = item.ProductId, Quantity = item.Quantity, UnitPrice = item.UnitPrice });

                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    var before = product.StockQuantity;
                    product.StockQuantity += item.Quantity;
                    product.CostPrice = item.UnitPrice;

                    // 維護該倉庫之庫存映射
                    if (targetWarehouse != null)
                    {
                        var whStock = await _context.WarehouseStocks
                            .FirstOrDefaultAsync(ws => ws.WarehouseId == targetWarehouse.Id && ws.ProductId == product.Id);
                        if (whStock == null)
                        {
                            whStock = new WarehouseStock
                            {
                                WarehouseId = targetWarehouse.Id,
                                ProductId = product.Id,
                                Quantity = item.Quantity,
                                SafetyStock = 10,
                                UpdatedAt = DateTime.UtcNow
                            };
                            _context.WarehouseStocks.Add(whStock);
                        }
                        else
                        {
                            whStock.Quantity += item.Quantity;
                            whStock.UpdatedAt = DateTime.UtcNow;
                        }
                    }

                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = product.Id,
                        WarehouseId = targetWarehouse?.Id,
                        MovementType = StockMovementType.PurchaseIn,
                        Quantity = item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = product.StockQuantity,
                        ReferenceNo = receipt.ReceiptNo,
                        Remark = $"進貨單 {receipt.ReceiptNo} 入庫{(targetWarehouse != null ? $"至 {targetWarehouse.Name}" : "")}",
                    });
                }
            }

            order.ReceivedAt = DateTime.UtcNow;
            _context.GoodsReceipts.Add(receipt);
            await _context.SaveChangesAsync();

            // Post the payable: Dr 存貨 / Cr 應付帳款.
            var voucherOk = await _accounting.CreatePurchaseVoucherAsync(order.OrderNo, order.OrderDate, order.TotalAmount);
            if (!voucherOk) throw new InvalidOperationException("拋轉應付傳票失敗,已回滾進貨。");

            scope.Complete();
            return Ok(new { receipt.Id, receipt.ReceiptNo });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return StatusCode(500, "進貨時發生未預期錯誤,已回滾。");
        }
    }
}
