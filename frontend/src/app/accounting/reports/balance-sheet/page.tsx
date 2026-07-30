'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { accountingApi, BalanceSheetReport } from '@/features/accounting/api/accountingApi';
import { Printer, Download, FileText } from 'lucide-react';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import * as XLSX from 'xlsx';
import { ReportPrintView } from '@/features/accounting/components/ReportPrintView';

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [companyName, setCompanyName] = useState('Phoenix ERP');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(() => {
    accountingApi.getBalanceSheet(asOfDate)
      .then(data => setReport(data))
      .catch(error => {
        console.error('Failed to fetch Balance Sheet report', error);
        alert('無法載入資產負債表，請檢查日期或網路連線。');
      })
      .finally(() => setIsLoading(false));
  }, [asOfDate]);

  useEffect(() => {
    fetchReport();
    accountingApi.getCompanyName().then(setCompanyName).catch(console.error);
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!report) return;
    
    // Prepare data for Excel
    const data = [
      ['資產 (Assets)'],
      ...report.assets.map(a => [a.title, a.amount]),
      ['資產總額', report.totalAssets],
      [''],
      ['負債 (Liabilities)'],
      ...report.liabilities.map(l => [l.title, l.amount]),
      ['負債總額', report.totalLiabilities],
      [''],
      ['權益 (Equity)'],
      ...report.equity.map(e => [e.title, e.amount]),
      ['權益總額', report.totalEquity],
      [''],
      ['負債及權益總額', report.totalLiabilitiesAndEquity],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '資產負債表');
    XLSX.writeFile(wb, `資產負債表_${asOfDate}.xlsx`);
  };

  const currentAssets = report?.assets.filter(a => a.code && /^(11|12|13)/.test(a.code)) || [];
  const nonCurrentAssets = report?.assets.filter(a => a.code && /^(14|15|16|17|18|19)/.test(a.code)) || [];
  
  const currentLiabilities = report?.liabilities.filter(l => l.code && /^(21|22|23)/.test(l.code)) || [];
  const nonCurrentLiabilities = report?.liabilities.filter(l => l.code && /^(24|25|26|27|28|29)/.test(l.code)) || [];

  const sum = (items: {amount: number}[]) => items.reduce((acc, curr) => acc + curr.amount, 0);

  const renderPrintSection = (title: string, items: any[]) => {
    if (!items || items.length === 0) return null;
    const total = sum(items);
    return (
      <>
        <tr>
          <td colSpan={2} className="py-1.5 text-black font-bold pt-4">{title}</td>
        </tr>
        {items.map((item, idx) => (
          <tr key={idx}>
            <td className="py-1 text-black pl-6">{item.title}</td>
            <td className="py-1 text-right font-mono text-black">{item.amount.toLocaleString()}</td>
          </tr>
        ))}
        <tr>
          <td className="py-2 text-black pl-6">{title}合計</td>
          <td className="py-2 text-right font-mono text-black border-t border-black">
            {total.toLocaleString()}
          </td>
        </tr>
      </>
    );
  };

  const renderWebSection = (title: string, items: any[]) => {
    if (!items || items.length === 0) return null;
    const total = sum(items);
    return (
      <>
        <tr>
          <td colSpan={2} className="py-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/30 pl-2">{title}</td>
        </tr>
        {items.map((item, idx) => (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
            <td className="py-2 text-slate-600 dark:text-slate-400 pl-8">{item.title}</td>
            <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300 pr-4">{item.amount.toLocaleString()}</td>
          </tr>
        ))}
        <tr>
          <td className="py-3 text-slate-700 dark:text-slate-300 pl-8 font-medium border-b border-slate-200 dark:border-slate-700">{title}合計</td>
          <td className="py-3 text-right font-mono font-medium text-slate-900 dark:text-slate-100 pr-4 border-b border-slate-200 dark:border-slate-700">
            {total.toLocaleString()}
          </td>
        </tr>
      </>
    );
  };

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto space-y-6 print:hidden">
        <Breadcrumbs items={[
          { label: '首頁', href: '/' },
          { label: '會計系統', href: '/accounting' },
          { label: '資產負債表' }
        ]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              資產負債表 (Balance Sheet)
            </h1>
            <p className="text-sm text-slate-500 mt-1">檢視特定基準日下的資產、負債與權益狀況。</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportExcel}
              disabled={!report}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              匯出 Excel
            </button>
            <button 
              onClick={handlePrint}
              disabled={!report}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              列印 PDF
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-end gap-4 bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5 flex-1 max-w-[300px]">
            <label className="block text-xs font-medium text-slate-500">報表基準日 (As Of Date)</label>
            <input 
              type="date" 
              value={asOfDate}
              onChange={e => setAsOfDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
            />
          </div>
          <button
            onClick={() => { setIsLoading(true); fetchReport(); }}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {isLoading ? '產生中...' : '產生報表'}
          </button>
        </div>

        {/* Report Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-8">
          
          <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">資產負債表</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              基準日：{asOfDate}
            </p>
          </div>

          {report ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
              {/* Left Column: Assets */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-800 dark:border-slate-300">資產</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {renderWebSection('流動資產', currentAssets)}
                    {renderWebSection('非流動資產', nonCurrentAssets)}
                    <tr>
                      <td className="py-4 font-bold text-slate-900 dark:text-white text-base">資產總計</td>
                      <td className="py-4 pr-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 text-lg border-b-4 border-double border-emerald-200 dark:border-emerald-900/50">
                        {report.totalAssets.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column: Liabilities & Equity */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-800 dark:border-slate-300">負債及權益</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {renderWebSection('流動負債', currentLiabilities)}
                    {renderWebSection('非流動負債', nonCurrentLiabilities)}
                    <tr>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/30 pl-2">負債總計</td>
                      <td className="py-3 pr-4 text-right font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/30">
                        {report.totalLiabilities.toLocaleString()}
                      </td>
                    </tr>
                    
                    <tr><td colSpan={2} className="py-2"></td></tr>
                    
                    {renderWebSection('權益', report.equity)}
                    
                    <tr>
                      <td className="py-4 font-bold text-slate-900 dark:text-white text-base">負債及權益總計</td>
                      <td className="py-4 pr-4 text-right font-bold font-mono text-blue-600 dark:text-blue-400 text-lg border-b-4 border-double border-blue-200 dark:border-blue-900/50">
                        {report.totalLiabilitiesAndEquity.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Balance Check */}
              <div className="lg:col-span-2 mt-2">
                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-sm border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">試算平衡檢查</span>
                  <span className={`font-bold ${report.totalAssets === report.totalLiabilitiesAndEquity ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {report.totalAssets === report.totalLiabilitiesAndEquity ? '借貸平衡 (Balanced)' : '不平衡 (Unbalanced)'}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-500">
              請選擇基準日並點擊「產生報表」
            </div>
          )}
        </div>
      </div>

      {/* Print View (Word Style) */}
      {report && (
        <ReportPrintView 
          title="資產負債表" 
          companyName={companyName} 
          dateString={`中華民國 ${new Date(asOfDate).getFullYear() - 1911} 年 ${new Date(asOfDate).getMonth() + 1} 月 ${new Date(asOfDate).getDate()} 日`}
        >
          <div className="grid grid-cols-2 gap-x-12 w-full text-[13px] leading-tight">
            {/* Left Column: Assets */}
            <div>
              <h3 className="font-bold text-black mb-2 text-center text-base border-b border-black pb-1">資產</h3>
              <table className="w-full border-collapse">
                <tbody>
                  {renderPrintSection('流動資產', currentAssets)}
                  {renderPrintSection('非流動資產', nonCurrentAssets)}
                  <tr><td colSpan={2} className="py-2"></td></tr>
                  <tr>
                    <td className="py-2 font-bold text-black text-sm">資產總計</td>
                    <td className="py-2 text-right font-bold font-mono text-black text-sm border-t border-b-4 border-double border-black">
                      ${report.totalAssets.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Column: Liabilities & Equity */}
            <div>
              <h3 className="font-bold text-black mb-2 text-center text-base border-b border-black pb-1">負債及權益</h3>
              <table className="w-full border-collapse">
                <tbody>
                  {renderPrintSection('流動負債', currentLiabilities)}
                  {renderPrintSection('非流動負債', nonCurrentLiabilities)}
                  
                  <tr><td colSpan={2} className="py-1"></td></tr>
                  <tr>
                    <td className="py-1.5 font-bold text-black">負債總計</td>
                    <td className="py-1.5 text-right font-bold font-mono text-black border-t border-black">
                      {report.totalLiabilities.toLocaleString()}
                    </td>
                  </tr>
                  
                  <tr><td colSpan={2} className="py-2"></td></tr>
                  
                  {renderPrintSection('權益', report.equity)}
                  
                  <tr><td colSpan={2} className="py-2"></td></tr>
                  <tr>
                    <td className="py-2 font-bold text-black text-sm">負債及權益總計</td>
                    <td className="py-2 text-right font-bold font-mono text-black text-sm border-t border-b-4 border-double border-black">
                      ${report.totalLiabilitiesAndEquity.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </ReportPrintView>
      )}
    </>
  );
}
