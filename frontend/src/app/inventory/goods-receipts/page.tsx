"use client";

import React, { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { GoodsReceipt } from "@/features/inventory/types/inventory";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { GoodsReceiptModal } from "@/features/inventory/components/GoodsReceiptModal";
import { GoodsReceiptDetailModal } from "@/features/inventory/components/GoodsReceiptDetailModal";
import {
  PackageCheck,
  Plus,
  Search,
  Warehouse as WarehouseIcon,
  DollarSign,
  Clock,
  Eye,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function GoodsReceiptsPage() {
  // SWR data queries
  const { data: receipts = [], isLoading: loadingReceipts } = useSWR(
    "/api/GoodsReceipts",
    inventoryApi.getGoodsReceipts,
    { revalidateOnFocus: false }
  );
  const { data: warehouses = [] } = useSWR(
    "/api/Warehouses",
    () => inventoryApi.getWarehouses(),
    { revalidateOnFocus: false }
  );
  const { data: purchaseOrders = [] } = useSWR(
    "/api/PurchaseOrders",
    inventoryApi.getPurchaseOrders,
    { revalidateOnFocus: false }
  );

  const pendingOrders = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === 1 && !po.receivedAt);
  }, [purchaseOrders]);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [detailReceipt, setDetailReceipt] = useState<GoodsReceipt | null>(null);

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.purchaseOrder?.supplier?.name &&
          r.purchaseOrder.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.purchaseOrder?.orderNo &&
          r.purchaseOrder.orderNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.memo && r.memo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWarehouse =
        selectedWarehouse === "ALL" ||
        (r.warehouseId && r.warehouseId.toString() === selectedWarehouse);

      return matchesSearch && matchesWarehouse;
    });
  }, [receipts, searchTerm, selectedWarehouse]);

  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [filteredReceipts, currentPage, pageSize]);

  // KPIs
  const totalAmountReceived = useMemo(() => {
    return receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  }, [receipts]);

  const handleRefresh = () => {
    mutate("/api/GoodsReceipts");
    mutate("/api/Warehouses");
    mutate("/api/PurchaseOrders");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "進銷存系統 (Inventory)", href: "/inventory" },
          { label: "進貨驗收 (Goods Receipts)" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="h-6 w-6 text-emerald-600" />
            進貨驗收管理 (Goods Receipts)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            記錄各採購單之實體驗收入庫紀錄，自動更新目標倉庫庫存並產生存貨與應付帳款傳票。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            title="重新載入"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Plus className="w-4 h-4" />
            執行驗收入庫
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">累計驗收單數</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{receipts.length} 筆</p>
            <span className="text-xs text-emerald-600 font-medium">全數完成入庫</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PackageCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">累計進貨總金額</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${totalAmountReceived.toLocaleString()}
            </p>
            <span className="text-xs text-blue-600 font-medium">存貨與應付已立帳</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">待驗收採購單</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {pendingOrders.length} 筆
            </p>
            <span className="text-xs text-amber-600 font-medium">
              {pendingOrders.length > 0 ? "已有廠商待送達" : "暫無待收貨項目"}
            </span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋單號、採購單號、供應商名稱..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="ALL">全部入庫倉庫</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id.toString()}>
                  [{w.code}] {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">驗收單號 (Receipt No)</th>
                <th className="px-6 py-4 font-semibold">驗收日期 (Date)</th>
                <th className="px-6 py-4 font-semibold">來源採購單 (PO No)</th>
                <th className="px-6 py-4 font-semibold">供應商 (Supplier)</th>
                <th className="px-6 py-4 font-semibold">入庫倉庫 (Warehouse)</th>
                <th className="px-6 py-4 font-semibold text-right">進貨金額 (Total)</th>
                <th className="px-6 py-4 font-semibold text-center">品項數</th>
                <th className="px-6 py-4 text-right font-semibold">操作 (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingReceipts ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                      <span>載入進貨驗收資料中...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm || selectedWarehouse !== "ALL"
                      ? "查無符合條件的進貨驗收單。"
                      : "目前尚無進貨驗收單，點擊上方按鈕執行驗收入庫。"}
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {r.receiptNo}
                    </td>
                    <td className="px-6 py-4">{new Date(r.receiptDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                      {r.purchaseOrder?.orderNo || `PO #${r.purchaseOrderId}`}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{r.purchaseOrder?.supplier?.name || "未知供應商"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <WarehouseIcon className="w-3 h-3 text-emerald-500" />
                        {r.warehouse ? r.warehouse.name : "預設主倉庫"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${r.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs">
                      {r.items?.length ?? 0} 項
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDetailReceipt(r)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-1 px-2.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        檢視明細
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredReceipts.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modals */}
      <GoodsReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <GoodsReceiptDetailModal
        receipt={detailReceipt}
        onClose={() => setDetailReceipt(null)}
      />
    </div>
  );
}
