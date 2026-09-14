import React, { useState } from 'react';
import { Warehouse } from '@/features/inventory/types/inventory';
import { X, Save, Warehouse as WarehouseIcon } from 'lucide-react';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Warehouse>) => Promise<void>;
  initialData?: Warehouse;
  readOnly?: boolean;
}

export function WarehouseModal({ isOpen, onClose, onSave, initialData, readOnly = false }: WarehouseModalProps) {
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
    isDefault: false,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editKey = isOpen ? (initialData?.id ?? 'new') : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);
  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.name,
          address: initialData.address || '',
          contactPerson: initialData.contactPerson || '',
          phone: initialData.phone || '',
          isDefault: initialData.isDefault,
          isActive: initialData.isActive,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          address: '',
          contactPerson: '',
          phone: '',
          isDefault: false,
          isActive: true,
        });
      }
    }
  }

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <WarehouseIcon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800">
              {readOnly ? '檢視倉庫主檔' : initialData ? '編輯倉庫' : '新增倉庫'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={readOnly} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                倉庫代碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                required
                placeholder="例如: WH-TPE"
                value={formData.code || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                倉庫名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="例如: 台北總倉"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  負責人
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="姓名"
                  value={formData.contactPerson || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  連絡電話
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="電話號碼"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                倉庫地址
              </label>
              <input
                type="text"
                name="address"
                placeholder="完整地址"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm text-slate-700 font-medium">設為系統預設倉庫</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive !== false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm text-slate-700 font-medium">啟用狀態</span>
              </label>
            </div>
          </fieldset>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? '儲存中...' : '儲存'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
