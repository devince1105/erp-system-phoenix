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
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<GoodsReceipt> GoodsReceipts => Set<GoodsReceipt>();
    public DbSet<GoodsReceiptItem> GoodsReceiptItems => Set<GoodsReceiptItem>();
    public DbSet<DeliveryNote> DeliveryNotes => Set<DeliveryNote>();
    public DbSet<DeliveryNoteItem> DeliveryNoteItems => Set<DeliveryNoteItem>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<WarehouseStock> WarehouseStocks => Set<WarehouseStock>();
    public DbSet<StockTransfer> StockTransfers => Set<StockTransfer>();
    public DbSet<StockTransferItem> StockTransferItems => Set<StockTransferItem>();

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

        // StockMovement: Append-Only ledger
        modelBuilder.Entity<StockMovement>().ToTable("StockMovements");
        modelBuilder.Entity<StockMovement>()
            .Property(m => m.MovementType)
            .HasConversion<int>();
        modelBuilder.Entity<StockMovement>()
            .Property(m => m.CreatedAt)
            .ValueGeneratedOnAdd(); // Only set on insert, never update

        // Multi-Warehouse entities
        modelBuilder.Entity<Warehouse>().ToTable("Warehouses");
        modelBuilder.Entity<Warehouse>()
            .HasIndex(w => w.Code)
            .IsUnique();

        modelBuilder.Entity<WarehouseStock>().ToTable("WarehouseStocks");
        modelBuilder.Entity<WarehouseStock>()
            .HasIndex(ws => new { ws.WarehouseId, ws.ProductId })
            .IsUnique();

        modelBuilder.Entity<StockTransfer>().ToTable("StockTransfers");
        modelBuilder.Entity<StockTransfer>()
            .HasIndex(st => st.TransferNo)
            .IsUnique();
        modelBuilder.Entity<StockTransfer>()
            .Property(st => st.Status)
            .HasConversion<int>();
        modelBuilder.Entity<StockTransfer>()
            .HasOne(st => st.FromWarehouse)
            .WithMany()
            .HasForeignKey(st => st.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<StockTransfer>()
            .HasOne(st => st.ToWarehouse)
            .WithMany()
            .HasForeignKey(st => st.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransferItem>().ToTable("StockTransferItems");
    }
}
