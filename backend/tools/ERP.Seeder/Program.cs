using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using ERP.Modules.MDM.Data;
using ERP.Modules.MDM.Models;
using ERP.Modules.CRM.Data;
using ERP.Modules.CRM.Models;
using ERP.Modules.Inventory.Infrastructure.Database;
using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
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
SeedMdm(connectionString, rnd);
SeedInventory(connectionString, rnd);
SeedCrm(connectionString, rnd);
SeedAccounting(connectionString, rnd);

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

// ===========================================================================
// MDM — Business Partners (master data)
// ===========================================================================
static void SeedMdm(string conn, Random rnd)
{
    var options = new DbContextOptionsBuilder<MdmDbContext>().UseSqlServer(conn).Options;
    using var db = new MdmDbContext(options);
    if (db.BusinessPartners.Any())
    {
        Console.WriteLine($"[MDM] already has {db.BusinessPartners.Count()} partners — skipping.");
        return;
    }

    Console.WriteLine("[MDM] seeding business partners...");
    var customers = new[] { "誠品生活股份有限公司", "全家便利商店股份有限公司", "統一超商股份有限公司",
        "新光三越百貨股份有限公司", "遠東百貨股份有限公司", "家樂福股份有限公司", "屈臣氏個人用品商店",
        "燦坤實業股份有限公司", "順發電腦股份有限公司", "良興電子股份有限公司" };
    var suppliers = new[] { "台灣積體電路製造股份有限公司", "鴻海精密工業股份有限公司", "廣達電腦股份有限公司",
        "和碩聯合科技股份有限公司", "英業達股份有限公司", "大聯大投資控股股份有限公司",
        "文曄科技股份有限公司", "聯強國際股份有限公司" };

    var partners = new List<BusinessPartner>();
    void Add(string name, BPRoleType role)
    {
        var bp = new BusinessPartner
        {
            TaxId = rnd.Next(10000000, 99999999).ToString(),
            CompanyName = name,
            Phone = $"02-{rnd.Next(2000, 2799)}-{rnd.Next(1000, 9999)}",
            Email = $"contact@{Math.Abs(name.GetHashCode()) % 100000}.com.tw",
            Address = $"台北市信義區松高路{rnd.Next(1, 200)}號",
            IsActive = true,
            Roles = new List<BPRole> { new BPRole { RoleType = role, CreditLimit = role == BPRoleType.Customer ? rnd.Next(1, 10) * 500000 : null, PaymentTerms = "月結30天" } }
        };
        partners.Add(bp);
    }
    foreach (var c in customers) Add(c, BPRoleType.Customer);
    foreach (var s in suppliers) Add(s, BPRoleType.Supplier);
    db.BusinessPartners.AddRange(partners);
    db.SaveChanges();
    Console.WriteLine($"[MDM] done: {partners.Count} business partners.");
}

