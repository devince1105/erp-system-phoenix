using ERP.Modules.HR.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Data;

/// <summary>Seeds the default job-grade table (salary bands) if none exist. Idempotent.</summary>
public static class JobGradeSeeder
{
    public static async Task SeedAsync(HRDbContext db)
    {
        if (await db.JobGrades.AnyAsync()) return;

        var grades = new[]
        {
            new JobGrade { Code = "L1", Title = "助理 / 專員", MinSalary = 30000, MaxSalary = 40000, SortOrder = 1 },
            new JobGrade { Code = "L2", Title = "工程師 / 管理師", MinSalary = 40000, MaxSalary = 60000, SortOrder = 2 },
            new JobGrade { Code = "L3", Title = "高級工程師 / 高級管理師", MinSalary = 60000, MaxSalary = 80000, SortOrder = 3 },
            new JobGrade { Code = "M1", Title = "課長 / 副理", MinSalary = 70000, MaxSalary = 90000, SortOrder = 4 },
            new JobGrade { Code = "M2", Title = "經理 / 部門主管", MinSalary = 90000, MaxSalary = 130000, SortOrder = 5 },
            new JobGrade { Code = "D1", Title = "處長 / 總監", MinSalary = 130000, MaxSalary = 200000, SortOrder = 6 },
            new JobGrade { Code = "C1", Title = "總經理 / 執行長", MinSalary = 250000, MaxSalary = 9999999, SortOrder = 7 },
        };
        db.JobGrades.AddRange(grades);
        await db.SaveChangesAsync();
    }
}
