'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { accountingApi, AccountTitle, JournalTemplate } from '@/features/accounting/api/accountingApi';
import { useAuth } from '@/features/core/contexts/AuthContext';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { BookMarked, Plus, Trash2, X, Pencil, ShieldAlert } from 'lucide-react';

const PRIVILEGED = ['Admin', 'Accountant'];

interface EditLine { accountTitleId: number; isDebit: boolean; amount: string; summary: string; }
const emptyForm = () => ({ id: 0, name: '', description: '', lines: [
  { accountTitleId: 0, isDebit: true, amount: '', summary: '' },
  { accountTitleId: 0, isDebit: false, amount: '', summary: '' },
] as EditLine[] });

export default function JournalTemplatesPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [accounts, setAccounts] = useState<AccountTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ReturnType<typeof emptyForm> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    Promise.all([accountingApi.getJournalTemplates(), accountingApi.getAccountTitles()])
      .then(([t, a]) => { setTemplates(t); setAccounts(a.filter((x) => x.isActive)); })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { if (canView) fetchData(); }, [canView, fetchData]);

  const acctName = (id: number) => accounts.find((a) => a.id === id)?.name ?? '—';

  const openNew = () => setModal(emptyForm());
  const openEdit = (t: JournalTemplate) => setModal({
    id: t.id, name: t.name, description: t.description ?? '',
    lines: t.lines.map((l) => ({ accountTitleId: l.accountTitleId, isDebit: l.isDebit, amount: l.amount > 0 ? String(l.amount) : '', summary: l.summary ?? '' })),
  });

  const setLine = (i: number, patch: Partial<EditLine>) =>
    setModal((m) => m && ({ ...m, lines: m.lines.map((l, idx) => idx === i ? { ...l, ...patch } : l) }));
  const addLine = () => setModal((m) => m && ({ ...m, lines: [...m.lines, { accountTitleId: 0, isDebit: true, amount: '', summary: '' }] }));
  const removeLine = (i: number) => setModal((m) => m && ({ ...m, lines: m.lines.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!modal) return;
    if (!modal.name.trim()) return alert('請填寫範本名稱');
    if (modal.lines.some((l) => !l.accountTitleId)) return alert('每一行都要選會計科目');
    if (!modal.lines.some((l) => l.isDebit) || !modal.lines.some((l) => !l.isDebit)) return alert('範本需同時包含借方與貸方');
    setIsSaving(true);
    try {
      const payload = {
        name: modal.name, description: modal.description, isActive: true,
        lines: modal.lines.map((l) => ({ accountTitleId: l.accountTitleId, isDebit: l.isDebit, amount: parseFloat(l.amount) || 0, summary: l.summary })),
      };
      if (modal.id) await accountingApi.updateJournalTemplate(modal.id, payload as unknown as Partial<JournalTemplate>);
      else await accountingApi.createJournalTemplate(payload as unknown as Partial<JournalTemplate>);
      setModal(null); fetchData();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? '儲存失敗');
    } finally { setIsSaving(false); }
  };

  const del = async (t: JournalTemplate) => {
    if (!confirm(`刪除範本「${t.name}」?`)) return;
    try { await accountingApi.deleteJournalTemplate(t.id); fetchData(); } catch { alert('刪除失敗'); }
  };

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '常用分錄範本' }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">僅限管理員 / 會計</h2>
          <p className="text-sm text-slate-500 mt-2">常用分錄範本由會計人員維護。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '常用分錄範本' }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-violet-600" /> 常用分錄範本 (Journal Templates)
          </h1>
          <p className="text-sm text-slate-500 mt-1">預先定義常見交易的借貸分錄;開傳票時於「套用常用分錄」一鍵帶入,再填金額即可。</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-sm">
          <Plus className="w-4 h-4" /> 新增範本
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">載入中...</div>
        ) : templates.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無範本,點右上角新增。</div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {templates.map((t) => (
              <li key={t.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">{t.name}</p>
                  {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {t.lines.map((l, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded ${l.isDebit ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                        {l.isDebit ? '借' : '貸'} {l.accountTitle?.name ?? acctName(l.accountTitleId)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="編輯"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(t)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="刪除"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{modal.id ? '編輯範本' : '新增分錄範本'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">範本名稱 <span className="text-red-500">*</span></label>
                  <input type="text" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })}
                    placeholder="例如:支付租金" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">說明</label>
                  <input type="text" value={modal.description} onChange={(e) => setModal({ ...modal, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">分錄明細</label>
                {modal.lines.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={l.isDebit ? 'D' : 'C'} onChange={(e) => setLine(i, { isDebit: e.target.value === 'D' })}
                      className="px-2 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 shrink-0">
                      <option value="D">借</option><option value="C">貸</option>
                    </select>
                    <select value={l.accountTitleId} onChange={(e) => setLine(i, { accountTitleId: Number(e.target.value) })}
                      className="flex-1 px-2 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 min-w-0">
                      <option value={0}>選科目...</option>
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} {a.name}</option>)}
                    </select>
                    <input type="text" value={l.summary} onChange={(e) => setLine(i, { summary: e.target.value })} placeholder="摘要"
                      className="w-32 px-2 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 shrink-0" />
                    <button onClick={() => removeLine(i)} disabled={modal.lines.length <= 2} className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addLine} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Plus className="w-4 h-4" /> 加一行
                </button>
                <p className="text-xs text-slate-400">金額於開傳票套用後再填;範本只固定科目與借貸方向。</p>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button onClick={save} disabled={isSaving} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-sm">{isSaving ? '儲存中...' : '儲存'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
