using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Services;

/// <summary>
/// Approval-workflow definitions per form type. Mirrors the flows configured on
/// the /settings/workflows screen. (Later these can be persisted and edited.)
/// </summary>
public static class WorkflowDefinitions
{
    public static readonly IReadOnlyDictionary<string, (string Role, string Label)[]> ForForm =
        new Dictionary<string, (string, string)[]>
        {
            ["BusinessTrip"] = new[] { ("DirectSupervisor", "直屬主管"), ("DepartmentManager", "部門主管") },
            ["ExpenseClaim"] = new[] { ("DepartmentManager", "部門主管"), ("Finance", "財務部") },
            ["Leave"] = new[] { ("DirectSupervisor", "直屬主管"), ("DepartmentManager", "部門主管") },
            ["Overtime"] = new[] { ("DirectSupervisor", "直屬主管"), ("DepartmentManager", "部門主管") },
            ["Purchase"] = new[] { ("DirectSupervisor", "直屬主管"), ("Finance", "財務部") },
        };

    public static (string Role, string Label)[] For(string formType) =>
        ForForm.TryGetValue(formType, out var steps) ? steps : Array.Empty<(string, string)>();
}

/// <summary>
/// Creates and advances approval instances (簽核實例). Keeps the underlying
/// document's Status in sync with the instance outcome.
/// </summary>
public class ApprovalService
{
    private readonly HRDbContext _db;

    public ApprovalService(HRDbContext db) => _db = db;

    /// <summary>Create the instance and its steps for a submitted document.</summary>
    public async Task<ApprovalInstance> CreateAsync(string formType, int documentId)
    {
        var def = WorkflowDefinitions.For(formType);
        var instance = new ApprovalInstance
        {
            FormType = formType,
            DocumentId = documentId,
            CurrentStepOrder = 1,
            Status = def.Length == 0 ? "Approved" : "Pending",
            CompletedAt = def.Length == 0 ? DateTime.UtcNow : null,
        };
        var order = 1;
        foreach (var (role, label) in def)
            instance.Steps.Add(new ApprovalStep { StepOrder = order++, Role = role, Label = label, Status = "Pending" });

        _db.ApprovalInstances.Add(instance);
        await _db.SaveChangesAsync();
        return instance;
    }

    public Task<ApprovalInstance?> GetAsync(string formType, int documentId) =>
        _db.ApprovalInstances
            .Include(i => i.Steps)
            .FirstOrDefaultAsync(i => i.FormType == formType && i.DocumentId == documentId);

    /// <summary>
    /// Create approval instances for still-pending documents that were submitted
    /// before the engine existed (or before their form type was wired). Idempotent:
    /// documents that already have an instance are skipped. Returns the count created.
    /// </summary>
    public async Task<int> BackfillAsync(string formType)
    {
        List<int> pendingIds = formType switch
        {
            "Leave" => await _db.LeaveRequests.Where(l => l.Status == "Pending").Select(l => l.Id).ToListAsync(),
            "Overtime" => await _db.OvertimeRequests.Where(o => o.Status == "Pending").Select(o => o.Id).ToListAsync(),
            _ => new List<int>(),
        };
        if (pendingIds.Count == 0) return 0;

        var existing = await _db.ApprovalInstances
            .Where(i => i.FormType == formType && pendingIds.Contains(i.DocumentId))
            .Select(i => i.DocumentId)
            .ToListAsync();
        var missing = pendingIds.Except(existing).ToList();

        var created = 0;
        foreach (var id in missing)
        {
            await CreateAsync(formType, id);
            created++;
        }
        return created;
    }

    // ----- Approver resolution (strict role control) -------------------------

    /// <summary>Employee id of the document's applicant (for approver resolution).</summary>
    private async Task<int?> ApplicantEmployeeIdAsync(string formType, int documentId) => formType switch
    {
        "Leave" => (await _db.LeaveRequests.FindAsync(documentId))?.EmployeeId,
        "Overtime" => (await _db.OvertimeRequests.FindAsync(documentId))?.EmployeeId,
        "BusinessTrip" => (await _db.BusinessTrips.FindAsync(documentId))?.EmployeeId,
        "ExpenseClaim" => (await _db.ExpenseClaims.FindAsync(documentId))?.EmployeeId,
        _ => null,
    };

    private Task<bool> IsFinanceManagerAsync(int? employeeId) =>
        employeeId is null
            ? Task.FromResult(false)
            : _db.Departments.AnyAsync(d =>
                (d.Name.Contains("會計") || d.Name.Contains("財務")) && d.ManagerId == employeeId);

    /// <summary>
    /// Whether the given user (identified by their linked employee id + roles) is the
    /// authorized approver of the instance's current step. Admin is a super-approver.
    /// </summary>
    public async Task<bool> CanDecideAsync(ApprovalInstance instance, int? employeeId, ISet<string> roles)
    {
        if (roles.Contains("Admin")) return true;
        if (instance.Status != "Pending") return false;

        var step = instance.Steps.FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder && s.Status == "Pending");
        if (step is null) return false;

