using ERP.Modules.Accounting.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ERP.Modules.Accounting.Services;
using ERP.Shared.Interfaces.Accounting;

namespace ERP.Modules.Accounting;

public static class AccountingModuleExtensions
{
    public static IServiceCollection AddAccountingModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AccountingDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            
        // Register module-specific services or repositories here
        services.AddScoped<IAccountingIntegrationService, AccountingIntegrationService>();
        
        return services;
    }
}
