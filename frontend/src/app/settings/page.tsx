"use client";

import React from "react";
import { Landmark, Users, PackageSearch, BarChart3, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col text-slate-900 dark:text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform configuration and activate Lego-like plugins.</p>
        </div>
      </div>

      <div className="space-y-10">
        
        {/* Module Management Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Plugin Management</h2>
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
                  Active
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 relative z-10">Financial Accounting</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 relative z-10 leading-relaxed min-h-[40px]">
                Core accounting engine, vouchers, and bank APIs.
              </p>
              
              <button className="w-full py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700">
                Configure Settings
              </button>
            </div>

            {/* Module 2: HR (Placeholder) */}
            <div className="relative h-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 border-dashed rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <Users className="h-7 w-7 text-slate-400 dark:text-slate-500 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Available
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300 mb-2">Human Resources</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                Employee records, payroll, attendance, and leave management.
              </p>
              <button className="w-full py-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 transition-colors">
                Install Plugin
              </button>
            </div>

            {/* Module 3: Inventory (Placeholder) */}
            <div className="relative h-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 border-dashed rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <PackageSearch className="h-7 w-7 text-slate-400 dark:text-slate-500 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Available
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300 mb-2">Inventory Mgmt</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                Real-time stock tracking, procurement, and warehouse operations.
              </p>
              <button className="w-full py-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 transition-colors">
                Install Plugin
              </button>
            </div>

            {/* Module 4: CRM (Placeholder) */}
            <div className="relative h-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 border-dashed rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <BarChart3 className="h-7 w-7 text-slate-400 dark:text-slate-500 stroke-[2]" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Available
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300 mb-2">CRM & Sales</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                Customer relations, sales pipelines, and quotation tracking.
              </p>
              <button className="w-full py-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 transition-colors">
                Install Plugin
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
