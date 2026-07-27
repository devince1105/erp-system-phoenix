using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BomsController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public BomsController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bom>>> GetBoms()
    {
        return await _context.Boms
            .Include(b => b.Product)
            .Include(b => b.Items)
                .ThenInclude(i => i.ComponentProduct)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Bom>> GetBom(int id)
    {
        var bom = await _context.Boms
            .Include(b => b.Product)
            .Include(b => b.Items)
                .ThenInclude(i => i.ComponentProduct)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bom == null) return NotFound();
        return bom;
    }

    [HttpPost]
    public async Task<ActionResult<Bom>> CreateBom(Bom bom)
    {
        bom.CreatedAt = DateTime.UtcNow;
        bom.UpdatedAt = DateTime.UtcNow;
        _context.Boms.Add(bom);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBom), new { id = bom.Id }, bom);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBom(int id, Bom bom)
    {
        if (id != bom.Id) return BadRequest();
        
        bom.UpdatedAt = DateTime.UtcNow;
        _context.Entry(bom).State = EntityState.Modified;

        foreach(var item in bom.Items) {
            if(item.Id == 0) _context.Entry(item).State = EntityState.Added;
            else _context.Entry(item).State = EntityState.Modified;
        }

        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) {
            if (!_context.Boms.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }
}
