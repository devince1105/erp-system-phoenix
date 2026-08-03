using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class AddJournalTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JournalTemplates",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalTemplateLines",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JournalTemplateId = table.Column<int>(type: "int", nullable: false),
                    AccountTitleId = table.Column<int>(type: "int", nullable: false),
                    IsDebit = table.Column<bool>(type: "bit", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalTemplateLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JournalTemplateLines_AccountTitles_AccountTitleId",
                        column: x => x.AccountTitleId,
                        principalSchema: "acc",
                        principalTable: "AccountTitles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JournalTemplateLines_JournalTemplates_JournalTemplateId",
                        column: x => x.JournalTemplateId,
                        principalSchema: "acc",
                        principalTable: "JournalTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_JournalTemplateLines_AccountTitleId",
                schema: "acc",
                table: "JournalTemplateLines",
                column: "AccountTitleId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalTemplateLines_JournalTemplateId",
                schema: "acc",
                table: "JournalTemplateLines",
                column: "JournalTemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JournalTemplateLines",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "JournalTemplates",
                schema: "acc");

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
    }
}
