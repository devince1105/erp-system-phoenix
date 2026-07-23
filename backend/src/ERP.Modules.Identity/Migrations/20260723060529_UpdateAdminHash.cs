using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Modules.Identity.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "id",
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$wcx..fmgwqAY4lQFtAsgxe4sh1/td0R/w/Thqh5Bunx09AzwQTWqO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "id",
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$wE4C3KkKqy.Wv.zO7O./e.bB13o0V0jO9sXn3bNqGq9uM.6Z6rWfG");
        }
    }
}
