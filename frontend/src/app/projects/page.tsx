"use client";

import React, { useState, useEffect } from "react";
import { Plus, Briefcase, FileText, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Clock, Search, Activity, ChevronRight, X } from "lucide-react";
import { projectApi } from "@/features/projects/api/projectApi";
import { Project, ProjectFinancials, ProjectStatus } from "@/features/projects/types/project";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">進行中</span>;
      case ProjectStatus.Planning:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">規劃中</span>;
      case ProjectStatus.Completed:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">已完成</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400">其他</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '專案管理與財務追蹤' }
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-600" />
            專案管理 (Projects & Financials)
          </h1>
          <p className="text-sm text-slate-500 mt-1">即時追蹤專案進度、預算消耗與專案損益</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
          <Plus className="h-4 w-4" /> 新增專案
        </button>
      </div>

      {/* DataGrid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜尋專案代號或名稱..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">專案代碼</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">名稱</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">初始預算</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">載入中...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">目前沒有專案資料</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400">{p.code}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 text-right">{formatCurrency(p.budget)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleViewDetails(p)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        財務分析 <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Details Modal */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  專案財務追蹤：{selectedProject.name}
                </h2>
                <div className="text-sm text-slate-500 font-mono mt-1">{selectedProject.code}</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {!financials ? (
                <div className="py-12 text-center text-slate-500">載入財務數據中...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget Overview */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        預算使用狀況
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">總預算</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(financials.budget)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">已消耗成本 (採購+費用)</span>
                          <span className="font-medium text-rose-600 dark:text-rose-400">-{formatCurrency(financials.totalCost)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, (financials.totalCost / financials.budget) * 100 || 0))}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-700 dark:text-slate-300">剩餘預算</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(financials.budgetRemaining)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Profitability Overview */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        專案損益計算
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">帶來營收 (銷售單)</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">+{formatCurrency(financials.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">專案成本 (採購+費用)</span>
                          <span className="font-medium text-rose-600 dark:text-rose-400">-{formatCurrency(financials.totalCost)}</span>
                        </div>
                        <div className="pt-5 border-t border-slate-200 dark:border-slate-700"></div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-bold text-slate-900 dark:text-white">專案淨利</span>
                          <span className={`text-xl font-black ${financials.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatCurrency(financials.profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connected Documents Stats */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">關聯單據統計</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <FileText className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{financials.details.salesCount}</div>
                        <div className="text-xs text-slate-500 mt-1">銷售單 (Revenue)</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <ShoppingCart className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{financials.details.purchaseCount}</div>
                        <div className="text-xs text-slate-500 mt-1">採購單 (Cost)</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <DollarSign className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{financials.details.voucherCount}</div>
                        <div className="text-xs text-slate-500 mt-1">會計傳票 (Expense)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
