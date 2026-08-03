using ERP.Modules.Inventory.Domain.Entities;
using ERP.Modules.Inventory.Infrastructure.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Controllers;

public record AgingItemDto(int OrderId, string OrderNo, DateTime OrderDate, DateTime DueDate, string PartnerName,
    decimal Total, decimal Settled, decimal Outstanding, int DaysOverdue, string Bucket);
public record AgingSummaryDto(decimal TotalOutstanding, decimal Overdue,
    decimal NotDue, decimal D1_30, decimal D31_60, decimal D61_90, decimal D90Plus);
public record AgingReportDto(AgingSummaryDto Summary, List<AgingItemDto> Items);
public record SettleDto(decimal Amount);

/// <summary>Shared aging bucketing. Net-30 assumed when an order has no explicit due date.</summary>
internal static class Aging
{
    public static (int Days, string Bucket, bool Overdue) Classify(DateTime due, DateTime today)
    {
        var days = (today.Date - due.Date).Days;
        if (days <= 0) return (0, "未到期", false);
        if (days <= 30) return (days, "1-30", true);
        if (days <= 60) return (days, "31-60", true);
        if (days <= 90) return (days, "61-90", true);
        return (days, "90+", true);
    }

    public static AgingReportDto Build(IEnumerable<(int Id, string OrderNo, DateTime OrderDate, DateTime? DueDate, string Partner, decimal Total, decimal Settled)> rows, DateTime today)
    {
        var items = new List<AgingItemDto>();
        foreach (var r in rows)
        {
            var outstanding = r.Total - r.Settled;
            if (outstanding <= 0) continue;
            var due = r.DueDate ?? r.OrderDate.AddDays(30);
            var (days, bucket, _) = Classify(due, today);
            items.Add(new AgingItemDto(r.Id, r.OrderNo, r.OrderDate, due, r.Partner, r.Total, r.Settled, outstanding, days, bucket));
        }
        items = items.OrderByDescending(i => i.DaysOverdue).ThenByDescending(i => i.Outstanding).ToList();

        decimal Bucket(string b) => items.Where(i => i.Bucket == b).Sum(i => i.Outstanding);
        var summary = new AgingSummaryDto(
            items.Sum(i => i.Outstanding),
            items.Where(i => i.DaysOverdue > 0).Sum(i => i.Outstanding),
            Bucket("未到期"), Bucket("1-30"), Bucket("31-60"), Bucket("61-90"), Bucket("90+"));
        return new AgingReportDto(summary, items);
    }
}

/// <summary>應收帳款帳齡 (receivables aging) + 收款. From confirmed sales orders with an outstanding balance.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Accountant")]
public class ReceivablesController : ControllerBase
{
    private readonly InventoryDbContext _db;
    public ReceivablesController(InventoryDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<AgingReportDto>> Get()
    {
        var orders = await _db.SalesOrders.Include(o => o.Customer)
            .Where(o => o.Status == OrderStatus.Confirmed)
            .ToListAsync();
        var rows = orders.Select(o => (o.Id, o.OrderNo, o.OrderDate, o.DueDate, o.Customer!.Name, o.TotalAmount, o.SettledAmount));
        return Aging.Build(rows, DateTime.UtcNow);
    }

    /// <summary>Record a receipt against a sales order (收款).</summary>
    [HttpPost("{id}/settle")]
    public async Task<IActionResult> Settle(int id, [FromBody] SettleDto dto)
    {
        if (dto.Amount <= 0) return BadRequest(new { message = "收款金額須大於 0。" });
        var order = await _db.SalesOrders.FindAsync(id);
        if (order == null) return NotFound();
        order.SettledAmount = Math.Min(order.TotalAmount, order.SettledAmount + dto.Amount);
        await _db.SaveChangesAsync();
        return Ok(new { order.Id, order.SettledAmount, Outstanding = order.TotalAmount - order.SettledAmount });
    }
}

/// <summary>應付帳款帳齡 (payables aging) + 付款. From confirmed purchase orders with an outstanding balance.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Accountant")]
public class PayablesController : ControllerBase
{
    private readonly InventoryDbContext _db;
    public PayablesController(InventoryDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<AgingReportDto>> Get()
    {
        var orders = await _db.PurchaseOrders.Include(o => o.Supplier)
            .Where(o => o.Status == OrderStatus.Confirmed)
            .ToListAsync();
        var rows = orders.Select(o => (o.Id, o.OrderNo, o.OrderDate, o.DueDate, o.Supplier!.Name, o.TotalAmount, o.SettledAmount));
        return Aging.Build(rows, DateTime.UtcNow);
    }

    /// <summary>Record a payment against a purchase order (付款).</summary>
    [HttpPost("{id}/settle")]
    public async Task<IActionResult> Settle(int id, [FromBody] SettleDto dto)
    {
        if (dto.Amount <= 0) return BadRequest(new { message = "付款金額須大於 0。" });
        var order = await _db.PurchaseOrders.FindAsync(id);
        if (order == null) return NotFound();
        order.SettledAmount = Math.Min(order.TotalAmount, order.SettledAmount + dto.Amount);
        await _db.SaveChangesAsync();
        return Ok(new { order.Id, order.SettledAmount, Outstanding = order.TotalAmount - order.SettledAmount });
    }
}
