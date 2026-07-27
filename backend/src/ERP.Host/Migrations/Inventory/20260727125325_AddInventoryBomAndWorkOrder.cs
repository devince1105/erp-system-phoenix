using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Host.Migrations.Inventory
{
    /// <inheritdoc />
    public partial class AddInventoryBomAndWorkOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Boms",
                schema: "Inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Version = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Boms_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "Inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BomItems",
                schema: "Inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BomId = table.Column<int>(type: "int", nullable: false),
                    ComponentProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BomItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BomItems_Boms_BomId",
                        column: x => x.BomId,
                        principalSchema: "Inventory",
                        principalTable: "Boms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BomItems_Products_ComponentProductId",
                        column: x => x.ComponentProductId,
                        principalSchema: "Inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkOrders",
                schema: "Inventory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    BomId = table.Column<int>(type: "int", nullable: false),
                    PlannedQuantity = table.Column<int>(type: "int", nullable: false),
                    CompletedQuantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkOrders_Boms_BomId",
                        column: x => x.BomId,
                        principalSchema: "Inventory",
                        principalTable: "Boms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkOrders_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "Inventory",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BomItems_BomId",
                schema: "Inventory",
                table: "BomItems",
                column: "BomId");

            migrationBuilder.CreateIndex(
                name: "IX_BomItems_ComponentProductId",
                schema: "Inventory",
                table: "BomItems",
                column: "ComponentProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Boms_ProductId",
                schema: "Inventory",
                table: "Boms",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_BomId",
                schema: "Inventory",
                table: "WorkOrders",
                column: "BomId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_ProductId",
                schema: "Inventory",
                table: "WorkOrders",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BomItems",
                schema: "Inventory");

            migrationBuilder.DropTable(
                name: "WorkOrders",
                schema: "Inventory");

            migrationBuilder.DropTable(
                name: "Boms",
                schema: "Inventory");
        }
    }
}
