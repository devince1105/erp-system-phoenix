using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public WarehousesController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Warehouse>>> GetAll([FromQuery] bool activeOnly = false)
    {
        var query = _context.Warehouses.AsQueryable();
        if (activeOnly)
        {
            query = query.Where(w => w.IsActive);
        }

        return await query
            .OrderByDescending(w => w.IsDefault)
            .ThenBy(w => w.Code)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Warehouse>> GetById(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();
        return warehouse;
    }

    [HttpPost]
    public async Task<ActionResult<Warehouse>> Create([FromBody] Warehouse warehouse)
    {
        if (string.IsNullOrWhiteSpace(warehouse.Code) || string.IsNullOrWhiteSpace(warehouse.Name))
        {
            return BadRequest("倉庫代碼與名稱為必填項目。");
        }

        warehouse.Code = warehouse.Code.Trim().ToUpperInvariant();
        if (await _context.Warehouses.AnyAsync(w => w.Code == warehouse.Code))
        {
            return BadRequest($"倉庫代碼 [{warehouse.Code}] 已存在。");
        }

        if (warehouse.IsDefault)
        {
            var otherDefaults = await _context.Warehouses.Where(w => w.IsDefault).ToListAsync();
            foreach (var d in otherDefaults)
            {
                d.IsDefault = false;
            }
        }
        else if (!await _context.Warehouses.AnyAsync())
        {
            warehouse.IsDefault = true; // 第一座倉庫自動作為預設倉
        }

        warehouse.CreatedAt = DateTime.UtcNow;
        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Warehouse input)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        input.Code = input.Code.Trim().ToUpperInvariant();
        if (warehouse.Code != input.Code && await _context.Warehouses.AnyAsync(w => w.Code == input.Code && w.Id != id))
        {
            return BadRequest($"倉庫代碼 [{input.Code}] 已被其他倉庫使用。");
        }

        if (warehouse.IsDefault && !input.IsDefault)
        {
            // 若要取消預設倉，必須確認系統內有其他預設倉
            var hasOtherDefault = await _context.Warehouses.AnyAsync(w => w.Id != id && w.IsDefault);
            if (!hasOtherDefault)
            {
                return BadRequest("系統必須至少保有一座預設倉庫，無法直接取消預設。請先指定其他倉庫為預設。");
            }
        }

        if (input.IsDefault && !warehouse.IsDefault)
        {
            var otherDefaults = await _context.Warehouses.Where(w => w.IsDefault && w.Id != id).ToListAsync();
            foreach (var d in otherDefaults)
            {
                d.IsDefault = false;
            }
        }

        warehouse.Code = input.Code;
        warehouse.Name = input.Name;
        warehouse.Address = input.Address;
        warehouse.ContactPerson = input.ContactPerson;
        warehouse.Phone = input.Phone;
        warehouse.IsDefault = input.IsDefault;
        warehouse.IsActive = input.IsActive;
        warehouse.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        if (warehouse.IsDefault)
        {
            return BadRequest("預設倉庫無法刪除。如需停用請取消啟用狀態或將其他倉庫設為預設。");
        }

        var hasStock = await _context.WarehouseStocks.AnyAsync(ws => ws.WarehouseId == id && ws.Quantity > 0);
        if (hasStock)
        {
            return BadRequest("此倉庫尚有在庫商品庫存，無法刪除。請先將庫存調撥出庫。");
        }

        var hasTransfers = await _context.StockTransfers.AnyAsync(st => st.FromWarehouseId == id || st.ToWarehouseId == id);
        if (hasTransfers)
        {
            return BadRequest("此倉庫已存在關聯之調撥單紀錄，無法刪除。建議將倉庫狀態改為「停用」。");
        }

        var hasMovements = await _context.StockMovements.AnyAsync(sm => sm.WarehouseId == id);
        if (hasMovements)
        {
            return BadRequest("此倉庫已有庫存異動紀錄，為維護審計軌跡無法刪除。建議將狀態改為「停用」。");
        }

        // 清理空庫存記錄
        var emptyStocks = await _context.WarehouseStocks.Where(ws => ws.WarehouseId == id).ToListAsync();
        _context.WarehouseStocks.RemoveRange(emptyStocks);

        _context.Warehouses.Remove(warehouse);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>取得指定倉庫內各商品之庫存量與安全庫存</summary>
    [HttpGet("{id}/stocks")]
    public async Task<IActionResult> GetStocks(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        var stocks = await _context.WarehouseStocks
            .Include(ws => ws.Product)
            .Where(ws => ws.WarehouseId == id)
            .OrderBy(ws => ws.Product!.Sku)
            .Select(ws => new
            {
                ws.Id,
                ws.WarehouseId,
                WarehouseCode = warehouse.Code,
                WarehouseName = warehouse.Name,
                ws.ProductId,
                ProductSku = ws.Product!.Sku,
                ProductName = ws.Product!.Name,
                ws.Quantity,
                ws.SafetyStock,
                IsLowStock = ws.SafetyStock > 0 && ws.Quantity < ws.SafetyStock,
                ws.UpdatedAt
            })
            .ToListAsync();

        return Ok(stocks);
    }
}
