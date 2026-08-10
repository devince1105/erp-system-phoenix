'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { accountingApi, Note } from '@/features/accounting/api/accountingApi';
import { useAuth } from '@/features/core/contexts/AuthContext';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { ScrollText, Plus, X, Trash2, CheckCircle2, AlertTriangle, ShieldAlert, Ban } from 'lucide-react';

const PRIVILEGED = ['Admin', 'Accountant'];
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const daysUntil = (d: string) => Math.round((new Date(d).getTime() - Date.now()) / 86400000);

const emptyForm = (direction: string) => ({
  direction, instrument: '支票', partnerName: '', bankName: '', amount: 0,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  memo: '',
});

export default function NotesPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [tab, setTab] = useState<'Receivable' | 'Payable'>('Receivable');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ReturnType<typeof emptyForm> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    accountingApi.getNotes().then(setNotes).catch(console.error).finally(() => setIsLoading(false));
  }, []);
  useEffect(() => { if (canView) fetchData(); }, [canView, fetchData]);

  const rows = notes.filter((n) => n.direction === tab);
  const pending = rows.filter((n) => n.status === 'Pending');
  const outstanding = pending.reduce((s, n) => s + n.amount, 0);
  const dueSoon = pending.filter((n) => { const d = daysUntil(n.dueDate); return d >= 0 && d <= 7; }).reduce((s, n) => s + n.amount, 0);
  const overdue = pending.filter((n) => daysUntil(n.dueDate) < 0).reduce((s, n) => s + n.amount, 0);

  const save = async () => {
    if (!modal) return;
    if (!modal.partnerName.trim()) return alert('請填寫對象');
    if (modal.amount <= 0) return alert('票面金額須大於 0');
    setIsSaving(true);
    try {
      await accountingApi.createNote({ ...modal, issueDate: new Date(modal.issueDate).toISOString(), dueDate: new Date(modal.dueDate).toISOString() } as unknown as Partial<Note>);
      setModal(null); fetchData();
    } catch (err) { const e = err as { response?: { data?: { message?: string } } }; alert(e.response?.data?.message ?? '儲存失敗'); }
    finally { setIsSaving(false); }
  };

  const clear = async (n: Note) => {
    if (!confirm(`確定將票據 ${n.noteNo} 兌現?將拋轉一張${tab === 'Receivable' ? '入帳(借 銀行/貸 應收)' : '兌付(借 應付/貸 銀行)'}傳票。`)) return;
    try { const r = await accountingApi.clearNote(n.id); alert(r.voucherCreated ? '已兌現並拋轉傳票(草稿)。' : '已兌現。'); fetchData(); }
    catch { alert('兌現失敗'); }
  };
  const bounce = async (n: Note) => { if (!confirm(`標記 ${n.noteNo} 為退票?`)) return; try { await accountingApi.bounceNote(n.id); fetchData(); } catch { alert('操作失敗'); } };
  const del = async (n: Note) => { if (!confirm(`刪除票據 ${n.noteNo}?`)) return; try { await accountingApi.deleteNote(n.id); fetchData(); } catch (err) { const e = err as { response?: { data?: { message?: string } } }; alert(e.response?.data?.message ?? '刪除失敗'); } };

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '票據管理' }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">僅限管理員 / 會計</h2>
          <p className="text-sm text-slate-500 mt-2">票據管理由會計人員維護。</p>
        </div>
      </div>
    );
  }

  const isR = tab === 'Receivable';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '票據管理' }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-indigo-600" /> 票據管理 (Notes)
          </h1>
          <p className="text-sm text-slate-500 mt-1">支票/本票的到期與兌現追蹤。兌現時自動拋轉銀行分錄,連動應收/應付。</p>
        </div>
        <button onClick={() => setModal(emptyForm(tab))} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-sm">
          <Plus className="w-4 h-4" /> 登記{isR ? '收' : '付'}票
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['Receivable', 'Payable'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${tab === t ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            {t === 'Receivable' ? '應收票據 (收票)' : '應付票據 (付票)'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4"><p className="text-xs text-slate-500">未兌現合計</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{money(outstanding)}</p></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4"><p className="text-xs text-amber-600 dark:text-amber-400">7 天內到期</p><p className="text-2xl font-bold text-amber-600 mt-1 font-mono">{money(dueSoon)}</p></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4"><p className="text-xs text-red-500">逾期未兌現</p><p className="text-2xl font-bold text-red-500 mt-1 font-mono">{money(overdue)}</p></div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">載入中...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無{isR ? '收' : '付'}票紀錄。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">票號 / 種類</th><th className="px-5 py-3">對象</th><th className="px-5 py-3 text-right">金額</th>
                  <th className="px-5 py-3">到期日</th><th className="px-5 py-3 text-center">狀態</th><th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((n) => {
                  const d = daysUntil(n.dueDate);
                  const dueBadge = n.status !== 'Pending' ? null : d < 0
                    ? <span className="text-xs text-red-600 dark:text-red-400 inline-flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />逾期 {-d} 天</span>
                    : d <= 7 ? <span className="text-xs text-amber-600 dark:text-amber-400">{d} 天後到期</span> : null;
                  return (
                    <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-5 py-3"><span className="font-mono text-xs text-slate-400">{n.noteNo}</span><div className="text-slate-700 dark:text-slate-300">{n.instrument}</div></td>
                      <td className="px-5 py-3 text-slate-800 dark:text-slate-200">{n.partnerName}{n.bankName && <span className="text-xs text-slate-400 block">{n.bankName}</span>}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-white">{money(n.amount)}</td>
                      <td className="px-5 py-3"><div className="tabular-nums text-slate-600 dark:text-slate-300">{new Date(n.dueDate).toLocaleDateString()}</div>{dueBadge}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${n.status === 'Cleared' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : n.status === 'Bounced' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                          {n.status === 'Cleared' ? '已兌現' : n.status === 'Bounced' ? '退票' : '未兌現'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {n.status === 'Pending' ? (
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => clear(n)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded"><CheckCircle2 className="w-3.5 h-3.5" />兌現</button>
                            <button onClick={() => bounce(n)} className="p-1.5 text-slate-400 hover:text-red-600" title="退票"><Ban className="w-4 h-4" /></button>
                            <button onClick={() => del(n)} className="p-1.5 text-slate-400 hover:text-red-600" title="刪除"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ) : <span className="text-xs text-slate-400">{n.clearedDate ? new Date(n.clearedDate).toLocaleDateString() : '—'}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">登記{modal.direction === 'Receivable' ? '收' : '付'}票</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">票據種類</label>
                  <select value={modal.instrument} onChange={(e) => setModal({ ...modal, instrument: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    {['支票', '本票', '匯票'].map((x) => <option key={x} value={x}>{x}</option>)}</select></div>
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{modal.direction === 'Receivable' ? '客戶' : '供應商'} <span className="text-red-500">*</span></label>
                  <input type="text" value={modal.partnerName} onChange={(e) => setModal({ ...modal, partnerName: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">票面金額 <span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="1000" value={modal.amount} onChange={(e) => setModal({ ...modal, amount: Number(e.target.value) })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 font-mono" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">付款銀行</label>
                  <input type="text" value={modal.bankName} onChange={(e) => setModal({ ...modal, bankName: e.target.value })} placeholder="例如:台灣銀行" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">發票日</label>
                  <input type="date" value={modal.issueDate} onChange={(e) => setModal({ ...modal, issueDate: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">到期日</label>
                  <input type="date" value={modal.dueDate} onChange={(e) => setModal({ ...modal, dueDate: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button onClick={save} disabled={isSaving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-sm">{isSaving ? '儲存中...' : '登記'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
