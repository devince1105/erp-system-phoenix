import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { crmApi } from "@/features/crm/api/crmApi";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { SalesOpportunity } from "@/features/crm/types/crm";
import {
  X,
  PackageSearch,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";

interface ConvertToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opportunity: SalesOpportunity | null;
}

interface OrderItemRow {
  productId: number | "";
  quantity: number;
  unitPrice: number;
}

export function ConvertToOrderModal({
  isOpen,
  onClose,
  onSuccess,
  opportunity,
}: ConvertToOrderModalProps) {
  const { data: products = [] } = useSWR(
    isOpen ? "/api/Products" : null,
    inventoryApi.getProducts,
    { revalidateOnFocus: false }
  );

  const [customItems, setCustomItems] = useState<OrderItemRow[] | null>(null);
  const [customMemo, setCustomMemo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive initial items
  const items = useMemo(() => {
    if (customItems !== null) return customItems;
    if (products.length > 0) {
      return [
        {
          productId: products[0].id,
          quantity: 1,
          unitPrice: opportunity?.estimatedValue ? Number(opportunity.estimatedValue) : products[0].unitPrice,
        },
      ];
    }
    return [];
  }, [customItems, products, opportunity]);

  const orderMemo = useMemo(() => {
    if (customMemo !== null) return customMemo;
    return opportunity
      ? `[由 CRM 商機轉單] ${opportunity.title} (客戶: ${opportunity.customer?.name || "未知"})`
      : "";
  }, [customMemo, opportunity]);

  if (!isOpen || !opportunity) return null;

  const handleAddItem = () => {
    const defaultProd = products[0];
    const current = [...items];
    current.push({
      productId: defaultProd ? defaultProd.id : "",
      quantity: 1,
      unitPrice: defaultProd ? defaultProd.unitPrice : 0,
    });
    setCustomItems(current);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setError("訂單至少需包含一項商品明細");
      return;
    }
    setCustomItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemRow,
    val: number | ""
  ) => {
    const next = [...items];
    const row = { ...next[index], [field]: val };

    if (field === "productId" && typeof val === "number") {
      const prod = products.find((p) => p.id === val);
      if (prod) {
        row.unitPrice = prod.unitPrice;
      }
    }

    next[index] = row;
    setCustomItems(next);
  };

  const calculatedTotal = items.reduce((sum, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const handleModalClose = () => {
    setCustomItems(null);
    setCustomMemo(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some((i) => !i.productId || i.quantity <= 0)) {
      setError("請確認所有商品品項皆已選擇且數量大於 0");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const customer = opportunity.customer;
      if (!customer) {
        throw new Error("此商機無關聯客戶資訊");
      }

      // 1. Get or Create Partner in Inventory
      let partnerId: number | null = null;
      const partners = await inventoryApi.getPartners(1); // Type 1: Customer
      const existingPartner = partners.find(
        (p) => p.name.trim().toLowerCase() === customer.name.trim().toLowerCase()
      );

      if (existingPartner) {
        partnerId = existingPartner.id;
      } else {
        const newPartner = await inventoryApi.createPartner({
          name: customer.name,
          type: 1,
          taxId: "00000000",
          contactPerson: customer.contactPerson,
          phone: customer.phone,
          address: customer.address,
        });
        partnerId = newPartner.id;
      }

      // 2. Create Sales Order with items
      await inventoryApi.createSalesOrder({
        customerId: partnerId,
        memo: orderMemo,
        items: items.map((it) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          subtotal: Number(it.quantity) * Number(it.unitPrice),
          id: 0,
          salesOrderId: 0,
          product: undefined,
        })),
      });

      // 3. Update Opportunity Stage to Closed
      await crmApi.updateOpportunityStage(opportunity.id, "Closed");

      alert(`🎉 恭喜！商機「${opportunity.title}」已成功結案並轉為銷售訂單（草稿狀態）。`);
      setCustomItems(null);
      setCustomMemo(null);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "轉換失敗，請檢查網路連線或系統記錄";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">商機贏單結案並建立銷售訂單</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                將洽談完成之商機轉化為進銷存銷售訂單（Sales Order），自動同步客戶資料
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 rounded-lg text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Opp summary card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                來源商機資訊
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                客戶：{opportunity.customer?.name || "未知客戶"}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="text-right">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                商機預估金額
              </p>
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                ${opportunity.estimatedValue.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">將轉入進銷存草稿訂單</p>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PackageSearch className="h-3.5 w-3.5 text-slate-400" />
                訂購商品明細 (Order Items) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                新增品項
              </button>
            </div>

            <div className="space-y-2">
              {items.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex-1">
                    <select
                      value={row.productId}
                      onChange={(e) => handleItemChange(idx, "productId", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    >
                      <option value="" disabled>
                        選擇品項...
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (定價: ${p.unitPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="數量"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      placeholder="單價"
                      value={row.unitPrice}
                      onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="w-24 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    ${(Number(row.quantity || 0) * Number(row.unitPrice || 0)).toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center gap-2 pt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span>合計總金額：</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">
                ${calculatedTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              銷售單備註 (Memo)
            </label>
            <input
              type="text"
              value={orderMemo}
              onChange={(e) => setCustomMemo(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-200"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "建立銷售訂單中..." : "確認贏單並轉為銷售訂單"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
