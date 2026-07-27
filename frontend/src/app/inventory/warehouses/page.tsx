"use client";

import React, { useState, useEffect } from "react";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { Warehouse, InventoryStock, Product } from "@/features/inventory/types/inventory";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Building, MapPin, Plus, Edit2, Trash2, Box, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Warehouse>>({ code: "", name: "", location: "", manager: "", isActive: true });

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, []);

  const loadWarehouses = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryApi.getWarehouses();
      setWarehouses(data);
      if (data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await inventoryApi.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedWarehouseId) {
      loadStocks(selectedWarehouseId);
    }
  }, [selectedWarehouseId]);

  const loadStocks = async (warehouseId: number) => {
    try {
      const data = await inventoryApi.getWarehouseStocks(warehouseId);
      setStocks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.name) {
      alert("請填寫必填欄位 (代碼、名稱)");
      return;
    }
    try {
      await inventoryApi.createWarehouse(formData);
      setIsModalOpen(false);
      setFormData({ code: "", name: "", location: "", manager: "", isActive: true });
      loadWarehouses();
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    }
  };

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '進銷存管理', href: '/inventory' },
        { label: '倉庫與庫存管理' }
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building className="h-6 w-6 text-indigo-600" />
            倉庫與庫存管理 (Warehouses & Stock)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理多據點倉庫，即時追蹤商品水位與安全庫存</p>
        </div>
        <button 
          onClick={() => { setFormData({ code: "", name: "", location: "", manager: "", isActive: true }); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          新增倉庫
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Warehouse List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">倉庫列表 ({warehouses.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {isLoading ? (
                <div className="text-center p-4 text-sm text-slate-500">載入中...</div>
              ) : warehouses.length === 0 ? (
                <div className="text-center p-4 text-sm text-slate-500">目前沒有倉庫資料</div>
              ) : (
                warehouses.map(w => (
                  <div 
                    key={w.id} 
                    onClick={() => setSelectedWarehouseId(w.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedWarehouseId === w.id 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' 
                        : 'border-gray-100 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{w.code}</span>
                      <div className="flex items-center gap-1">
                        {w.isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{w.name}</h4>
                    {w.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{w.location}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stock Details */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-[600px] flex flex-col">
            {selectedWarehouse ? (
              <>
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/30 dark:bg-slate-900/30">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-500" />
                      {selectedWarehouse.name} - 庫存明細
                    </h2>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>負責人: {selectedWarehouse.manager || '未指定'}</span>
                      <span>地點: {selectedWarehouse.location || '未指定'}</span>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    庫存盤點作業
                  </button>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                      <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500">
                        <th className="p-4 font-medium">商品代號 (SKU)</th>
                        <th className="p-4 font-medium">商品名稱</th>
                        <th className="p-4 font-medium text-right">目前庫存</th>
                        <th className="p-4 font-medium text-right">安全庫存</th>
                        <th className="p-4 font-medium">狀態</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {stocks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">此倉庫目前無任何商品庫存紀錄</td>
                        </tr>
                      ) : (
                        stocks.map(stock => {
                          const product = products.find(p => p.id === stock.productId) || stock.product;
                          const isLowStock = stock.quantity < stock.safetyStock;
                          const isOut = stock.quantity <= 0;
                          
                          return (
                            <tr key={stock.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                                {product?.sku || `PROD-${stock.productId}`}
                              </td>
                              <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                                {product?.name || '未知商品'}
                              </td>
                              <td className="p-4 text-right">
                                <span className={`font-mono font-bold text-lg ${isOut ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {stock.quantity}
                                </span>
                              </td>
                              <td className="p-4 text-right text-slate-500 font-mono text-sm">
                                {stock.safetyStock}
                              </td>
                              <td className="p-4">
                                {isOut ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs font-bold">
                                    <AlertTriangle className="w-3 h-3" /> 缺貨中
                                  </span>
                                ) : isLowStock ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold">
                                    <AlertTriangle className="w-3 h-3" /> 低於安全庫存
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">
                                    <CheckCircle2 className="w-3 h-3" /> 庫存充足
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Box className="w-16 h-16 mb-4 opacity-20" />
                <p>請從左側選擇倉庫以檢視庫存明細</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Create Warehouse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">新增倉庫</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">倉庫代碼 (必填) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="例: WH-TPE-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">倉庫名稱 (必填) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="例: 台北總倉"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">所在地點</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="例: 台北市南港區..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">負責人</label>
                <input 
                  type="text" 
                  value={formData.manager} 
                  onChange={e => setFormData({...formData, manager: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="例: 王大明"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                確認新增
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
