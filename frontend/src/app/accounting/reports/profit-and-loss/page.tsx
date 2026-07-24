'use client';

import React, { useState, useEffect } from 'react';
import { accountingApi, ProfitAndLossReport } from '@/features/accounting/api/accountingApi';
import { Printer, Download, Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ProfitAndLossPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [report, setReport] = useState<ProfitAndLossReport | null>(null);
  const [companyName, setCompanyName] = useState('Phoenix ERP');
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await accountingApi.getProfitAndLoss(startDate, endDate);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch P&L report', error);
      alert('無法載入損益表，請檢查日期或網路連線。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    accountingApi.getCompanyName().then(setCompanyName).catch(console.error);
  }, []); // Run once on mount

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!report) return;
    
    // Prepare data for Excel
    const data = [
      ['營業收入'],
      ...report.revenues.map(r => [r.title, r.amount]),
      ['營業收入合計', report.totalRevenue],
      [''],
      ['營業費用'],
      ...report.expenses.map(e => [e.title, e.amount]),
      ['營業費用合計', report.totalExpense],
      [''],
      ['本期淨利 (Net Profit)', report.netProfit],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '損益表');
    XLSX.writeFile(wb, `損益表_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            損益表 (Profit & Loss)
          </h1>
          <p className="text-sm text-slate-500 mt-1">檢視特定期間內的營業收入與費用，掌握公司獲利狀況。</p>
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

      {/* Toolbar (Hidden when printing) */}
      <div className="print:hidden flex items-end gap-4 bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <label className="block text-xs font-medium text-slate-500">起始日期</label>
          <input 
            type="date" 
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
          />
        </div>
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <label className="block text-xs font-medium text-slate-500">結束日期</label>
          <input 
            type="date" 
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
          />
        </div>
        <button 
          onClick={fetchReport}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50"
        >
          {isLoading ? '產生中...' : '產生報表'}
        </button>
      </div>

      {/* Report Container (Printable Area) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:font-serif">
        
        {/* Report Header */}
        <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 print:border-none">
          <h1 className="hidden print:block text-2xl font-bold print:text-black mb-1">{companyName}</h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white print:text-black print:text-xl">損益表</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 print:text-black">
            期間：{startDate} 至 {endDate}
          </p>
        </div>

        {report ? (
          <div className="max-w-3xl mx-auto print:max-w-full">
            <table className="w-full text-sm print:text-base print:border-collapse [&_td]:print:border [&_td]:print:border-black [&_td]:print:px-3 [&_td]:print:py-2">
              <tbody>
                {/* Revenues */}
                <tr>
                  <td colSpan={2} className="py-3 font-bold text-slate-900 dark:text-white text-base">營業收入</td>
                </tr>
                {report.revenues.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="py-2.5 pl-6 text-slate-700 dark:text-slate-300">{item.title}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/30 print:bg-gray-100">
                  <td className="py-3 pl-6 font-semibold text-slate-900 dark:text-white print:text-black">營業收入合計</td>
                  <td className="py-3 pr-4 text-right font-bold font-mono text-slate-900 dark:text-white print:text-black">
                    {report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </td>
                </tr>

                <tr className="print:hidden"><td colSpan={2} className="py-4"></td></tr>

                {/* Expenses */}
                <tr>
                  <td colSpan={2} className="py-3 font-bold text-slate-900 dark:text-white text-base">營業費用</td>
                </tr>
                {report.expenses.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="py-2.5 pl-6 text-slate-700 dark:text-slate-300">{item.title}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/30 print:bg-gray-100">
                  <td className="py-3 pl-6 font-semibold text-slate-900 dark:text-white print:text-black">營業費用合計</td>
                  <td className="py-3 pr-4 text-right font-bold font-mono text-slate-900 dark:text-white print:text-black">
                    {report.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </td>
                </tr>

                <tr className="print:hidden"><td colSpan={2} className="py-6 border-b-2 border-slate-300 dark:border-slate-600"></td></tr>

                {/* Net Profit */}
                <tr className="bg-blue-50/50 dark:bg-blue-900/10 print:bg-gray-200">
                  <td className="py-4 pl-4 text-lg font-bold text-slate-900 dark:text-white print:text-black">本期淨利</td>
                  <td className={`py-4 pr-4 text-right text-xl font-bold font-mono print:text-black ${
                    report.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    ${report.netProfit.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            請選擇日期並點擊「產生報表」
          </div>
        )}
      </div>
    </div>
  );
}
