import React from "react";
import { GoodsReceipt } from "../types/inventory";
import { X, PackageCheck, Building2, Warehouse as WarehouseIcon, Calendar, Receipt, FileText } from "lucide-react";

interface GoodsReceiptDetailModalProps {
  receipt: GoodsReceipt | null;
  onClose: () => void;
}

export function GoodsReceiptDetailModal({ receipt, onClose }: GoodsReceiptDetailModalProps) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono">{receipt.receiptNo}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                  已入庫 (Completed)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">進貨驗收單明細檢視</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">來源採購單</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {receipt.purchaseOrder?.orderNo || `PO #${receipt.purchaseOrderId}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">供應商</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-blue-500 shrink-0" />
                {receipt.purchaseOrder?.supplier?.name || "未知供應商"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">入庫存放倉庫</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <WarehouseIcon className="h-3 w-3 text-emerald-500 shrink-0" />
                {receipt.warehouse ? `[${receipt.warehouse.code}] ${receipt.warehouse.name}` : "預設主倉庫"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">驗收日期</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                {new Date(receipt.receiptDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              驗收入庫品項清單
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">商品編號 / 品名</th>
                    <th className="px-4 py-2.5 text-right">入庫數量</th>
                    <th className="px-4 py-2.5 text-right">採購進價</th>
                    <th className="px-4 py-2.5 text-right">品項小計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {receipt.items && receipt.items.length > 0 ? (
                    receipt.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {item.product?.name || `Product #${item.productId}`}
                          </p>
                          {item.product?.sku && (
                            <p className="font-mono text-[10px] text-slate-400">SKU: {item.product.sku}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          +{item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-400">
                          ${item.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        無明細品項資料
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      進貨總金額：
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                      ${receipt.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Fulfillment & Accounting Alert */}
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-300">
            <Receipt className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <div>
              <p className="font-semibold">會計傳票與履約連動狀態</p>
              <p className="mt-0.5 text-blue-600 dark:text-blue-400">
                本驗收單建立時已自動產生過帳傳票：借記「1210 存貨」、貸記「2141 應付帳款」，並記錄進出貨履約鏈。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
