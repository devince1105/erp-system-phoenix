using ERP.Modules.Identity.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace ERP.Modules.Identity.Data;

public class ERPIdentityDbContext : DbContext
{
    public ERPIdentityDbContext(DbContextOptions<ERPIdentityDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Isolate Identity tables in [id] schema
        modelBuilder.HasDefaultSchema("id");

        // Composite key for UserRole
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);

        // Seed Default Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Accountant" },
            new Role { Id = 3, Name = "Employee" }
        );

        // Seed Default Admin User
        // Pre-computed hash for 'Admin123!'
        var adminPasswordHash = "$2a$11$wcx..fmgwqAY4lQFtAsgxe4sh1/td0R/w/Thqh5Bunx09AzwQTWqO";
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@nexus-erp.com",
                FullName = "System Administrator",
                PasswordHash = adminPasswordHash,
                IsActive = true,
                CreatedAt = new DateTime(2026, 7, 23, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Assign Admin role to Admin user
        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1 }
        );
    }
}
