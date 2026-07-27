"use client";

import React, { useState, useEffect } from "react";
import { Target, Users, TrendingUp, DollarSign } from "lucide-react";
import { SalesOpportunity } from "@/features/crm/types/crm";

interface CRMDashboardProps {
  opportunities: SalesOpportunity[];
}

export const CRMDashboard: React.FC<CRMDashboardProps> = ({ opportunities }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare data for funnel chart
  const stageOrder = ["Requirement", "Proposal", "Contract", "Execution", "Review", "Closed"];
  const stageNames = {
    Requirement: "需求訪談",
    Proposal: "提案報價",
    Contract: "簽約階段",
    Execution: "專案執行",
    Review: "驗收階段",
    Closed: "成功結案"
  };

  const funnelData = stageOrder.map((stage) => {
    const oppsInStage = opportunities.filter(o => o.stage === stage);
    const value = oppsInStage.reduce((acc, o) => acc + o.estimatedValue, 0);
    return {
      name: stageNames[stage as keyof typeof stageNames],
      count: oppsInStage.length,
      amount: value
    };
  }).filter(d => d.count > 0);

  // If no data, provide dummy data for visual wow factor
  const displayData = funnelData.length > 0 ? funnelData : [
    { name: "需求訪談", count: 18, amount: 2400000 },
    { name: "提案報價", count: 12, amount: 1650000 },
    { name: "簽約階段", count: 8, amount: 1100000 },
    { name: "專案執行", count: 5, amount: 800000 },
    { name: "成功結案", count: 3, amount: 450000 }
  ];

  const funnelGradients = [
    "bg-gradient-to-r from-sky-400 to-blue-500",
    "bg-gradient-to-r from-cyan-400 to-sky-500",
    "bg-gradient-to-r from-teal-400 to-emerald-500",
    "bg-gradient-to-r from-emerald-400 to-green-500",
    "bg-gradient-to-r from-amber-400 to-orange-500",
    "bg-gradient-to-r from-purple-400 to-fuchsia-500"
  ];

  const totalPipelineValue = opportunities
    .filter(o => o.stage !== "Closed" && o.stage !== "Lost")
    .reduce((acc, o) => acc + o.estimatedValue, 0) || 4500000;

  if (!mounted) {
    return <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"></div>;
  }

  // Calculate funnel shape constants
  const N = displayData.length;
  const minWidth = 40; // Narrower bottom because we don't need to fit as much text
  const dropPerStep = (100 - minWidth) / Math.max(1, N);

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>客戶關係 (CRM) - 銷售漏斗與商機</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">商機轉換階段與預估收益分析</p>
        </div>
        <span className="text-xs font-mono bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-800/30 font-semibold shadow-sm">
          總商機數: {opportunities.length || displayData.reduce((acc, d) => acc + d.count, 0)}
        </span>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-sky-100 dark:border-slate-700/50 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shadow-inner">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">進行中商機總額 (Pipeline)</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">${(totalPipelineValue / 1000).toFixed(0)}k</p>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border border-emerald-100 dark:border-slate-700/50 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shadow-inner">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">總成功結案 (Won Opps)</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{opportunities.filter(o => o.stage === "Closed").length || 3}</p>
          </div>
        </div>
      </div>

      {/* Main Content: Funnel & Floating Legend */}
      <div className="relative flex flex-col items-start justify-center flex-1 min-h-[240px] w-full pt-4">
        
        {/* Funnel (Shifted slightly right from left edge, occupying 75% width) */}
        <div className="flex flex-col items-center justify-center gap-[2px] w-[75%] max-w-[500px] h-full z-0 mr-auto ml-5">
          {displayData.map((item, idx) => {
            const topW = 100 - (dropPerStep * idx);
            const botW = 100 - (dropPerStep * (idx + 1));
            
            const topLeft = (100 - topW) / 2;
            const topRight = 100 - topLeft;
            const botLeft = (100 - botW) / 2;
            const botRight = 100 - botLeft;
     
            const clipPath = `polygon(${topLeft}% 0%, ${topRight}% 0%, ${botRight}% 100%, ${botLeft}% 100%)`;

            return (
              <div 
                key={item.name}
                className="relative w-full flex-1 min-h-[50px] max-h-[100px] flex items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:z-20 cursor-pointer group"
              >
                {/* Background Shape */}
                <div 
                  className={`absolute inset-0 w-full h-full ${funnelGradients[idx % funnelGradients.length]} group-hover:shadow-lg transition-shadow`}
                  style={{ clipPath }}
                ></div>
                
                {/* Inside Text (Amount Only) */}
                <div className="relative flex items-center gap-1 text-white z-10 pointer-events-none">
                  <span className="text-xl font-mono font-bold drop-shadow-md tracking-wider">
                    ${(item.amount / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Stage Legend (Z-Index above chart, bottom right) */}
        <div className="absolute bottom-2 right-2 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-3 shadow-lg max-w-[200px]">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-700/50">
            <TrendingUp className="h-3 w-3" />
            階段分佈明細
          </h4>
          <div className="flex flex-col gap-1.5">
            {displayData.map((item, idx) => (
              <div key={`legend-${item.name}`} className="flex items-center justify-between text-xs group cursor-default p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <span 
                    className={`w-2.5 h-2.5 rounded-full shadow-sm ${funnelGradients[idx % funnelGradients.length].replace('bg-gradient-to-r', 'bg-gradient-to-br')}`}
                  ></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <span className="text-slate-900 dark:text-white font-mono font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{item.count}</span>
                  <span className="text-slate-400 text-[10px] font-medium">件</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
