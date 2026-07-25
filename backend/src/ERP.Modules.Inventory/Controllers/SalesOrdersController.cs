using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using ERP.Shared.Interfaces.Accounting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesOrdersController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IAccountingIntegrationService _accounting;

    public SalesOrdersController(InventoryDbContext context, IAccountingIntegrationService accounting)
    {
        _context = context;
        _accounting = accounting;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesOrder>>> GetSalesOrders()
    {
        return await _context.SalesOrders
            .Include(so => so.Customer)
            .Include(so => so.Items)
            .ThenInclude(i => i.Product)
            .OrderByDescending(so => so.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOrder>> GetSalesOrder(int id)
    {
        var order = await _context.SalesOrders
            .Include(so => so.Customer)
            .Include(so => so.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(so => so.Id == id);
            
        if (order == null)
            return NotFound();
            
        return order;
    }

    [HttpPost]
    public async Task<ActionResult<SalesOrder>> CreateSalesOrder(SalesOrder order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.OrderDate = DateTime.UtcNow;
        order.Status = OrderStatus.Draft;
        
        // Generate Order No
        var count = await _context.SalesOrders.CountAsync();
        order.OrderNo = $"SO-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D3}";
        
        // Calculate Total
        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        _context.SalesOrders.Add(order);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetSalesOrder), new { id = order.Id }, order);
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmSalesOrder(int id)
    {
        var order = await _context.SalesOrders
            .Include(so => so.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(so => so.Id == id);
            
        if (order == null)
            return NotFound();

        if (order.Status != OrderStatus.Draft)
            return BadRequest("Only draft orders can be confirmed.");

        order.Status = OrderStatus.Confirmed;
        
        // Deduct inventory and calculate total cost
        decimal totalCost = 0;
        foreach (var item in order.Items)
        {
            var product = item.Product;
            if (product != null)
            {
                product.StockQuantity -= item.Quantity;
                totalCost += item.Quantity * product.CostPrice;
            }
        }

        await _context.SaveChangesAsync();
        
        // Trigger Auto-Voucher Integration
        await _accounting.CreateSalesVoucherAsync(order.OrderNo, order.OrderDate, order.TotalAmount, totalCost);
        
        return Ok(order);
    }
}
