using ERP.Modules.Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Modules.Inventory.Infrastructure.Database;

/// <summary>
/// One-time backfill after the order → receipt/delivery split: existing confirmed
/// orders already had their stock + vouchers posted at seed time, so mark them
/// received/delivered and create the receipt/delivery document as a record — without
/// re-moving stock or re-posting vouchers. Idempotent.
/// </summary>
public static class InventoryChainSeeder
{
    public static async Task BackfillAsync(InventoryDbContext db)
    {
        // Purchase orders → goods receipts
        var pos = await db.PurchaseOrders.Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Confirmed && o.ReceivedAt == null)
            .ToListAsync();
        int grSeq = await db.GoodsReceipts.CountAsync();
        foreach (var po in pos)
        {
            po.ReceivedAt = po.OrderDate;
            var receipt = new GoodsReceipt
            {
                ReceiptNo = $"GR-{po.OrderDate:yyyyMMdd}-{++grSeq:D3}",
                PurchaseOrderId = po.Id,
                ReceiptDate = po.OrderDate,
                TotalAmount = po.TotalAmount,
                Memo = $"採購單 {po.OrderNo} 進貨（既有資料回填）",
            };
            foreach (var it in po.Items)
                receipt.Items.Add(new GoodsReceiptItem { ProductId = it.ProductId, Quantity = it.Quantity, UnitPrice = it.UnitPrice });
            db.GoodsReceipts.Add(receipt);
        }

        // Sales orders → delivery notes
        var sos = await db.SalesOrders.Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Confirmed && o.DeliveredAt == null)
            .ToListAsync();
        int dnSeq = await db.DeliveryNotes.CountAsync();
        foreach (var so in sos)
        {
            so.DeliveredAt = so.OrderDate;
            var note = new DeliveryNote
            {
                DeliveryNo = $"DN-{so.OrderDate:yyyyMMdd}-{++dnSeq:D3}",
                SalesOrderId = so.Id,
                DeliveryDate = so.OrderDate,
                TotalAmount = so.TotalAmount,
                Memo = $"銷售訂單 {so.OrderNo} 出貨（既有資料回填）",
            };
            foreach (var it in so.Items)
                note.Items.Add(new DeliveryNoteItem { ProductId = it.ProductId, Quantity = it.Quantity, UnitPrice = it.UnitPrice });
            db.DeliveryNotes.Add(note);
        }

        if (pos.Count > 0 || sos.Count > 0) await db.SaveChangesAsync();
    }
}
