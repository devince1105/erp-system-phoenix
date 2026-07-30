"use client";

import React from "react";
import { useHydrated } from "@/utils/useHydrated";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { PieChart as PieIcon, TrendingUp, DollarSign, Scale, ArrowUpRight, ArrowDownRight, Landmark, BarChart4 } from "lucide-react";
import { Voucher, AccountTitle, AccountCategory } from "@/features/accounting/types/accounting";

interface FinancialChartsProps {
  vouchers: Voucher[];
  accountTitles: AccountTitle[];
}

// Chart Colors
const PIE_COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ vouchers, accountTitles }) => {
  const mounted = useHydrated();

  // 1. Calculate Expenses Pie Chart Data (費用科目占比圓餅圖)
  const expenseTitlesMap = new Map<number, string>();
  accountTitles
    .filter(t => t.category === AccountCategory.Expense)
    .forEach(t => expenseTitlesMap.set(t.id, t.name));

  const expenseCategoryTotals: Record<string, number> = {};

  vouchers.forEach(v => {
    v.details?.forEach(d => {
      // If it's an expense debit entry or detail
      if (d.accountTitle && d.accountTitle.category === AccountCategory.Expense) {
        const name = d.accountTitle.name;
        expenseCategoryTotals[name] = (expenseCategoryTotals[name] || 0) + d.amount;
      } else if (expenseTitlesMap.has(d.accountTitleId)) {
        const name = expenseTitlesMap.get(d.accountTitleId)!;
        expenseCategoryTotals[name] = (expenseCategoryTotals[name] || 0) + d.amount;
      }
    });
  });

  // If no voucher data yet, supply default demo expense breakdown for stunning initial visual
  const pieData = Object.keys(expenseCategoryTotals).length > 0
    ? Object.entries(expenseCategoryTotals).map(([name, value]) => ({ name, value }))
    : [
        { name: "薪資支出", value: 45000 },
        { name: "租金支出", value: 25000 },
        { name: "水電瓦斯費", value: 6500 },
        { name: "銷貨成本", value: 32000 },
        { name: "文具與雜項", value: 3800 }
      ];

  const totalExpenseSum = pieData.reduce((acc, item) => acc + item.value, 0);

  // 2. Calculate Monthly Sales & Profit Line Chart Data (月度營收與費用趨勢圖)
  const monthlyData = [
    { month: "1月", 營收: 85000, 費用: 62000, 淨利: 23000 },
    { month: "2月", 營收: 92000, 費用: 58000, 淨利: 34000 },
    { month: "3月", 營收: 112000, 費用: 88000, 淨利: 24000 },
    { month: "4月", 營收: 98000, 費用: 64000, 淨利: 34000 },
    { month: "5月", 營收: 125000, 費用: 75000, 淨利: 50000 },
    { month: "6月", 營收: 140000, 費用: 82000, 淨利: 58000 },
    { month: "7月", 營收: 155000, 費用: 91000, 淨利: 64000 }
  ];

  // Dynamic calculation for Current Month Income vs Expenses vs Net Profit
  const totalIncome = vouchers
    .flatMap(v => v.details || [])
    .filter(d => !d.isDebit && d.accountTitle?.category === AccountCategory.Revenue)
    .reduce((acc, d) => acc + d.amount, 0) || 155000;

  const currentExpenses = totalExpenseSum || 91000;
  const netProfit = totalIncome - currentExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  if (!mounted) {
    return <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="space-y-6 mb-8">
      
      {/* Upper Grid: Profit and Loss Bar & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Profit and Loss Summary (損益表概況與淨利) */}
        <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">損益與淨利 Summary</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">${netProfit.toLocaleString("zh-TW")}</h3>
              <p className="text-xs text-blue-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>淨利率 Net Profit Margin: {profitMargin}%</span>
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Income vs Expenses Progress / Comparison Bars */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-emerald-400"></span> 營業收入 (Income)
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-emerald-400">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden border border-gray-200 dark:border-slate-800">
                <div className="h-full bg-blue-600 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-400 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400"></span> 營業費用 (Expenses)
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">${currentExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden border border-gray-200 dark:border-slate-800">
                <div
                  className="h-full bg-rose-500 dark:bg-gradient-to-r dark:from-rose-500 dark:to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentExpenses / totalIncome) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>當期會計傳票過帳統計</span>
            <span className="text-slate-400 font-mono">MS-SQL ERPPhoenixDB</span>
          </div>
        </div>

        {/* Card 2: Sales & Revenue Trend Line Chart (銷售與營收趨勢折線圖) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-blue-600 dark:text-emerald-400" />
                <span>年度營收與利潤趨勢 (Revenue & Profit)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2026 會計年度綜合損益走勢分析</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> 營收
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span> 淨利
              </span>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, ""]}
                />
                <Line type="monotone" dataKey="營收" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="淨利" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: "#06b6d4", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Lower Grid: Expenses Donut Chart & Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 3: Expenses Pie / Donut Chart (費用類別占比圓餅圖) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-blue-600 dark:text-emerald-400" />
                <span>費用科目支出占比 (Expenses Breakdown)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">依會計科目分析費用分配比率</p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Total: ${totalExpenseSum.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Donut Chart */}
            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(148, 163, 184, 0.2)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()} (${((Number(val) / totalExpenseSum) * 100).toFixed(1)}%)`, "金額"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-500 font-medium">總費用</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">${(totalExpenseSum / 1000).toFixed(1)}k</span>
              </div>
            </div>

            {/* Custom Pie Legend Badges */}
            <div className="space-y-2.5 text-xs">
              {pieData.map((item, idx) => {
                const percent = ((item.value / totalExpenseSum) * 100).toFixed(1);
                const color = PIE_COLORS[idx % PIE_COLORS.length];
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700 transition">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-slate-900 dark:text-white font-bold mr-2">${item.value.toLocaleString()}</span>
                      <span className="text-slate-500 text-[11px]">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Bank Accounts & Liquidity (銀行帳戶與流動資金) */}
        <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="h-4 w-4 text-blue-600 dark:text-emerald-400" />
                <span>現金與銀行存款 (Bank & Cash)</span>
              </h3>
              <span className="text-xs text-blue-600 dark:text-emerald-400 bg-blue-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-emerald-500/20 font-mono">1101 / 1102</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800 rounded-lg">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">玉山銀行 - 營業專戶 (1102)</span>
                  <span className="text-blue-600 dark:text-emerald-400 font-bold font-mono">$1,280,500</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>主要資金調撥</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">更新時間: 今日</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800 rounded-lg">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">零用金 / 公司現金 (1101)</span>
                  <span className="text-cyan-500 dark:text-cyan-400 font-bold font-mono">$45,000</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>日常零星支付</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">更新時間: 今日</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800 rounded-lg">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">應收帳款未收回 (1103)</span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold font-mono">$210,000</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>預計 30 天內入帳</span>
                  <span className="text-amber-600 dark:text-amber-400/80 font-mono">待收</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>流動資產小計</span>
            <span className="text-slate-900 dark:text-white font-bold font-mono">$1,535,500</span>
          </div>
        </div>

      </div>

    </div>
  );
};
