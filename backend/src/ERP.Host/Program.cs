using ERP.Modules.Identity;
using ERP.Modules.Identity.Data;
using ERP.Modules.Accounting;
using ERP.Modules.Accounting.Data;
using ERP.Modules.Inventory;
using ERP.Modules.Inventory.Infrastructure.Database;
using ERP.Modules.HR;
using ERP.Modules.HR.Data;
using ERP.Modules.CRM;
using ERP.Modules.CRM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Core Platform Services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddMemoryCache();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(ERP.Modules.Identity.IdentityModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.Accounting.AccountingModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.Inventory.InventoryModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.HR.HRModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.CRM.CRMModuleExtensions).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? "nexus_erp_very_secure_secret_key_2026_!@#";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "nexus-erp",
        ValidAudience = jwtSettings["Audience"] ?? "nexus-erp-users",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// 2. Load Modular Plugins
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddAccountingModule(builder.Configuration);
builder.Services.AddInventoryModule(builder.Configuration);
builder.Services.AddHRModule(builder.Configuration);
builder.Services.AddCRMModule(builder.Configuration);

// 3. Configure OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// 4. Configure HTTP request pipeline.
app.MapOpenApi();

app.UseCors("AllowAll");
app.UseHttpsRedirection();

app.UseAuthentication(); // Must be before Authorization
app.UseAuthorization();

app.MapControllers();

// 5. Auto Migrate Database on Startup for each Module
using (var scope = app.Services.CreateScope())
{
    // Migrate Identity Module Database
    var identityDb = scope.ServiceProvider.GetRequiredService<ERPIdentityDbContext>();
    identityDb.Database.Migrate();

    // Migrate Accounting Module Database
    var accountingDb = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();
    accountingDb.Database.Migrate();
    
    // Migrate Inventory Module Database
    var inventoryDb = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    inventoryDb.Database.Migrate();

    // Migrate HR Module Database
    var hrDb = scope.ServiceProvider.GetRequiredService<HRDbContext>();
    hrDb.Database.Migrate();
}

app.Run();
