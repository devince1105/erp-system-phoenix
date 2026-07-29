using ERP.Modules.MDM.Data;
using ERP.Modules.MDM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.MDM.Controllers;

[ApiController]
[Route("api/mdm/[controller]")]
[Authorize]
public class BusinessPartnersController : ControllerBase
{
    private readonly MdmDbContext _context;

    public BusinessPartnersController(MdmDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<IEnumerable<BusinessPartner>>> GetAll(
        [FromQuery] BPRoleType? role = null,
        [FromQuery] bool? isActive = null)
    {
        var query = _context.BusinessPartners
            .Include(bp => bp.Roles)
            .AsQueryable();

        if (role.HasValue)
            query = query.Where(bp => bp.Roles.Any(r => r.RoleType == role.Value && r.IsActive));

        if (isActive.HasValue)
            query = query.Where(bp => bp.IsActive == isActive.Value);

        return await query.OrderBy(bp => bp.CompanyName).ToListAsync();
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<BusinessPartner>> GetById(int id)
    {
        var bp = await _context.BusinessPartners
            .Include(b => b.Roles)
            .FirstOrDefaultAsync(b => b.Id == id);

        return bp == null ? NotFound() : Ok(bp);
    }

    /// <summary>
    /// Query by 統一編號 (TaxId) — the canonical lookup to prevent duplicate entries.
    /// Use this BEFORE creating a new BP to check for existing records.
    /// </summary>
    [HttpGet("by-taxid/{taxId}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<BusinessPartner>> GetByTaxId(string taxId)
    {
        var bp = await _context.BusinessPartners
            .Include(b => b.Roles)
            .FirstOrDefaultAsync(b => b.TaxId == taxId);

        return bp == null ? NotFound() : Ok(bp);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BusinessPartner>> Create(BusinessPartner bp)
    {
        // Prevent duplicate TaxId
        if (await _context.BusinessPartners.AnyAsync(b => b.TaxId == bp.TaxId))
            return Conflict($"統一編號 {bp.TaxId} 已存在，請勿重複建檔。請使用 GET /by-taxid/{bp.TaxId} 查詢現有記錄。");

        bp.CreatedAt = DateTime.UtcNow;
        _context.BusinessPartners.Add(bp);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = bp.Id }, bp);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, BusinessPartner bp)
    {
        if (id != bp.Id) return BadRequest();

        var existing = await _context.BusinessPartners.FindAsync(id);
        if (existing == null) return NotFound();

        // TaxId cannot be changed after creation (it's the identity key)
        if (existing.TaxId != bp.TaxId)
            return BadRequest("統一編號不可修改。如需更正，請聯繫系統管理員。");

        existing.CompanyName = bp.CompanyName;
        existing.Address     = bp.Address;
        existing.Phone       = bp.Phone;
        existing.Email       = bp.Email;
        existing.BankInfo    = bp.BankInfo;
        existing.Remark      = bp.Remark;
        existing.IsActive    = bp.IsActive;
        existing.UpdatedAt   = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Activate a role for a BP (e.g. promote a customer to also be a supplier).
    /// </summary>
    [HttpPost("{id:int}/roles")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddRole(int id, [FromBody] BPRole role)
    {
        var bp = await _context.BusinessPartners.FindAsync(id);
        if (bp == null) return NotFound();

        // Prevent duplicate role
        if (await _context.BPRoles.AnyAsync(r => r.BusinessPartnerId == id && r.RoleType == role.RoleType))
            return Conflict($"此夥伴已具備 {role.RoleType} 角色。");

        role.BusinessPartnerId = id;
        role.ActivatedAt = DateTime.UtcNow;
        _context.BPRoles.Add(role);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"角色 {role.RoleType} 已啟用。" });
    }

    /// <summary>
    /// Deactivate a BP role (soft delete — preserves historical transaction links).
    /// </summary>
    [HttpDelete("{id:int}/roles/{roleType:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateRole(int id, BPRoleType roleType)
    {
        var role = await _context.BPRoles
            .FirstOrDefaultAsync(r => r.BusinessPartnerId == id && r.RoleType == roleType);

        if (role == null) return NotFound();

        role.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"角色 {roleType} 已停用。歷史交易紀錄保留不受影響。" });
    }
}
