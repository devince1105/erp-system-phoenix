using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
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
                .ThenInclude(e => e.Department)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync();
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,HR")] // Only HR/Admin can look up another employee's payroll
    public async Task<ActionResult<IEnumerable<PayrollRecord>>> GetEmployeePayrolls(int employeeId)
    {
        return await _context.Payrolls
            .Include(p => p.Employee)
                .ThenInclude(e => e.Department)
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync();
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
                decimal hourlyRate = emp.BaseSalary / 240m;
                
                // Calculate Overtime Bonus
                var overtimes = await _context.OvertimeRequests
                    .Where(o => o.EmployeeId == emp.Id && o.Status == "Approved" && o.Date.Year == year && o.Date.Month == month)
                    .ToListAsync();

                decimal bonus = 0;
                foreach (var ov in overtimes)
                {
                    decimal firstTwo = Math.Min(ov.Hours, 2m);
                    decimal remaining = Math.Max(0m, ov.Hours - 2m);
                    bonus += (firstTwo * hourlyRate * 1.34m) + (remaining * hourlyRate * 1.67m);
                }

                // Calculate Leave Deductions
                var leaves = await _context.LeaveRequests
                    .Where(l => l.EmployeeId == emp.Id && l.Status == "Approved" 
                                && ((l.StartDate.Year == year && l.StartDate.Month == month) 
                                    || (l.EndDate.Year == year && l.EndDate.Month == month)))
                    .ToListAsync();

                decimal deductions = 0;
                foreach (var lv in leaves)
                {
                    // Assume 8 hours per day
                    int days = (lv.EndDate.Date - lv.StartDate.Date).Days + 1;
                    decimal hours = days * 8m;
                    
                    if (lv.LeaveType == "Sick" || lv.LeaveType == "病假")
                    {
                        deductions += (hours * hourlyRate * 0.5m);
                    }
                    else if (lv.LeaveType == "Personal" || lv.LeaveType == "事假")
                    {
                        deductions += (hours * hourlyRate * 1.0m);
                    }
                }

                var payroll = new PayrollRecord
                {
                    EmployeeId = emp.Id,
                    Year = year,
                    Month = month,
                    BaseSalary = emp.BaseSalary,
                    Bonus = Math.Round(bonus, 0),
                    Deductions = Math.Round(deductions, 0),
                    NetSalary = Math.Round(emp.BaseSalary + bonus - deductions, 0),
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