// ===========================================================================
// Inventory — Partners + Purchase/Sales orders (May–Jul 2026)
// ===========================================================================
static void SeedInventory(string conn, Random rnd)
{
    var options = new DbContextOptionsBuilder<InventoryDbContext>().UseSqlServer(conn).Options;
    using var db = new InventoryDbContext(options);

    var products = db.Products.ToList();
    if (!products.Any())
    {
        Console.WriteLine("[INV] no products found — skipping orders.");
        return;
    }
    // Ensure partner master data exists (create only the types that are missing;
    // existing seed partners are reused).
    var toAdd = new List<Partner>();
    if (!db.Partners.Any(p => p.Type == PartnerType.Customer))
    {
        foreach (var n in new[] { "誠品生活", "全家便利商店", "統一超商", "新光三越", "遠東百貨", "燦坤3C", "順發電腦", "良興電子", "德誼數位", "傑昇通信" })
            toAdd.Add(new Partner { Name = n, Type = PartnerType.Customer, TaxId = rnd.Next(10000000, 99999999).ToString(), ContactPerson = "採購" + "王李陳林張"[rnd.Next(5)] + "經理", Phone = $"02-{rnd.Next(2000, 2799)}-{rnd.Next(1000, 9999)}", Address = $"台北市{rnd.Next(1, 100)}號" });
    }
    if (!db.Partners.Any(p => p.Type == PartnerType.Supplier))
    {
        foreach (var n in new[] { "聯強國際", "大聯大", "文曄科技", "廣達電腦", "鴻海精密", "英業達", "台灣三星", "蘋果亞洲" })
            toAdd.Add(new Partner { Name = n, Type = PartnerType.Supplier, TaxId = rnd.Next(10000000, 99999999).ToString(), ContactPerson = "業務" + "王李陳林張"[rnd.Next(5)] + "專員", Phone = $"03-{rnd.Next(300, 599)}-{rnd.Next(1000, 9999)}", Address = $"新竹市{rnd.Next(1, 100)}號" });
    }
    if (toAdd.Count > 0) { db.Partners.AddRange(toAdd); db.SaveChanges(); Console.WriteLine($"[INV] added {toAdd.Count} partners."); }

    var custs = db.Partners.Where(p => p.Type == PartnerType.Customer).ToList();
    var supps = db.Partners.Where(p => p.Type == PartnerType.Supplier).ToList();
    if (custs.Count == 0 || supps.Count == 0) { Console.WriteLine("[INV] missing customers/suppliers — skipping orders."); return; }

    // Idempotent guard for seeded orders (marker via memo).
    if (db.SalesOrders.Any(o => o.Memo == "客戶訂購"))
    {
        Console.WriteLine("[INV] seeded orders already present — skipping.");
        return;
    }

    Console.WriteLine("[INV] seeding purchase & sales orders (May–Jul 2026)...");
    var poSeq = 0; var soSeq = 0;
    var purchaseOrders = new List<PurchaseOrder>();
    var salesOrders = new List<SalesOrder>();
    for (var day = new DateTime(2026, 5, 1); day <= new DateTime(2026, 7, 30); day = day.AddDays(1))
    {
        if (day.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday) continue;
        // ~15% of workdays get a purchase order
        if (rnd.NextDouble() < 0.15)
        {
            var items = PickProducts(products, rnd, 1, 3)
                .Select(p => new PurchaseOrderItem { ProductId = p.Id, Quantity = rnd.Next(5, 40), UnitPrice = p.CostPrice }).ToList();
            purchaseOrders.Add(new PurchaseOrder
            {
                OrderNo = $"PO-{day:yyyyMMdd}-{++poSeq:D3}",
                OrderDate = day, CreatedAt = day,
                SupplierId = supps[rnd.Next(supps.Count)].Id,
                Status = OrderStatus.Confirmed,
                TotalAmount = items.Sum(i => i.Quantity * i.UnitPrice),
                Memo = "定期補貨採購",
                Items = items,
            });
        }
        // ~55% of workdays get 1-2 sales orders
        var soCount = rnd.NextDouble() < 0.55 ? rnd.Next(1, 3) : 0;
        for (int s = 0; s < soCount; s++)
        {
            var items = PickProducts(products, rnd, 1, 4)
                .Select(p => new SalesOrderItem { ProductId = p.Id, Quantity = rnd.Next(1, 10), UnitPrice = p.UnitPrice }).ToList();
            salesOrders.Add(new SalesOrder
            {
                OrderNo = $"SO-{day:yyyyMMdd}-{++soSeq:D3}",
                OrderDate = day, CreatedAt = day,
                CustomerId = custs[rnd.Next(custs.Count)].Id,
                Status = OrderStatus.Confirmed,
                TotalAmount = items.Sum(i => i.Quantity * i.UnitPrice),
                Memo = "客戶訂購",
                Items = items,
            });
        }
    }
    db.PurchaseOrders.AddRange(purchaseOrders);
    db.SalesOrders.AddRange(salesOrders);
    db.SaveChanges();
    Console.WriteLine($"[INV] done: {custs.Count + supps.Count} partners, {purchaseOrders.Count} purchase orders, {salesOrders.Count} sales orders.");
}

static List<Product> PickProducts(List<Product> products, Random rnd, int min, int max)
{
    var n = Math.Min(rnd.Next(min, max + 1), products.Count);
    return products.OrderBy(_ => rnd.Next()).Take(n).ToList();
}

// ===========================================================================
// CRM — Customers + Opportunities
// ===========================================================================
static void SeedCrm(string conn, Random rnd)
{
    var options = new DbContextOptionsBuilder<CRMDbContext>().UseSqlServer(conn).Options;
    using var db = new CRMDbContext(options);
    if (db.Customers.Any())
    {
        Console.WriteLine($"[CRM] already has {db.Customers.Count()} customers — skipping.");
        return;
    }

    Console.WriteLine("[CRM] seeding customers & opportunities...");
    var names = new[] { "誠品生活", "全家便利商店", "新光三越", "遠東百貨", "燦坤3C", "順發電腦", "良興電子", "德誼數位", "傑昇通信", "PChome 網路家庭", "momo 富邦媒體", "蝦皮購物" };
    var industries = new[] { "零售流通", "連鎖超商", "百貨零售", "3C 通路", "電子商務", "通訊零售" };
    var customers = names.Select((n, i) => new Customer
    {
        Name = n,
        Type = i % 4 == 0 ? "B2C" : "B2B",
        ContactPerson = "王李陳林張黃"[rnd.Next(6)] + "經理",
        Email = $"po@{i}.com.tw",
        Phone = $"02-{rnd.Next(2000, 2799)}-{rnd.Next(1000, 9999)}",
        Address = $"台北市信義區松高路{rnd.Next(1, 200)}號",
        Industry = industries[rnd.Next(industries.Length)],
        CreatedAt = new DateTime(2026, 5, 1).AddDays(rnd.Next(0, 40)),
    }).ToList();
    db.Customers.AddRange(customers);
    db.SaveChanges();

    var stages = new[] { "Requirement", "Proposal", "Contract", "Execution", "Review", "Closed", "Lost" };
    var titles = new[] { "企業採購案", "年度供貨合約", "新品鋪貨專案", "門市設備汰換", "電商倉儲整合", "促銷檔期備貨" };
    var opps = new List<SalesOpportunity>();
    for (int i = 0; i < 16; i++)
    {
        var c = customers[rnd.Next(customers.Count)];
        var created = new DateTime(2026, 5, 1).AddDays(rnd.Next(0, 85));
        opps.Add(new SalesOpportunity
        {
            CustomerId = c.Id,
            Title = $"{c.Name} - {titles[rnd.Next(titles.Length)]}",
            EstimatedValue = rnd.Next(2, 60) * 50000,
            Stage = stages[rnd.Next(stages.Length)],
            ExpectedCloseDate = created.AddDays(rnd.Next(15, 60)),
            Notes = "由業務團隊跟進中",
            CreatedAt = created,
        });
    }
    db.Opportunities.AddRange(opps);
    db.SaveChanges();
    Console.WriteLine($"[CRM] done: {customers.Count} customers, {opps.Count} opportunities.");
}

