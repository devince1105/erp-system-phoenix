"use client";

import React, { useState, useEffect } from "react";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { Bom, Product } from "@/features/inventory/types/inventory";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Settings, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Box, FileText } from "lucide-react";

export default function BomsPage() {
  const [boms, setBoms] = useState<Bom[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [bomName, setBomName] = useState('');
  const [items, setItems] = useState<{componentProductId: number, quantity: number, unit: string}[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bomData, prodData] = await Promise.all([
        inventoryApi.getBoms(),
        inventoryApi.getProducts()
      ]);
      setBoms(bomData);
      setProducts(prodData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProductId || !bomName || items.length === 0) {
      alert("請填寫所有必填欄位並加入至少一項原料");
      return;
    }
    try {
      await inventoryApi.createBom({
        productId: Number(selectedProductId),
        name: bomName,
        version: '1.0',
        isActive: true,
        items: items
      });
      setIsModalOpen(false);
      setItems([]);
      setBomName('');
      setSelectedProductId('');
      fetchData();
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '進銷存管理', href: '/inventory' },
        { label: '物料管理' }
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" />
            物料管理 (Bill of Materials)
          </h1>
          <p className="text-sm text-slate-500 mt-1">建立與維護各項成品的物料清單，設定生產所需之原物料與數量</p>
        </div>
        <button 
          onClick={() => {
            setBomName('');
            setSelectedProductId('');
            setItems([]);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          新增 BOM 配方
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">載入中...</div>
        ) : boms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
            目前沒有設定任何 BOM 配方，點擊上方按鈕新增
          </div>
        ) : (
          boms.map(bom => (
            <div key={bom.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{bom.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Box className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">成品: {bom.product?.name}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg">
                  v{bom.version}
                </span>
              </div>
              
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  配方明細 ({bom.items?.length || 0} 項)
                </h4>
                <div className="space-y-2">
                  {bom.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.componentProduct?.name}</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.quantity} <span className="text-xs text-slate-400">{item.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                新增 BOM 配方
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">BOM 名稱</label>
                  <input 
                    type="text" 
                    value={bomName} 
                    onChange={e => setBomName(e.target.value)} 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                    placeholder="例如：筆記型電腦標準配方" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">對應成品 (Finished Good)</label>
                  <select 
                    value={selectedProductId} 
                    onChange={e => setSelectedProductId(e.target.value ? Number(e.target.value) : '')} 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">請選擇成品...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Box className="w-4 h-4 text-slate-500" />
                    所需原料明細
                  </h3>
                  <button 
                    onClick={() => setItems([...items, { componentProductId: 0, quantity: 1, unit: 'pcs' }])} 
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> 加入原料
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-500 mb-1">原料項目</label>
                        <select 
                          value={item.componentProductId}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[idx].componentProductId = Number(e.target.value);
                            setItems(newItems);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                        >
                          <option value={0}>選擇原料...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 mb-1">數量</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[idx].quantity = Number(e.target.value);
                            setItems(newItems);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 mb-1">單位</label>
                        <input 
                          type="text" 
                          value={item.unit}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[idx].unit = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                        />
                      </div>
                      <div className="pt-5">
                        <button 
                          onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="移除此項"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                      尚未加入任何原料，請點擊右上方按鈕新增
                    </div>
                  )}
                </div>
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
                onClick={handleSave} 
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                儲存配方
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
