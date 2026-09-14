using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

public class CreateStockTransferItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateStockTransferDto
{
    public int FromWarehouseId { get; set; }
    public int ToWarehouseId { get; set; }
    public DateTime? TransferDate { get; set; }
    public string? Remark { get; set; }
    public List<CreateStockTransferItemDto> Items { get; set; } = new();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockTransfersController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public StockTransfersController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockTransfer>>> GetAll()
    {
        return await _context.StockTransfers
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Items).ThenInclude(i => i.Product)
            .OrderByDescending(t => t.TransferDate)
            .ThenByDescending(t => t.Id)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StockTransfer>> GetById(int id)
    {
        var transfer = await _context.StockTransfers
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer == null) return NotFound();
        return transfer;
    }

    [HttpPost]
    public async Task<ActionResult<StockTransfer>> Create([FromBody] CreateStockTransferDto dto)
    {
        if (dto.FromWarehouseId == dto.ToWarehouseId)
        {
            return BadRequest("調撥來源倉庫與目的倉庫不可相同。");
        }

        var fromWh = await _context.Warehouses.FindAsync(dto.FromWarehouseId);
        if (fromWh == null || !fromWh.IsActive)
        {
            return BadRequest("來源倉庫不存在或已停用。");
        }

        var toWh = await _context.Warehouses.FindAsync(dto.ToWarehouseId);
        if (toWh == null || !toWh.IsActive)
        {
            return BadRequest("目的倉庫不存在或已停用。");
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest("調撥單至少需包含一項調撥品項。");
        }

        foreach (var item in dto.Items)
        {
            if (item.Quantity <= 0)
            {
                return BadRequest("調撥數量必須大於 0。");
            }
        }

        var datePrefix = $"TR-{DateTime.UtcNow:yyyyMMdd}-";
        var countToday = await _context.StockTransfers.CountAsync(t => t.TransferNo.StartsWith(datePrefix));

        var transfer = new StockTransfer
        {
            TransferNo = $"{datePrefix}{(countToday + 1):D3}",
            FromWarehouseId = dto.FromWarehouseId,
            ToWarehouseId = dto.ToWarehouseId,
            TransferDate = dto.TransferDate ?? DateTime.UtcNow,
            Status = StockTransferStatus.Draft,
            Remark = dto.Remark,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in dto.Items)
        {
            transfer.Items.Add(new StockTransferItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity
            });
        }

        _context.StockTransfers.Add(transfer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = transfer.Id }, transfer);
    }

    /// <summary>
    /// 執行調撥：原子交易扣減來源倉庫存、增加目的倉庫存、寫入調撥出入庫歷程
    /// </summary>
    [HttpPost("{id}/execute")]
    public async Task<IActionResult> ExecuteTransfer(int id)
    {
        var transfer = await _context.StockTransfers
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer == null) return NotFound();
        if (transfer.Status != StockTransferStatus.Draft)
        {
            return BadRequest("只有草稿狀態的調撥單可以執行調撥。");
        }

        using var scope = new TransactionScope(
            TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted },
            TransactionScopeAsyncFlowOption.Enabled);

        try
        {
            foreach (var item in transfer.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    return BadRequest($"調撥商品 (ID: {item.ProductId}) 不存在。");
                }

                // 檢查來源倉庫存
                var fromStock = await _context.WarehouseStocks
                    .FirstOrDefaultAsync(ws => ws.WarehouseId == transfer.FromWarehouseId && ws.ProductId == item.ProductId);

                var currentQty = fromStock?.Quantity ?? 0;
                if (currentQty < item.Quantity)
                {
                    return BadRequest($"來源倉庫 [{transfer.FromWarehouse?.Name}] 之商品 [{product.Name}] 庫存不足！現有 {currentQty}，需求 {item.Quantity}。");
                }

                // 扣減來源倉庫存
                fromStock!.Quantity -= item.Quantity;
                fromStock.UpdatedAt = DateTime.UtcNow;

                // 增加目的倉庫存
                var toStock = await _context.WarehouseStocks
                    .FirstOrDefaultAsync(ws => ws.WarehouseId == transfer.ToWarehouseId && ws.ProductId == item.ProductId);

                if (toStock == null)
                {
                    toStock = new WarehouseStock
                    {
                        WarehouseId = transfer.ToWarehouseId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        SafetyStock = 0,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.WarehouseStocks.Add(toStock);
                }
                else
                {
                    toStock.Quantity += item.Quantity;
                    toStock.UpdatedAt = DateTime.UtcNow;
                }

                // 寫入調撥出庫紀錄 (TransferOut)
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = item.ProductId,
                    WarehouseId = transfer.FromWarehouseId,
                    MovementType = StockMovementType.TransferOut,
                    Quantity = -item.Quantity,
                    QuantityBefore = currentQty,
                    QuantityAfter = fromStock.Quantity,
                    ReferenceNo = transfer.TransferNo,
                    Remark = $"調撥出庫至 [{transfer.ToWarehouse?.Name}]",
                    CreatedAt = DateTime.UtcNow
                });

                // 寫入調撥入庫紀錄 (TransferIn)
                var toQtyBefore = toStock.Quantity - item.Quantity;
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = item.ProductId,
                    WarehouseId = transfer.ToWarehouseId,
                    MovementType = StockMovementType.TransferIn,
                    Quantity = item.Quantity,
                    QuantityBefore = toQtyBefore,
                    QuantityAfter = toStock.Quantity,
                    ReferenceNo = transfer.TransferNo,
                    Remark = $"由 [{transfer.FromWarehouse?.Name}] 調撥入庫",
                    CreatedAt = DateTime.UtcNow
                });
            }

            transfer.Status = StockTransferStatus.Completed;
            transfer.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            scope.Complete();

            return Ok(new { transfer.Id, transfer.TransferNo, Status = "Completed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"執行調撥時發生錯誤，已自動復原：{ex.Message}");
        }
    }

    /// <summary>
    /// 取消草稿狀態調撥單
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelTransfer(int id)
    {
        var transfer = await _context.StockTransfers.FindAsync(id);
        if (transfer == null) return NotFound();
        if (transfer.Status != StockTransferStatus.Draft)
        {
            return BadRequest("只有草稿狀態的調撥單可以取消。");
        }

        transfer.Status = StockTransferStatus.Cancelled;
        await _context.SaveChangesAsync();
        return Ok(new { transfer.Id, transfer.TransferNo, Status = "Cancelled" });
    }
}
