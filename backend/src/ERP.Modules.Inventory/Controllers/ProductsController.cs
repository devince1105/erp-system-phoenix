using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints require login
public class ProductsController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public ProductsController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Accountant,Employee")] // All roles can read product catalog
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products.ToListAsync();
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Accountant,Employee")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();
            
        return product;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")] // Only Admin can create products
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")] // Only Admin can update products
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id)
            return BadRequest();

        var existing = await _context.Products.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.Name = product.Name;
        existing.Sku = product.Sku;
        existing.SerialNumber = product.SerialNumber;
        existing.Description = product.Description;
        existing.UnitPrice = product.UnitPrice;
        existing.CostPrice = product.CostPrice;
        existing.StockQuantity = product.StockQuantity;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // Only Admin can delete products
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
