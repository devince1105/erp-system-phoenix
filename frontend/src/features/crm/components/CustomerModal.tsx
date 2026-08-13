import React, { useState } from 'react';
import { crmApi } from '@/features/crm/api/crmApi';
import { Customer } from '@/features/crm/types/crm';
import { X, Building2, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer; // if provided, it's edit mode
  readOnly?: boolean;
}

export function CustomerModal({ isOpen, onClose, onSuccess, customer, readOnly = false }: CustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'B2B',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: ''
  });

  const editKey = isOpen ? (customer?.id ?? 'new') : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);
  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (customer && isOpen) {
      setFormData({
        name: customer.name,
        type: customer.type,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        industry: customer.industry
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        type: 'B2B',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        industry: ''
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson) {
      alert("請填寫必填欄位");
      return;
    }

    setIsSubmitting(true);
    try {
      if (customer) {
        await crmApi.updateCustomer(customer.id, formData);
      } else {
        await crmApi.createCustomer(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("儲存失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {readOnly ? '檢視客戶資料' : customer ? '編輯客戶資料' : '新增客戶'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <fieldset disabled={readOnly} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Building2 className="h-4 w-4 text-slate-400" />
                客戶名稱 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="公司或個人名稱"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Briefcase className="h-4 w-4 text-slate-400" />
                客戶類型 <span className="text-rose-500">*</span>
              </label>
              <select 
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="B2B">企業客戶 (B2B)</option>
                <option value="B2C">個人客戶 (B2C)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <User className="h-4 w-4 text-slate-400" />
                聯絡人姓名 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="主要對接窗口"
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Phone className="h-4 w-4 text-slate-400" />
                聯絡電話
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="0912-345-678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                電子信箱
              </label>
              <input 
                type="email"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Briefcase className="h-4 w-4 text-slate-400" />
                所屬產業
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="例如：科技、製造、零售..."
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <MapPin className="h-4 w-4 text-slate-400" />
                聯絡地址
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="完整地址"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </fieldset>

          <div className="pt-4 flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {readOnly ? '關閉' : '取消'}
            </button>
            {!readOnly && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? '儲存中...' : (customer ? '儲存變更' : '建立客戶')}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
