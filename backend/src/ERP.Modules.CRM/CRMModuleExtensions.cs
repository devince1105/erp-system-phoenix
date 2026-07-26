using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using ERP.Modules.CRM.Data;

namespace ERP.Modules.CRM;

public static class CRMModuleExtensions
{
    public static IServiceCollection AddCRMModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CRMDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("CRMConnection"), 
                b => b.MigrationsAssembly("ERP.Host")));

        return services;
    }
}
