using ERP.Modules.HR.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERP.Modules.HR.Controllers;

/// <summary>
/// Approval-workflow configuration (簽核流程設定). Admin-only: editing a flow changes
/// how future documents of that form type are routed for signing.
/// </summary>
[ApiController]
[Route("api/hr/[controller]")]
[Authorize(Roles = "Admin")]
public class WorkflowsController : ControllerBase
{
    private readonly ApprovalService _approvals;

    public WorkflowsController(ApprovalService approvals) => _approvals = approvals;

    /// <summary>All configurable form types with their steps, plus the selectable roles.</summary>
    [HttpGet]
    public async Task<ActionResult<WorkflowOptionsDto>> Get() => await _approvals.GetWorkflowsAsync();

    /// <summary>Steps of a single form type (built-in or a custom template "Tpl{id}") + selectable roles.</summary>
    [HttpGet("{formType}")]
    public async Task<IActionResult> GetOne(string formType)
    {
        var workflow = await _approvals.GetWorkflowAsync(formType);
        if (workflow is null) return NotFound();
        return Ok(new { workflow, availableRoles = await _approvals.BuildRoleOptionsAsync() });
    }

    public record SaveWorkflowRequest(List<WorkflowStepDto> Steps);

    /// <summary>Replace the steps for one form type.</summary>
    [HttpPut("{formType}")]
    public async Task<IActionResult> Save(string formType, [FromBody] SaveWorkflowRequest request)
    {
        var steps = request.Steps ?? new List<WorkflowStepDto>();

        var roleError = await _approvals.ValidateRolesAsync(steps.Select(s => s.Role));
        if (roleError is not null)
            return BadRequest(new { message = roleError });
        if (steps.Any(s => string.IsNullOrWhiteSpace(s.Label)))
            return BadRequest(new { message = "每個關卡都需要顯示名稱。" });

        var ok = await _approvals.SaveWorkflowAsync(formType, steps);
        return ok ? NoContent() : StatusCode(StatusCodes.Status404NotFound, new { message = "未知的表單類型。" });
    }
}
