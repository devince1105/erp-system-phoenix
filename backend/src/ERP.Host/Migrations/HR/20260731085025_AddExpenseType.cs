using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.HR
{
    /// <inheritdoc />
    public partial class AddExpenseType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExpenseType",
                schema: "hr",
                table: "ExpenseClaims",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Travel");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpenseType",
                schema: "hr",
                table: "ExpenseClaims");
        }
    }
}
