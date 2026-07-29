using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherApprovalAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                schema: "acc",
                table: "Vouchers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByUserId",
                schema: "acc",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(5160));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6040));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6040));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6040));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6050));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6060));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6150));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6150));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6150));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6150));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 0, 51, 52, 563, DateTimeKind.Utc).AddTicks(6150));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 7, 29, 0, 51, 52, 564, DateTimeKind.Utc).AddTicks(170), new DateTime(2026, 7, 29, 0, 51, 52, 564, DateTimeKind.Utc).AddTicks(2080) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 7, 29, 0, 51, 52, 564, DateTimeKind.Utc).AddTicks(2340), new DateTime(2026, 7, 29, 0, 51, 52, 564, DateTimeKind.Utc).AddTicks(2340) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                schema: "acc",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                schema: "acc",
                table: "Vouchers");

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 894, DateTimeKind.Utc).AddTicks(840));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5180));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5190));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5200));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 24, 10, 47, 10, 896, DateTimeKind.Utc).AddTicks(5210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 7, 24, 10, 47, 10, 897, DateTimeKind.Utc).AddTicks(9790), new DateTime(2026, 7, 24, 10, 47, 10, 904, DateTimeKind.Utc).AddTicks(3020) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 7, 24, 10, 47, 10, 908, DateTimeKind.Utc).AddTicks(4120), new DateTime(2026, 7, 24, 10, 47, 10, 908, DateTimeKind.Utc).AddTicks(4130) });
        }
    }
}
