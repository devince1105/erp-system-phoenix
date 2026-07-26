using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Modules.CRM.Data;
using ERP.Modules.CRM.Models;

namespace ERP.Modules.CRM.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
public class OpportunitiesController : ControllerBase
{
    private readonly CRMDbContext _context;

    public OpportunitiesController(CRMDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesOpportunity>>> GetOpportunities()
    {
        return await _context.Opportunities
            .Include(o => o.Customer)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOpportunity>> GetOpportunity(int id)
    {
        var opportunity = await _context.Opportunities
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (opportunity == null)
        {
            return NotFound();
        }

        return opportunity;
    }

    [HttpPost]
    public async Task<ActionResult<SalesOpportunity>> PostOpportunity(SalesOpportunity opportunity)
    {
        opportunity.CreatedAt = DateTime.UtcNow;
        _context.Opportunities.Add(opportunity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOpportunity), new { id = opportunity.Id }, opportunity);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutOpportunity(int id, SalesOpportunity opportunity)
    {
        if (id != opportunity.Id)
        {
            return BadRequest();
        }

        _context.Entry(opportunity).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!OpportunityExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }
    
    // For Kanban board drag and drop
    [HttpPatch("{id}/stage")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] string stage)
    {
        var opportunity = await _context.Opportunities.FindAsync(id);
        if (opportunity == null)
        {
            return NotFound();
        }

        opportunity.Stage = stage;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOpportunity(int id)
    {
        var opportunity = await _context.Opportunities.FindAsync(id);
        if (opportunity == null)
        {
            return NotFound();
        }

        _context.Opportunities.Remove(opportunity);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool OpportunityExists(int id)
    {
        return _context.Opportunities.Any(e => e.Id == id);
    }
}
