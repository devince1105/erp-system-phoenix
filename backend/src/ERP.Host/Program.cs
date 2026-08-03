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
using ERP.Modules.MDM;
using ERP.Modules.MDM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Amazon.S3;
using ERP.Host.Storage;
using ERP.Shared.Interfaces;
using Microsoft.Extensions.FileProviders;

// Load the repo-root .env into environment variables so the backend shares the
// same config file as docker-compose (used for R2 / object-storage settings).
DotNetEnv.Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// 1. Add Core Platform Services
// CORS: restrict to configured origins. Set Cors:AllowedOrigins (array) in
// configuration for production; falls back to local dev origins otherwise.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:3100" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddMemoryCache();

// Receipt storage: Cloudflare R2 (S3-compatible) when configured via .env,
// otherwise fall back to local wwwroot storage for development.
var r2Account = Environment.GetEnvironmentVariable("R2_ACCOUNT_ID");
var r2Bucket = Environment.GetEnvironmentVariable("R2_BUCKET");
var r2Key = Environment.GetEnvironmentVariable("R2_ACCESS_KEY_ID");
var r2Secret = Environment.GetEnvironmentVariable("R2_SECRET_ACCESS_KEY");
var r2Public = Environment.GetEnvironmentVariable("R2_PUBLIC_BASE_URL");
if (!string.IsNullOrWhiteSpace(r2Account) && !string.IsNullOrWhiteSpace(r2Bucket)
    && !string.IsNullOrWhiteSpace(r2Key) && !string.IsNullOrWhiteSpace(r2Secret)
    && !string.IsNullOrWhiteSpace(r2Public))
{
    var s3 = new AmazonS3Client(r2Key, r2Secret, new AmazonS3Config
    {
        ServiceURL = $"https://{r2Account}.r2.cloudflarestorage.com",
        ForcePathStyle = true,
    });
    builder.Services.AddSingleton<IReceiptStorage>(new R2ReceiptStorage(s3, r2Bucket, r2Public));
    Console.WriteLine($"[Storage] Receipts -> Cloudflare R2 bucket '{r2Bucket}'");
}
else
{
    builder.Services.AddScoped<IReceiptStorage, LocalReceiptStorage>();
    Console.WriteLine("[Storage] Receipts -> local wwwroot (R2 not configured)");
}

builder.Services.AddControllers()
    .AddApplicationPart(typeof(ERP.Modules.Identity.IdentityModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.Accounting.AccountingModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.Inventory.InventoryModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.HR.HRModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.CRM.CRMModuleExtensions).Assembly)
    .AddApplicationPart(typeof(ERP.Modules.MDM.MdmModuleExtensions).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key is not configured. Set it via user-secrets (dev) or environment / secret store (prod).");

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
builder.Services.AddMdmModule(builder.Configuration);

// 3. Configure OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// 4. Configure HTTP request pipeline.
app.MapOpenApi();

app.UseCors("AppCors");
app.UseHttpsRedirection();

// Serve uploaded files (e.g. expense receipts). Use an explicit provider so it
// works even when wwwroot did not exist when the app started.
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(wwwrootPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(wwwrootPath),
});

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

    // Seed default approval workflows for any form type that has none (idempotent).
    scope.ServiceProvider.GetRequiredService<ERP.Modules.HR.Services.ApprovalService>()
        .SeedWorkflowsAsync().GetAwaiter().GetResult();

    // Migrate CRM Module Database
    var crmDb = scope.ServiceProvider.GetRequiredService<CRMDbContext>();
    crmDb.Database.Migrate();

    // Migrate MDM Module Database
    var mdmDb = scope.ServiceProvider.GetRequiredService<MdmDbContext>();
    mdmDb.Database.Migrate();

    // Development-only: seed demo role accounts (會計/業務/人資) for role testing.
    if (app.Environment.IsDevelopment())
        ERP.Modules.Identity.Data.IdentityDemoSeeder.SeedAsync(identityDb).GetAwaiter().GetResult();
}

app.Run();
