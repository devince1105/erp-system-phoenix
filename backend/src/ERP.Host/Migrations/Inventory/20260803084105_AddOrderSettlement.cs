using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.Inventory
{
    /// <inheritdoc />
    public partial class AddOrderSettlement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                schema: "Inventory",
                table: "SalesOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SettledAmount",
                schema: "Inventory",
                table: "SalesOrders",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                schema: "Inventory",
                table: "PurchaseOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SettledAmount",
                schema: "Inventory",
                table: "PurchaseOrders",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueDate",
                schema: "Inventory",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "SettledAmount",
                schema: "Inventory",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "DueDate",
                schema: "Inventory",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "SettledAmount",
                schema: "Inventory",
                table: "PurchaseOrders");
        }
    }
}
