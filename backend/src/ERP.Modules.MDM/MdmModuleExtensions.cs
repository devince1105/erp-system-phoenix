using ERP.Modules.MDM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ERP.Modules.MDM;

public static class MdmModuleExtensions
{
    public static IServiceCollection AddMdmModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<MdmDbContext>(options =>
            options.UseSqlServer(connectionString,
                sqlOptions => sqlOptions.MigrationsAssembly("ERP.Host")));

        return services;
    }
}
