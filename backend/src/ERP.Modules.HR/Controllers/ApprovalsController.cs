using System.Security.Claims;
using ERP.Modules.HR.Models;
using ERP.Modules.HR.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize]
public class ApprovalsController : ControllerBase
{
    private readonly ApprovalService _approvals;

    public ApprovalsController(ApprovalService approvals) => _approvals = approvals;

    /// <summary>Get the approval instance (steps + current position) for a document.</summary>
    [HttpGet("{formType}/{documentId:int}")]
    public async Task<ActionResult<ApprovalInstance>> Get(string formType, int documentId)
    {
        var instance = await _approvals.GetAsync(formType, documentId);
        return instance is null ? NotFound() : instance;
    }

    public record DecideDto(bool Approve, string? Comment);

    /// <summary>Approve or reject the current step of an approval instance.</summary>
    [HttpPost("{id:int}/decide")]
    public async Task<ActionResult<ApprovalInstance>> Decide(int id, [FromBody] DecideDto dto)
    {
        var instance = await _approvals.DecideAsync(id, dto.Approve, CurrentUserId(), dto.Comment);
        return instance is null ? NotFound() : instance;
    }

    private int CurrentUserId()
    {
        var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value
                  ?? User.FindFirst("nameid")?.Value;
        return int.TryParse(raw, out var id) ? id : 0;
    }
}
