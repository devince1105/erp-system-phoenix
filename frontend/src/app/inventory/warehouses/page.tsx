'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { Warehouse } from '@/features/inventory/types/inventory';
import { WarehouseModal } from '@/features/inventory/components/WarehouseModal';
import { Warehouse as WarehouseIcon, Plus, Trash2, Edit2, Eye, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Pagination } from '@/features/core/components/Pagination';

export default function WarehousesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>(undefined);

  const { data: warehouses = [], isLoading } = useSWR('/api/Warehouses', () => inventoryApi.getWarehouses(), {
    revalidateOnFocus: false,
  });

  const paginatedWarehouses = warehouses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSave = async (data: Partial<Warehouse>) => {
    if (editingWarehouse) {
      await inventoryApi.updateWarehouse(editingWarehouse.id, data);
    } else {
      await inventoryApi.createWarehouse(data);
    }
    mutate('/api/Warehouses');
  };

  const handleDelete = async (id: number) => {
    if (confirm('確定要刪除這座倉庫嗎？若倉庫尚有庫存或異動單據將無法刪除。')) {
      try {
        await inventoryApi.deleteWarehouse(id);
        mutate('/api/Warehouses');
      } catch (error: unknown) {
        console.error('Delete failed', error);
        alert(error instanceof Error ? error.message : '刪除失敗');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: '首頁', href: '/' },
          { label: '進銷存系統 (Inventory)', href: '/inventory' },
          { label: '倉庫管理' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <WarehouseIcon className="h-6 w-6 text-blue-600" />
            實體倉庫管理 (Warehouses)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理企業各實體倉庫、物流中心或營業據點，設定預設倉與聯絡資訊。</p>
        </div>
        <button
          onClick={() => {
            setEditingWarehouse(undefined);
            setViewMode(false);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          新增倉庫
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入倉庫列表中...
          </div>
        ) : warehouses.length === 0 ? (
          <div className="py-12 text-center text-slate-500">目前尚未建立任何實體倉庫。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">倉庫名稱 / 代碼</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">聯絡窗口</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">地址</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">預設倉</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">狀態</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedWarehouses.map(warehouse => (
                  <tr key={warehouse.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <WarehouseIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            {warehouse.name}
                            <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                              {warehouse.code}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {warehouse.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="space-y-1">
                        {warehouse.contactPerson && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{warehouse.contactPerson}</span>
                          </div>
                        )}
                        {warehouse.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{warehouse.phone}</span>
                          </div>
                        )}
                        {!warehouse.contactPerson && !warehouse.phone && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {warehouse.address ? (
                        <div className="flex items-center gap-1.5 max-w-xs truncate" title={warehouse.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{warehouse.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {warehouse.isDefault ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          預設總倉
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          warehouse.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {warehouse.isActive ? '啟用中' : '已停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingWarehouse(warehouse);
                            setViewMode(true);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="檢視"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWarehouse(warehouse);
                            setViewMode(false);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          totalItems={warehouses.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingWarehouse}
        readOnly={viewMode}
      />
    </div>
  );
}
