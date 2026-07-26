import React, { useState, useEffect } from 'react';
import { AccountTitle } from '@/features/accounting/api/accountingApi';
import { X, Save, AlertCircle } from 'lucide-react';

interface AccountTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AccountTitle>) => Promise<void>;
  initialData?: AccountTitle;
}

export function AccountTitleModal({ isOpen, onClose, onSave, initialData }: AccountTitleModalProps) {
  const [formData, setFormData] = useState<Partial<AccountTitle>>({
    code: '',
    name: '',
    category: 1,
    isActive: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          code: '',
          name: '',
          category: 1,
          isActive: true
        });
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data || err.message || '儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialData ? '編輯會計科目' : '新增會計科目'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-5 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 flex items-start gap-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                科目代碼 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="例如: 1101"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                科目類別 <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
                value={formData.category ?? 0}
                onChange={e => setFormData({ ...formData, category: parseInt(e.target.value) })}
              >
                <option value={1}>資產 (Asset)</option>
                <option value={2}>負債 (Liability)</option>
                <option value={3}>權益 (Equity)</option>
                <option value={4}>收益 (Revenue)</option>
                <option value={5}>費用 (Expense)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              科目名稱 <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如: 現金"
            />
          </div>



          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={formData.isActive ?? true}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              啟用此會計科目
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? '儲存中...' : '確認儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
