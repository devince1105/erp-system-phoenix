using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Modules.Accounting.Migrations
{
    /// <inheritdoc />
    public partial class InitialAccountingSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "acc");

            migrationBuilder.CreateTable(
                name: "AccountTitles",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountTitles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountTitles_AccountTitles_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "acc",
                        principalTable: "AccountTitles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VoucherNo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    VoucherDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Memo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vouchers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BankAccounts",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BankCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BranchName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    AccountTitleId = table.Column<int>(type: "int", nullable: true),
                    ApiType = table.Column<int>(type: "int", nullable: false),
                    ApiEndpoint = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ApiClientId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankAccounts_AccountTitles_AccountTitleId",
                        column: x => x.AccountTitleId,
                        principalSchema: "acc",
                        principalTable: "AccountTitles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VoucherDetails",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VoucherId = table.Column<int>(type: "int", nullable: false),
                    SeqNo = table.Column<int>(type: "int", nullable: false),
                    AccountTitleId = table.Column<int>(type: "int", nullable: false),
                    IsDebit = table.Column<bool>(type: "bit", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VoucherDetails_AccountTitles_AccountTitleId",
                        column: x => x.AccountTitleId,
                        principalSchema: "acc",
                        principalTable: "AccountTitles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VoucherDetails_Vouchers_VoucherId",
                        column: x => x.VoucherId,
                        principalSchema: "acc",
                        principalTable: "Vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "acc",
                table: "AccountTitles",
                columns: new[] { "Id", "Category", "Code", "CreatedAt", "IsActive", "Level", "Name", "ParentId" },
                values: new object[,]
                {
                    { 1, 1, "1101", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(4980), true, 1, "現金及約當現金", null },
                    { 2, 1, "1102", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5600), true, 1, "銀行存款", null },
                    { 3, 1, "1103", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5600), true, 1, "應收帳款", null },
                    { 4, 1, "1104", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5600), true, 1, "存貨", null },
                    { 5, 1, "1401", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5600), true, 1, "不動產、廠房及設備", null },
                    { 6, 2, "2101", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5600), true, 1, "應付帳款", null },
                    { 7, 2, "2102", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "應付薪資", null },
                    { 8, 2, "2103", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "應付稅額", null },
                    { 9, 2, "2201", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "長期借款", null },
                    { 10, 3, "3101", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "普通股股本", null },
                    { 11, 3, "3201", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "保留盈餘", null },
                    { 12, 4, "4101", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "銷貨收入", null },
                    { 13, 4, "4201", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "勞務收入", null },
                    { 14, 5, "5101", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "銷貨成本", null },
                    { 15, 5, "6101", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "薪資支出", null },
                    { 16, 5, "6201", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "租金支出", null },
                    { 17, 5, "6301", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "水電瓦斯費", null },
                    { 18, 5, "6401", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(5610), true, 1, "文具用品", null }
                });

            migrationBuilder.InsertData(
                schema: "acc",
                table: "BankAccounts",
                columns: new[] { "Id", "AccountName", "AccountNumber", "AccountTitleId", "ApiClientId", "ApiEndpoint", "ApiType", "Balance", "BankCode", "BankName", "BranchName", "CreatedAt", "Currency", "IsActive", "LastSyncedAt" },
                values: new object[,]
                {
                    { 1, "○○企業股份有限公司", "0808-988-123456", 2, "ESUN_ERP_CLIENT_2026", "https://api.esunbank.com.tw/open-banking/v1", 2, 1280500m, "808", "玉山銀行", "營業部", new DateTime(2026, 7, 23, 5, 36, 52, 139, DateTimeKind.Utc).AddTicks(8470), "TWD", true, new DateTime(2026, 7, 23, 5, 36, 52, 140, DateTimeKind.Utc).AddTicks(30) },
                    { 2, "○○企業股份有限公司", "0130-100-888999", 2, "CATHAY_SANDBOX_KEY", "https://sandbox.cathaybk.com.tw/v1", 1, 650000m, "013", "國泰世華銀行", "敦南分行", new DateTime(2026, 7, 23, 5, 36, 52, 140, DateTimeKind.Utc).AddTicks(270), "TWD", true, new DateTime(2026, 7, 23, 5, 36, 52, 140, DateTimeKind.Utc).AddTicks(280) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountTitles_ParentId",
                schema: "acc",
                table: "AccountTitles",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_AccountTitleId",
                schema: "acc",
                table: "BankAccounts",
                column: "AccountTitleId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherDetails_AccountTitleId",
                schema: "acc",
                table: "VoucherDetails",
                column: "AccountTitleId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherDetails_VoucherId",
                schema: "acc",
                table: "VoucherDetails",
                column: "VoucherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BankAccounts",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "VoucherDetails",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "AccountTitles",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "Vouchers",
                schema: "acc");
        }
    }
}
