using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartnersController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public PartnersController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Partner>>> GetPartners([FromQuery] PartnerType? type = null)
    {
        var query = _context.Partners.AsQueryable();
        if (type.HasValue)
        {
            query = query.Where(p => p.Type == type.Value);
        }
        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Partner>> GetPartner(int id)
    {
        var partner = await _context.Partners.FindAsync(id);
        if (partner == null)
            return NotFound();
            
        return partner;
    }

    [HttpPost]
    public async Task<ActionResult<Partner>> CreatePartner(Partner partner)
    {
        partner.CreatedAt = DateTime.UtcNow;
        _context.Partners.Add(partner);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetPartner), new { id = partner.Id }, partner);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePartner(int id, Partner partner)
    {
        if (id != partner.Id)
            return BadRequest();

        var existing = await _context.Partners.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.Name = partner.Name;
        existing.Type = partner.Type;
        existing.TaxId = partner.TaxId;
        existing.ContactPerson = partner.ContactPerson;
        existing.Phone = partner.Phone;
        existing.Address = partner.Address;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
