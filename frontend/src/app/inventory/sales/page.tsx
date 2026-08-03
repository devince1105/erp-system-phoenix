'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { SalesOrder } from '@/features/inventory/types/inventory';
import { TrendingUp, Plus, CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import { SalesOrderModal } from '@/features/inventory/components/SalesOrderModal';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | undefined>(undefined);

  const fetchOrders = useCallback(() => {
    inventoryApi.getSalesOrders()
      .then(data => setOrders(data))
      .catch(error => console.error('Failed to fetch sales orders', error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShip = async (id: number) => {
    if (confirm("確定要出貨嗎？出貨後將扣減庫存並產生應收帳款。")) {
      try {
        const r = await inventoryApi.shipFromOrder(id);
        alert(`已出貨,出貨單號 ${r.deliveryNo};庫存已扣減、應收帳款已入帳。`);
        fetchOrders();
      } catch {
        alert('出貨失敗（可能庫存不足）');
      }
    }
  };

  const handleConfirm = async (id: number) => {
    if (confirm("確定要確認這筆訂單嗎？確認為接單承諾;實際出貨請於確認後按「出貨」。")) {
      try {
        await inventoryApi.confirmSalesOrder(id);
        fetchOrders();
      } catch (err) {
        console.error(err);
        alert('Failed to confirm sales order');
      }
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const order = await inventoryApi.getSalesOrder(id);
      setEditingOrder(order);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch sales order details');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除這筆銷貨單嗎？")) {
      try {
        await inventoryApi.deleteSalesOrder(id);
        fetchOrders();
      } catch (err) {
        console.error(err);
        alert('Failed to delete sales order');
      }
    }
  };

  const handleSave = async (data: Partial<SalesOrder>) => {
    if (editingOrder) {
      await inventoryApi.updateSalesOrder(editingOrder.id, data);
    } else {
      await inventoryApi.createSalesOrder(data);
    }
    fetchOrders();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '進銷存系統 (Inventory)', href: '/inventory' },
        { label: '銷售單管理' }
      ]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            銷貨管理 (Sales)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理銷貨單與出貨狀態。銷貨確認後將自動建立會計傳票。</p>
        </div>
        <button 
          onClick={() => {
            setEditingOrder(undefined);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          建立銷貨單
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">單號 (Order No)</th>
                <th className="px-6 py-4 font-semibold">日期 (Date)</th>
                <th className="px-6 py-4 font-semibold">客戶 (Customer)</th>
                <th className="px-6 py-4 font-semibold">總金額 (Total)</th>
                <th className="px-6 py-4 font-semibold">狀態 (Status)</th>
                <th className="px-6 py-4 text-right font-semibold">操作 (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    載入中...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    目前沒有任何銷貨單。
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-200">{order.orderNo}</td>
                    <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{order.customer?.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">${order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {order.status === 1 ? (
                        order.deliveredAt ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            已出貨 (Shipped)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            已確認 · 待出貨
                          </span>
                        )
                      ) : order.status === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          草稿 (Draft)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          已取消 (Cancelled)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 0 ? (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleConfirm(order.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                          >
                            確認訂單
                          </button>
                          <button
                            onClick={() => handleEdit(order.id)}
                            className="text-amber-500 hover:text-amber-600 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="text-rose-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : order.status === 1 && !order.deliveredAt ? (
                        <button
                          onClick={() => handleShip(order.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm font-medium text-sm transition-colors"
                        >
                          出貨
                        </button>
                      ) : (
                        <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm transition-colors">
                          檢視明細
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SalesOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingOrder}
      />
    </div>
  );
}
