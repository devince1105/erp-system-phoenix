using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.Inventory
{
    /// <inheritdoc />
    public partial class AddInventoryBPLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BusinessPartnerId",
                schema: "Inventory",
                table: "Partners",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusinessPartnerId",
                schema: "Inventory",
                table: "Partners");
        }
    }
}
