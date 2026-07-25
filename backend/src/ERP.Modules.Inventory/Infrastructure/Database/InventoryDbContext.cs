using ERP.Modules.Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Infrastructure.Database;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderItem> SalesOrderItems => Set<SalesOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Define schemas to isolate module tables
        modelBuilder.HasDefaultSchema("Inventory");
        
        modelBuilder.Entity<Partner>()
            .Property(p => p.Type)
            .HasConversion<int>();
            
        modelBuilder.Entity<PurchaseOrder>()
            .Property(p => p.Status)
            .HasConversion<int>();
            
        modelBuilder.Entity<SalesOrder>()
            .Property(p => p.Status)
            .HasConversion<int>();
            
        // Setup table names
        modelBuilder.Entity<Product>().ToTable("Products");
        modelBuilder.Entity<Partner>().ToTable("Partners");
        modelBuilder.Entity<PurchaseOrder>().ToTable("PurchaseOrders");
        modelBuilder.Entity<PurchaseOrderItem>().ToTable("PurchaseOrderItems");
        modelBuilder.Entity<SalesOrder>().ToTable("SalesOrders");
        modelBuilder.Entity<SalesOrderItem>().ToTable("SalesOrderItems");
    }
}
