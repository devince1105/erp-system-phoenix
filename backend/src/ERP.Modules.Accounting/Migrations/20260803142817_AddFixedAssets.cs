using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class AddFixedAssets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FixedAssets",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    AcquisitionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcquisitionCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalvageValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UsefulLifeMonths = table.Column<int>(type: "int", nullable: false),
                    AccumulatedDepreciation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LastDepreciatedPeriod = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FixedAssets", x => x.Id);
                });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(3330));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(4220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 3, 14, 28, 17, 38, DateTimeKind.Utc).AddTicks(8590), new DateTime(2026, 8, 3, 14, 28, 17, 39, DateTimeKind.Utc).AddTicks(280) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 3, 14, 28, 17, 39, DateTimeKind.Utc).AddTicks(460), new DateTime(2026, 8, 3, 14, 28, 17, 39, DateTimeKind.Utc).AddTicks(460) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FixedAssets",
                schema: "acc");

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(400));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(1210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 3, 14, 16, 10, 369, DateTimeKind.Utc).AddTicks(9040), new DateTime(2026, 8, 3, 14, 16, 10, 370, DateTimeKind.Utc).AddTicks(4320) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 3, 14, 16, 10, 370, DateTimeKind.Utc).AddTicks(4810), new DateTime(2026, 8, 3, 14, 16, 10, 370, DateTimeKind.Utc).AddTicks(4810) });
        }
    }
}
