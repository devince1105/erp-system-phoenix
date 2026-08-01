"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Landmark, 
  Settings, 
  Puzzle,
  Users,
  PackageSearch,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Activity,
  CheckSquare,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Plane,
  Receipt,
  Wallet,
  CalendarCheck,
  CalendarDays,
  Clock3,
  ShoppingCart
} from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];
  const canSee = (item: { roles?: string[] }) => !item.roles || item.roles.some((r) => userRoles.includes(r));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isAccountingOpen, setIsAccountingOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  const [isHROpen, setIsHROpen] = useState(true);
  const [isCRMOpen, setIsCRMOpen] = useState(true);

  const mainNavItems = [
    { name: "企業總覽 (Dashboard)", href: "/", icon: LayoutDashboard },
  ];

  const accountingItems = [
    { name: "會計總覽 (Overview)", href: "/accounting", icon: LayoutDashboard },
    { name: "傳票管理 (Vouchers)", href: "/accounting/vouchers", icon: Landmark },
    { name: "會計科目 (Accounts)", href: "/accounting/accounts", icon: Puzzle },
    { name: "銀行帳戶 (Banks)", href: "/accounting/banks", icon: Users },
    { name: "損益表 (P&L)", href: "/accounting/reports/profit-and-loss", icon: BarChart3 },
    { name: "資產負債表 (Balance Sheet)", href: "/accounting/reports/balance-sheet", icon: BarChart3 },
  ];

  const inventoryItems = [
    { name: "進銷存總覽 (Dashboard)", href: "/inventory", icon: LayoutDashboard },
    { name: "商品管理 (Products)", href: "/inventory/products", icon: PackageSearch },
    { name: "客戶與廠商 (Partners)", href: "/inventory/partners", icon: Users },
    { name: "銷貨管理 (Sales)", href: "/inventory/sales", icon: TrendingUp },
    { name: "採購管理 (Purchases)", href: "/inventory/purchases", icon: FolderTree },
  ];

  const hrItems = [
    { name: "人資總覽 (Dashboard)", href: "/hr", icon: LayoutDashboard },
    { name: "員工管理 (Employees)", href: "/hr/employees", icon: Users },
    { name: "部門架構 (Departments)", href: "/hr/departments", icon: FolderTree },
    { name: "出勤與請假 (Attendance)", href: "/hr/attendance", icon: Landmark },
    { name: "假別餘額 (Leave Balances)", href: "/hr/leave-balances", icon: Activity },
    { name: "請假申請 (Leave Requests)", href: "/hr/leaves", icon: CalendarDays },
    { name: "加班申請 (Overtime Requests)", href: "/hr/overtimes", icon: Clock3 },
    { name: "出差申請 (Business Trips)", href: "/hr/business-trips", icon: Plane },
    { name: "差旅報支 (Travel Expenses)", href: "/hr/expenses", icon: Receipt },
    { name: "採購申請 (Purchase Requests)", href: "/hr/purchase-requests", icon: ShoppingCart },
    { name: "費用報銷 (Office Expenses)", href: "/hr/office-expenses", icon: Wallet },
    { name: "假勤簽核 (Leave & Overtime)", href: "/hr/approvals", icon: CalendarCheck },
    { name: "員工薪資 (Salaries)", href: "/hr/salaries", icon: Wallet, roles: ["Admin", "HR", "Accountant"] },
    { name: "薪資結算 (Payroll)", href: "/hr/payroll", icon: DollarSign },
  ];

  const crmItems = [
    { name: "銷售看板 (Pipeline)", href: "/crm", icon: LayoutDashboard },
    { name: "客戶名單 (Customers)", href: "/crm/customers", icon: Users },
  ];

  const settingsItems = [
    { name: "系統設定 (Settings)", href: "/settings", icon: Settings },
    { name: "頁面權限 (Permissions)", href: "/settings/permissions", icon: ShieldCheck },
    { name: "員工權限 (Employee Perms)", href: "/settings/employee-permissions", icon: Users },
    { name: "簽核流程 (Workflows)", href: "/settings/workflows", icon: CheckSquare },
    { name: "組織與職級 (Organization)", href: "/settings/organization", icon: FolderTree },
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

      <div className="flex-1 overflow-y-auto py-6 space-y-2 no-scrollbar overflow-x-hidden">
        
        {/* Main Navigation */}
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
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

        {/* Accounting Accordion */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <button
              onClick={() => setIsAccountingOpen(!isAccountingOpen)}
              className="w-full flex items-center justify-between py-2 pl-5 pr-4 mx-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <FolderTree className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate">會計系統 (Accounting)</span>
              </div>
              {isAccountingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}

          {isCollapsed && (
            <div className="flex justify-center py-2 text-slate-500 dark:text-slate-400" title="會計系統 (Accounting)">
              <FolderTree className="h-5 w-5" />
            </div>
          )}

          {(isAccountingOpen || isCollapsed) && (
            <div className={`space-y-0.5 ${!isCollapsed ? "mt-1 mb-2 ml-4 border-l-2 border-gray-200 dark:border-slate-800" : ""}`}>
              {accountingItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/accounting" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                      isCollapsed ? 'justify-center px-0' : 'pl-5 pr-4 mx-2 rounded-md'
                    } ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {isActive && !isCollapsed && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 dark:bg-blue-500 rounded-r" />}
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory Accordion */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <button
              onClick={() => setIsInventoryOpen(!isInventoryOpen)}
              className="w-full flex items-center justify-between py-2 pl-5 pr-4 mx-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <PackageSearch className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate">進銷存系統 (Inventory)</span>
              </div>
              {isInventoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}

          {isCollapsed && (
            <div className="flex justify-center py-2 text-slate-500 dark:text-slate-400" title="進銷存系統 (Inventory)">
              <PackageSearch className="h-5 w-5" />
            </div>
          )}

          {(isInventoryOpen || isCollapsed) && (
            <div className={`space-y-0.5 ${!isCollapsed ? "mt-1 mb-2 ml-4 border-l-2 border-gray-200 dark:border-slate-800" : ""}`}>
              {inventoryItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/inventory" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                      isCollapsed ? 'justify-center px-0' : 'pl-5 pr-4 mx-2 rounded-md'
                    } ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {isActive && !isCollapsed && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 dark:bg-blue-500 rounded-r" />}
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* HR Accordion */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <button
              onClick={() => setIsHROpen(!isHROpen)}
              className="w-full flex items-center justify-between py-2 pl-5 pr-4 mx-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate">人力資源 (HR)</span>
              </div>
              {isHROpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}

          {isCollapsed && (
            <div className="flex justify-center py-2 text-slate-500 dark:text-slate-400" title="人力資源 (HR)">
              <Users className="h-5 w-5" />
            </div>
          )}

          {(isHROpen || isCollapsed) && (
            <div className={`space-y-0.5 ${!isCollapsed ? "mt-1 mb-2 ml-4 border-l-2 border-gray-200 dark:border-slate-800" : ""}`}>
              {hrItems.filter(canSee).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/hr" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                      isCollapsed ? 'justify-center px-0' : 'pl-5 pr-4 mx-2 rounded-md'
                    } ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {isActive && !isCollapsed && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 dark:bg-blue-500 rounded-r" />}
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* CRM Accordion */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <button
              onClick={() => setIsCRMOpen(!isCRMOpen)}
              className="w-full flex items-center justify-between py-2 pl-5 pr-4 mx-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate">客戶關係 (CRM)</span>
              </div>
              {isCRMOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}

          {isCollapsed && (
            <div className="flex justify-center py-2 text-slate-500 dark:text-slate-400" title="客戶關係 (CRM)">
              <Briefcase className="h-5 w-5" />
            </div>
          )}

          {(isCRMOpen || isCollapsed) && (
            <div className={`space-y-0.5 ${!isCollapsed ? "mt-1 mb-2 ml-4 border-l-2 border-gray-200 dark:border-slate-800" : ""}`}>
              {crmItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/crm" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                      isCollapsed ? 'justify-center px-0' : 'pl-5 pr-4 mx-2 rounded-md'
                    } ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {isActive && !isCollapsed && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 dark:bg-blue-500 rounded-r" />}
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Navigation */}
        <div className="space-y-0.5 border-t border-gray-200 dark:border-slate-800 pt-4">
          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
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
              
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">人力資源 (HR)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">進銷存 (Inventory)</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">客戶關係 (CRM)</span>
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
