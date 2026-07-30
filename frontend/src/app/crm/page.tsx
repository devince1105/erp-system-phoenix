"use client";

import React, { useCallback, useState, useEffect } from "react";
import { crmApi } from "@/features/crm/api/crmApi";
import { SalesOpportunity } from "@/features/crm/types/crm";
import { Briefcase, Plus, DollarSign, Calendar, Building2 } from "lucide-react";
import { NewOpportunityModal } from "@/features/crm/components/NewOpportunityModal";
import { ConvertToOrderModal } from "@/features/crm/components/ConvertToOrderModal";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

const STAGES = [
  { id: "Requirement", title: "需求洽談", color: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-200 dark:border-slate-700" },
  { id: "Proposal", title: "提案報價", color: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" },
  { id: "Contract", title: "簽約付訂", color: "bg-purple-50 dark:bg-purple-900/20", borderColor: "border-purple-200 dark:border-purple-800" },
  { id: "Execution", title: "專案執行", color: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800" },
  { id: "Review", title: "驗收請款", color: "bg-cyan-50 dark:bg-cyan-900/20", borderColor: "border-cyan-200 dark:border-cyan-800" },
  { id: "Closed", title: "結案 (收案)", color: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-200 dark:border-emerald-800" },
  { id: "Lost", title: "流失/終止", color: "bg-rose-50 dark:bg-rose-900/20", borderColor: "border-rose-200 dark:border-rose-800" }
];

export default function CRMDashboard() {
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertingOpportunity, setConvertingOpportunity] = useState<SalesOpportunity | null>(null);

  const fetchOpportunities = useCallback(() => {
    crmApi.getOpportunities()
      .then(data => setOpportunities(data))
      .catch(error => console.error("Failed to load opportunities", error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("opportunityId", id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("opportunityId"), 10);
    if (!id || !newStage) return;

    if (newStage === "Closed") {
      const opp = opportunities.find(o => o.id === parseInt(id.toString()));
      if (opp) {
        setConvertingOpportunity(opp);
        setIsConvertModalOpen(true);
      }
      return; // Do not update backend yet, wait for modal
    }

    // Optimistic UI Update for other stages
    const prevOpportunities = [...opportunities];
    setOpportunities(prev => prev.map(o => 
      o.id === parseInt(id.toString()) ? { ...o, stage: newStage } : o
    ));

    try {
      await crmApi.updateOpportunityStage(id, newStage);
    } catch (err) {
      console.error("Failed to update stage", err);
      alert("更新狀態失敗");
      setOpportunities(prevOpportunities);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="h-8 w-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Calculate total pipeline value (exclude closed and lost)
  const totalValue = opportunities.filter(o => o.stage !== 'Lost' && o.stage !== 'Closed').reduce((acc, curr) => acc + curr.estimatedValue, 0);

  return (
    <div className="flex flex-col h-full text-slate-900 dark:text-slate-100">
      <div className="px-6 pt-6 pb-2">
        <Breadcrumbs items={[
          { label: '首頁', href: '/' },
          { label: '客戶關係管理 (CRM)' }
        ]} />
      </div>
      
      {/* Header */}
      <div className="px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-rose-500" />
            銷售看板 (Pipeline)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理各階段商機與銷售漏斗，拖曳卡片即可變更階段。</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">總漏斗金額</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
              ${totalValue.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            新增商機
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex gap-4 min-w-max h-full">
          {STAGES.map((stage) => {
            const stageOpps = opportunities.filter(o => o.stage === stage.id);
            const stageValue = stageOpps.reduce((acc, curr) => acc + curr.estimatedValue, 0);

            return (
              <div 
                key={stage.id} 
                className={`flex flex-col w-72 rounded-xl border ${stage.color} ${stage.borderColor} shadow-sm overflow-hidden`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-inherit bg-white/50 dark:bg-slate-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{stage.title}</h3>
                    <span className="bg-white dark:bg-slate-800 text-xs font-mono px-2 py-0.5 rounded-full text-slate-500 border border-inherit">
                      {stageOpps.length}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    ${stageValue >= 1000 ? (stageValue/1000).toFixed(1) + 'k' : stageValue}
                  </span>
                </div>
                
                {/* Cards Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar min-h-[200px]">
                  {stageOpps.map(opp => (
                    <div 
                      key={opp.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-rose-400 dark:hover:border-rose-500 transition-colors group"
                    >
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-tight">
                        {opp.title}
                      </h4>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Building2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                          <span className="truncate">{opp.customer?.name || "未知客戶"}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="h-3 w-3 mr-0.5" />
                            {opp.estimatedValue.toLocaleString()}
                          </div>
                          
                          {opp.expectedCloseDate && (
                            <div className="flex items-center text-[10px] text-slate-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(opp.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <NewOpportunityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchOpportunities}
      />

      <ConvertToOrderModal 
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setConvertingOpportunity(null);
        }}
        onSuccess={() => {
          fetchOpportunities();
          alert("🎉 成功將商機轉換為進銷存 Sales Order！");
        }}
        opportunity={convertingOpportunity}
      />
    </div>
  );
}
