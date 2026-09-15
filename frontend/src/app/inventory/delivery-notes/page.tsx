"use client";

import React, { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { DeliveryNote } from "@/features/inventory/types/inventory";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { DeliveryNoteModal } from "@/features/inventory/components/DeliveryNoteModal";
import { DeliveryNoteDetailModal } from "@/features/inventory/components/DeliveryNoteDetailModal";
import {
  Truck,
  Plus,
  Search,
  Warehouse as WarehouseIcon,
  DollarSign,
  Clock,
  Eye,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function DeliveryNotesPage() {
  // SWR data queries
  const { data: deliveryNotes = [], isLoading: loadingNotes } = useSWR(
    "/api/DeliveryNotes",
    inventoryApi.getDeliveryNotes,
    { revalidateOnFocus: false }
  );
  const { data: warehouses = [] } = useSWR(
    "/api/Warehouses",
    () => inventoryApi.getWarehouses(),
    { revalidateOnFocus: false }
  );
  const { data: salesOrders = [] } = useSWR(
    "/api/SalesOrders",
    inventoryApi.getSalesOrders,
    { revalidateOnFocus: false }
  );

  const pendingOrders = useMemo(() => {
    return salesOrders.filter((so) => so.status === 1 && !so.deliveredAt);
  }, [salesOrders]);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [detailNote, setDetailNote] = useState<DeliveryNote | null>(null);

  // Filtered Delivery Notes
  const filteredNotes = useMemo(() => {
    return deliveryNotes.filter((n) => {
      const matchesSearch =
        n.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.salesOrder?.customer?.name &&
          n.salesOrder.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (n.salesOrder?.orderNo &&
          n.salesOrder.orderNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (n.memo && n.memo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWarehouse =
        selectedWarehouse === "ALL" ||
        (n.warehouseId && n.warehouseId.toString() === selectedWarehouse);

      return matchesSearch && matchesWarehouse;
    });
  }, [deliveryNotes, searchTerm, selectedWarehouse]);

  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotes.slice(start, start + pageSize);
  }, [filteredNotes, currentPage, pageSize]);

  // KPIs
  const totalAmountShipped = useMemo(() => {
    return deliveryNotes.reduce((sum, n) => sum + n.totalAmount, 0);
  }, [deliveryNotes]);

  const handleRefresh = () => {
    mutate("/api/DeliveryNotes");
    mutate("/api/Warehouses");
    mutate("/api/SalesOrders");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "進銷存系統 (Inventory)", href: "/inventory" },
          { label: "出貨裝箱 (Delivery Notes)" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            出貨裝箱管理 (Delivery Notes)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            處理客戶銷售訂單出庫履約，自動扣減指定倉庫庫存並產生成本與應收帳款傳票。
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
            onClick={() => setIsDeliveryModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Plus className="w-4 h-4" />
            執行出貨裝箱
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">累計出貨單數</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{deliveryNotes.length} 筆</p>
            <span className="text-xs text-blue-600 font-medium">全數出庫裝箱</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">累計出貨總金額</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${totalAmountShipped.toLocaleString()}
            </p>
            <span className="text-xs text-emerald-600 font-medium">銷貨收入已入帳</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">待出貨銷售單</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {pendingOrders.length} 筆
            </p>
            <span className="text-xs text-amber-600 font-medium">
              {pendingOrders.length > 0 ? "需盡快排程出貨" : "無待出貨訂單"}
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
              placeholder="搜尋出貨單號、銷售單號、客戶名稱..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">全部出庫倉庫</option>
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
                <th className="px-6 py-4 font-semibold">出貨單號 (Delivery No)</th>
                <th className="px-6 py-4 font-semibold">出貨日期 (Date)</th>
                <th className="px-6 py-4 font-semibold">來源銷售單 (SO No)</th>
                <th className="px-6 py-4 font-semibold">客戶名稱 (Customer)</th>
                <th className="px-6 py-4 font-semibold">出庫倉庫 (Warehouse)</th>
                <th className="px-6 py-4 font-semibold text-right">出貨金額 (Total)</th>
                <th className="px-6 py-4 font-semibold text-center">品項數</th>
                <th className="px-6 py-4 text-right font-semibold">操作 (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingNotes ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      <span>載入出貨裝箱資料中...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedNotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm || selectedWarehouse !== "ALL"
                      ? "查無符合條件的出貨裝箱單。"
                      : "目前尚無出貨單，點擊上方按鈕執行出貨裝箱。"}
                  </td>
                </tr>
              ) : (
                paginatedNotes.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {n.deliveryNo}
                    </td>
                    <td className="px-6 py-4">{new Date(n.deliveryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                      {n.salesOrder?.orderNo || `SO #${n.salesOrderId}`}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{n.salesOrder?.customer?.name || "未知客戶"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <WarehouseIcon className="w-3 h-3 text-blue-500" />
                        {n.warehouse ? n.warehouse.name : "預設主倉庫"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${n.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs">
                      {n.items?.length ?? 0} 項
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDetailNote(n)}
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
          totalItems={filteredNotes.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modals */}
      <DeliveryNoteModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <DeliveryNoteDetailModal
        note={detailNote}
        onClose={() => setDetailNote(null)}
      />
    </div>
  );
}
