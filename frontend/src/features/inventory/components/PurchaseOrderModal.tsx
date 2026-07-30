import React, { useState } from 'react';
import useSWR from 'swr';
import { PurchaseOrder, PurchaseOrderItem, Product, Partner } from '@/features/inventory/types/inventory';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PurchaseOrder>) => Promise<void>;
  initialData?: PurchaseOrder;
}

export function PurchaseOrderModal({ isOpen, onClose, onSave, initialData }: PurchaseOrderModalProps) {
  const { data: suppliers } = useSWR<Partner[]>('/Partners?type=2', () => inventoryApi.getPartners(2));
  const { data: products } = useSWR<Product[]>('/Products', inventoryApi.getProducts);

  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [memo, setMemo] = useState('');
  const [items, setItems] = useState<Partial<PurchaseOrderItem>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editKey = isOpen ? (initialData?.id ?? 'new') : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);
  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (isOpen) {
      if (initialData) {
        setSupplierId(initialData.supplierId);
        setMemo(initialData.memo || '');
        setItems(initialData.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })));
      } else {
        setSupplierId('');
        setMemo('');
        setItems([]);
      }
    }
  }

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { productId: 0, quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'productId') {
      const selectedProduct = products?.find(p => p.id === value);
      item.productId = value;
      if (selectedProduct) {
        item.unitPrice = selectedProduct.costPrice; // Default to cost price for purchases
      }
    } else {
      item[field] = value as never;
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert("請選擇供應商");
      return;
    }
    if (items.length === 0) {
      alert("請至少新增一項商品");
      return;
    }
    if (items.some(i => !i.productId || i.productId === 0 || i.quantity! <= 0)) {
      alert("請檢查商品項目是否填寫正確");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        supplierId: supplierId as number,
        memo,
        items: items as PurchaseOrderItem[]
      });
      onClose();
    } catch (error) {
      console.error('Failed to save purchase order', error);
      alert('儲存失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialData ? '編輯採購單' : '新增採購單'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="purchase-order-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">供應商 (Supplier) <span className="text-rose-500">*</span></label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>請選擇供應商...</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">備註 (Memo)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="採購單備註..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">採購明細 (Items)</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增商品
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">商品</th>
                      <th className="px-4 py-3 font-semibold w-24">數量</th>
                      <th className="px-4 py-3 font-semibold w-32">進價</th>
                      <th className="px-4 py-3 font-semibold w-32">小計</th>
                      <th className="px-4 py-3 font-semibold w-12 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, index) => (
                      <tr key={index} className="bg-white dark:bg-slate-900">
                        <td className="px-4 py-2">
                          <select
                            value={item.productId || ''}
                            onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="" disabled>請選擇商品...</option>
                            {products?.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (現有庫存: {p.stockQuantity})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice || 0}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-200">
                          ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-rose-500 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/30">
                          目前沒有任何商品。請點擊上方「新增商品」按鈕。
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">總計 (Total)</td>
                        <td colSpan={2} className="px-4 py-3 font-bold text-lg text-blue-600 dark:text-blue-400">
                          ${totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            form="purchase-order-form"
            disabled={isSubmitting || items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? '儲存中...' : '確認儲存'}
          </button>
        </div>
      </div>
    </div>
  );
}
