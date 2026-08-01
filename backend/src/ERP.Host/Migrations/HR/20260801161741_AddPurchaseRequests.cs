using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddPurchaseRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PurchaseRequestId",
                schema: "hr",
                table: "ExpenseClaims",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PurchaseRequests",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseClaims_PurchaseRequestId",
                schema: "hr",
                table: "ExpenseClaims",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_EmployeeId",
                schema: "hr",
                table: "PurchaseRequests",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExpenseClaims_PurchaseRequests_PurchaseRequestId",
                schema: "hr",
                table: "ExpenseClaims",
                column: "PurchaseRequestId",
                principalSchema: "hr",
                principalTable: "PurchaseRequests",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpenseClaims_PurchaseRequests_PurchaseRequestId",
                schema: "hr",
                table: "ExpenseClaims");

            migrationBuilder.DropTable(
                name: "PurchaseRequests",
                schema: "hr");

            migrationBuilder.DropIndex(
                name: "IX_ExpenseClaims_PurchaseRequestId",
                schema: "hr",
                table: "ExpenseClaims");

            migrationBuilder.DropColumn(
                name: "PurchaseRequestId",
                schema: "hr",
                table: "ExpenseClaims");
        }
    }
}
