import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { inventoryApi } from "../api/inventoryApi";
import { X, Truck, Warehouse as WarehouseIcon, Building2, AlertCircle } from "lucide-react";

interface DeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedOrderId?: number;
}

export function DeliveryNoteModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedOrderId,
}: DeliveryNoteModalProps) {
  const { data: salesOrders = [], isLoading: loadingOrders } = useSWR(
    isOpen ? "/api/SalesOrders" : null,
    inventoryApi.getSalesOrders,
    { revalidateOnFocus: false }
  );

  const { data: warehouses = [], isLoading: loadingWh } = useSWR(
    isOpen ? "/api/Warehouses?activeOnly=true" : null,
    () => inventoryApi.getWarehouses(true),
    { revalidateOnFocus: false }
  );

  const pendingOrders = useMemo(() => {
    return salesOrders.filter((o) => o.status === 1 && !o.deliveredAt);
  }, [salesOrders]);

  const [selectedOrderId, setSelectedOrderId] = useState<number | "">("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived effective IDs
  const effectiveOrderId = useMemo(() => {
    if (selectedOrderId && pendingOrders.some((o) => o.id === selectedOrderId)) {
      return selectedOrderId;
    }
    if (preselectedOrderId && pendingOrders.some((o) => o.id === preselectedOrderId)) {
      return preselectedOrderId;
    }
    return pendingOrders[0]?.id ?? "";
  }, [selectedOrderId, pendingOrders, preselectedOrderId]);

  const effectiveWarehouseId = useMemo(() => {
    if (selectedWarehouseId && warehouses.some((w) => w.id === selectedWarehouseId)) {
      return selectedWarehouseId;
    }
    const defaultWh = warehouses.find((w) => w.isDefault) || warehouses[0];
    return defaultWh?.id ?? "";
  }, [selectedWarehouseId, warehouses]);

  if (!isOpen) return null;

  const isLoading = loadingOrders || loadingWh;
  const currentOrder = pendingOrders.find((o) => o.id === effectiveOrderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveOrderId) {
      setError("請選擇待出貨銷售訂單");
      return;
    }
    if (!effectiveWarehouseId) {
      setError("請指定出貨扣庫倉庫");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await inventoryApi.shipFromOrder(
        Number(effectiveOrderId),
        Number(effectiveWarehouseId)
      );
      alert(`🎉 出貨裝箱成功！出貨單號：${res.deliveryNo}\n系統已扣減倉庫庫存並立應收帳款與銷貨成本傳票。`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "出貨裝箱處理失敗，請確認該倉庫庫存是否足夠";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">執行銷貨出庫裝箱</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                檢驗銷售訂單並指定扣庫倉庫，確認出貨後將扣庫存並立應收與銷貨收入傳票
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">載入中...</p>
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">目前沒有待出貨的銷售訂單</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              所有已確認的銷售訂單均已全數完成出貨裝箱，或尚未建立新的已審核銷售單。
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg"
            >
              關閉視窗
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 rounded-lg text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Select SO */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                待出貨銷售單 (Sales Order) <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
                value={effectiveOrderId}
                onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                required
              >
                {pendingOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNo} — {o.customer?.name || "未知客戶"} (${o.totalAmount.toLocaleString()} ·{" "}
                    {new Date(o.orderDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Warehouse */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                出貨扣庫倉庫 (Source Warehouse) <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
                value={effectiveWarehouseId}
                onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name} {w.isDefault ? "(預設倉庫)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* SO Details Summary Box */}
            {currentOrder && (
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                    <Building2 className="h-3.5 w-3.5 text-blue-500" />
                    客戶：{currentOrder.customer?.name}
                  </span>
                  <span className="font-mono">訂單號：{currentOrder.orderNo}</span>
                </div>

                {/* Items preview table */}
                <div className="border border-slate-200 dark:border-slate-700/80 rounded-md overflow-hidden bg-white dark:bg-slate-900">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2">品項名稱</th>
                        <th className="px-3 py-2 text-right">出貨數量</th>
                        <th className="px-3 py-2 text-right">銷售單價</th>
                        <th className="px-3 py-2 text-right">小計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                            {item.product?.name || `Product #${item.productId}`}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                            -{item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-500">
                            ${item.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                            ${(item.quantity * item.unitPrice).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-medium text-slate-600 dark:text-slate-400">
                          訂單總額：
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${currentOrder.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <WarehouseIcon className="h-4 w-4" />
                {isSubmitting ? "出貨裝箱中..." : "確認完成出庫裝箱"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
