'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { accountingApi, CashFlowReport } from '@/features/accounting/api/accountingApi';
import { Download, Waves, CheckCircle2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';

// Accounting style: outflows / negatives in parentheses.
const acct = (n: number) => (n < 0 ? `(${Math.abs(n).toLocaleString()})` : n.toLocaleString());

const SectionTotal = ({ label, amount }: { label: string; amount: number }) => (
  <tr>
    <td className="py-3 pl-4 font-semibold text-slate-900 dark:text-slate-100 border-t border-slate-300 dark:border-slate-600">{label}</td>
    <td className="py-3 pr-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 border-t border-slate-300 dark:border-slate-600 tabular-nums">{acct(amount)}</td>
  </tr>
);

const LineRow = ({ label, amount, indent = 8 }: { label: string; amount: number; indent?: number }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800/50">
    <td className="py-2 text-slate-600 dark:text-slate-400" style={{ paddingLeft: indent * 4 }}>{label}</td>
    <td className="py-2 pr-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">{acct(amount)}</td>
  </tr>
);

export default function CashFlowPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(() => {
    accountingApi.getCashFlow(startDate, endDate)
      .then(setReport)
      .catch((error) => {
        console.error('Failed to fetch cash-flow report', error);
        alert('無法載入現金流量表，請檢查日期或網路連線。');
      })
      .finally(() => setIsLoading(false));
  }, [startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExportExcel = () => {
    if (!report) return;
    const rows: (string | number)[][] = [
      ['現金流量表（間接法）', ''],
      [`期間：${report.startDate} 至 ${report.endDate}`, ''],
      ['', ''],
      ['營業活動之現金流量', ''],
      ['　本期損益', report.netIncome],
      ...report.operating.addbacks.map((a) => [`　${a.title}（回加）`, a.amount]),
      ...report.operating.workingCapital.map((w) => [`　${w.title}`, w.amount]),
      ['　營業活動之淨現金流量', report.operating.total],
      ['', ''],
      ['投資活動之現金流量', ''],
      ...report.investing.items.map((i) => [`　${i.title}`, i.amount]),
      ['　投資活動之淨現金流量', report.investing.total],
      ['', ''],
      ['理財活動之現金流量', ''],
      ...report.financing.items.map((f) => [`　${f.title}`, f.amount]),
      ['　理財活動之淨現金流量', report.financing.total],
      ['', ''],
      ['本期現金及約當現金淨變動', report.netChange],
      ['期初現金及約當現金', report.openingCash],
      ['期末現金及約當現金', report.endingCash],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '現金流量表');
    XLSX.writeFile(wb, `現金流量表_${report.startDate}_${report.endDate}.xlsx`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '會計系統', href: '/accounting' }, { label: '現金流量表' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Waves className="h-6 w-6 text-indigo-600" />
            現金流量表 (Cash Flow)
          </h1>
          <p className="text-sm text-slate-500 mt-1">間接法：自本期損益出發，依科目分類推導營業、投資、理財三段現金流量。</p>
        </div>
        <button onClick={handleExportExcel} disabled={!report}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-medium rounded-sm transition-colors disabled:opacity-50">
          <Download className="w-4 h-4" /> 匯出 Excel
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-end gap-4 bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <label className="block text-xs font-medium text-slate-500">起始日期</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200" />
        </div>
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <label className="block text-xs font-medium text-slate-500">結束日期</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200" />
        </div>
        <button onClick={() => { setIsLoading(true); fetchReport(); }} disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50">
          {isLoading ? '產生中...' : '產生報表'}
        </button>
      </div>

      {/* Report */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-8">
        <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">現金流量表</h2>
          <p className="text-xs text-slate-400 mt-1">間接法</p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">期間：{startDate} 至 {endDate}</p>
        </div>

        {!report ? (
          <div className="py-12 text-center text-slate-500">{isLoading ? '產生中...' : '尚無資料'}</div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <table className="w-full text-sm">
              <tbody>
                {/* Operating */}
                <tr><td colSpan={2} className="py-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/30 pl-2">營業活動之現金流量</td></tr>
                <LineRow label="本期損益" amount={report.netIncome} />
                {report.operating.addbacks.map((a, i) => <LineRow key={`a${i}`} label={`${a.title}（回加非現金）`} amount={a.amount} />)}
                {report.operating.workingCapital.length > 0 && (
                  <tr><td colSpan={2} className="pt-3 pb-1 pl-6 text-xs text-slate-400">營運資金變動</td></tr>
                )}
                {report.operating.workingCapital.map((w, i) => <LineRow key={`w${i}`} label={w.title} amount={w.amount} indent={12} />)}
                <SectionTotal label="營業活動之淨現金流量" amount={report.operating.total} />

                {/* Investing */}
                <tr><td colSpan={2} className="py-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/30 pl-2 pt-6">投資活動之現金流量</td></tr>
                {report.investing.items.length === 0
                  ? <LineRow label="（無投資活動）" amount={0} />
                  : report.investing.items.map((it, i) => <LineRow key={`i${i}`} label={it.title} amount={it.amount} />)}
                <SectionTotal label="投資活動之淨現金流量" amount={report.investing.total} />

                {/* Financing */}
                <tr><td colSpan={2} className="py-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/30 pl-2 pt-6">理財活動之現金流量</td></tr>
                {report.financing.items.length === 0
                  ? <LineRow label="（無理財活動）" amount={0} />
                  : report.financing.items.map((f, i) => <LineRow key={`f${i}`} label={f.title} amount={f.amount} />)}
                <SectionTotal label="理財活動之淨現金流量" amount={report.financing.total} />

                {/* Reconciliation */}
                <tr>
                  <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white pt-6">本期現金及約當現金淨變動</td>
                  <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums pt-6">{acct(report.netChange)}</td>
                </tr>
                <LineRow label="期初現金及約當現金" amount={report.openingCash} indent={2} />
                <tr>
                  <td className="py-3 pl-2 font-bold text-indigo-700 dark:text-indigo-300 border-t-2 border-slate-800 dark:border-slate-200">期末現金及約當現金</td>
                  <td className="py-3 pr-4 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300 border-t-2 border-slate-800 dark:border-slate-200 tabular-nums">{acct(report.endingCash)}</td>
                </tr>
              </tbody>
            </table>

            {/* Reconciliation badge */}
            <div className="mt-6 flex justify-center">
              {report.reconciles ? (
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已與現金科目實際變動對帳一致
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> 與現金科目變動 {acct(report.cashMovementCheck)} 不一致，請檢查分類
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
