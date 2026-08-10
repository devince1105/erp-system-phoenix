using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddJobGrades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "JobGradeId",
                schema: "hr",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JobGrades",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    MinSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobGrades", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_JobGradeId",
                schema: "hr",
                table: "Employees",
                column: "JobGradeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_JobGrades_JobGradeId",
                schema: "hr",
                table: "Employees",
                column: "JobGradeId",
                principalSchema: "hr",
                principalTable: "JobGrades",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_JobGrades_JobGradeId",
                schema: "hr",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "JobGrades",
                schema: "hr");

            migrationBuilder.DropIndex(
                name: "IX_Employees_JobGradeId",
                schema: "hr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "JobGradeId",
                schema: "hr",
                table: "Employees");
        }
    }
}
