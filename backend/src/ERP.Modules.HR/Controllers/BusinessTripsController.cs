using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using ERP.Modules.HR.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class BusinessTripsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly ApprovalService _approvals;

    public BusinessTripsController(HRDbContext context, ApprovalService approvals)
    {
        _context = context;
        _approvals = approvals;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BusinessTrip>>> GetBusinessTrips()
    {
        return await _context.BusinessTrips
            .Include(t => t.Employee)
            .OrderByDescending(t => t.StartDate)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<BusinessTrip>>> GetEmployeeBusinessTrips(int employeeId)
    {
        return await _context.BusinessTrips
            .Where(t => t.EmployeeId == employeeId)
            .OrderByDescending(t => t.StartDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BusinessTrip>> GetBusinessTrip(int id)
    {
        var trip = await _context.BusinessTrips
            .Include(t => t.Employee)
            .Include(t => t.ExpenseClaims)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (trip == null)
            return NotFound();

        return trip;
    }

    [HttpPost]
    public async Task<ActionResult<BusinessTrip>> CreateBusinessTrip(BusinessTrip trip)
    {
        trip.CreatedAt = DateTime.UtcNow;
        trip.Status = "Pending";
        trip.Employee = null;
        trip.ExpenseClaims = new List<ExpenseClaim>();

        _context.BusinessTrips.Add(trip);
        await _context.SaveChangesAsync();

        // Kick off the approval workflow for this trip.
        await _approvals.CreateAsync("BusinessTrip", trip.Id);

        return CreatedAtAction(nameof(GetBusinessTrip), new { id = trip.Id }, trip);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusinessTrip(int id, BusinessTrip trip)
    {
        if (id != trip.Id)
            return BadRequest();

        var existing = await _context.BusinessTrips.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.Destination = trip.Destination;
        existing.Purpose = trip.Purpose;
        existing.StartDate = trip.StartDate;
        existing.EndDate = trip.EndDate;
        existing.EstimatedCost = trip.EstimatedCost;
        existing.Notes = trip.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateBusinessTripStatus(int id, [FromBody] string status)
    {
        var existing = await _context.BusinessTrips.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.Status = status;
        existing.UpdatedAt = DateTime.UtcNow;
        if (status == "Approved")
            existing.ApprovedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBusinessTrip(int id)
    {
        var trip = await _context.BusinessTrips.FindAsync(id);
        if (trip == null)
            return NotFound();

        _context.BusinessTrips.Remove(trip);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
