using ERP.Modules.Identity.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Identity.Data;

/// <summary>
/// Seeds demo login accounts for role testing (會計 / 業務 / 人資 …), linked to the
/// matching department-manager employees so approval role-control and salary
/// gating can be exercised. Idempotent, and intended for Development only — the
/// accounts share a weak demo password and must never be seeded in production.
/// </summary>
public static class IdentityDemoSeeder
{
    private const string DemoPassword = "Admin123!"; // demo only — same as the admin demo login

    public static async Task SeedAsync(ERPIdentityDbContext db)
    {
        // 1. Ensure the roles referenced by authorization exist.
        string[] roleNames = { "Admin", "Accountant", "Employee", "HR", "Sales", "Manager" };
        foreach (var name in roleNames)
            if (!await db.Roles.AnyAsync(r => r.Name == name))
                db.Roles.Add(new Role { Name = name });
        await db.SaveChangesAsync();

        var roleId = await db.Roles.ToDictionaryAsync(r => r.Name, r => r.Id);

        // 2. Demo accounts. EmployeeId points at each department's manager employee
        //    (業務部=1, 會計部=2, 人資部=3) so the employee_id claim drives approver
        //    resolution and "only my pending" filtering.
        var accounts = new[]
        {
            (Username: "hr",         FullName: "許家豪 (人資主管)", Email: "hr@nexus-erp.com",         Role: "HR",         EmployeeId: 3),
            (Username: "accountant", FullName: "陳淑芬 (會計主管)", Email: "accountant@nexus-erp.com", Role: "Accountant", EmployeeId: 2),
            (Username: "sales",      FullName: "洪志明 (業務主管)", Email: "sales@nexus-erp.com",      Role: "Sales",      EmployeeId: 1),
        };

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword);

        foreach (var acc in accounts)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == acc.Username);
            if (user is null)
            {
                user = new User
                {
                    Username = acc.Username,
                    FullName = acc.FullName,
                    Email = acc.Email,
                    PasswordHash = passwordHash,
                    IsActive = true,
                    EmployeeId = acc.EmployeeId,
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }

            if (roleId.TryGetValue(acc.Role, out var rid)
                && !await db.UserRoles.AnyAsync(ur => ur.UserId == user.Id && ur.RoleId == rid))
            {
                db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = rid });
            }
        }
        await db.SaveChangesAsync();
    }
}
