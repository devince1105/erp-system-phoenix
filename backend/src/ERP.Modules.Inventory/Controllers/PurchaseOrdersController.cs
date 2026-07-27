using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public PurchaseOrdersController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetPurchaseOrders([FromQuery] string? projectCode = null)
    {
        var query = _context.PurchaseOrders
            .Include(po => po.Supplier)
            .Include(po => po.Items)
            .ThenInclude(i => i.Product)
            .AsQueryable();

        if (!string.IsNullOrEmpty(projectCode))
            query = query.Where(po => po.ProjectCode == projectCode);

        return await query.OrderByDescending(po => po.CreatedAt).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseOrder>> CreatePurchaseOrder(PurchaseOrder order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.OrderDate = DateTime.UtcNow;
        order.Status = OrderStatus.Draft;
        
        // Generate Order No
        var count = await _context.PurchaseOrders.CountAsync();
        order.OrderNo = $"PO-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D3}";
        
        // Calculate Total
        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        _context.PurchaseOrders.Add(order);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction("GetPurchaseOrder", new { id = order.Id }, order);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrder>> GetPurchaseOrder(int id)
    {
        var order = await _context.PurchaseOrders
            .Include(po => po.Supplier)
            .Include(po => po.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(po => po.Id == id);
            
        if (order == null) return NotFound();
        return order;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePurchaseOrder(int id, PurchaseOrder dto)
    {
        var order = await _context.PurchaseOrders
            .Include(po => po.Items)
            .FirstOrDefaultAsync(po => po.Id == id);
            
        if (order == null) return NotFound();
        if (order.Status != OrderStatus.Draft) return BadRequest("Only draft orders can be updated.");

        order.SupplierId = dto.SupplierId;
        order.Memo = dto.Memo;
        order.TotalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
        
        // Replace items
        _context.Set<PurchaseOrderItem>().RemoveRange(order.Items);
        order.Items = dto.Items.Select(i => new PurchaseOrderItem
        {
            ProductId = i.ProductId,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice
        }).ToList();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchaseOrder(int id)
    {
        var order = await _context.PurchaseOrders.FindAsync(id);
        if (order == null) return NotFound();
        if (order.Status != OrderStatus.Draft) return BadRequest("Only draft orders can be deleted.");

        _context.PurchaseOrders.Remove(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmPurchaseOrder(int id)
    {
        var order = await _context.PurchaseOrders
            .Include(po => po.Items)
            .FirstOrDefaultAsync(po => po.Id == id);
            
        if (order == null) return NotFound();

        if (order.Status != OrderStatus.Draft)
            return BadRequest("Only draft orders can be confirmed.");

        order.Status = OrderStatus.Confirmed;
        
        // Add inventory
        foreach (var item in order.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                product.StockQuantity += item.Quantity;
                
                // Update cost price (Moving Average or just latest price)
                // For simplicity, we just set it to latest price
                product.CostPrice = item.UnitPrice;
            }
        }

        await _context.SaveChangesAsync();
        
        return Ok(order);
    }
}
