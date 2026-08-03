using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherAttachment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                schema: "acc",
                table: "Vouchers",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 698, DateTimeKind.Utc).AddTicks(9430));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(210));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "AccountTitles",
                keyColumn: "Id",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(220));

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(4050), new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(5770) });

            migrationBuilder.UpdateData(
                schema: "acc",
                table: "BankAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastSyncedAt" },
                values: new object[] { new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(5990), new DateTime(2026, 8, 3, 3, 56, 29, 699, DateTimeKind.Utc).AddTicks(5990) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                schema: "acc",
                table: "Vouchers");

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
    }
}
