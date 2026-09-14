using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.Modules.Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Infrastructure.Database;

public static class MultiWarehouseSeeder
{
    public static async Task SeedAsync(InventoryDbContext context)
    {
        // 1. 確保 3 座預設倉庫存在
        var defaultWarehouse = await context.Warehouses.FirstOrDefaultAsync(w => w.Code == "WH-TPE");
        if (defaultWarehouse == null)
        {
            defaultWarehouse = new Warehouse
            {
                Code = "WH-TPE",
                Name = "台北總倉",
                Address = "台北市內湖區行愛路 88 號",
                ContactPerson = "林建宏",
                Phone = "02-2790-1234",
                IsDefault = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Warehouses.Add(defaultWarehouse);
        }

        if (!await context.Warehouses.AnyAsync(w => w.Code == "WH-TXG"))
        {
            context.Warehouses.Add(new Warehouse
            {
                Code = "WH-TXG",
                Name = "台中物流中心",
                Address = "台中市西屯區工業區一路 50 號",
                ContactPerson = "陳美惠",
                Phone = "04-2359-5678",
                IsDefault = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!await context.Warehouses.AnyAsync(w => w.Code == "WH-KHH"))
        {
            context.Warehouses.Add(new Warehouse
            {
                Code = "WH-KHH",
                Name = "高雄營業所",
                Address = "高雄市前鎮區成功二路 25 號",
                ContactPerson = "黃志遠",
                Phone = "07-536-8899",
                IsDefault = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();

        // 2. 將既有商品的庫存遷移至預設倉庫 (台北總倉)
        var products = await context.Products.ToListAsync();
        var existingStocks = await context.WarehouseStocks
            .Where(ws => ws.WarehouseId == defaultWarehouse.Id)
            .ToListAsync();
        var existingProductIds = existingStocks.Select(s => s.ProductId).ToHashSet();

        bool hasNewStock = false;
        foreach (var product in products)
        {
            if (!existingProductIds.Contains(product.Id))
            {
                context.WarehouseStocks.Add(new WarehouseStock
                {
                    WarehouseId = defaultWarehouse.Id,
                    ProductId = product.Id,
                    Quantity = product.StockQuantity,
                    SafetyStock = 10,
                    UpdatedAt = DateTime.UtcNow
                });
                hasNewStock = true;
            }
        }

        if (hasNewStock)
        {
            await context.SaveChangesAsync();
        }
    }
}
