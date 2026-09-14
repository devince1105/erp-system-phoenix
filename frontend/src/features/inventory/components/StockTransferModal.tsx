import React, { useState, useEffect } from 'react';
import {
  StockTransfer,
  Warehouse,
  Product,
  CreateStockTransferPayload,
  WarehouseStock,
} from '@/features/inventory/types/inventory';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { X, Save, ArrowRightLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateStockTransferPayload) => Promise<void>;
  onExecute?: (id: number) => Promise<void>;
  initialData?: StockTransfer;
  readOnly?: boolean;
}

export function StockTransferModal({
  isOpen,
  onClose,
  onSave,
  onExecute,
  initialData,
  readOnly = false,
}: StockTransferModalProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fromWarehouseStocks, setFromWarehouseStocks] = useState<Record<number, number>>({});

  const [fromWarehouseId, setFromWarehouseId] = useState<number>(0);
  const [toWarehouseId, setToWarehouseId] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState<string>('');
  const [items, setItems] = useState<{ productId: number; quantity: number }[]>([
    { productId: 0, quantity: 1 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 載入倉庫與商品基本清單
  useEffect(() => {
    if (!isOpen) return;
    inventoryApi.getWarehouses(true).then(whs => {
      setWarehouses(whs);
      if (!initialData && whs.length >= 2) {
        const def = whs.find(w => w.isDefault) || whs[0];
        const other = whs.find(w => w.id !== def.id) || whs[1];
        setFromWarehouseId(def.id);
        setToWarehouseId(other.id);
      }
    }).catch(console.error);

    inventoryApi.getProducts().then(setProducts).catch(console.error);
  }, [isOpen, initialData]);

  // 當來源倉庫變更時，抓取該倉庫各商品庫存
  useEffect(() => {
    if (!isOpen || !fromWarehouseId) return;
    inventoryApi.getWarehouseStocks(fromWarehouseId).then((stocks: WarehouseStock[]) => {
      const map: Record<number, number> = {};
      stocks.forEach(s => {
        map[s.productId] = s.quantity;
      });
      setFromWarehouseStocks(map);
    }).catch(console.error);
  }, [isOpen, fromWarehouseId]);

  // 監聽 initialData 切換
  const editKey = isOpen ? (initialData?.id ?? 'new') : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);
  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (isOpen) {
      setErrorMsg('');
      if (initialData) {
        setFromWarehouseId(initialData.fromWarehouseId);
        setToWarehouseId(initialData.toWarehouseId);
        setTransferDate(initialData.transferDate ? initialData.transferDate.split('T')[0] : '');
        setRemark(initialData.remark || '');
        setItems(
          initialData.items && initialData.items.length > 0
            ? initialData.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
            : [{ productId: 0, quantity: 1 }]
        );
      } else {
        setTransferDate(new Date().toISOString().split('T')[0]);
        setRemark('');
        setItems([{ productId: 0, quantity: 1 }]);
      }
    }
  }

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems(prev => [...prev, { productId: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setErrorMsg('');

    if (fromWarehouseId === toWarehouseId) {
      setErrorMsg('來源倉庫與目的倉庫不可相同。');
      return;
    }

    const validItems = items.filter(i => i.productId > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      setErrorMsg('請至少選取一項商品並設定大於 0 的調撥數量。');
      return;
    }

    // 檢查是否有來源庫存不足
    for (const item of validItems) {
      const currentStock = fromWarehouseStocks[item.productId] ?? 0;
      if (item.quantity > currentStock) {
        const prod = products.find(p => p.id === item.productId);
        setErrorMsg(`商品 [${prod?.name || item.productId}] 來源庫存不足！現庫存 ${currentStock}，需求 ${item.quantity}。`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSave({
        fromWarehouseId,
        toWarehouseId,
        transferDate: new Date(transferDate).toISOString(),
        remark,
        items: validItems,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '建立調撥單失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecute = async () => {
    if (!initialData || !onExecute) return;
    if (!confirm(`確定要立即執行此調撥單 [${initialData.transferNo}] 嗎？將扣減來源庫存並增加目的倉庫存。`)) return;
    try {
      setIsExecuting(true);
      setErrorMsg('');
      await onExecute(initialData.id);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '執行調撥失敗');
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">已完成調撥</span>;
      case 2:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">已取消</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">草稿待執行</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">
                  {readOnly ? `檢視調撥單: ${initialData?.transferNo}` : '建立庫存調撥單'}
                </h3>
                {readOnly && getStatusBadge(initialData?.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">跨實體倉庫間之庫存轉移與異動審計</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={readOnly} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  來源倉庫 (From) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={fromWarehouseId}
                  onChange={e => setFromWarehouseId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50 disabled:text-slate-600"
                >
                  <option value={0}>請選擇來源倉</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id} disabled={w.id === toWarehouseId}>
                      {w.name} ({w.code}) {w.isDefault ? '[預設]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  目的倉庫 (To) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={toWarehouseId}
                  onChange={e => setToWarehouseId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50 disabled:text-slate-600"
                >
                  <option value={0}>請選擇目的倉</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id} disabled={w.id === fromWarehouseId}>
                      {w.name} ({w.code}) {w.isDefault ? '[預設]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">調撥日期</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={e => setTransferDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">調撥原因 / 備註</label>
                <input
                  type="text"
                  placeholder="例如: 台中營業所補貨、庫存平衡"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* 明細品項清單 */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">調撥商品品項</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增品項
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">商品品項</th>
                      <th className="py-2.5 px-3 w-32">來源在庫量</th>
                      <th className="py-2.5 px-3 w-32">調撥數量</th>
                      {!readOnly && <th className="py-2.5 px-3 w-16 text-center">操作</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const stockAvailable = fromWarehouseStocks[item.productId] ?? 0;
                      const isInsufficient = item.quantity > stockAvailable && item.productId > 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <select
                              required
                              value={item.productId}
                              onChange={e => handleItemChange(idx, 'productId', Number(e.target.value))}
                              disabled={readOnly}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
                            >
                              <option value={0}>請選取調撥商品</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  [{p.sku}] {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-xs font-mono text-slate-600">
                              {item.productId > 0 ? `${stockAvailable} 件` : '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={1}
                              required
                              value={item.quantity}
                              onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              disabled={readOnly}
                              className={`w-full px-2.5 py-1.5 border rounded-md text-sm font-mono focus:outline-none focus:ring-1 ${
                                isInsufficient
                                  ? 'border-red-300 text-red-600 bg-red-50/30 focus:ring-red-500'
                                  : 'border-slate-200 focus:ring-indigo-500 disabled:bg-slate-50'
                              }`}
                            />
                            {isInsufficient && !readOnly && (
                              <span className="block text-[11px] text-red-500 mt-0.5">庫存不足</span>
                            )}
                          </td>
                          {!readOnly && (
                            <td className="py-2 px-3 text-center">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="移除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </fieldset>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div>
              {readOnly && initialData?.status === 0 && onExecute && (
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={handleExecute}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isExecuting ? '執行調撥中...' : '確認並執行調撥'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {readOnly ? '關閉' : '取消'}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? '儲存中...' : '建立調撥單'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
