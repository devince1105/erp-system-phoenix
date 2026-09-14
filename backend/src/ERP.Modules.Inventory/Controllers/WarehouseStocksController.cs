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

public class UpdateSafetyStockRequest
{
    public int SafetyStock { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehouseStocksController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public WarehouseStocksController(InventoryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 跨倉庫庫存透視查詢（以商品維度展開各倉庫庫存）
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetStockMatrix(
        [FromQuery] string? keyword,
        [FromQuery] int? warehouseId,
        [FromQuery] bool lowStockOnly = false)
    {
        var warehouses = await _context.Warehouses
            .Where(w => w.IsActive)
            .OrderByDescending(w => w.IsDefault)
            .ThenBy(w => w.Code)
            .ToListAsync();

        var productsQuery = _context.Products.AsQueryable();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim().ToLower();
            productsQuery = productsQuery.Where(p => p.Sku.ToLower().Contains(k) || p.Name.ToLower().Contains(k));
        }

        var products = await productsQuery.OrderBy(p => p.Sku).ToListAsync();
        var productIds = products.Select(p => p.Id).ToList();

        var stocksQuery = _context.WarehouseStocks
            .Where(ws => productIds.Contains(ws.ProductId));

        if (warehouseId.HasValue)
        {
            stocksQuery = stocksQuery.Where(ws => ws.WarehouseId == warehouseId.Value);
        }

        var stocks = await stocksQuery.ToListAsync();
        var stockMap = stocks.ToLookup(s => s.ProductId);

        var result = new List<object>();

        foreach (var product in products)
        {
            var prodStocks = stockMap[product.Id].ToDictionary(s => s.WarehouseId);

            var breakdown = warehouses.Select(w =>
            {
                prodStocks.TryGetValue(w.Id, out var ws);
                var qty = ws?.Quantity ?? 0;
                var safety = ws?.SafetyStock ?? 0;
                return new
                {
                    WarehouseId = w.Id,
                    WarehouseCode = w.Code,
                    WarehouseName = w.Name,
                    IsDefault = w.IsDefault,
                    Quantity = qty,
                    SafetyStock = safety,
                    IsLowStock = safety > 0 && qty < safety
                };
            }).ToList();

            var totalStockInWarehouses = breakdown.Sum(b => b.Quantity);
            var hasAnyLowStock = breakdown.Any(b => b.IsLowStock);

            if (lowStockOnly && !hasAnyLowStock)
            {
                continue;
            }

            result.Add(new
            {
                ProductId = product.Id,
                ProductSku = product.Sku,
                ProductName = product.Name,
                SerialNumber = product.SerialNumber,
                CostPrice = product.CostPrice,
                UnitPrice = product.UnitPrice,
                ProductTotalStock = product.StockQuantity,
                WarehouseTotalStock = totalStockInWarehouses,
                HasLowStockAlert = hasAnyLowStock,
                Warehouses = breakdown
            });
        }

        return Ok(new
        {
            Warehouses = warehouses.Select(w => new { w.Id, w.Code, w.Name, w.IsDefault }),
            TotalProducts = result.Count,
            Items = result
        });
    }

    /// <summary>
    /// 設定指定倉庫中特定商品的安全庫存量
    /// </summary>
    [HttpPut("{warehouseId}/{productId}/safety-stock")]
    public async Task<IActionResult> UpdateSafetyStock(
        int warehouseId,
        int productId,
        [FromBody] UpdateSafetyStockRequest request)
    {
        if (request.SafetyStock < 0)
        {
            return BadRequest("安全庫存量不可為負數。");
        }

        var warehouse = await _context.Warehouses.FindAsync(warehouseId);
        if (warehouse == null) return NotFound("找不到指定倉庫。");

        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound("找不到指定商品。");

        var stock = await _context.WarehouseStocks
            .FirstOrDefaultAsync(ws => ws.WarehouseId == warehouseId && ws.ProductId == productId);

        if (stock == null)
        {
            stock = new WarehouseStock
            {
                WarehouseId = warehouseId,
                ProductId = productId,
                Quantity = 0,
                SafetyStock = request.SafetyStock,
                UpdatedAt = DateTime.UtcNow
            };
            _context.WarehouseStocks.Add(stock);
        }
        else
        {
            stock.SafetyStock = request.SafetyStock;
            stock.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { stock.WarehouseId, stock.ProductId, stock.SafetyStock });
    }
}
