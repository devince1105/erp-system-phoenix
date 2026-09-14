import React, { useState } from 'react';
import {
  CustomReportTemplate,
  CustomReportSection,
  SaveCustomReportTemplatePayload,
} from '@/features/accounting/types/accounting';
import { X, Save, Plus, Trash2, SlidersHorizontal } from 'lucide-react';

interface CustomReportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveCustomReportTemplatePayload) => Promise<void>;
  initialData?: CustomReportTemplate;
  readOnly?: boolean;
}

export function CustomReportTemplateModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  readOnly = false,
}: CustomReportTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sections, setSections] = useState<CustomReportSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const editKey = isOpen ? (initialData?.id ?? 'new') : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);

  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (isOpen) {
      setErrorMsg('');
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setIsActive(initialData.isActive);
        setSections(
          initialData.sections && initialData.sections.length > 0
            ? initialData.sections.map(s => ({ ...s }))
            : [
                {
                  title: '一、營業收入',
                  orderIndex: 1,
                  accountCodePrefixes: '41,42',
                  isDebitPositive: false,
                  isSubtotal: false,
                },
              ]
        );
      } else {
        setName('');
        setDescription('');
        setIsActive(true);
        setSections([
          {
            title: '一、主要項目',
            orderIndex: 1,
            accountCodePrefixes: '61',
            isDebitPositive: true,
            isSubtotal: false,
          },
        ]);
      }
    }
  }

  if (!isOpen) return null;

  const handleAddSection = () => {
    const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.orderIndex)) + 1 : 1;
    setSections(prev => [
      ...prev,
      {
        title: `段落 ${nextOrder}`,
        orderIndex: nextOrder,
        accountCodePrefixes: '',
        isDebitPositive: true,
        isSubtotal: false,
        formulaExpression: '',
      },
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSectionChange = (
    idx: number,
    field: keyof CustomReportSection,
    value: string | number | boolean
  ) => {
    setSections(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('請填寫報表範本名稱。');
      return;
    }

    if (sections.length === 0) {
      setErrorMsg('至少需建立一個報表段落。');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
        sections: sections.map((s, i) => ({
          ...s,
          orderIndex: s.orderIndex || i + 1,
        })),
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '儲存範本失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {readOnly ? '檢視自訂報表範本' : initialData ? '編輯自訂報表範本' : '新增自訂報表範本'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">定義報表科目代碼前綴分組、正負向借貸向與小計計算公式</p>
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
          <fieldset disabled={readOnly} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  報表範本名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 各部門營業費用明細表"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">啟用狀態</label>
                <div className="flex items-center h-10">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 font-medium">啟用此範本</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">報表說明 / 備註</label>
              <input
                type="text"
                placeholder="選填：說明此報表用途與核算對象"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            {/* 段落配置清單 */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-slate-800">報表段落與行次設定</span>
                  <p className="text-xs text-slate-500">段落順序將決定報表呈現的上下位置與公式計算參照編號。</p>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增段落
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                          {sec.orderIndex || idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="段落標題 (如: 一、薪資支出)"
                          value={sec.title}
                          onChange={e => handleSectionChange(idx, 'title', e.target.value)}
                          disabled={readOnly}
                          className="w-64 px-2.5 py-1.5 border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                          <input
                            type="checkbox"
                            checked={sec.isSubtotal}
                            onChange={e => handleSectionChange(idx, 'isSubtotal', e.target.checked)}
                            disabled={readOnly}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>設為小計/公式列</span>
                        </label>

                        {!readOnly && sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="刪除此段落"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {sec.isSubtotal ? (
                      <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-md text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-800 shrink-0">小計公式:</span>
                          <input
                            type="text"
                            placeholder="例如: 1-2 或 +1+2+3 (留空則自動加總本段落之前所有項目)"
                            value={sec.formulaExpression || ''}
                            onChange={e => handleSectionChange(idx, 'formulaExpression', e.target.value)}
                            disabled={readOnly}
                            className="flex-1 px-2.5 py-1 border border-amber-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white disabled:bg-slate-50"
                          />
                        </div>
                        <p className="text-[11px] text-amber-700">
                          數字代表段落編號，支援 + 或 -。例：輸入 <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">1-2</code> 即代表第 1 段落減第 2 段落。
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            包含科目代碼前綴 <span className="text-slate-400">(逗號分隔)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="例如: 61 或 6101,6201"
                            value={sec.accountCodePrefixes || ''}
                            onChange={e => handleSectionChange(idx, 'accountCodePrefixes', e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-medium mb-1">正負借貸向定義</label>
                          <select
                            value={sec.isDebitPositive ? 'debit' : 'credit'}
                            onChange={e => handleSectionChange(idx, 'isDebitPositive', e.target.value === 'debit')}
                            disabled={readOnly}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50"
                          >
                            <option value="debit">借方增加為正數 (+) — 適用於費用、資產科目</option>
                            <option value="credit">貸方增加為正數 (+) — 適用於收入、負債、權益科目</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                {isSubmitting ? '儲存中...' : '儲存範本'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
