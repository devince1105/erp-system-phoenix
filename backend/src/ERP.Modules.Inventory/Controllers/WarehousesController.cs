using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Modules.Inventory.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using ERP.Modules.Inventory.Infrastructure.Database;

namespace ERP.Modules.Inventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehousesController : ControllerBase
    {
        private readonly InventoryDbContext _context;

        public WarehousesController(InventoryDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Warehouse>>> GetWarehouses()
        {
            return await _context.Warehouses.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Warehouse>> GetWarehouse(int id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null) return NotFound();
            return warehouse;
        }

        [HttpPost]
        public async Task<ActionResult<Warehouse>> CreateWarehouse(Warehouse warehouse)
        {
            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWarehouse), new { id = warehouse.Id }, warehouse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWarehouse(int id, Warehouse warehouse)
        {
            if (id != warehouse.Id) return BadRequest();
            _context.Entry(warehouse).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWarehouse(int id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null) return NotFound();
            _context.Warehouses.Remove(warehouse);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/stocks")]
        public async Task<ActionResult<IEnumerable<InventoryStock>>> GetWarehouseStocks(int id)
        {
            var stocks = await _context.InventoryStocks
                .Include(s => s.Product)
                .Where(s => s.WarehouseId == id)
                .ToListAsync();
            return stocks;
        }

        [HttpPost("{id}/stocks")]
        public async Task<ActionResult<InventoryStock>> CreateWarehouseStock(int id, InventoryStock stock)
        {
            if (id != stock.WarehouseId) return BadRequest();
            _context.InventoryStocks.Add(stock);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWarehouseStocks), new { id = stock.WarehouseId }, stock);
        }
    }
}
