using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

// ---------------------------------------------------------------------------
// ERP Phoenix demo-data seeder
// Writes ~3 months of coherent sample data (May–Jul 2026) across the modules.
// Connection string comes from the shared ERP.Host user-secrets, so no
// credential is handled in code. Each module is idempotent (skips if already
// populated) so the seeder can be re-run safely.
// ---------------------------------------------------------------------------

var config = new ConfigurationBuilder()
    .AddUserSecrets("erp-phoenix-host")
    .AddEnvironmentVariables()
    .Build();

var connectionString = config.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection not found. Run this from a machine where ERP.Host user-secrets are set.");

Console.WriteLine("== ERP Phoenix demo-data seeder ==");
Console.WriteLine($"Target: {MaskServer(connectionString)}");

var rnd = new Random(20260730); // deterministic

SeedHr(connectionString, rnd);

Console.WriteLine("Done.");
return;

// ===========================================================================
// HR
// ===========================================================================
static void SeedHr(string conn, Random rnd)
{
    var options = new DbContextOptionsBuilder<HRDbContext>().UseSqlServer(conn).Options;
    using var db = new HRDbContext(options);

    if (db.Employees.Any())
    {
        Console.WriteLine($"[HR] already has {db.Employees.Count()} employees — skipping.");
        return;
    }

    Console.WriteLine("[HR] seeding departments...");
    var deptNames = new[] { "業務部", "會計部", "人資部", "資訊部", "生產部", "倉儲部", "行政部" };
    var departments = deptNames.Select(n => new Department { Name = n }).ToList();
    db.Departments.AddRange(departments);
    db.SaveChanges();

    Console.WriteLine("[HR] seeding employees...");
    var surnames = new[] { "陳", "林", "黃", "張", "李", "王", "吳", "劉", "蔡", "楊", "許", "鄭", "謝", "郭", "洪" };
    var given = new[] { "志明", "淑芬", "家豪", "美玲", "俊傑", "怡君", "建宏", "雅婷", "宗翰", "詩涵",
                        "冠廷", "欣怡", "承恩", "婉婷", "柏翰", "郁婷", "彥廷", "佩珊", "冠宇", "思穎",
                        "宇軒", "曉涵", "士豪", "筱雯", "銘傑", "琇雯", "偉倫", "君怡", "哲瑋", "淑惠" };
    var titlesByDept = new Dictionary<string, string[]>
    {
        ["業務部"] = new[] { "業務經理", "業務專員", "業務助理" },
        ["會計部"] = new[] { "會計主管", "會計專員", "出納" },
        ["人資部"] = new[] { "人資經理", "人資專員" },
        ["資訊部"] = new[] { "資訊主管", "系統工程師", "MIS 工程師" },
        ["生產部"] = new[] { "生產經理", "產線組長", "作業員" },
        ["倉儲部"] = new[] { "倉管主管", "倉管人員" },
        ["行政部"] = new[] { "行政經理", "行政專員" },
    };

    var employees = new List<Employee>();
    for (int i = 0; i < 30; i++)
    {
        var dept = departments[i % departments.Count];
        var titles = titlesByDept[dept.Name];
        var title = titles[Math.Min(i / departments.Count, titles.Length - 1)];
        var name = surnames[rnd.Next(surnames.Length)] + given[i];
        var baseSalary = title.Contains("經理") || title.Contains("主管") ? rnd.Next(70, 95) * 1000
                       : title.Contains("組長") ? rnd.Next(45, 55) * 1000
                       : rnd.Next(32, 48) * 1000;
        var hireYear = rnd.Next(2018, 2026);
        employees.Add(new Employee
        {
            Name = name,
            Email = $"emp{i + 1:D2}@phoenix-erp.com.tw",
            DepartmentId = dept.Id,
            JobTitle = title,
            BaseSalary = baseSalary,
            HireDate = new DateTime(hireYear, rnd.Next(1, 13), rnd.Next(1, 28)),
            Status = i is 7 or 19 ? EmployeeStatus.OnLeave : EmployeeStatus.Active,
            Phone = $"02-2{rnd.Next(100, 999)}-{rnd.Next(1000, 9999)}",
            Mobile = $"09{rnd.Next(10, 99)}-{rnd.Next(100, 999)}-{rnd.Next(100, 999)}",
            DateOfBirth = new DateTime(rnd.Next(1978, 2001), rnd.Next(1, 13), rnd.Next(1, 28)),
        });
    }
    db.Employees.AddRange(employees);
    db.SaveChanges();

    // first employee of each department becomes its manager
    foreach (var dept in departments)
    {
        var mgr = employees.FirstOrDefault(e => e.DepartmentId == dept.Id);
        if (mgr != null) dept.ManagerId = mgr.Id;
    }
    db.SaveChanges();

    Console.WriteLine("[HR] seeding leave balances...");
    var leaveBalances = new List<LeaveBalance>();
    foreach (var e in employees)
    {
        foreach (var (type, total) in new[] { ("Annual", 14m), ("Sick", 30m), ("Personal", 14m) })
        {
            var used = type == "Annual" ? rnd.Next(0, 8) : type == "Sick" ? rnd.Next(0, 5) : rnd.Next(0, 4);
            leaveBalances.Add(new LeaveBalance
            {
                EmployeeId = e.Id,
                LeaveType = type,
                Year = 2026,
                TotalDays = total,
                UsedDays = used,
                RemainingDays = total - used,
            });
        }
    }
    db.LeaveBalances.AddRange(leaveBalances);
    db.SaveChanges();

    Console.WriteLine("[HR] seeding attendance (May–Jul 2026)...");
    var active = employees.Where(e => e.Status == EmployeeStatus.Active).ToList();
    var attendance = new List<AttendanceRecord>();
    for (var day = new DateTime(2026, 5, 1); day <= new DateTime(2026, 7, 30); day = day.AddDays(1))
    {
        if (day.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday) continue;
        foreach (var e in active)
        {
            var roll = rnd.NextDouble();
            if (roll < 0.03) // on leave that day
            {
                attendance.Add(new AttendanceRecord { EmployeeId = e.Id, Date = day, Status = "Leave" });
                continue;
            }
            var late = roll < 0.08;
            var checkIn = day.AddHours(late ? 9 : 8).AddMinutes(late ? rnd.Next(5, 40) : rnd.Next(40, 60));
            var checkOut = day.AddHours(18).AddMinutes(rnd.Next(0, 45));
            attendance.Add(new AttendanceRecord
            {
                EmployeeId = e.Id,
                Date = day,
                CheckInTime = checkIn,
                CheckOutTime = checkOut,
                Status = late ? "Late" : "Present",
            });
        }
    }
    db.Attendances.AddRange(attendance);
    db.SaveChanges();
    Console.WriteLine($"[HR]   {attendance.Count} attendance records");

    Console.WriteLine("[HR] seeding payroll (May–Jul 2026)...");
    var payrolls = new List<PayrollRecord>();
    foreach (var e in employees)
    {
        foreach (var month in new[] { 5, 6, 7 })
        {
            var bonus = month == 7 ? 0 : rnd.Next(0, 6) * 1000; // Jul not yet finalised
            var deductions = Math.Round(e.BaseSalary * 0.09m, 0); // labour + health insurance
            var status = month == 7 ? "Draft" : "Paid";
            payrolls.Add(new PayrollRecord
            {
                EmployeeId = e.Id,
                Year = 2026,
                Month = month,
                BaseSalary = e.BaseSalary,
                Bonus = bonus,
                Deductions = deductions,
                NetSalary = e.BaseSalary + bonus - deductions,
                Status = status,
                PaymentDate = status == "Paid" ? new DateTime(2026, month + 1, 5) : null,
            });
        }
    }
    db.Payrolls.AddRange(payrolls);
    db.SaveChanges();

    Console.WriteLine("[HR] seeding leave requests...");
    var requests = new List<LeaveRequest>();
    for (int i = 0; i < 18; i++)
    {
        var e = active[rnd.Next(active.Count)];
        var start = new DateTime(2026, rnd.Next(5, 8), rnd.Next(1, 27));
        var days = rnd.Next(1, 4);
        var type = new[] { "Annual", "Sick", "Personal" }[rnd.Next(3)];
        requests.Add(new LeaveRequest
        {
            EmployeeId = e.Id,
            LeaveType = type,
            StartDate = start,
            EndDate = start.AddDays(days - 1),
            Reason = type == "Sick" ? "身體不適就醫" : type == "Annual" ? "家庭旅遊" : "個人事務",
            Status = start < new DateTime(2026, 7, 1) ? "Approved" : "Pending",
        });
    }
    db.LeaveRequests.AddRange(requests);
    db.SaveChanges();

    Console.WriteLine($"[HR] done: {departments.Count} depts, {employees.Count} employees, "
        + $"{attendance.Count} attendance, {payrolls.Count} payroll, {requests.Count} leave requests.");
}

static string MaskServer(string conn)
{
    var server = conn.Split(';').FirstOrDefault(p => p.TrimStart().StartsWith("Server", StringComparison.OrdinalIgnoreCase));
    return server ?? "(unknown server)";
}
