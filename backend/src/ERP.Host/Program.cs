using ERP.Host.Infrastructure;
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

// 3. Configure OpenAPI & Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "ERP Phoenix API",
        Version = "v1",
        Description = "Enterprise Resource Planning System API"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme (e.g. 'Bearer {token}')",
        Name = "Authorization",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Type = Microsoft.OpenApi.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    var schemeRef = new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", null, null);
    c.AddSecurityRequirement(doc => new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        { schemeRef, new List<string>() }
    });

    c.CustomSchemaIds(type => type.FullName?.Replace("+", ".") ?? type.Name);
});

var app = builder.Build();

// 4. Configure HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ERP Phoenix API v1");
    c.RoutePrefix = "swagger";
});

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

app.MapControllers();

// 5. Database Migration and Seeding Handling
var isMigrateOnly = args.Contains("--migrate-only");
var isSkipMigration = args.Contains("--skip-migration");
var forceSeedDemo = args.Contains("--seed-demo");

if (isMigrateOnly)
{
    var migrationSuccess = await DatabaseMigrationRunner.RunAsync(
        app.Services, 
        app.Environment.IsDevelopment(), 
        forceSeedDemo);

    return migrationSuccess ? 0 : 1;
}

if (!isSkipMigration)
{
    var migrationSuccess = await DatabaseMigrationRunner.RunAsync(
        app.Services, 
        app.Environment.IsDevelopment(), 
        forceSeedDemo);

    if (!migrationSuccess && !app.Environment.IsDevelopment())
    {
        // 在生產環境下若 Migration 失敗，直接拒絕啟動以防資料結構不一致
        return 1;
    }
}
else
{
    var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("ERP.Host.Program");
    logger.LogInformation("⏩ [--skip-migration] Database migration skipped by configuration/flag.");
}

await app.RunAsync();
return 0;
