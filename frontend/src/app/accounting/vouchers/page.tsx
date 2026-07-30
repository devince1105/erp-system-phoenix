'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { accountingApi } from '@/features/accounting/api/accountingApi';
import { Voucher } from '@/features/accounting/types/accounting';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Plus, Search, Filter, FileText, CheckCircle2, XCircle, Edit, Trash2, Download, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { ReportPrintView } from '@/features/accounting/components/ReportPrintView';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVouchers = useCallback(() => {
    accountingApi.getVouchers()
      .then(data => setVouchers(data))
      .catch(error => console.error('Failed to fetch vouchers', error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這筆傳票嗎？此操作無法復原。')) return;
    try {
      await accountingApi.deleteVoucher(id);
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.title || error.response?.data || '刪除失敗');
    }
  };

  const handleExportExcel = () => {
    const data = vouchers.map(v => ({
      '傳票號碼': v.voucherNo,
      '日期': new Date(v.voucherDate).toLocaleDateString(),
      '摘要': v.memo || '-',
      '總金額': v.totalAmount,
      '狀態': v.status === 1 ? '草稿' : v.status === 2 ? '已審核' : '已過帳'
    }));
    exportToExcel(data, '傳票列表');
  };

  const handleExportPDF = () => {
    exportToPDF('傳票列表');
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"><FileText className="w-3.5 h-3.5"/> 草稿</span>;
      case 2:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"><CheckCircle2 className="w-3.5 h-3.5"/> 已審核</span>;
      case 3:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"><CheckCircle2 className="w-3.5 h-3.5"/> 已過帳</span>;
      default:
        return <span>未知</span>;
    }
  };

  return (
    <>
    <div className="p-6 max-w-7xl mx-auto space-y-6 print:hidden">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '會計系統', href: '/accounting' },
        { label: '傳票管理' }
      ]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            傳票管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理與檢視公司的會計一般傳票。</p>
        </div>
        <Link 
          href="/accounting/vouchers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          新增傳票
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜尋傳票號碼或摘要..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-sm text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            匯出 Excel
          </button>
          <button onClick={handleExportPDF} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Printer className="w-4 h-4" />
            列印 PDF
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" />
            進階篩選
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">傳票號碼</th>
                <th className="px-6 py-4">日期</th>
                <th className="px-6 py-4">摘要</th>
                <th className="px-6 py-4 text-right">總金額</th>
                <th className="px-6 py-4 text-center">狀態</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    載入傳票中...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    目前沒有傳票資料。點擊右上角「新增傳票」來建立第一筆。
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {voucher.voucherNo}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(voucher.voucherDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={voucher.memo}>
                      {voucher.memo || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-200">
                      ${voucher.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(voucher.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {voucher.status === 1 ? (
                          <>
                            <Link href={`/accounting/vouchers/${voucher.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" title="編輯">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(voucher.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="刪除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="檢視明細">
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Print View */}
    <ReportPrintView 
      title="傳票列表 (Voucher List)"
      companyName="Phoenix ERP"
      dateString={`列印日期：${new Date().toLocaleDateString()}`}
      hideSignatures={false}
    >
      <table className="w-full text-sm text-left border-collapse border border-black text-black">
        <thead>
          <tr className="bg-gray-100 border-b border-black text-black">
            <th className="px-4 py-2 border-r border-black font-bold">傳票號碼</th>
            <th className="px-4 py-2 border-r border-black font-bold">日期</th>
            <th className="px-4 py-2 border-r border-black font-bold">摘要</th>
            <th className="px-4 py-2 border-r border-black font-bold text-right">總金額</th>
            <th className="px-4 py-2 font-bold text-center">狀態</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher, idx) => (
            <tr key={voucher.id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
              <td className="px-4 py-2 border-r border-b border-black">{voucher.voucherNo}</td>
              <td className="px-4 py-2 border-r border-b border-black">{new Date(voucher.voucherDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 border-r border-b border-black">{voucher.memo || "-"}</td>
              <td className="px-4 py-2 border-r border-b border-black text-right">${voucher.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 border-b border-black text-center">{voucher.status === 1 ? '草稿' : voucher.status === 2 ? '已審核' : '已過帳'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportPrintView>
    </>
  );
}
