"use client";

import React, { useState, useEffect } from "react";
import { Plus, Briefcase, FileText, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Clock, Search, Filter } from "lucide-react";
import { projectApi } from "@/features/projects/api/projectApi";
import { Project, ProjectFinancials, ProjectStatus } from "@/features/projects/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getProjects();
      setProjects(data);
      if (data.length > 0) {
        selectProject(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = async (project: Project) => {
    setSelectedProject(project);
    try {
      const fin = await projectApi.getProjectFinancials(project.code, project.budget);
      setFinancials(fin);
    } catch (e) {
      console.error(e);
      setFinancials(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-medium border border-emerald-500/30">進行中</span>;
      case ProjectStatus.Planning:
        return <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-medium border border-amber-500/30">規劃中</span>;
      case ProjectStatus.Completed:
        return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/30">已完成</span>;
      default:
        return <span className="bg-slate-500/20 text-slate-400 px-2 py-1 rounded text-xs font-medium border border-slate-500/30">其他</span>;
    }
  };

  return (
    <div className="flex h-full flex-col p-8 bg-[#0B1120] text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-400" />
            專案管理與財務追蹤 (Project Financials)
          </h1>
          <p className="text-slate-400">即時追蹤專案進度、預算消耗與專案損益</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium gap-2 transition-colors">
          <Plus className="w-4 h-4" /> 新增專案
        </button>
      </div>

      <div className="flex gap-6 flex-1 h-[calc(100vh-180px)]">
        {/* Left Sidebar - Project List */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜尋專案..." 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button className="flex items-center justify-center px-3 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {isLoading ? (
              <div className="text-center text-slate-500 py-8">載入中...</div>
            ) : projects.length === 0 ? (
              <div className="text-center text-slate-500 py-8">目前無專案資料</div>
            ) : (
              projects.map(p => (
                <div 
                  key={p.id}
                  onClick={() => selectProject(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedProject?.id === p.id 
                      ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{p.code}</span>
                      {getStatusBadge(p.status)}
                    </div>
                  </div>
                  <h3 className="font-medium text-lg text-white mb-2">{p.name}</h3>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>預算: {formatCurrency(p.budget)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Project Details & Financials */}
        <div className="w-2/3 bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 overflow-y-auto backdrop-blur-sm">
          {selectedProject && financials ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Project Header */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    {selectedProject.name}
                    {getStatusBadge(selectedProject.status)}
                  </h2>
                  <button className="px-3 py-1.5 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors">編輯專案</button>
                </div>
                <div className="flex gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {selectedProject.code}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 建立於 {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Financial Dashboard */}
              <div className="grid grid-cols-2 gap-4">
                {/* 預算狀況 (For R&D/Marketing) */}
                <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    預算使用狀況 (研發/行銷)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">總預算</span>
                        <span className="text-white">{formatCurrency(financials.budget)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">已消耗成本 (採購+費用)</span>
                        <span className="text-rose-400">-{formatCurrency(financials.totalCost)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(0, (financials.totalCost / financials.budget) * 100 || 0))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-400">剩餘預算</span>
                        <span className="text-emerald-400 font-medium">{formatCurrency(financials.budgetRemaining)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 專案損益 (For Sales/Contracts) */}
                <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    專案損益計算 (業務/客製案)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                      <span className="text-slate-400 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> 帶來營收 (銷售單)
                      </span>
                      <span className="text-emerald-400 font-medium">+{formatCurrency(financials.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                      <span className="text-slate-400 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" /> 專案成本 (採購+費用)
                      </span>
                      <span className="text-rose-400 font-medium">-{formatCurrency(financials.totalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-white font-medium">專案淨利</span>
                      <span className={`text-xl font-bold ${financials.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(financials.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Documents */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">關聯單據 (Connected Documents)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center gap-2 hover:bg-slate-800/60 transition-colors cursor-pointer">
                    <FileText className="w-8 h-8 text-blue-400 mb-1" />
                    <span className="text-2xl font-bold text-white">{financials.details.salesCount}</span>
                    <span className="text-sm text-slate-400">銷售單 (Revenue)</span>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center gap-2 hover:bg-slate-800/60 transition-colors cursor-pointer">
                    <ShoppingCart className="w-8 h-8 text-amber-400 mb-1" />
                    <span className="text-2xl font-bold text-white">{financials.details.purchaseCount}</span>
                    <span className="text-sm text-slate-400">採購單 (Material Cost)</span>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center gap-2 hover:bg-slate-800/60 transition-colors cursor-pointer">
                    <DollarSign className="w-8 h-8 text-rose-400 mb-1" />
                    <span className="text-2xl font-bold text-white">{financials.details.voucherCount}</span>
                    <span className="text-sm text-slate-400">會計傳票 (Expenses)</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Briefcase className="w-16 h-16 mb-4 opacity-20" />
              <p>請從左側選擇一個專案以檢視詳細財務狀況</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
