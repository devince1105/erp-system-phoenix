'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { accountingApi, FixedAsset } from '@/features/accounting/api/accountingApi';
import { useAuth } from '@/features/core/contexts/AuthContext';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Pagination } from '@/features/core/components/Pagination';
import { Building2, Plus, Trash2, Pencil, X, CalendarClock, ShieldAlert, Eye } from 'lucide-react';

const PRIVILEGED = ['Admin', 'Accountant'];
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const CATEGORIES = ['辦公設備', '機器設備', '運輸設備', '其他'];
const statusLabel = (s: string) => (s === 'InUse' ? '使用中' : s === 'FullyDepreciated' ? '已折舊完畢' : '已處分');

const emptyForm = () => ({
  id: 0, name: '', category: '辦公設備',
  acquisitionDate: new Date().toISOString().split('T')[0],
  acquisitionCost: 0, salvageValue: 0, usefulLifeMonths: 60,
});

export default function FixedAssetsPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ReturnType<typeof emptyForm> | null>(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    accountingApi.getFixedAssets().then(setAssets).catch(console.error).finally(() => setIsLoading(false));
  }, []);
  useEffect(() => { if (canView) fetchData(); }, [canView, fetchData]);

  const save = async () => {
    if (!modal) return;
    if (!modal.name.trim()) return alert('請填寫資產名稱');
    if (modal.acquisitionCost <= 0) return alert('取得成本須大於 0');
    if (modal.salvageValue < 0 || modal.salvageValue >= modal.acquisitionCost) return alert('殘值須介於 0 與取得成本之間');
    setIsSaving(true);
    try {
      const payload = { ...modal, acquisitionDate: new Date(modal.acquisitionDate).toISOString() } as unknown as Partial<FixedAsset>;
      if (modal.id) await accountingApi.updateFixedAsset(modal.id, payload);
      else await accountingApi.createFixedAsset(payload);
      setModal(null); fetchData();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? '儲存失敗');
    } finally { setIsSaving(false); }
  };

  const del = async (a: FixedAsset) => {
    if (!confirm(`刪除資產「${a.name}」?`)) return;
    try { await accountingApi.deleteFixedAsset(a.id); fetchData(); }
    catch (err) { const e = err as { response?: { data?: { message?: string } } }; alert(e.response?.data?.message ?? '刪除失敗'); }
  };

  const runDepreciation = async () => {
    if (!confirm(`確定提列 ${year}年${month}月 折舊?將更新各資產累計折舊並拋轉一張折舊傳票。`)) return;
    setIsRunning(true);
    try {
      const r = await accountingApi.depreciateAssets(year, month);
      alert(r.assetsDepreciated === 0 ? '本期沒有可提列折舊的資產(或已提列)。' :
        `已提列 ${r.assetsDepreciated} 項,折舊合計 ${money(r.totalDepreciation)},${r.voucherCreated ? '並拋轉折舊傳票(草稿)。' : '。'}`);
      fetchData();
    } catch { alert('提列失敗'); } finally { setIsRunning(false); }
  };

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '固定資產' }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">僅限管理員 / 會計</h2>
          <p className="text-sm text-slate-500 mt-2">固定資產與折舊由會計人員維護。</p>
        </div>
      </div>
    );
  }

  const totalCost = assets.reduce((s, a) => s + a.acquisitionCost, 0);
  const totalBook = assets.reduce((s, a) => s + a.bookValue, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '固定資產' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" /> 固定資產 (Fixed Assets)
          </h1>
          <p className="text-sm text-slate-500 mt-1">資產卡與直線法折舊;每月提列自動拋轉分錄(借 折舊費用 / 貸 累計折舊)。</p>
        </div>
        <button onClick={() => { setModalReadOnly(false); setModal(emptyForm()); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-sm">
          <Plus className="w-4 h-4" /> 新增資產
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">資產項數</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{assets.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">取得成本合計</p><p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">{money(totalCost)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">帳面淨值合計</p><p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">{money(totalBook)}</p>
        </div>
      </div>

      {/* Depreciation run */}
      <div className="flex items-end gap-3 bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="space-y-1"><label className="block text-xs text-slate-500">年</label>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
        <div className="space-y-1"><label className="block text-xs text-slate-500">月</label>
          <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
        <button onClick={runDepreciation} disabled={isRunning}
          className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium rounded-sm">
          <CalendarClock className="w-4 h-4" /> {isRunning ? '提列中...' : '本期提列折舊'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">載入中...</div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無固定資產,點右上角新增。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">編號 / 名稱</th><th className="px-5 py-3">類別</th>
                  <th className="px-5 py-3 text-right">取得成本</th><th className="px-5 py-3 text-right">月折舊</th>
                  <th className="px-5 py-3 text-right">累計折舊</th><th className="px-5 py-3 text-right">帳面淨值</th>
                  <th className="px-5 py-3 text-center">狀態</th><th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-3"><span className="font-mono text-xs text-slate-400">{a.assetNo}</span><div className="font-medium text-slate-900 dark:text-white">{a.name}</div></td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{a.category}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">{money(a.acquisitionCost)}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-500">{money(a.monthlyDepreciation)}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">{money(a.accumulatedDepreciation)}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-white">{money(a.bookValue)}</td>
                    <td className="px-5 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded ${a.status === 'InUse' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{statusLabel(a.status)}</span></td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => { setModalReadOnly(true); setModal({ id: a.id, name: a.name, category: a.category, acquisitionDate: a.acquisitionDate.split('T')[0], acquisitionCost: a.acquisitionCost, salvageValue: a.salvageValue, usefulLifeMonths: a.usefulLifeMonths }); }} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" title="檢視"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setModalReadOnly(false); setModal({ id: a.id, name: a.name, category: a.category, acquisitionDate: a.acquisitionDate.split('T')[0], acquisitionCost: a.acquisitionCost, salvageValue: a.salvageValue, usefulLifeMonths: a.usefulLifeMonths }); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="編輯"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => del(a)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="刪除"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {assets.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={assets.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{modalReadOnly ? '檢視資產' : modal.id ? '編輯資產' : '新增固定資產'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <fieldset disabled={modalReadOnly} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">資產名稱 <span className="text-red-500">*</span></label>
                  <input type="text" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} placeholder="例如:業務部筆電" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">類別</label>
                  <select value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">取得日期</label>
                  <input type="date" value={modal.acquisitionDate} onChange={(e) => setModal({ ...modal, acquisitionDate: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">耐用月數</label>
                  <input type="number" min="1" value={modal.usefulLifeMonths} onChange={(e) => setModal({ ...modal, usefulLifeMonths: Number(e.target.value) })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">取得成本 <span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="1000" value={modal.acquisitionCost} onChange={(e) => setModal({ ...modal, acquisitionCost: Number(e.target.value) })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 font-mono" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">殘值</label>
                  <input type="number" min="0" step="1000" value={modal.salvageValue} onChange={(e) => setModal({ ...modal, salvageValue: Number(e.target.value) })} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 font-mono" /></div>
              </div>
              <p className="text-xs text-slate-400">直線法月折舊 = (取得成本 − 殘值) ÷ 耐用月數 ≈ {money(modal.usefulLifeMonths > 0 ? (modal.acquisitionCost - modal.salvageValue) / modal.usefulLifeMonths : 0)}/月</p>
              </fieldset>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">{modalReadOnly ? '關閉' : '取消'}</button>
                {!modalReadOnly && (
                <button onClick={save} disabled={isSaving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-sm">{isSaving ? '儲存中...' : '儲存'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
