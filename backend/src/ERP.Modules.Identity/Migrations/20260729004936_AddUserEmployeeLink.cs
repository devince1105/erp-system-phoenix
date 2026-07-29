using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Identity.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEmployeeLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                schema: "id",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "id",
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "EmployeeId",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmployeeId",
                schema: "id",
                table: "Users");
        }
    }
}
