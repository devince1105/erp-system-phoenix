"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Sector
} from "recharts";
import { PieChart as PieIcon, ArrowUpRight, DollarSign, Landmark, BarChart4 } from "lucide-react";
import { Voucher, AccountTitle, AccountCategory } from "@/features/accounting/types/accounting";

interface FinancialChartsProps {
  vouchers: Voucher[];
  accountTitles: AccountTitle[];
}

const PIE_COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899", "#3b82f6"];

// Custom Tooltip for AreaChart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl shadow-xl z-50">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
              </div>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                ${Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Active Shape for Donut Chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#64748b" className="text-[11px] font-medium font-sans">
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} dy={8} textAnchor="middle" fill={fill} className="text-base font-bold font-mono">
        ${(value / 1000).toFixed(1)}k
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Expand radius slightly on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300 drop-shadow-md"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.2}
      />
    </g>
  );
};

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ vouchers, accountTitles }) => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculate Expenses Pie Chart Data
  const expenseTitlesMap = new Map<number, string>();
  accountTitles
    .filter(t => t.category === AccountCategory.Expense)
    .forEach(t => expenseTitlesMap.set(t.id, t.name));

  const expenseCategoryTotals: Record<string, number> = {};

  vouchers.forEach(v => {
    v.details?.forEach(d => {
      if (d.accountTitle && d.accountTitle.category === AccountCategory.Expense) {
        const name = d.accountTitle.name;
        expenseCategoryTotals[name] = (expenseCategoryTotals[name] || 0) + d.amount;
      } else if (expenseTitlesMap.has(d.accountTitleId)) {
        const name = expenseTitlesMap.get(d.accountTitleId)!;
        expenseCategoryTotals[name] = (expenseCategoryTotals[name] || 0) + d.amount;
      }
    });
  });

  const pieDataRaw = Object.entries(expenseCategoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort descending

  const pieData = pieDataRaw.length > 0 
    ? pieDataRaw 
    : [
        { name: "薪資支出", value: 45000 },
        { name: "租金支出", value: 25000 },
        { name: "水電瓦斯費", value: 6500 },
        { name: "銷貨成本", value: 32000 },
        { name: "文具與雜項", value: 3800 }
      ];

  const totalExpenseSum = pieData.reduce((acc, item) => acc + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // 2. Real Data Aggregation for Area Chart (1-12 Months)
  const currentYear = new Date().getFullYear();
  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    營收: 0,
    費用: 0,
    淨利: 0
  }));

  vouchers.forEach(v => {
    const d = new Date(v.voucherDate);
    if (d.getFullYear() === currentYear) {
      const monthIdx = d.getMonth(); // 0-11
      
      v.details?.forEach(detail => {
        const category = detail.accountTitle?.category;
        
        // Income = Revenue Category
        if (category === AccountCategory.Revenue) {
          monthlyStats[monthIdx].營收 += detail.amount;
        } else if (category === AccountCategory.Expense) {
          monthlyStats[monthIdx].費用 += detail.amount;
        }
      });
    }
  });

  // Calculate Net Profit for each month
  monthlyStats.forEach(stat => {
    stat.淨利 = stat.營收 - stat.費用;
  });

  // Check if we have any real data, otherwise inject beautiful demo data
  const hasRealData = monthlyStats.some(s => s.營收 > 0 || s.費用 > 0);
  const displayMonthlyData = hasRealData ? monthlyStats : [
    { month: "1月", 營收: 85000, 費用: 62000, 淨利: 23000 },
    { month: "2月", 營收: 92000, 費用: 58000, 淨利: 34000 },
    { month: "3月", 營收: 112000, 費用: 88000, 淨利: 24000 },
    { month: "4月", 營收: 98000, 費用: 64000, 淨利: 34000 },
    { month: "5月", 營收: 125000, 費用: 75000, 淨利: 50000 },
    { month: "6月", 營收: 140000, 費用: 82000, 淨利: 58000 },
    { month: "7月", 營收: 155000, 費用: 91000, 淨利: 64000 },
    { month: "8月", 營收: 170000, 費用: 94000, 淨利: 76000 },
    { month: "9月", 營收: 165000, 費用: 90000, 淨利: 75000 },
    { month: "10月", 營收: 180000, 費用: 95000, 淨利: 85000 },
    { month: "11月", 營收: 210000, 費用: 105000, 淨利: 105000 },
    { month: "12月", 營收: 245000, 費用: 112000, 淨利: 133000 }
  ];

  // Calculate Totals for Summary
  const totalIncome = displayMonthlyData.reduce((acc, curr) => acc + curr.營收, 0);
  const currentExpenses = displayMonthlyData.reduce((acc, curr) => acc + curr.費用, 0);
  const netProfit = totalIncome - currentExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  if (!mounted) {
    return <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="space-y-6 mb-8">
      
      {/* Upper Grid: Profit and Loss Bar & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Profit and Loss Summary */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">損益與淨利 Summary</span>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">${netProfit.toLocaleString("zh-TW")}</h3>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1.5 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>淨利率 Margin: {profitMargin}%</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* Income vs Expenses Progress / Comparison Bars */}
          <div className="space-y-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div>
              <div className="flex justify-between text-xs mb-2 font-medium">
                <span className="text-slate-600 dark:text-slate-300">營業收入 (Income)</span>
                <span className="font-mono text-slate-900 dark:text-white">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2 font-medium">
                <span className="text-slate-600 dark:text-slate-300">營業費用 (Expenses)</span>
                <span className="font-mono text-slate-900 dark:text-white">${currentExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, totalIncome > 0 ? (currentExpenses / totalIncome) * 100 : 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Gradient Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <BarChart4 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>年度營收與利潤趨勢 (Revenue & Profit)</span>
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5">{currentYear} 會計年度綜合損益走勢分析</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 mt-4 md:mt-0">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm"></span> 營收
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm"></span> 淨利
              </span>
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="營收" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="淨利" 
                  stroke="#22d3ee" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Lower Grid: Expenses Donut Chart & Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 3: Interactive Expenses Donut Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                  <PieIcon className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </div>
                <span>費用科目支出占比 (Expenses Breakdown)</span>
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5">依會計科目分析費用分配比率</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Expenses</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">${totalExpenseSum.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-2">
            {/* Donut Chart */}
            <div className="h-64 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]} 
                        className="cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Note: The center label is now handled dynamically by renderActiveShape! */}
            </div>

            {/* Custom Pie Legend Badges */}
            <div className="space-y-3 text-xs pl-0 md:pl-4">
              {pieData.slice(0, 6).map((item, idx) => {
                const percent = ((item.value / totalExpenseSum) * 100).toFixed(1);
                const color = PIE_COLORS[idx % PIE_COLORS.length];
                const isActive = idx === activeIndex;
                return (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-md scale-[1.02]" 
                        : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full shrink-0 shadow-sm transition-transform ${isActive ? 'scale-125' : ''}`} style={{ backgroundColor: color }}></span>
                      <span className={`font-medium transition-colors ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="font-mono text-right flex items-center gap-3">
                      <span className={`font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        ${item.value.toLocaleString()}
                      </span>
                      <span className={`text-[10px] w-8 text-right font-semibold ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Bank Accounts & Liquidity */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                  <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>流動資金與帳戶</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="group p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-emerald-900/50 rounded-xl transition-all">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">玉山銀行 - 營業專戶</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-base tracking-tight">$1,280,500</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">1102</span>
                  <span>主要資金調撥</span>
                </div>
              </div>

              <div className="group p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 hover:border-cyan-200 dark:hover:border-cyan-900/50 rounded-xl transition-all">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">公司零用金</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold font-mono text-base tracking-tight">$45,000</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">1101</span>
                  <span>日常零星支付</span>
                </div>
              </div>

              <div className="group p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 hover:border-amber-200 dark:hover:border-amber-900/50 rounded-xl transition-all">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">應收帳款 (未結)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold font-mono text-base tracking-tight">$210,000</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">1103</span>
                  <span>預計 30 天內入帳</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Liquidity</span>
            <span className="text-xl text-slate-900 dark:text-white font-bold font-mono tracking-tight">$1,535,500</span>
          </div>
        </div>

      </div>

    </div>
  );
};
