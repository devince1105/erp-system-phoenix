"use client";

import React from "react";
import { Wallet, TrendingUp, TrendingDown, FileText, ArrowUpRight } from "lucide-react";
import { Voucher, AccountTitle, AccountCategory } from "@/features/accounting/types/accounting";

interface StatCardsProps {
  vouchers: Voucher[];
  accountTitles: AccountTitle[];
}

export const StatCards: React.FC<StatCardsProps> = ({ vouchers, accountTitles }) => {
  // Calculate summary metrics
  const totalAssetsTitles = accountTitles.filter(t => t.category === AccountCategory.Asset).length;
  const totalRevenueTitles = accountTitles.filter(t => t.category === AccountCategory.Revenue).length;
  const totalExpenseTitles = accountTitles.filter(t => t.category === AccountCategory.Expense).length;

  const totalVouchersCount = vouchers.length;
  const totalVouchersAmount = vouchers.reduce((acc, v) => acc + (v.totalAmount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-slate-700/80 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">當期傳票總額</span>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <FileText className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight break-all">
            ${totalVouchersAmount.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center">
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono inline-flex">
              {totalVouchersCount} 筆傳票
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-emerald-400" />
          <span>會計借貸平衡雙向檢核通過</span>
        </div>
      </div>

      {/* 資產類科目 */}
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-slate-700/80 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">資產類科目 (1xxx)</span>
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totalAssetsTitles} <span className="text-sm font-normal text-slate-400">個科目</span>
          </h3>
          <div className="flex items-center">
            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-mono inline-flex">
              Asset
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">包含現金、銀行存款、應收帳款</div>
      </div>

      {/* 收入類科目 */}
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-slate-700/80 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">營業收入科目 (4xxx)</span>
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totalRevenueTitles} <span className="text-sm font-normal text-slate-400">個科目</span>
          </h3>
          <div className="flex items-center">
            <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-mono inline-flex">
              Revenue
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">包含銷貨收入、勞務收入</div>
      </div>

      {/* 費用類科目 */}
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-slate-700/80 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">營業費用科目 (5-6xxx)</span>
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totalExpenseTitles} <span className="text-sm font-normal text-slate-400">個科目</span>
          </h3>
          <div className="flex items-center">
            <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono inline-flex">
              Expense
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">包含銷貨成本、薪資與租金支出</div>
      </div>

    </div>
  );
};
