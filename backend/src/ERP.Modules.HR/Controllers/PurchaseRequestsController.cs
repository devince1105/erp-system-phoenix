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
public class PurchaseRequestsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly ApprovalService _approvals;

    public PurchaseRequestsController(HRDbContext context, ApprovalService approvals)
    {
        _context = context;
        _approvals = approvals;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseRequest>>> GetPurchaseRequests()
    {
        return await _context.PurchaseRequests
            .Include(p => p.Employee)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<PurchaseRequest>>> GetEmployeePurchaseRequests(int employeeId)
    {
        return await _context.PurchaseRequests
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseRequest>> GetPurchaseRequest(int id)
    {
        var request = await _context.PurchaseRequests
            .Include(p => p.Employee)
            .Include(p => p.ExpenseClaims)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (request == null)
            return NotFound();

        return request;
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseRequest>> CreatePurchaseRequest(PurchaseRequest request)
    {
        request.CreatedAt = DateTime.UtcNow;
        request.Status = "Pending";
        request.Employee = null;
        request.ExpenseClaims = new List<ExpenseClaim>();

        _context.PurchaseRequests.Add(request);
        await _context.SaveChangesAsync();

        // Kick off the approval workflow for this purchase request.
        await _approvals.CreateAsync("Purchase", request.Id);

        return CreatedAtAction(nameof(GetPurchaseRequest), new { id = request.Id }, request);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePurchaseRequest(int id, PurchaseRequest request)
    {
        if (id != request.Id)
            return BadRequest();

        var existing = await _context.PurchaseRequests.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.ItemName = request.ItemName;
        existing.Category = request.Category;
        existing.Quantity = request.Quantity;
        existing.EstimatedCost = request.EstimatedCost;
        existing.Purpose = request.Purpose;
        existing.Notes = request.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchaseRequest(int id)
    {
        var request = await _context.PurchaseRequests.FindAsync(id);
        if (request == null)
            return NotFound();

        _context.PurchaseRequests.Remove(request);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
