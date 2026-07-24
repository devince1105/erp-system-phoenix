"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Landmark, 
  Settings, 
  Puzzle,
  Users,
  PackageSearch,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "總覽 (Dashboard)", href: "/accounting", icon: LayoutDashboard },
    { name: "傳票管理 (Vouchers)", href: "/accounting/vouchers", icon: Landmark },
    { name: "會計科目 (Accounts)", href: "/accounting/accounts", icon: Puzzle },
    { name: "銀行帳戶 (Banks)", href: "/accounting/banks", icon: Users },
    { name: "損益表 (P&L)", href: "/accounting/reports/profit-and-loss", icon: BarChart3 },
    { name: "資產負債表 (Balance Sheet)", href: "/accounting/reports/balance-sheet", icon: BarChart3 },
    { name: "系統設定 (Settings)", href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={`border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hidden lg:flex flex-col h-full z-30 transition-all duration-300 relative ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 dark:text-slate-400 p-1 rounded-full border border-gray-200 dark:border-slate-700 z-40 transition-colors shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="flex-1 overflow-y-auto py-6 space-y-8 no-scrollbar overflow-x-hidden">
        
        {/* Main Navigation */}
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                  isCollapsed ? 'justify-center px-0' : 'pl-5 pr-4 mx-2 rounded-md'
                } ${
                  isActive
                    ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {isActive && !isCollapsed && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 dark:bg-blue-500 rounded-r" />}
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Plugin Status Mini-Overview */}
        {!isCollapsed && (
          <div className="px-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 truncate">
              已啟用模組 (Active Plugins)
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">財務會計 (Accounting)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 rounded-md border border-transparent">
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" />
                  <span className="text-sm text-slate-500 truncate">人力資源 (HR)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 rounded-md border border-transparent">
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" />
                  <span className="text-sm text-slate-500 truncate">進銷存 (Inventory)</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 py-2 bg-white dark:bg-slate-900 rounded-md border border-gray-200 dark:border-slate-800 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
          <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">v1</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">Nexus Core</p>
              <p className="text-[10px] text-slate-500 truncate">Stable Build</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
