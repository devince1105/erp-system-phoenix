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
        }
    }
}
