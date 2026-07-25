using ERP.Modules.HR.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ERP.Modules.HR;

public static class HRModuleExtensions
{
    public static IServiceCollection AddHRModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("HRDb");

        services.AddDbContext<HRDbContext>(options =>
            options.UseSqlite(connectionString ?? "Data Source=hr.db", 
                b => b.MigrationsAssembly("ERP.Host")));

        return services;
    }
}
