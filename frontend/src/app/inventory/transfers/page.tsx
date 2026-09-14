'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { StockTransfer, CreateStockTransferPayload } from '@/features/inventory/types/inventory';
import { StockTransferModal } from '@/features/inventory/components/StockTransferModal';
import { ArrowRightLeft, Plus, Eye, CheckCircle2, ArrowRight, Ban } from 'lucide-react';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Pagination } from '@/features/core/components/Pagination';

export default function StockTransfersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | undefined>(undefined);

  const { data: transfers = [], isLoading } = useSWR('/api/StockTransfers', inventoryApi.getStockTransfers, {
    revalidateOnFocus: false,
  });

  const filteredTransfers = transfers.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const paginatedTransfers = filteredTransfers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSave = async (payload: CreateStockTransferPayload) => {
    await inventoryApi.createStockTransfer(payload);
    mutate('/api/StockTransfers');
    mutate('/api/WarehouseStocks');
  };

  const handleExecute = async (id: number) => {
    await inventoryApi.executeStockTransfer(id);
    mutate('/api/StockTransfers');
    mutate('/api/WarehouseStocks');
  };

  const handleCancel = async (id: number, transferNo: string) => {
    if (confirm(`確定要取消調撥單 [${transferNo}] 嗎？`)) {
      try {
        await inventoryApi.cancelStockTransfer(id);
        mutate('/api/StockTransfers');
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : '取消調撥單失敗');
      }
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            已調撥完成
          </span>
        );
      case 2:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            已取消
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            草稿待執行
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: '首頁', href: '/' },
          { label: '進銷存系統 (Inventory)', href: '/inventory' },
          { label: '調撥作業' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-indigo-600" />
            庫存調撥作業 (Stock Transfers)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理各實體倉庫間之庫存轉移，調撥執行將自動記錄出入庫審計日誌。</p>
        </div>
        <button
          onClick={() => {
            setSelectedTransfer(undefined);
            setViewMode(false);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          建立調撥單
        </button>
      </div>

      {/* 狀態過濾籤頁 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { key: 'all', label: '全部單據' },
          { key: 0, label: '草稿待執行' },
          { key: 1, label: '已調撥完成' },
          { key: 2, label: '已取消' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key as number | 'all');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              statusFilter === tab.key
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入調撥單據中...
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">目前無符合條件的庫存調撥單。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">調撥單號</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">調撥路徑 (來源 → 目的)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">品項摘要</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">調撥日期</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">狀態</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedTransfers.map(transfer => {
                  const totalQty = (transfer.items || []).reduce((sum, item) => sum + item.quantity, 0);
                  const firstItemName = transfer.items?.[0]?.product?.name || `品項 (x${transfer.items?.length || 0})`;

                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-slate-900 dark:text-white">
                          {transfer.transferNo}
                        </div>
                        {transfer.remark && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{transfer.remark}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <span>{transfer.fromWarehouse?.name || `倉 #${transfer.fromWarehouseId}`}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{transfer.toWarehouse?.name || `倉 #${transfer.toWarehouseId}`}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {transfer.fromWarehouse?.code} → {transfer.toWarehouse?.code}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">{firstItemName}</span>
                          {transfer.items && transfer.items.length > 1 && (
                            <span className="text-xs text-slate-400">等 {transfer.items.length} 項</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          共 {totalQty.toLocaleString()} 件
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                        {new Date(transfer.transferDate).toLocaleDateString('zh-TW')}
                      </td>

                      <td className="px-6 py-4 text-center">{getStatusBadge(transfer.status)}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedTransfer(transfer);
                              setViewMode(true);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="檢視明細"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {transfer.status === 0 && (
                            <button
                              onClick={() => handleCancel(transfer.id, transfer.transferNo)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="取消調撥單"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          totalItems={filteredTransfers.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <StockTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onExecute={handleExecute}
        initialData={selectedTransfer}
        readOnly={viewMode}
      />
    </div>
  );
}
