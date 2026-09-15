using System.Diagnostics;
using ERP.Modules.Accounting.Data;
using ERP.Modules.CRM.Data;
using ERP.Modules.HR.Data;
using ERP.Modules.HR.Services;
using ERP.Modules.Identity.Data;
using ERP.Modules.Inventory.Infrastructure.Database;
using ERP.Modules.MDM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ERP.Host.Infrastructure;

/// <summary>
/// 集中管理所有模組之 EF Core Migration 與基礎種子資料 (Seeder) 之執行器。
/// 支援非同步平行/循序遷移、結構化日誌輸出、模組耗時統計，並可獨立於 Web Host 執行。
/// </summary>
public static class DatabaseMigrationRunner
{
    public static async Task<bool> RunAsync(
        IServiceProvider services,
        bool isDevelopment,
        bool seedDemo = false,
        CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("ERP.Host.DatabaseMigrationRunner");

        var totalStopwatch = Stopwatch.StartNew();
        logger.LogInformation("=================================================");
        logger.LogInformation("🚀 [MigrationRunner] Starting Database Migrations...");
        logger.LogInformation("Environment: {Env} | Force Seed Demo: {SeedDemo}", 
            isDevelopment ? "Development" : "Production", seedDemo);
        logger.LogInformation("=================================================");

        try
        {
            // 1. Identity Module (基礎身份與角色)
            await MigrateModuleAsync(
                "Identity",
                logger,
                async () =>
                {
                    var db = scope.ServiceProvider.GetRequiredService<ERPIdentityDbContext>();
                    await db.Database.MigrateAsync(cancellationToken);

                    if (isDevelopment || seedDemo)
                    {
                        logger.LogInformation("   ↳ Seeding Identity demo role accounts (Admin, Accountant, Sales, HR)...");
                        await IdentityDemoSeeder.SeedAsync(db);
                    }
                });

            // 2. Accounting Module (會計科目、範本、折舊、自訂報表)
            await MigrateModuleAsync(
                "Accounting",
                logger,
                async () =>
                {
                    var db = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();
                    await db.Database.MigrateAsync(cancellationToken);

                    logger.LogInformation("   ↳ Seeding Journal Templates...");
                    await JournalTemplateSeeder.SeedAsync(db);

                    logger.LogInformation("   ↳ Seeding Depreciation Accounts...");
                    await DepreciationAccountSeeder.SeedAsync(db);

                    logger.LogInformation("   ↳ Seeding Custom Financial Report Templates...");
                    await CustomReportSeeder.SeedAsync(db);
                });

            // 3. Inventory Module (多倉庫主檔、履約鏈歷史回補)
            await MigrateModuleAsync(
                "Inventory",
                logger,
                async () =>
                {
                    var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
                    await db.Database.MigrateAsync(cancellationToken);

                    logger.LogInformation("   ↳ Backfilling Inventory fulfillment chains (Goods Receipts & Delivery Notes)...");
                    await InventoryChainSeeder.BackfillAsync(db);

                    logger.LogInformation("   ↳ Seeding Multi-Warehouse data...");
                    await MultiWarehouseSeeder.SeedAsync(db);
                });

            // 4. HR Module (人事簽核引擎、職等薪級表)
            await MigrateModuleAsync(
                "HR",
                logger,
                async () =>
                {
                    var db = scope.ServiceProvider.GetRequiredService<HRDbContext>();
                    await db.Database.MigrateAsync(cancellationToken);

                    logger.LogInformation("   ↳ Seeding HR Approval workflows...");
                    var approvalService = scope.ServiceProvider.GetRequiredService<ApprovalService>();
                    await approvalService.SeedWorkflowsAsync();

                    logger.LogInformation("   ↳ Seeding HR Job Grades (Salary Bands)...");
                    await JobGradeSeeder.SeedAsync(db);
                });

            // 5. CRM Module (客戶與商機管理)
            await MigrateModuleAsync(
                "CRM",
                logger,
                async () =>
                {
                    var db = scope.ServiceProvider.GetRequiredService<CRMDbContext>();
                    await db.Database.MigrateAsync(cancellationToken);
                });

            // 6. MDM Module (主資料管理)
            await MigrateModuleAsync(
                "MDM",
                logger,
                async () =>
                {
                    var db = scope.ServiceProvider.GetRequiredService<MdmDbContext>();
                    await db.Database.MigrateAsync(cancellationToken);
                });

            totalStopwatch.Stop();
            logger.LogInformation("=================================================");
            logger.LogInformation("✅ [MigrationRunner] All database migrations completed successfully in {ElapsedMilliseconds} ms.", 
                totalStopwatch.ElapsedMilliseconds);
            logger.LogInformation("=================================================");
            return true;
        }
        catch (Exception ex)
        {
            totalStopwatch.Stop();
            logger.LogError(ex, "❌ [MigrationRunner] Database migration failed after {ElapsedMilliseconds} ms: {Message}", 
                totalStopwatch.ElapsedMilliseconds, ex.Message);
            return false;
        }
    }

    private static async Task MigrateModuleAsync(
        string moduleName,
        ILogger logger,
        Func<Task> action)
    {
        var sw = Stopwatch.StartNew();
        logger.LogInformation("➡️ [{Module}] Migrating and seeding...", moduleName);
        await action();
        sw.Stop();
        logger.LogInformation("✔️ [{Module}] Completed in {ElapsedMilliseconds} ms.", moduleName, sw.ElapsedMilliseconds);
    }
}
