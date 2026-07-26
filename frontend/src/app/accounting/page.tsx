"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Voucher,
  ProfitAndLossReport,
  BalanceSheetReport 
} from "@/features/accounting/api/accountingApi";
import { accountingApi } from "@/features/accounting/api/accountingApi";
import { Wallet, Calculator, Building2, BookOpen, Clock, Activity, LineChart, FileText, TrendingUp, Landmark, PlusCircle, ArrowRight, BarChart3, PieChart } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AccountingDashboardPage() {
  const [recentVouchers, setRecentVouchers] = useState<Voucher[]>([]);
  const [plReport, setPlReport] = useState<ProfitAndLossReport | null>(null);
  const [bsReport, setBsReport] = useState<BalanceSheetReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Fetch recent vouchers
        const vouchersData = await accountingApi.getVouchers();
        // Sort by date descending and take top 5
        const sortedVouchers = [...vouchersData].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        setRecentVouchers(sortedVouchers);

        // 2. Fetch reports for current month KPI
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const startDateStr = firstDayOfMonth.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];

        const [plData, bsData] = await Promise.all([
          accountingApi.getProfitAndLoss(startDateStr, endDateStr),
          accountingApi.getBalanceSheet(endDateStr)
        ]);

        setPlReport(plData);
        setBsReport(bsData);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('$', '$ ');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-500">載入儀表板數據中...</p>
      </div>
    );
  }

  const plChartData = plReport ? [
    { name: '營業收入', value: plReport.totalRevenue, color: '#4f46e5' },
    { name: '營業費用', value: plReport.totalExpense, color: '#ea580c' },
    { name: '本期淨利', value: plReport.netProfit, color: plReport.netProfit >= 0 ? '#10b981' : '#ef4444' }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '會計系統' }
      ]} />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            財務會計總覽
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">本月關鍵營運指標與最新動態</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <Link
            href="/accounting/vouchers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-sm hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            新增傳票
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white dark:bg-slate-900 rounded-sm p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">資產總額</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(bsReport?.totalAssets)}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span>截至今日</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-sm p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">本月淨利</p>
              <h3 className={`text-2xl font-bold mt-1 ${
                (plReport?.netProfit || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(plReport?.netProfit)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span>本月累計</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-sm p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">本月營收</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(plReport?.totalRevenue)}
              </h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span>本月累計</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-sm p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">本月費用</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(plReport?.totalExpense)}
              </h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span>本月累計</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chart & Vouchers */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue vs Expense Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-5">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">本月收支結構分析</h2>
            </div>
            <div className="h-64 w-full">
              {plChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={plChartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, '金額']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {plChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">無收支資料</div>
              )}
            </div>
          </div>

          {/* Recent Vouchers List */}
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">近期傳票</h2>
            <Link href="/accounting/vouchers" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 font-medium transition-colors">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
            {recentVouchers.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">傳票號碼</th>
                    <th className="px-6 py-4">日期</th>
                    <th className="px-6 py-4">摘要</th>
                    <th className="px-6 py-4 text-right">總金額</th>
                    <th className="px-6 py-4 text-center">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {recentVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                        {voucher.voucherNo}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {new Date(voucher.voucherDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[150px] truncate" title={voucher.memo}>
                        {voucher.memo || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-200">
                        {formatCurrency(voucher.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          voucher.status === 3
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : voucher.status === 1
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {voucher.status === 3 ? '已過帳' : voucher.status === 1 ? '草稿' : '作廢'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500">
                目前沒有任何傳票記錄
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">快速操作</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-4 flex flex-col gap-3">
            <Link 
              href="/accounting/reports/profit-and-loss" 
              className="flex items-center gap-3 p-3 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200">檢視損益表</h4>
                <p className="text-xs text-slate-500 mt-0.5">查看公司盈虧狀況</p>
              </div>
            </Link>

            <Link 
              href="/accounting/reports/balance-sheet" 
              className="flex items-center gap-3 p-3 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
            >
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200">檢視資產負債表</h4>
                <p className="text-xs text-slate-500 mt-0.5">掌握最新資產負債與權益</p>
              </div>
            </Link>

            <Link 
              href="/accounting/accounts" 
              className="flex items-center gap-3 p-3 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
            >
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200">會計科目設定</h4>
                <p className="text-xs text-slate-500 mt-0.5">管理與修改會計項目</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
