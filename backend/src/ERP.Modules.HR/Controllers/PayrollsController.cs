using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using ERP.Modules.HR.Services;
using ERP.Shared.Interfaces.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
[Authorize] // Require authentication for all payroll actions
public class PayrollsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IAccountingIntegrationService _accounting;

    public PayrollsController(HRDbContext context, IAccountingIntegrationService accounting)
    {
        _context = context;
        _accounting = accounting;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HR")] // Only HR/Admin can see all payrolls
    public async Task<ActionResult<IEnumerable<PayrollRecord>>> GetPayrolls()
    {
        return await _context.Payrolls
            .Include(p => p.Employee)
                .ThenInclude(e => e!.Department)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,HR")] // Only HR/Admin can look up another employee's payroll
    public async Task<ActionResult<IEnumerable<PayrollRecord>>> GetEmployeePayrolls(int employeeId)
    {
        return await _context.Payrolls
            .Include(p => p.Employee)
                .ThenInclude(e => e!.Department)
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync();
    }

    /// <summary>
    /// Itemised breakdown of a payroll record: which approved overtime (加項) and
    /// leave (扣項) fed into the Bonus/Deductions, recomputed live from the source
    /// documents at the employee's hourly rate.
    /// </summary>
    [HttpGet("{id}/breakdown")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<PayrollBreakdown>> GetBreakdown(int id)
    {
        var p = await _context.Payrolls.Include(x => x.Employee).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        decimal rate = PayrollCalculator.HourlyRate(p.BaseSalary);

        var overtimes = await _context.OvertimeRequests
            .Where(o => o.EmployeeId == p.EmployeeId && o.Status == "Approved" && o.Date.Year == p.Year && o.Date.Month == p.Month)
            .ToListAsync();
        var leaves = await _context.LeaveRequests
            .Where(l => l.EmployeeId == p.EmployeeId && l.Status == "Approved"
                        && ((l.StartDate.Year == p.Year && l.StartDate.Month == p.Month)
                            || (l.EndDate.Year == p.Year && l.EndDate.Month == p.Month)))
            .ToListAsync();

        var additions = PayrollCalculator.BuildAdditions(overtimes, rate);
        var deductions = PayrollCalculator.BuildDeductions(leaves, rate, p.Year, p.Month);
        decimal totalAdd = additions.Sum(a => a.Amount);
        decimal totalDed = deductions.Sum(d => d.Amount);

        return new PayrollBreakdown(
            p.EmployeeId,
            p.Employee?.Name ?? $"員工 #{p.EmployeeId}",
            p.Year, p.Month,
            p.BaseSalary, Math.Round(rate, 2),
            additions, deductions,
            totalAdd, totalDed,
            p.BaseSalary + totalAdd - totalDed);
    }

    [HttpPost]
    public async Task<ActionResult<PayrollRecord>> CreatePayroll(PayrollRecord record)
    {
        _context.Payrolls.Add(record);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPayrolls), new { id = record.Id }, record);
    }

    [HttpPost("generate/{year}/{month}")]
    [Authorize(Roles = "Admin,HR")] // Only HR/Admin can trigger payroll generation
    public async Task<IActionResult> GeneratePayrolls(int year, int month)
    {
        var employees = await _context.Employees.Where(e => e.Status == EmployeeStatus.Active).ToListAsync();
        
        foreach (var emp in employees)
        {
            var existing = await _context.Payrolls.FirstOrDefaultAsync(p => p.EmployeeId == emp.Id && p.Year == year && p.Month == month);
            if (existing == null)
            {
                decimal hourlyRate = PayrollCalculator.HourlyRate(emp.BaseSalary);

                var overtimes = await _context.OvertimeRequests
                    .Where(o => o.EmployeeId == emp.Id && o.Status == "Approved" && o.Date.Year == year && o.Date.Month == month)
                    .ToListAsync();

                var leaves = await _context.LeaveRequests
                    .Where(l => l.EmployeeId == emp.Id && l.Status == "Approved"
                                && ((l.StartDate.Year == year && l.StartDate.Month == month)
                                    || (l.EndDate.Year == year && l.EndDate.Month == month)))
                    .ToListAsync();

                // Same calculator the breakdown endpoint uses, so stored totals reconcile
                // exactly with the itemised detail.
                decimal bonus = PayrollCalculator.BuildAdditions(overtimes, hourlyRate).Sum(a => a.Amount);
                decimal deductions = PayrollCalculator.BuildDeductions(leaves, hourlyRate, year, month).Sum(d => d.Amount);

                var payroll = new PayrollRecord
                {
                    EmployeeId = emp.Id,
                    Year = year,
                    Month = month,
                    BaseSalary = emp.BaseSalary,
                    Bonus = bonus,
                    Deductions = deductions,
                    NetSalary = emp.BaseSalary + bonus - deductions,
                    Status = "Draft"
                };
                _context.Payrolls.Add(payroll);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Payrolls generated successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayroll(int id, PayrollRecord record)
    {
        if (id != record.Id) return BadRequest();

        var existing = await _context.Payrolls.FindAsync(id);
        if (existing == null) return NotFound();

        // Calculate NetSalary
        record.NetSalary = record.BaseSalary + record.Bonus - record.Deductions;

        _context.Entry(existing).CurrentValues.SetValues(record);
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Payrolls.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    /// <summary>
    /// 確認發薪：將指定年/月全部草稿薪資批次改為 Processed，
    /// 並自動拋轉財務傳票（薪資費用 / 應付薪資）。
    /// 此為不可逆操作，僅限 Admin/HR 執行。
    /// </summary>
    [HttpPost("batch-process/{year}/{month}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> BatchProcessPayrolls(int year, int month)
    {
        var drafts = await _context.Payrolls
            .Where(p => p.Year == year && p.Month == month && p.Status == "Draft")
            .ToListAsync();

        if (!drafts.Any())
            return BadRequest($"{year}年{month:D2}月 沒有草稿狀態的薪資單，請先執行 generate。");

        // Aggregate totals for the voucher
        decimal totalNetSalary = drafts.Sum(p => p.NetSalary);
        decimal totalBonus     = drafts.Sum(p => p.Bonus);
        decimal totalDeductions = drafts.Sum(p => p.Deductions);

        // Mark all as Processed
        foreach (var payroll in drafts)
        {
            payroll.Status = "Processed";
            payroll.PaymentDate = DateTime.UtcNow;
            payroll.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // Trigger Auto-Voucher: Dr 薪資費用 / Cr 應付薪資 + 代扣稅額
        var voucherCreated = await _accounting.CreatePayrollVoucherAsync(
            year, month, totalNetSalary, totalBonus, totalDeductions);

        return Ok(new
        {
            message = $"{year}年{month:D2}月 薪資已確認發放，共 {drafts.Count} 筆。",
            voucherCreated,
            totalNetSalary,
            totalBonus,
            totalDeductions
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // Only Admin can delete payroll records
    public async Task<IActionResult> DeletePayroll(int id)
    {
        var record = await _context.Payrolls.FindAsync(id);
        if (record == null) return NotFound();

        _context.Payrolls.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