// ===========================================================================
// Accounting — balanced double-entry vouchers (May–Jul 2026)
// ===========================================================================
static void SeedAccounting(string conn, Random rnd)
{
    var options = new DbContextOptionsBuilder<AccountingDbContext>().UseSqlServer(conn).Options;
    using var db = new AccountingDbContext(options);

    var titles = db.AccountTitles.ToDictionary(a => a.Code, a => a.Id);
    if (!titles.Any())
    {
        Console.WriteLine("[ACC] no account titles — skipping vouchers.");
        return;
    }
    if (db.Vouchers.Any(v => v.VoucherNo.StartsWith("VS")))
    {
        Console.WriteLine("[ACC] seeded vouchers already present — skipping.");
        return;
    }

    int? T(string code) => titles.TryGetValue(code, out var id) ? id : null;
    var vouchers = new List<Voucher>();
    int seq = 0;

    void AddVoucher(DateTime date, VoucherType type, string memo, (string code, bool debit, decimal amt, string summary)[] lines)
    {
        var details = new List<VoucherDetail>();
        int sq = 1;
        foreach (var (code, debit, amt, summary) in lines)
        {
            var id = T(code);
            if (id == null) return; // required account missing → skip this voucher
            details.Add(new VoucherDetail { SeqNo = sq++, AccountTitleId = id.Value, IsDebit = debit, Amount = amt, Summary = summary });
        }
        if (details.Sum(d => d.IsDebit ? d.Amount : -d.Amount) != 0) return; // must balance
        vouchers.Add(new Voucher
        {
            VoucherNo = $"VS{date:yyyyMMdd}-{++seq:D3}",
            VoucherDate = date,
            Type = type,
            Status = VoucherStatus.Posted,
            TotalAmount = details.Where(d => d.IsDebit).Sum(d => d.Amount),
            Memo = memo,
            CreatedAt = date,
            Details = details,
        });
    }

    Console.WriteLine("[ACC] seeding vouchers (May–Jul 2026)...");
    foreach (var month in new[] { 5, 6, 7 })
    {
        var d = new DateTime(2026, month, 5);
        AddVoucher(d, VoucherType.CashOut, $"{month}月辦公室租金", new[] {
            ("6201", true, 45000m, "月租金"), ("1101", false, 45000m, "現金支付") });
        AddVoucher(new DateTime(2026, month, 10), VoucherType.CashOut, $"{month}月水電瓦斯費", new[] {
            ("6301", true, 6800m, "水電費"), ("1101", false, 6800m, "現金支付") });
        AddVoucher(new DateTime(2026, month, 5), VoucherType.CashOut, $"{month}月份薪資", new[] {
            ("6101", true, 1250000m, "員工薪資"), ("1101", false, 1250000m, "薪資轉帳") });
    }
    // sales revenue & purchase cost samples spread across the quarter
    for (int i = 0; i < 24; i++)
    {
        var date = new DateTime(2026, 5, 1).AddDays(rnd.Next(0, 88));
        var amt = rnd.Next(20, 300) * 1000m;
        AddVoucher(date, VoucherType.General, "銷貨收入認列", new[] {
            ("1103", true, amt, "應收帳款"), ("4101", false, amt, "銷貨收入") });
    }
    for (int i = 0; i < 12; i++)
    {
        var date = new DateTime(2026, 5, 1).AddDays(rnd.Next(0, 88));
        var amt = rnd.Next(15, 200) * 1000m;
        AddVoucher(date, VoucherType.General, "進貨入庫", new[] {
            ("1104", true, amt, "存貨"), ("2101", false, amt, "應付帳款") });
    }

    db.Vouchers.AddRange(vouchers);
    db.SaveChanges();
    Console.WriteLine($"[ACC] done: {vouchers.Count} balanced vouchers.");
}

static string MaskServer(string conn)
{
    var server = conn.Split(';').FirstOrDefault(p => p.TrimStart().StartsWith("Server", StringComparison.OrdinalIgnoreCase));
    return server ?? "(unknown server)";
}
