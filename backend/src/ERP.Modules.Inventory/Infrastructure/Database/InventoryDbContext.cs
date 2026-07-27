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
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<InventoryStock> InventoryStocks => Set<InventoryStock>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderItem> SalesOrderItems => Set<SalesOrderItem>();
    public DbSet<Bom> Boms => Set<Bom>();
    public DbSet<BomItem> BomItems => Set<BomItem>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();

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
        modelBuilder.Entity<Warehouse>().ToTable("Warehouses");
        modelBuilder.Entity<InventoryStock>().ToTable("InventoryStocks");
        modelBuilder.Entity<Partner>().ToTable("Partners");
        modelBuilder.Entity<PurchaseOrder>().ToTable("PurchaseOrders");
        modelBuilder.Entity<PurchaseOrderItem>().ToTable("PurchaseOrderItems");
        modelBuilder.Entity<SalesOrder>().ToTable("SalesOrders");
        modelBuilder.Entity<SalesOrderItem>().ToTable("SalesOrderItems");
        
        modelBuilder.Entity<Bom>().ToTable("Boms");
        modelBuilder.Entity<BomItem>().ToTable("BomItems");
        modelBuilder.Entity<WorkOrder>().ToTable("WorkOrders");

        modelBuilder.Entity<WorkOrder>()
            .Property(w => w.Status)
            .HasConversion<int>();
            
        modelBuilder.Entity<BomItem>()
            .HasOne(b => b.ComponentProduct)
            .WithMany()
            .HasForeignKey(b => b.ComponentProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.Product)
            .WithMany()
            .HasForeignKey(w => w.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.Bom)
            .WithMany()
            .HasForeignKey(w => w.BomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
