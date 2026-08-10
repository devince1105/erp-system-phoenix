using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class AddNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoteNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Direction = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Instrument = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PartnerName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClearedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Memo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notes",
                schema: "acc");

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
    }
}
