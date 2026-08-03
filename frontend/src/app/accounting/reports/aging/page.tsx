'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { accountingApi, AgingReport } from '@/features/accounting/api/accountingApi';
import { useAuth } from '@/features/core/contexts/AuthContext';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Scale, ShieldAlert, AlertTriangle, Check, X } from 'lucide-react';

const PRIVILEGED = ['Admin', 'Accountant'];
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const BUCKETS = ['未到期', '1-30', '31-60', '61-90', '90+'];
const bucketColor = (b: string) =>
  b === '未到期' ? 'text-slate-500' : b === '1-30' ? 'text-amber-600 dark:text-amber-400'
  : b === '31-60' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400';

export default function AgingPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [tab, setTab] = useState<'ar' | 'ap'>('ar');
  const [report, setReport] = useState<AgingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settleId, setSettleId] = useState<number | null>(null);
  const [settleAmt, setSettleAmt] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    (tab === 'ar' ? accountingApi.getReceivablesAging() : accountingApi.getPayablesAging())
      .then(setReport)
      .catch((e) => { console.error(e); setReport(null); })
      .finally(() => setIsLoading(false));
  }, [tab]);

  useEffect(() => { if (canView) fetchData(); }, [canView, fetchData]);

  const doSettle = async (orderId: number) => {
    if (settleAmt <= 0) return alert(tab === 'ar' ? '收款金額須大於 0' : '付款金額須大於 0');
    setIsSaving(true);
    try {
      if (tab === 'ar') await accountingApi.settleReceivable(orderId, settleAmt);
      else await accountingApi.settlePayable(orderId, settleAmt);
      setSettleId(null); setSettleAmt(0); fetchData();
    } catch (err) { console.error(err); alert('沖銷失敗'); }
    finally { setIsSaving(false); }
  };

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '應收應付帳齡' }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">此報表為財務資料</h2>
          <p className="text-sm text-slate-500 mt-2">應收/應付帳齡僅限系統管理員與會計人員檢視。</p>
        </div>
      </div>
    );
  }

  const s = report?.summary;
  const isAr = tab === 'ar';
  const label = isAr ? '應收' : '應付';
  const settleLabel = isAr ? '收款' : '付款';
  const buckets = s ? [s.notDue, s.d1_30, s.d31_60, s.d61_90, s.d90Plus] : [0, 0, 0, 0, 0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '應收應付帳齡' }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="h-6 w-6 text-indigo-600" />
          應收 / 應付帳齡 (A/R · A/P Aging)
        </h1>
        <p className="text-sm text-slate-500 mt-1">已確認的{isAr ? '銷售訂單' : '採購單'}尚未沖銷的餘額,依逾期天數分齡。未設到期日者以單據日 + 30 天計。</p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['ar', 'ap'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSettleId(null); setIsLoading(true); }}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${tab === t ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            {t === 'ar' ? '應收帳款' : '應付帳款'}
          </button>
        ))}
      </div>

      {isLoading || !s ? (
        <div className="py-16 text-center text-slate-500">載入中...</div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
              <p className="text-xs text-slate-500">{label}未沖銷合計</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">{money(s.totalOutstanding)}</p>
              <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />逾期 {money(s.overdue)}</p>
            </div>
            {BUCKETS.map((b, i) => (
              <div key={b} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
                <p className={`text-xs ${bucketColor(b)}`}>{b === '未到期' ? b : `逾期 ${b}`}</p>
                <p className="text-lg font-bold mt-1 font-mono tabular-nums text-slate-800 dark:text-slate-200">{money(buckets[i])}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
            {report!.items.length === 0 ? (
              <div className="py-12 text-center text-slate-500">目前沒有未沖銷的{label}帳款。</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">單號</th>
                      <th className="px-5 py-3">{isAr ? '客戶' : '供應商'}</th>
                      <th className="px-5 py-3">到期日</th>
                      <th className="px-5 py-3 text-right">總額</th>
                      <th className="px-5 py-3 text-right">未沖銷</th>
                      <th className="px-5 py-3 text-center">帳齡</th>
                      <th className="px-5 py-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report!.items.map((it) => (
                      <tr key={it.orderId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">{it.orderNo}</td>
                        <td className="px-5 py-3 text-slate-800 dark:text-slate-200">{it.partnerName}</td>
                        <td className="px-5 py-3 text-slate-500 tabular-nums">{new Date(it.dueDate).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-500">{money(it.total)}</td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-white">{money(it.outstanding)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${bucketColor(it.bucket)} ${it.daysOverdue > 0 ? 'bg-red-50 dark:bg-red-900/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {it.bucket}{it.daysOverdue > 0 ? `（${it.daysOverdue}天）` : ''}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {settleId === it.orderId ? (
                            <div className="inline-flex items-center gap-1">
                              <input type="number" min="1" value={settleAmt || ''} onChange={(e) => setSettleAmt(Number(e.target.value))} autoFocus
                                placeholder={String(Math.round(it.outstanding))}
                                className="w-28 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200 font-mono text-sm" />
                              <button onClick={() => doSettle(it.orderId)} disabled={isSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-50" title="確認"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setSettleId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title="取消"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setSettleId(it.orderId); setSettleAmt(Math.round(it.outstanding)); }}
                              className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                              {settleLabel}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400">「{settleLabel}」會登記已{isAr ? '收' : '付'}金額並更新未沖銷餘額。收付款分錄自動拋轉會計傳票為後續強化項目。</p>
        </>
      )}
    </div>
  );
}
