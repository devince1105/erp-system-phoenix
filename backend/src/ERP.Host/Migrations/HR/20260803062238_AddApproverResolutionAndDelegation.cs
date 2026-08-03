using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddApproverResolutionAndDelegation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DelegateEmployeeId",
                schema: "hr",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManagerId",
                schema: "hr",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApproverEmployeeId",
                schema: "hr",
                table: "ApprovalSteps",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SignedByEmployeeId",
                schema: "hr",
                table: "ApprovalSteps",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DelegateEmployeeId",
                schema: "hr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                schema: "hr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ApproverEmployeeId",
                schema: "hr",
                table: "ApprovalSteps");

            migrationBuilder.DropColumn(
                name: "SignedByEmployeeId",
                schema: "hr",
                table: "ApprovalSteps");
        }
    }
}
