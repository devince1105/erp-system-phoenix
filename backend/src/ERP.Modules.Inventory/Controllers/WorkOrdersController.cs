using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkOrdersController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public WorkOrdersController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkOrder>>> GetWorkOrders()
    {
        return await _context.WorkOrders
            .Include(w => w.Product)
            .Include(w => w.Bom)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkOrder>> GetWorkOrder(int id)
    {
        var workOrder = await _context.WorkOrders
            .Include(w => w.Product)
            .Include(w => w.Bom)
                .ThenInclude(b => b.Items)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder == null) return NotFound();
        return workOrder;
    }

    [HttpPost]
    public async Task<ActionResult<WorkOrder>> CreateWorkOrder(WorkOrder workOrder)
    {
        workOrder.CreatedAt = DateTime.UtcNow;
        workOrder.UpdatedAt = DateTime.UtcNow;
        
        if(string.IsNullOrEmpty(workOrder.OrderNo)) {
            workOrder.OrderNo = $"WO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0,4)}";
        }

        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetWorkOrder), new { id = workOrder.Id }, workOrder);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteWorkOrder(int id)
    {
        var workOrder = await _context.WorkOrders
            .Include(w => w.Bom)
                .ThenInclude(b => b.Items)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder == null) return NotFound("WorkOrder not found");
        if (workOrder.Status == WorkOrderStatus.Completed) return BadRequest("Already completed");

        // Use the first warehouse as a default for testing purposes
        var defaultWarehouse = await _context.Warehouses.FirstOrDefaultAsync();
        if (defaultWarehouse == null) return BadRequest("No warehouse available");

        // Backflush materials
        foreach (var bomItem in workOrder.Bom!.Items)
        {
            var requiredQty = bomItem.Quantity * workOrder.PlannedQuantity;
            
            var stock = await _context.InventoryStocks
                .FirstOrDefaultAsync(s => s.ProductId == bomItem.ComponentProductId && s.WarehouseId == defaultWarehouse.Id);
                
            if (stock == null || stock.Quantity < requiredQty)
            {
                return BadRequest($"Insufficient stock for component ID: {bomItem.ComponentProductId}. Required: {requiredQty}");
            }
            
            stock.Quantity -= (int)requiredQty;
        }

        // Add finished goods to stock
        var finishedStock = await _context.InventoryStocks
            .FirstOrDefaultAsync(s => s.ProductId == workOrder.ProductId && s.WarehouseId == defaultWarehouse.Id);
            
        if (finishedStock == null)
        {
            finishedStock = new InventoryStock {
                ProductId = workOrder.ProductId,
                WarehouseId = defaultWarehouse.Id,
                Quantity = workOrder.PlannedQuantity,
                SafetyStock = 0
            };
            _context.InventoryStocks.Add(finishedStock);
        }
        else
        {
            finishedStock.Quantity += workOrder.PlannedQuantity;
        }

        workOrder.CompletedQuantity = workOrder.PlannedQuantity;
        workOrder.Status = WorkOrderStatus.Completed;
        workOrder.EndDate = DateTime.UtcNow;
        workOrder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(workOrder);
    }
}
