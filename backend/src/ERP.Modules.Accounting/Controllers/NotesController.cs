using ERP.Modules.Accounting.Data;
using ERP.Modules.Accounting.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Accounting.Controllers;

/// <summary>票據管理 (支票/本票). Read: any authenticated; manage + clear: Admin/Accountant.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly AccountingDbContext _context;

    public NotesController(AccountingDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Note>>> GetAll()
    {
        return await _context.Notes.OrderBy(n => n.DueDate).ToListAsync();
    }

    public record NoteDto(string Direction, string Instrument, string PartnerName, string? BankName, decimal Amount, DateTime IssueDate, DateTime DueDate, string? Memo);

    [HttpPost]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Create([FromBody] NoteDto dto)
    {
        if (dto.Amount <= 0) return BadRequest(new { message = "票面金額須大於 0。" });
        if (string.IsNullOrWhiteSpace(dto.PartnerName)) return BadRequest(new { message = "請填寫對象。" });

        var prefix = dto.Direction == "Payable" ? "NP-" : "NR-";
        var count = await _context.Notes.CountAsync(n => n.NoteNo.StartsWith(prefix));
        var note = new Note
        {
            NoteNo = $"{prefix}{(count + 1):D4}",
            Direction = dto.Direction == "Payable" ? "Payable" : "Receivable",
            Instrument = dto.Instrument, PartnerName = dto.PartnerName.Trim(), BankName = dto.BankName,
            Amount = dto.Amount, IssueDate = dto.IssueDate, DueDate = dto.DueDate, Memo = dto.Memo,
            Status = "Pending",
        };
        _context.Notes.Add(note);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = note.Id }, note);
    }

    /// <summary>兌現 — clears the note and posts a bank voucher (收票 Dr 銀行/Cr 應收帳款; 付票 Dr 應付帳款/Cr 銀行).</summary>
    [HttpPost("{id}/clear")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Clear(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();
        if (note.Status != "Pending") return BadRequest(new { message = "只有未兌現的票據可以兌現。" });

        note.Status = "Cleared";
        note.ClearedDate = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;

        var bankId = await AccountIdAsync("1102"); // 銀行存款
        var arId = await AccountIdAsync("1103");   // 應收帳款
        var apId = await AccountIdAsync("2101");   // 應付帳款
        var voucherCreated = false;
        if (bankId != null && arId != null && apId != null)
        {
            var isReceivable = note.Direction == "Receivable";
            var details = isReceivable
                ? new List<VoucherDetail>
                {
                    new() { SeqNo = 1, AccountTitleId = bankId.Value, IsDebit = true,  Amount = note.Amount, Summary = $"票據兌現入帳 - {note.NoteNo}" },
                    new() { SeqNo = 2, AccountTitleId = arId.Value,   IsDebit = false, Amount = note.Amount, Summary = $"沖銷應收 - {note.PartnerName}" },
                }
                : new List<VoucherDetail>
                {
                    new() { SeqNo = 1, AccountTitleId = apId.Value,   IsDebit = true,  Amount = note.Amount, Summary = $"沖銷應付 - {note.PartnerName}" },
                    new() { SeqNo = 2, AccountTitleId = bankId.Value, IsDebit = false, Amount = note.Amount, Summary = $"票據兌付 - {note.NoteNo}" },
                };
            var datePrefix = $"V{DateTime.UtcNow:yyyyMMdd}";
            var todayCount = await _context.Vouchers.CountAsync(v => v.VoucherNo.StartsWith(datePrefix));
            _context.Vouchers.Add(new Voucher
            {
                VoucherNo = $"{datePrefix}{(todayCount + 1):D3}",
                VoucherDate = DateTime.UtcNow, Type = VoucherType.General, Status = VoucherStatus.Draft,
                Memo = $"票據兌現 {note.NoteNo}（{note.PartnerName}）", TotalAmount = note.Amount, Details = details,
            });
            voucherCreated = true;
        }

        await _context.SaveChangesAsync();
        return Ok(new { note.Id, note.Status, voucherCreated });
    }

    /// <summary>退票 — mark as bounced (no reversal voucher in this MVP).</summary>
    [HttpPost("{id}/bounce")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Bounce(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();
        if (note.Status != "Pending") return BadRequest(new { message = "只有未兌現的票據可以標記退票。" });
        note.Status = "Bounced";
        note.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Delete(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();
        if (note.Status == "Cleared") return BadRequest(new { message = "已兌現的票據不可刪除。" });
        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private Task<int?> AccountIdAsync(string code) =>
        _context.AccountTitles.Where(a => a.Code == code).Select(a => (int?)a.Id).FirstOrDefaultAsync();
}
