using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomReportTemplates",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ReportType = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomReportTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomReportSections",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TemplateId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    AccountCodePrefixes = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsDebitPositive = table.Column<bool>(type: "bit", nullable: false),
                    IsSubtotal = table.Column<bool>(type: "bit", nullable: false),
                    FormulaExpression = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomReportSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomReportSections_CustomReportTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "acc",
                        principalTable: "CustomReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(3610));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4310));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(4320));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(7360), new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(8930) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(9090), new DateTime(2026, 9, 14, 12, 45, 22, 167, DateTimeKind.Utc).AddTicks(9100) });

            migrationBuilder.CreateIndex(
                name: "IX_CustomReportSections_TemplateId",
                schema: "acc",
                table: "CustomReportSections",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomReportSections",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "CustomReportTemplates",
                schema: "acc");

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(3890));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7430));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7440));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7440));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7440));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7440));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7460));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7460));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7460));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7460));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 10, 4, 35, 0, 624, DateTimeKind.Utc).AddTicks(7460));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 10, 4, 35, 0, 625, DateTimeKind.Utc).AddTicks(4510), new DateTime(2026, 8, 10, 4, 35, 0, 626, DateTimeKind.Utc).AddTicks(150) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 10, 4, 35, 0, 626, DateTimeKind.Utc).AddTicks(510), new DateTime(2026, 8, 10, 4, 35, 0, 626, DateTimeKind.Utc).AddTicks(520) });
        }
    }
}
