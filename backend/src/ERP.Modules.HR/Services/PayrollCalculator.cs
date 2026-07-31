using ERP.Modules.HR.Models;

namespace ERP.Modules.HR.Services;

/// <summary>A single add/deduct line that explains part of a payroll figure.</summary>
public record PayrollLineItem(
    string Kind,        // "Addition" | "Deduction"
    string Category,    // e.g. 加班, 事假(無薪), 病假(半薪), 特休(全薪)
    string Description,
    DateTime Date,
    decimal Hours,
    decimal Rate,
    decimal Multiplier,
    decimal Amount);

/// <summary>Itemised explanation of how a payroll record's Bonus/Deductions arose.</summary>
public record PayrollBreakdown(
    int EmployeeId,
    string EmployeeName,
    int Year,
    int Month,
    decimal BaseSalary,
    decimal HourlyRate,
    List<PayrollLineItem> Additions,
    List<PayrollLineItem> Deductions,
    decimal TotalAdditions,
    decimal TotalDeductions,
    decimal NetSalary);

/// <summary>
/// Single source of truth for payroll add/deduct calculation. Both the monthly
/// generation and the on-demand breakdown use this so stored totals always
/// reconcile with the itemised detail. Hourly rate = base salary / 240 (30 days × 8h).
/// </summary>
public static class PayrollCalculator
{
    public const decimal MonthlyHours = 240m;

    public static decimal HourlyRate(decimal baseSalary) => baseSalary / MonthlyHours;

    /// <summary>Overtime pay per approved request (labour-law tiers: first 2h ×1.34, beyond ×1.67).</summary>
    public static List<PayrollLineItem> BuildAdditions(IEnumerable<OvertimeRequest> approvedOvertimes, decimal rate)
    {
        var items = new List<PayrollLineItem>();
        foreach (var ov in approvedOvertimes.OrderBy(o => o.Date))
        {
            decimal firstTwo = Math.Min(ov.Hours, 2m);
            decimal remaining = Math.Max(0m, ov.Hours - 2m);
            decimal amount = Math.Round(firstTwo * rate * 1.34m + remaining * rate * 1.67m, 0);
            decimal blended = ov.Hours > 0 && rate > 0 ? Math.Round(amount / (ov.Hours * rate), 2) : 0m;
            string desc = remaining > 0
                ? $"加班 {ov.Hours:0.#}h（前 2h ×1.34 + 後 {remaining:0.#}h ×1.67）"
                : $"加班 {ov.Hours:0.#}h ×1.34";
            items.Add(new PayrollLineItem("Addition", "加班", desc, ov.Date, ov.Hours, rate, blended, amount));
        }
        return items;
    }

    /// <summary>
    /// Leave deductions per approved request, clipped to the target month. Paid leave
    /// (特休/公假) shows as a 0 line for transparency; 病假 half-pay; 事假 unpaid.
    /// </summary>
    public static List<PayrollLineItem> BuildDeductions(IEnumerable<LeaveRequest> approvedLeaves, decimal rate, int year, int month)
    {
        var monthStart = new DateTime(year, month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        var items = new List<PayrollLineItem>();
        foreach (var lv in approvedLeaves.OrderBy(l => l.StartDate))
        {
            var start = lv.StartDate.Date < monthStart ? monthStart : lv.StartDate.Date;
            var end = lv.EndDate.Date > monthEnd ? monthEnd : lv.EndDate.Date;
            int days = (end - start).Days + 1;
            if (days <= 0) continue;

            decimal hours = days * 8m;
            var (label, multiplier) = LeavePay(lv.LeaveType);
            decimal amount = Math.Round(hours * rate * multiplier, 0);
            items.Add(new PayrollLineItem("Deduction", label, $"{label} {days} 天（{hours:0}h）", start, hours, rate, multiplier, amount));
        }
        return items;
    }

    /// <summary>Deduction multiplier of the hourly wage per leave type (0 = fully paid).</summary>
    private static (string Label, decimal Multiplier) LeavePay(string leaveType) => leaveType switch
    {
        "Personal" or "事假" => ("事假(無薪)", 1.0m),
        "Sick" or "病假" => ("病假(半薪)", 0.5m),
        "Annual" or "特休" => ("特休(全薪)", 0m),
        "Official" or "公假" => ("公假(全薪)", 0m),
        _ => (leaveType, 0m),
    };
}
