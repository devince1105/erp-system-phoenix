"use client";

import React, { useState, useEffect } from "react";
import { Save, AlertCircle, RefreshCw, Power, PowerOff, Building2, LayoutDashboard, Store, Users, ShoppingCart, Lock, Database, Info, Settings as SettingsIcon, Landmark, PackageSearch, BarChart3 } from "lucide-react";
import { accountingApi } from "@/features/accounting/api/accountingApi";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

export default function SettingsPage() {
  const [closingDate, setClosingDate] = useState("");
  const [isSavingClosing, setIsSavingClosing] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [manufacturingEnabled, setManufacturingEnabled] = useState(true);

  useEffect(() => {
    accountingApi.getClosingDate().then(setClosingDate).catch(console.error);
    accountingApi.getCompanyName().then(setCompanyName).catch(console.error);
    
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('erp_module_manufacturing');
      if (val === 'false') setManufacturingEnabled(false);
    }
  }, []);

  const toggleManufacturing = () => {
    const newVal = !manufacturingEnabled;
    setManufacturingEnabled(newVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp_module_manufacturing', newVal.toString());
      window.location.reload();
    }
  };

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
      <div className="px-6 pt-6 pb-2 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[
          { label: '首頁', href: '/' },
          { label: '系統設定' }
        ]} />
      </div>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 mt-4 px-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            系統設定
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理平台環境設定與啟用積木式擴充模組。</p>
        </div>
      </div>

      <div className="space-y-10">
        
        {/* Module Management Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-800 pb-2">
            <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">擴充模組管理</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* Row 1 */}
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">財務會計模組</h3>
                    <p className="text-xs text-slate-500 mt-0.5">核心會計引擎，包含傳票管理、總帳與銀行 API 介接。</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold">已啟用</span>
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md">設定</button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">人力資源管理</h3>
                    <p className="text-xs text-slate-500 mt-0.5">管理員工資料、部門組織架構、出勤打卡與薪資結算。</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold">已啟用</span>
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md">設定</button>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                    <PackageSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">進銷存管理</h3>
                    <p className="text-xs text-slate-500 mt-0.5">即時庫存追蹤、採購流程與倉儲營運管理。</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold">已啟用</span>
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md">設定</button>
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">客戶關係管理 (CRM)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">客戶資料維護、業務銷售漏斗與報價單追蹤。</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold">已啟用</span>
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md">設定</button>
                </div>
              </div>

              {/* Row 5 */}
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">生產與物料管理</h3>
                    <p className="text-xs text-slate-500 mt-0.5">物料清單 (BOM) 設定與自動化生產扣料引擎。</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${manufacturingEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {manufacturingEnabled ? '已啟用' : '未啟用'}
                  </span>
                  <button 
                    onClick={toggleManufacturing}
                    className={`text-xs font-medium border px-3 py-1.5 rounded-md transition-colors ${manufacturingEnabled ? 'text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30'}`}
                  >
                    {manufacturingEnabled ? '停用模組' : '啟用模組'}
                  </button>
                </div>
              </div>

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
