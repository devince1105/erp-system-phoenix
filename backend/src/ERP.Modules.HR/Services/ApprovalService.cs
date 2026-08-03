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

// ----- Approval reporting DTOs (簽核報表) ------------------------------------

public record ApprovalSummaryDto(int Total, int Pending, int Approved, int Rejected, double ApprovalRate, double? AvgCycleHours);
public record FormTypeStatDto(string FormType, string Label, int Total, int Pending, int Approved, int Rejected, double ApprovalRate, double? AvgCycleHours);
public record StageStatDto(string Label, int Decided, double? AvgDecideHours, int PendingNow);
public record StuckItemDto(int InstanceId, string FormType, string FormLabel, int DocumentId, string CurrentLabel, int StepOrder, int TotalSteps, double AgeHours);
public record ApprovalReportDto(ApprovalSummaryDto Summary, List<FormTypeStatDto> ByFormType, List<StageStatDto> ByStage, List<StuckItemDto> Stuck);

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
        "Purchase" => (await _db.PurchaseRequests.FindAsync(documentId))?.EmployeeId,
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

    // ----- Reporting (簽核報表) -----------------------------------------------

    private static readonly IReadOnlyDictionary<string, string> FormLabels = new Dictionary<string, string>
    {
        ["BusinessTrip"] = "出差申請",
        ["ExpenseClaim"] = "費用/差旅報銷",
        ["Leave"] = "請假",
        ["Overtime"] = "加班",
        ["Purchase"] = "採購申請",
    };
    private static string FormLabel(string formType) => FormLabels.TryGetValue(formType, out var l) ? l : formType;

    /// <summary>Aggregate approval analytics: throughput, per-stage timing, and the current bottlenecks.</summary>
    public async Task<ApprovalReportDto> GetReportAsync()
    {
        var now = DateTime.UtcNow;
        var instances = await _db.ApprovalInstances.Include(i => i.Steps).AsNoTracking().ToListAsync();

        int total = instances.Count;
        int pending = instances.Count(i => i.Status == "Pending");
        int approved = instances.Count(i => i.Status == "Approved");
        int rejected = instances.Count(i => i.Status == "Rejected");
        int decided = approved + rejected;
        double approvalRate = decided == 0 ? 0 : Math.Round(approved * 100.0 / decided, 1);

        var cycles = instances
            .Where(i => i.CompletedAt != null)
            .Select(i => (i.CompletedAt!.Value - i.CreatedAt).TotalHours)
            .ToList();
        double? avgCycle = cycles.Count == 0 ? null : Math.Round(cycles.Average(), 1);

        var summary = new ApprovalSummaryDto(total, pending, approved, rejected, approvalRate, avgCycle);

        // Per form type
        var byFormType = instances
            .GroupBy(i => i.FormType)
            .Select(g =>
            {
                int ap = g.Count(i => i.Status == "Approved");
                int rj = g.Count(i => i.Status == "Rejected");
                int dc = ap + rj;
                var cyc = g.Where(i => i.CompletedAt != null).Select(i => (i.CompletedAt!.Value - i.CreatedAt).TotalHours).ToList();
                return new FormTypeStatDto(g.Key, FormLabel(g.Key), g.Count(),
                    g.Count(i => i.Status == "Pending"), ap, rj,
                    dc == 0 ? 0 : Math.Round(ap * 100.0 / dc, 1),
                    cyc.Count == 0 ? null : Math.Round(cyc.Average(), 1));
            })
            .OrderByDescending(f => f.Total)
            .ToList();

        // Per stage (label): time-to-decide = DecidedAt - when the step became active
        var decideDurations = new Dictionary<string, List<double>>();
        var pendingByLabel = new Dictionary<string, int>();
        foreach (var inst in instances)
        {
            var ordered = inst.Steps.OrderBy(s => s.StepOrder).ToList();
            for (int k = 0; k < ordered.Count; k++)
            {
                var step = ordered[k];
                DateTime stepStart = k == 0 ? inst.CreatedAt : (ordered[k - 1].DecidedAt ?? inst.CreatedAt);
                if (step.DecidedAt != null)
                {
                    var hrs = (step.DecidedAt.Value - stepStart).TotalHours;
                    if (!decideDurations.TryGetValue(step.Label, out var list)) decideDurations[step.Label] = list = new();
                    list.Add(hrs < 0 ? 0 : hrs);
                }
                else if (inst.Status == "Pending" && step.StepOrder == inst.CurrentStepOrder)
                {
                    pendingByLabel[step.Label] = pendingByLabel.GetValueOrDefault(step.Label) + 1;
                }
            }
        }
        var stageLabels = decideDurations.Keys.Union(pendingByLabel.Keys);
        var byStage = stageLabels
            .Select(label => new StageStatDto(
                label,
                decideDurations.TryGetValue(label, out var d) ? d.Count : 0,
                decideDurations.TryGetValue(label, out var d2) && d2.Count > 0 ? Math.Round(d2.Average(), 1) : null,
                pendingByLabel.GetValueOrDefault(label)))
            .OrderByDescending(s => s.PendingNow).ThenByDescending(s => s.Decided)
            .ToList();

        // Bottlenecks: pending instances by how long they've sat at the current step
        var stuck = instances
            .Where(i => i.Status == "Pending")
            .Select(i =>
            {
                var ordered = i.Steps.OrderBy(s => s.StepOrder).ToList();
                var idx = ordered.FindIndex(s => s.StepOrder == i.CurrentStepOrder);
                var cur = idx >= 0 ? ordered[idx] : ordered.LastOrDefault();
                DateTime since = idx <= 0 ? i.CreatedAt : (ordered[idx - 1].DecidedAt ?? i.CreatedAt);
                return new StuckItemDto(i.Id, i.FormType, FormLabel(i.FormType), i.DocumentId,
                    cur?.Label ?? "-", cur?.StepOrder ?? i.CurrentStepOrder, ordered.Count,
                    Math.Round((now - since).TotalHours, 1));
            })
            .OrderByDescending(s => s.AgeHours)
            .Take(15)
            .ToList();

        return new ApprovalReportDto(summary, byFormType, byStage, stuck);
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
            case "Purchase":
                var purchase = await _db.PurchaseRequests.FindAsync(instance.DocumentId);
                if (purchase is not null) { purchase.Status = instance.Status; purchase.UpdatedAt = DateTime.UtcNow; if (instance.Status == "Approved") purchase.ApprovedAt = DateTime.UtcNow; }
                break;
        }
    }
}
