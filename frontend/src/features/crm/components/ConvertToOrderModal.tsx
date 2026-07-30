import React, { useState, useEffect } from 'react';
import { crmApi } from '@/features/crm/api/crmApi';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { SalesOpportunity } from '@/features/crm/types/crm';
import { Product } from '@/features/inventory/types/inventory';
import { X, PackageSearch, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ConvertToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opportunity: SalesOpportunity | null;
}

export function ConvertToOrderModal({ isOpen, onClose, onSuccess, opportunity }: ConvertToOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      inventoryApi.getProducts().then(setProducts).catch(console.error);
    }
  }, [isOpen]);

  const activeOppId = isOpen ? (opportunity?.id ?? null) : null;
  const [pricedOppId, setPricedOppId] = useState<number | null>(null);
  if (activeOppId !== pricedOppId) {
    setPricedOppId(activeOppId);
    if (opportunity) {
      setUnitPrice(opportunity.estimatedValue);
    }
  }

  if (!isOpen || !opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert("請選擇轉換的商品或服務");
      return;
    }

    setIsSubmitting(true);
    try {
      const customer = opportunity.customer;
      if (!customer) {
        throw new Error("此商機無關聯客戶");
      }

      // 1. Get or Create Partner in Inventory
      let partnerId: number | null = null;
      const partners = await inventoryApi.getPartners(1); // Type 1: Customer
      const existingPartner = partners.find(p => p.name === customer.name);

      if (existingPartner) {
        partnerId = existingPartner.id;
      } else {
        const newPartner = await inventoryApi.createPartner({
          name: customer.name,
          type: 1,
          taxId: '00000000', // Default or grab from CRM if available
          contactPerson: customer.contactPerson,
          phone: customer.phone,
          address: customer.address
        });
        partnerId = newPartner.id;
      }

      // 2. Create Sales Order
      await inventoryApi.createSalesOrder({
        customerId: partnerId,
        memo: `[由 CRM 轉換] 商機: ${opportunity.title}`,
        items: [
          {
            productId: parseInt(selectedProductId, 10),
            quantity: quantity,
            unitPrice: unitPrice,
            subtotal: quantity * unitPrice,
            id: 0,
            salesOrderId: 0,
            product: undefined
          }
        ]
      });

      // 3. Update Opportunity Stage to Closed
      await crmApi.updateOpportunityStage(opportunity.id, 'Closed');

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("轉換失敗，請檢查網路連線或系統記錄");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">結案並建立銷售訂單</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">來源商機</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{opportunity.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opportunity.customer?.name}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-300" />
            <div className="text-right">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">目標系統</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">進銷存管理模組</p>
              <p className="text-xs text-slate-500 mt-0.5">Sales Order</p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <PackageSearch className="h-4 w-4 text-slate-400" />
              對應商品或服務 <span className="text-rose-500">*</span>
            </label>
            <select 
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-200"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              <option value="" disabled>請選擇要轉換的進銷存品項...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (定價: ${p.unitPrice})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                數量
              </label>
              <input 
                type="number"
                min="1"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-200"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                單價 (自動帶入預估金額)
              </label>
              <input 
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-200"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? '轉換中...' : '確認轉換並結案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