        if (step.Role == "Finance")
            return roles.Contains("Accountant") || await IsFinanceManagerAsync(employeeId);

        if (step.Role is "DepartmentManager" or "DirectSupervisor")
        {
            if (employeeId is null) return false;
            var applicantEmpId = await ApplicantEmployeeIdAsync(instance.FormType, instance.DocumentId);
            if (applicantEmpId is null) return false;
            var applicant = await _db.Employees.FindAsync(applicantEmpId.Value);
            if (applicant?.DepartmentId is null) return false;
            var dept = await _db.Departments.FindAsync(applicant.DepartmentId.Value);
            return dept?.ManagerId == employeeId;
        }

        return false; // unknown role → only Admin may act
    }

    /// <summary>Load an instance and evaluate <see cref="CanDecideAsync"/> for the user.</summary>
    public async Task<bool> CanDecideInstanceAsync(int instanceId, int? employeeId, ISet<string> roles)
    {
        var instance = await _db.ApprovalInstances.Include(i => i.Steps).FirstOrDefaultAsync(i => i.Id == instanceId);
        return instance is not null && await CanDecideAsync(instance, employeeId, roles);
    }

    /// <summary>All Pending instances the user may currently decide (Admin sees all).</summary>
    public async Task<List<ApprovalInstance>> GetPendingForUserAsync(int? employeeId, ISet<string> roles)
    {
        var pending = await _db.ApprovalInstances
            .Include(i => i.Steps)
            .Where(i => i.Status == "Pending")
            .ToListAsync();

        if (roles.Contains("Admin")) return pending;

        var mine = new List<ApprovalInstance>();
        foreach (var instance in pending)
            if (await CanDecideAsync(instance, employeeId, roles))
                mine.Add(instance);
        return mine;
    }

    /// <summary>Approve or reject the instance's current step and advance the flow.</summary>
    public async Task<ApprovalInstance?> DecideAsync(int instanceId, bool approve, int userId, string? comment)
    {
        var instance = await _db.ApprovalInstances
            .Include(i => i.Steps)
            .FirstOrDefaultAsync(i => i.Id == instanceId);

        if (instance is null || instance.Status != "Pending")
            return instance;

        var step = instance.Steps
            .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder && s.Status == "Pending");
        if (step is null)
            return instance;

        step.ApproverUserId = userId;
        step.DecidedAt = DateTime.UtcNow;
        step.Comment = comment;

        if (!approve)
        {
            step.Status = "Rejected";
            instance.Status = "Rejected";
            instance.CompletedAt = DateTime.UtcNow;
        }
        else
        {
            step.Status = "Approved";
            var next = instance.Steps
                .Where(s => s.StepOrder > instance.CurrentStepOrder)
                .OrderBy(s => s.StepOrder)
                .FirstOrDefault();
            if (next is null)
            {
                instance.Status = "Approved";
                instance.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                instance.CurrentStepOrder = next.StepOrder;
            }
        }

        await SyncDocumentStatusAsync(instance);
        await _db.SaveChangesAsync();
        return instance;
    }

    /// <summary>Reflect the instance outcome onto the source document.</summary>
    private async Task SyncDocumentStatusAsync(ApprovalInstance instance)
    {
        if (instance.Status == "Pending") return;

        switch (instance.FormType)
        {
            case "BusinessTrip":
                var trip = await _db.BusinessTrips.FindAsync(instance.DocumentId);
                if (trip is not null) { trip.Status = instance.Status; trip.UpdatedAt = DateTime.UtcNow; if (instance.Status == "Approved") trip.ApprovedAt = DateTime.UtcNow; }
                break;
            case "ExpenseClaim":
                var claim = await _db.ExpenseClaims.FindAsync(instance.DocumentId);
                if (claim is not null) { claim.Status = instance.Status; claim.ProcessedDate = DateTime.UtcNow; claim.UpdatedAt = DateTime.UtcNow; }
                break;
            case "Leave":
                var leave = await _db.LeaveRequests.FindAsync(instance.DocumentId);
                if (leave is not null) { leave.Status = instance.Status; leave.UpdatedAt = DateTime.UtcNow; if (instance.Status == "Approved") leave.ApprovedAt = DateTime.UtcNow; }
                break;
            case "Overtime":
                var overtime = await _db.OvertimeRequests.FindAsync(instance.DocumentId);
                if (overtime is not null) { overtime.Status = instance.Status; overtime.UpdatedAt = DateTime.UtcNow; if (instance.Status == "Approved") overtime.ApprovedAt = DateTime.UtcNow; }
                break;
        }
    }
}
