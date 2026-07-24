"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchAccountTitles,
  fetchVouchers
} from "@/features/accounting/api";
import { AccountTitle, Voucher } from "@/features/accounting/types/accounting";
import { StatCards } from "@/features/accounting/components/StatCards";
import { FinancialCharts } from "@/features/accounting/components/FinancialCharts";
import { Activity } from "lucide-react";

export default function DashboardPage() {
  const [accountTitles, setAccountTitles] = useState<AccountTitle[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [titlesData, vouchersData] = await Promise.all([
        fetchAccountTitles(),
        fetchVouchers()
      ]);
      setAccountTitles(titlesData);
      setVouchers(vouchersData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">企業營運總覽</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">即時掌握公司整體財務與營運績效。</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 dark:border-cyan-500 border-t-transparent animate-spin mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">載入數據與圖表中...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400 text-xs font-semibold tracking-wider border border-blue-200 dark:border-cyan-500/20 shadow-sm dark:shadow-inner">
            <Activity className="h-3.5 w-3.5" />
            <span>財務會計模組即時數據</span>
          </div>
          
          {/* Dashboard Overview Cards */}
          <StatCards vouchers={vouchers} accountTitles={accountTitles} />

          {/* Visual Financial Charts */}
          <FinancialCharts vouchers={vouchers} accountTitles={accountTitles} />
        </div>
      )}

    </div>
  );
}
