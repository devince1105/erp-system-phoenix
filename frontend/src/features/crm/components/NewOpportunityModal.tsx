import React, { useState, useEffect } from 'react';
import { crmApi } from '@/features/crm/api/crmApi';
import { Customer } from '@/features/crm/types/crm';
import { X, Building2, Briefcase, DollarSign, Calendar, FileText } from 'lucide-react';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewOpportunityModal({ isOpen, onClose, onSuccess }: NewOpportunityModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    estimatedValue: '',
    stage: 'Requirement',
    expectedCloseDate: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      crmApi.getCustomers().then(setCustomers).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.title || !formData.estimatedValue) {
      alert("請填寫必填欄位");
      return;
    }

    setIsSubmitting(true);
    try {
      await crmApi.createOpportunity({
        customerId: parseInt(formData.customerId, 10),
        title: formData.title,
        estimatedValue: parseFloat(formData.estimatedValue),
        stage: formData.stage,
        expectedCloseDate: formData.expectedCloseDate || null,
        notes: formData.notes
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("新增失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增專案 (商機)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Building2 className="h-4 w-4 text-slate-400" />
              所屬客戶 <span className="text-rose-500">*</span>
            </label>
            <select 
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              required
            >
              <option value="" disabled>請選擇客戶...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Briefcase className="h-4 w-4 text-slate-400" />
              專案名稱 <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
              placeholder="例如：2026 年度 ERP 導入專案"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <DollarSign className="h-4 w-4 text-slate-400" />
                預估金額 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                placeholder="0"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                預期結案日
              </label>
              <input 
                type="date"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              備註說明
            </label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200 resize-none"
              placeholder="請填寫專案的背景資訊或注意事項..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
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
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? '建立中...' : '建立專案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
