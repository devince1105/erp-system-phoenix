using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddLunchBreakToAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "BreakInTime",
                table: "Attendances",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BreakOutTime",
                table: "Attendances",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BreakInTime",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "BreakOutTime",
                table: "Attendances");
        }
    }
}
