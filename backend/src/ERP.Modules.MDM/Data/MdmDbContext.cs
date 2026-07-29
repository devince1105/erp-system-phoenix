using ERP.Modules.MDM.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.MDM.Data;

public class MdmDbContext : DbContext
{
    public MdmDbContext(DbContextOptions<MdmDbContext> options) : base(options) { }

    public DbSet<BusinessPartner> BusinessPartners { get; set; } = null!;
    public DbSet<BPRole> BPRoles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Isolate MDM tables in [mdm] schema
        modelBuilder.HasDefaultSchema("mdm");

        // BusinessPartner: TaxId must be unique globally
        modelBuilder.Entity<BusinessPartner>()
            .HasIndex(bp => bp.TaxId)
            .IsUnique()
            .HasDatabaseName("IX_BusinessPartner_TaxId");

        // BPRole: one BP can have each role at most once
        modelBuilder.Entity<BPRole>()
            .HasIndex(r => new { r.BusinessPartnerId, r.RoleType })
            .IsUnique()
            .HasDatabaseName("IX_BPRole_BP_RoleType");

        modelBuilder.Entity<BPRole>()
            .Property(r => r.RoleType)
            .HasConversion<int>();

        // Relationship: BusinessPartner → BPRoles
        modelBuilder.Entity<BusinessPartner>()
            .HasMany(bp => bp.Roles)
            .WithOne(r => r.BP)
            .HasForeignKey(r => r.BusinessPartnerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
