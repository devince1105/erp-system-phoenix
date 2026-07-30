import React, { useState } from 'react';
import { Partner } from '@/features/inventory/types/inventory';
import { X, Save, Building2, User } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Partner>) => Promise<void>;
  initialData?: Partner;
}

export function PartnerModal({ isOpen, onClose, onSave, initialData }: PartnerModalProps) {
  const [formData, setFormData] = useState<Partial<Partner>>({
    type: 1,
    name: '',
    taxId: '',
    contactPerson: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editKey = isOpen ? (initialData?.id ?? 'new') : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);
  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (isOpen) {
      if (initialData) {
        setFormData({
          type: initialData.type,
          name: initialData.name,
          taxId: initialData.taxId || '',
          contactPerson: initialData.contactPerson || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
        });
      } else {
        setFormData({
          type: 1,
          name: '',
          taxId: '',
          contactPerson: '',
          phone: '',
          address: '',
        });
      }
    }
  }

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save partner', error);
      alert('儲存失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {initialData ? '編輯客戶/廠商' : '新增客戶/廠商'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="partner-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">身分種類 <span className="text-rose-500">*</span></label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-sm gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 1 })}
                  className={`flex-1 flex justify-center items-center gap-2 py-1.5 text-sm font-bold rounded-sm transition-colors ${
                    formData.type === 1 
                      ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  客戶
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 2 })}
                  className={`flex-1 flex justify-center items-center gap-2 py-1.5 text-sm font-bold rounded-sm transition-colors ${
                    formData.type === 2 
                      ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-700 dark:text-purple-400' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  供應商
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {formData.type === 1 ? '客戶名稱' : '廠商名稱'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formData.type === 1 ? "例如: 誠品生活" : "例如: 布行紡織開發實業"}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">統一編號</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 12345678"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">聯絡電話</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 02-2345-6789"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">聯絡人</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 李店長"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">公司地址</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 台北市信義區松高路11號"
              />
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
            form="partner-form"
            disabled={isSubmitting}
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
