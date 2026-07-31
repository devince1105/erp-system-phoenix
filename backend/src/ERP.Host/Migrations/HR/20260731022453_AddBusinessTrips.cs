using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddBusinessTrips : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BusinessTripId",
                schema: "hr",
                table: "ExpenseClaims",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BusinessTrips",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    Destination = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessTrips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BusinessTrips_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseClaims_BusinessTripId",
                schema: "hr",
                table: "ExpenseClaims",
                column: "BusinessTripId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessTrips_EmployeeId",
                schema: "hr",
                table: "BusinessTrips",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExpenseClaims_BusinessTrips_BusinessTripId",
                schema: "hr",
                table: "ExpenseClaims",
                column: "BusinessTripId",
                principalSchema: "hr",
                principalTable: "BusinessTrips",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpenseClaims_BusinessTrips_BusinessTripId",
                schema: "hr",
                table: "ExpenseClaims");

            migrationBuilder.DropTable(
                name: "BusinessTrips",
                schema: "hr");

            migrationBuilder.DropIndex(
                name: "IX_ExpenseClaims_BusinessTripId",
                schema: "hr",
                table: "ExpenseClaims");

            migrationBuilder.DropColumn(
                name: "BusinessTripId",
                schema: "hr",
                table: "ExpenseClaims");
        }
    }
}
