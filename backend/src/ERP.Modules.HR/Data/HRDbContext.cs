using ERP.Modules.HR.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.HR.Data;

public class HRDbContext : DbContext
{
    public HRDbContext(DbContextOptions<HRDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<Experience> Experiences => Set<Experience>();
    public DbSet<JobHistory> JobHistories => Set<JobHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Department>()
            .HasOne(d => d.Manager)
            .WithMany()
            .HasForeignKey(d => d.ManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany()
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Education>()
            .HasOne(e => e.Employee)
            .WithMany(emp => emp.Educations)
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Experience>()
            .HasOne(e => e.Employee)
            .WithMany(emp => emp.Experiences)
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<JobHistory>()
            .HasOne(j => j.Employee)
            .WithMany(emp => emp.JobHistories)
            .HasForeignKey(j => j.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<JobHistory>()
            .HasOne(j => j.Department)
            .WithMany()
            .HasForeignKey(j => j.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
