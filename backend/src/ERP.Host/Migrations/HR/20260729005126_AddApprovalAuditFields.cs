using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddApprovalAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                schema: "hr",
                table: "OvertimeRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByUserId",
                schema: "hr",
                table: "OvertimeRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectedReason",
                schema: "hr",
                table: "OvertimeRequests",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                schema: "hr",
                table: "LeaveRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByUserId",
                schema: "hr",
                table: "LeaveRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectedReason",
                schema: "hr",
                table: "LeaveRequests",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                schema: "hr",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                schema: "hr",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "RejectedReason",
                schema: "hr",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                schema: "hr",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                schema: "hr",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "RejectedReason",
                schema: "hr",
                table: "LeaveRequests");
        }
    }
}
