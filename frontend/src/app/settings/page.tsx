"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Users, PackageSearch, BarChart3, Settings as SettingsIcon, Lock, Save } from "lucide-react";
import { accountingApi } from "@/features/accounting/api/accountingApi";

export default function SettingsPage() {
  const [closingDate, setClosingDate] = useState("");
  const [isSavingClosing, setIsSavingClosing] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  useEffect(() => {
    accountingApi.getClosingDate().then(setClosingDate).catch(console.error);
    accountingApi.getCompanyName().then(setCompanyName).catch(console.error);
  }, []);

  const handleSaveClosingDate = async () => {
    setIsSavingClosing(true);
    try {
      await accountingApi.setClosingDate(closingDate);
      alert('關帳日已更新！');
    } catch (error) {
      console.error(error);
      alert('更新失敗');
    } finally {
      setIsSavingClosing(false);
    }
  };

  const handleSaveCompanyName = async () => {
    setIsSavingCompany(true);
    try {
      await accountingApi.setCompanyName(companyName);
      alert('公司名稱已更新！');
    } catch (error) {
      console.error(error);
      alert('更新失敗');
    } finally {
      setIsSavingCompany(false);
    }
  };
  return (
    <div className="flex flex-col text-slate-900 dark:text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">系統設定</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理平台環境設定與啟用積木式擴充模組。</p>
        </div>
      </div>

      <div className="space-y-10">
        
        {/* Module Management Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">擴充模組管理</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            
            {/* Module 1: Accounting (Active) */}
            <div className="relative h-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:bg-slate-800/80 overflow-hidden shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-blue-600 dark:bg-gradient-to-br dark:from-emerald-400 dark:to-teal-500 flex items-center justify-center shadow-md dark:shadow-lg dark:shadow-emerald-500/20">
                  <Landmark className="h-7 w-7 text-white dark:text-slate-950 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-green-100 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  已啟用
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 relative z-10">財務會計模組</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 relative z-10 leading-relaxed min-h-[40px]">
                核心會計引擎，包含傳票管理、總帳與銀行 API 介接。
              </p>
              
              <button className="w-full py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700">
                模組設定
              </button>
            </div>

            {/* Module 2: HR (Placeholder) */}
            <div className="relative h-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 border-dashed rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <Users className="h-7 w-7 text-slate-400 dark:text-slate-500 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  未安裝
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300 mb-2">人力資源管理</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                員工基本資料、薪資結算、出勤與請假管理。
              </p>
              <button className="w-full py-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 transition-colors">
                安裝模組
              </button>
            </div>

            {/* Module 3: Inventory (Placeholder) */}
            <div className="relative h-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 border-dashed rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <PackageSearch className="h-7 w-7 text-slate-400 dark:text-slate-500 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  未安裝
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300 mb-2">進銷存管理</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                即時庫存追蹤、採購流程與倉儲營運管理。
              </p>
              <button className="w-full py-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 transition-colors">
                安裝模組
              </button>
            </div>

            {/* Module 4: CRM (Placeholder) */}
            <div className="relative h-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 border-dashed rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <BarChart3 className="h-7 w-7 text-slate-400 dark:text-slate-500 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  未安裝
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300 mb-2">客戶關係管理 (CRM)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                客戶資料維護、業務銷售漏斗與報價單追蹤。
              </p>
              <button className="w-full py-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 transition-colors">
                安裝模組
              </button>
            </div>

          </div>
        </section>

        {/* General Settings Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2 mt-12">
            <SettingsIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">一般設定</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">公司名稱</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                設定貴公司的官方名稱，此名稱將顯示於各式報表與系統介面中。
              </p>
              
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="例如：鳳凰股份有限公司"
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200"
                />
                <button 
                  onClick={handleSaveCompanyName}
                  disabled={isSavingCompany}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <Save className="w-4 h-4" />
                  {isSavingCompany ? '儲存中...' : '儲存設定'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Accounting Settings Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2 mt-12">
            <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">財務與會計設定</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">關帳基準日 (Closing Date)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                設定後，所有早於或等於此日期的傳票將被鎖定，無法新增、修改或刪除。這可用於月底或年底結帳防護。
              </p>
              
              <div className="flex items-center gap-4">
                <input 
                  type="date" 
                  value={closingDate}
                  onChange={e => setClosingDate(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-200"
                />
                <button 
                  onClick={handleSaveClosingDate}
                  disabled={isSavingClosing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <Save className="w-4 h-4" />
                  {isSavingClosing ? '儲存中...' : '儲存設定'}
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
