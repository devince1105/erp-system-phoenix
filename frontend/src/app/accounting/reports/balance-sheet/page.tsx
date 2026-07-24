'use client';

import React, { useState, useEffect } from 'react';
import { accountingApi, BalanceSheetReport } from '@/features/accounting/api/accountingApi';
import { Printer, Download, Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [companyName, setCompanyName] = useState('Phoenix ERP');
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await accountingApi.getBalanceSheet(asOfDate);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch Balance Sheet report', error);
      alert('無法載入資產負債表，請檢查日期或網路連線。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    accountingApi.getCompanyName().then(setCompanyName).catch(console.error);
  }, []);

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            匯出 Excel
          </button>
          <button 
            onClick={handlePrint}
            disabled={!report}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            列印 PDF
          </button>
        </div>
      </div>

      {/* Toolbar (Hidden when printing) */}
      <div className="print:hidden flex items-end gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5 flex-1 max-w-[300px]">
          <label className="block text-xs font-medium text-slate-500">報表基準日 (As Of Date)</label>
          <input 
            type="date" 
            value={asOfDate}
            onChange={e => setAsOfDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
          />
        </div>
        <button 
          onClick={fetchReport}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50"
        >
          {isLoading ? '產生中...' : '產生報表'}
        </button>
      </div>

      {/* Report Container (Printable Area) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:font-serif">
        
        {/* Report Header */}
        <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 print:border-none">
          <h1 className="hidden print:block text-2xl font-bold print:text-black mb-1">{companyName}</h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white print:text-black print:text-xl">資產負債表</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 print:text-black">
            基準日：{asOfDate}
          </p>
        </div>

        {report ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 print:grid-cols-2 print:gap-x-8 print:gap-y-8 print:w-full">
            {/* Left Column: Assets */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-800 dark:border-slate-300 print:text-black print:border-black">資產 (Assets)</h3>
              <table className="w-full text-sm print:text-base print:border-collapse [&_td]:print:border [&_td]:print:border-black [&_td]:print:px-3 [&_td]:print:py-2">
                <tbody>
                  {report.assets.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{item.title}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/30 print:bg-gray-100">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white print:text-black">資產總計</td>
                    <td className="py-3 pr-4 text-right font-bold font-mono text-slate-900 dark:text-white text-base print:text-black">
                      {report.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Column: Liabilities & Equity */}
            <div className="space-y-12 print:space-y-8">
              {/* Liabilities */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-800 dark:border-slate-300 print:text-black print:border-black">負債 (Liabilities)</h3>
                <table className="w-full text-sm print:text-base print:border-collapse [&_td]:print:border [&_td]:print:border-black [&_td]:print:px-3 [&_td]:print:py-2">
                  <tbody>
                    {report.liabilities.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">{item.title}</td>
                        <td className="py-2.5 pr-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800/30 print:bg-gray-100">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white print:text-black">負債總計</td>
                      <td className="py-3 pr-4 text-right font-bold font-mono text-slate-900 dark:text-white text-base print:text-black">
                        {report.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Equity */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-800 dark:border-slate-300 print:text-black print:border-black">權益 (Equity)</h3>
                <table className="w-full text-sm print:text-base print:border-collapse [&_td]:print:border [&_td]:print:border-black [&_td]:print:px-3 [&_td]:print:py-2">
                  <tbody>
                    {report.equity.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">{item.title}</td>
                        <td className="py-2.5 pr-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800/30 print:bg-gray-100">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white print:text-black">權益總計</td>
                      <td className="py-3 pr-4 text-right font-bold font-mono text-slate-900 dark:text-white text-base print:text-black">
                        {report.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Total Liabilities & Equity */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-sm p-4 flex items-center justify-between border border-blue-100 dark:border-blue-800/50 print:bg-gray-200 print:border-black print:border-2 print:rounded-none">
                <span className="font-bold text-slate-900 dark:text-white text-base print:text-black">負債及權益總計</span>
                <span className="font-bold font-mono text-xl text-blue-600 dark:text-blue-400 print:text-black">
                  ${report.totalLiabilitiesAndEquity.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            
            {/* Balance Check */}
            <div className="lg:col-span-2 pt-6 mt-6 border-t-4 double border-slate-300 dark:border-slate-600 print:border-black print:border-t-2">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-sm print:bg-transparent print:border print:border-black print:rounded-none">
                <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-black">試算平衡檢查</span>
                <span className={`font-bold print:text-black ${report.totalAssets === report.totalLiabilitiesAndEquity ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
  );
}
