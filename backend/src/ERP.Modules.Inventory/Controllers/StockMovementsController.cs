using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
[Authorize]
public class StockMovementsController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public StockMovementsController(InventoryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Query stock movement ledger, optionally filtered by product or movement type.
    /// Supports pagination for large datasets.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<object>> GetStockMovements(
        [FromQuery] int? productId = null,
        [FromQuery] StockMovementType? type = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize > 200) pageSize = 200;

        var query = _context.StockMovements
            .Include(m => m.Product)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(m => m.ProductId == productId.Value);

        if (type.HasValue)
            query = query.Where(m => m.MovementType == type.Value);

        if (from.HasValue)
            query = query.Where(m => m.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(m => m.CreatedAt <= to.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                m.Id,
                m.ProductId,
                ProductName = m.Product != null ? m.Product.Name : null,
                MovementType = m.MovementType.ToString(),
                m.Quantity,
                m.QuantityBefore,
                m.QuantityAfter,
                m.ReferenceNo,
                m.Remark,
                m.CreatedAt
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    /// <summary>
    /// Manual adjustment entry — for admin corrections only.
    /// Creates an append-only ledger record.
    /// </summary>
    [HttpPost("adjust")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ManualAdjust([FromBody] ManualAdjustRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound($"Product {request.ProductId} not found.");

        var qtyBefore = product.StockQuantity;
        product.StockQuantity += request.Delta; // Delta can be positive or negative

        if (product.StockQuantity < 0)
            return BadRequest("Adjustment would result in negative stock. Operation rejected.");

        var movement = new StockMovement
        {
            ProductId      = product.Id,
            MovementType   = StockMovementType.ManualAdjustment,
            Quantity       = request.Delta,
            QuantityBefore = qtyBefore,
            QuantityAfter  = product.StockQuantity,
            ReferenceNo    = "MANUAL",
            Remark         = request.Remark ?? "人工調整"
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return Ok(new { message = "庫存調整完成", qtyBefore, qtyAfter = product.StockQuantity });
    }
}

public record ManualAdjustRequest(int ProductId, int Delta, string? Remark);
