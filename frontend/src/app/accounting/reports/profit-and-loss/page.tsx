'use client';

import React, { useState, useEffect } from 'react';
import { accountingApi, ProfitAndLossReport } from '@/features/accounting/api/accountingApi';
import { Printer, Download, Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { ReportPrintView } from '@/features/accounting/components/ReportPrintView';

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
  }, []);

  const handleExportPDF = async () => {
    if (!report) return;
    
    // Import dynamically or ensure exportUtils is imported at the top
    const { exportToPDF } = await import('@/utils/exportUtils');
    
    const headers = ['項目', '金額'];
    const data = [
      ['營業收入', ''],
      ...opRevenues.map(r => [r.title, r.amount.toLocaleString()]),
      ['營業收入合計', totalOpRev.toLocaleString()],
      ['營業成本', ''],
      ...opCosts.map(c => [c.title, `(${c.amount.toLocaleString()})`]),
      ['營業毛利', grossProfit.toLocaleString()],
      ['營業費用', ''],
      ...opExpenses.map(e => [e.title, `(${e.amount.toLocaleString()})`]),
      ['營業淨利', opProfit.toLocaleString()],
      ['營業外收入及支出', ''],
      ...nonOpItems.map(n => [n.title, n.amount.toLocaleString()]),
      ['本期淨利 (稅前)', `$${preTaxProfit.toLocaleString()}`]
    ];
    
    await exportToPDF(`損益表_${startDate}_${endDate}`, '綜合損益表 (Profit & Loss)', headers, data);
  };

  const handleExportExcel = () => {
    if (!report) return;
    
    // Prepare data for Excel
    const data = [
      ['營業收入', ''],
      ...opRevenues.map(r => [r.title, r.amount]),
      ['營業收入合計', totalOpRev],
      [''],
      ['營業成本', ''],
      ...opCosts.map(c => [c.title, -c.amount]),
      ['營業毛利', grossProfit],
      [''],
      ['營業費用', ''],
      ...opExpenses.map(e => [e.title, -e.amount]),
      ['營業淨利', opProfit],
      [''],
      ['營業外收入及支出', ''],
      ...nonOpItems.map(n => [n.title, n.amount]),
      [''],
      ['本期淨利 (Net Profit)', preTaxProfit],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '損益表');
    XLSX.writeFile(wb, `損益表_${startDate}_${endDate}.xlsx`);
  };

  const opRevenues = report?.revenues.filter(r => r.code && r.code.startsWith('4')) || [];
  const opCosts = report?.expenses.filter(e => e.code && e.code.startsWith('5')) || [];
  const opExpenses = report?.expenses.filter(e => e.code && e.code.startsWith('6')) || [];
  const nonOpItems = [
    ...(report?.revenues.filter(r => r.code && r.code.startsWith('7')) || []),
    ...(report?.expenses.filter(e => e.code && e.code.startsWith('7')).map(e => ({...e, amount: -e.amount})) || [])
  ];

  const sum = (items: {amount: number}[]) => items.reduce((acc, curr) => acc + curr.amount, 0);

  const totalOpRev = sum(opRevenues);
  const totalOpCost = sum(opCosts);
  const grossProfit = totalOpRev - totalOpCost;
  const totalOpExp = sum(opExpenses);
  const opProfit = grossProfit - totalOpExp;
  const totalNonOp = sum(nonOpItems);
  const preTaxProfit = opProfit + totalNonOp;

  const renderPrintSection = (title: string, items: any[], isDeduction = false) => {
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
            <td className="py-1 text-right font-mono text-black">
              {isDeduction ? `(${item.amount.toLocaleString()})` : item.amount.toLocaleString()}
            </td>
          </tr>
        ))}
        <tr>
          <td className="py-2 text-black pl-6">{title}合計</td>
          <td className="py-2 text-right font-mono text-black border-t border-black">
            {isDeduction ? `(${total.toLocaleString()})` : total.toLocaleString()}
          </td>
        </tr>
      </>
    );
  };

  const renderWebSection = (title: string, items: any[], isDeduction = false) => {
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
            <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300 pr-4">
              {isDeduction ? `(${item.amount.toLocaleString()})` : item.amount.toLocaleString()}
            </td>
          </tr>
        ))}
        <tr>
          <td className="py-3 text-slate-700 dark:text-slate-300 pl-8 font-medium border-b border-slate-200 dark:border-slate-700">{title}合計</td>
          <td className="py-3 text-right font-mono font-medium text-slate-900 dark:text-slate-100 pr-4 border-b border-slate-200 dark:border-slate-700">
            {isDeduction ? `(${total.toLocaleString()})` : total.toLocaleString()}
          </td>
        </tr>
      </>
    );
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto space-y-6 print:hidden">
        <Breadcrumbs items={[
          { label: '首頁', href: '/' },
          { label: '會計系統', href: '/accounting' },
          { label: '損益表' }
        ]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              onClick={handleExportPDF}
              disabled={!report}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              匯出 PDF
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-end gap-4 bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
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

        {/* Report Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-8">
          
          <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">損益表</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              期間：{startDate} 至 {endDate}
            </p>
          </div>

          {report ? (
            <div className="max-w-2xl mx-auto">
              <table className="w-full text-sm">
                <tbody>
                  {renderWebSection('營業收入', opRevenues)}
                  {renderWebSection('營業成本', opCosts, true)}
                  
                  <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                    <td className="py-3 font-bold text-slate-900 dark:text-white text-base pl-2">營業毛利</td>
                    <td className="py-3 pr-4 text-right font-bold font-mono text-blue-600 dark:text-blue-400 text-base">
                      {grossProfit.toLocaleString()}
                    </td>
                  </tr>

                  {renderWebSection('營業費用', opExpenses, true)}
                  
                  <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                    <td className="py-3 font-bold text-slate-900 dark:text-white text-base pl-2">營業淨利</td>
                    <td className="py-3 pr-4 text-right font-bold font-mono text-blue-600 dark:text-blue-400 text-base">
                      {opProfit.toLocaleString()}
                    </td>
                  </tr>
                  
                  {renderWebSection('營業外收入及支出', nonOpItems)}

                  <tr><td colSpan={2} className="py-2"></td></tr>

                  {/* Net Profit */}
                  <tr className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50">
                    <td className="py-4 pl-4 text-lg font-bold text-slate-900 dark:text-emerald-400">本期淨利</td>
                    <td className={`py-4 pr-4 text-right text-xl font-bold font-mono ${
                      preTaxProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${preTaxProfit.toLocaleString()}
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

      {/* Print View */}
      {report && (
        <ReportPrintView 
          title="綜合損益表" 
          companyName={companyName} 
          dateString={`民國 ${new Date(startDate).getFullYear() - 1911} 年 ${new Date(startDate).getMonth() + 1} 月 ${new Date(startDate).getDate()} 日 至 民國 ${new Date(endDate).getFullYear() - 1911} 年 ${new Date(endDate).getMonth() + 1} 月 ${new Date(endDate).getDate()} 日`}
        >
          <div className="w-[80%] mx-auto text-[13px] leading-tight">
            <table className="w-full border-collapse">
              <tbody>
                {renderPrintSection('營業收入', opRevenues)}
                {renderPrintSection('營業成本', opCosts, true)}
                
                <tr><td colSpan={2} className="py-1"></td></tr>
                <tr>
                  <td className="py-1.5 font-bold text-black text-sm">營業毛利</td>
                  <td className="py-1.5 text-right font-bold font-mono text-black border-t border-black text-sm">
                    {grossProfit.toLocaleString()}
                  </td>
                </tr>
                
                {renderPrintSection('營業費用', opExpenses, true)}
                
                <tr><td colSpan={2} className="py-1"></td></tr>
                <tr>
                  <td className="py-1.5 font-bold text-black text-sm">營業淨利</td>
                  <td className="py-1.5 text-right font-bold font-mono text-black border-t border-black text-sm">
                    {opProfit.toLocaleString()}
                  </td>
                </tr>
                
                {renderPrintSection('營業外收入及支出', nonOpItems)}
                
                <tr><td colSpan={2} className="py-3"></td></tr>
                <tr>
                  <td className="py-2 font-bold text-black text-base">本期淨利 (稅前)</td>
                  <td className="py-2 text-right font-bold font-mono text-black border-t border-b-4 border-double border-black text-base">
                    ${preTaxProfit.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ReportPrintView>
      )}
    </>
  );
}
