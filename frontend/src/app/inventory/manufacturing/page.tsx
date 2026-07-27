"use client";

import React, { useState, useEffect } from "react";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { WorkOrder, Bom, Product } from "@/features/inventory/types/inventory";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Activity, Plus, CheckCircle2, AlertTriangle, Box, PlayCircle } from "lucide-react";

export default function ManufacturingPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [boms, setBoms] = useState<Bom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState<number | ''>('');
  const [plannedQuantity, setPlannedQuantity] = useState(1);
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [woData, bomData] = await Promise.all([
        inventoryApi.getWorkOrders(),
        inventoryApi.getBoms()
      ]);
      setWorkOrders(woData);
      setBoms(bomData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedBomId || plannedQuantity <= 0) {
      alert("請填寫所有必填欄位");
      return;
    }
    try {
      const selectedBom = boms.find(b => b.id === Number(selectedBomId));
      if (!selectedBom) return;

      await inventoryApi.createWorkOrder({
        bomId: selectedBom.id,
        productId: selectedBom.productId,
        plannedQuantity: plannedQuantity,
        status: 0 // Draft
      });
      setIsModalOpen(false);
      setSelectedBomId('');
      setPlannedQuantity(1);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("建立失敗");
    }
  };

  const handleComplete = async (woId: number) => {
    if (!confirm("確定要完工入庫嗎？系統將自動扣除所需的原料，並增加成品庫存。此操作無法復原。")) return;
    setCompletingId(woId);
    try {
      await inventoryApi.completeWorkOrder(woId);
      alert("完工入庫成功！庫存已自動調整。");
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert("完工入庫失敗: " + (e.response?.data || e.message));
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0: return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"><Box className="w-3 h-3" /> 草稿</span>;
      case 1: return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-medium border border-indigo-200 dark:border-indigo-800"><PlayCircle className="w-3 h-3" /> 生產中</span>;
      case 2: return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /> 已完工</span>;
      case 3: return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-medium border border-rose-200 dark:border-rose-800"><AlertTriangle className="w-3 h-3" /> 已取消</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '進銷存管理', href: '/inventory' },
        { label: '生產製造' }
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            生產製造 (Manufacturing)
          </h1>
          <p className="text-sm text-slate-500 mt-1">建立生產工單並執行完工入庫，自動扣除 BOM 配方原料</p>
        </div>
        <button 
          onClick={() => {
            setSelectedBomId('');
            setPlannedQuantity(1);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          新增生產工單
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">工單編號</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">生產成品</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">使用 BOM</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">預計產量</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">狀態</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">載入中...</td></tr>
              ) : workOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">目前沒有生產工單資料</td></tr>
              ) : (
                workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">{wo.orderNo}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {wo.product?.name}
                      <div className="text-xs text-slate-400 font-normal">SKU: {wo.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{wo.bom?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100 text-right">{wo.plannedQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(wo.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {wo.status === 0 && (
                        <button 
                          disabled={completingId === wo.id}
                          onClick={() => handleComplete(wo.id)} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/50 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {completingId === wo.id ? '處理中...' : '完工入庫'}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                新增生產工單
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">選擇 BOM (生產配方)</label>
                <select 
                  value={selectedBomId} 
                  onChange={e => setSelectedBomId(e.target.value ? Number(e.target.value) : '')} 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">請選擇...</option>
                  {boms.map(b => <option key={b.id} value={b.id}>{b.name} (成品: {b.product?.name})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">預計生產數量</label>
                <input 
                  type="number" 
                  min="1" 
                  value={plannedQuantity} 
                  onChange={e => setPlannedQuantity(Number(e.target.value))} 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleCreate} 
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                建立工單
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
