using Microsoft.EntityFrameworkCore;
using ERP.Modules.CRM.Models;

namespace ERP.Modules.CRM.Data;

public class CRMDbContext : DbContext
{
    public CRMDbContext(DbContextOptions<CRMDbContext> options) : base(options) { }

    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<SalesOpportunity> Opportunities { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Isolate CRM tables in [crm] schema
        modelBuilder.HasDefaultSchema("crm");

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Opportunities)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
