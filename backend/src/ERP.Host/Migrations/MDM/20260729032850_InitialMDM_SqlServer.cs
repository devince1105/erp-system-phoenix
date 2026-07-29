using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.MDM
{
    /// <inheritdoc />
    public partial class InitialMDM_SqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "mdm");

            migrationBuilder.CreateTable(
                name: "BusinessPartners",
                schema: "mdm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaxId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankInfo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessPartners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BPRoles",
                schema: "mdm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BusinessPartnerId = table.Column<int>(type: "int", nullable: false),
                    RoleType = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PriceLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SalesRep = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentTerms = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LeadTimeDays = table.Column<int>(type: "int", nullable: true),
                    MinOrderQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BPRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BPRoles_BusinessPartners_BusinessPartnerId",
                        column: x => x.BusinessPartnerId,
                        principalSchema: "mdm",
                        principalTable: "BusinessPartners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BPRole_BP_RoleType",
                schema: "mdm",
                table: "BPRoles",
                columns: new[] { "BusinessPartnerId", "RoleType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BusinessPartner_TaxId",
                schema: "mdm",
                table: "BusinessPartners",
                column: "TaxId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BPRoles",
                schema: "mdm");

            migrationBuilder.DropTable(
                name: "BusinessPartners",
                schema: "mdm");
        }
    }
}
