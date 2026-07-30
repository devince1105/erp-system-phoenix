"use client";

import React, { useState, useEffect } from "react";
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
  ShieldAlert,
  Building
} from "lucide-react";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { hasPermission } from "@/utils/rbac";

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const [isAccountingOpen, setIsAccountingOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  const [isHROpen, setIsHROpen] = useState(true);
  const [isCRMOpen, setIsCRMOpen] = useState(true);

  // --- RBAC Logic ---
  const savedRbacStr = typeof window !== 'undefined' ? localStorage.getItem('erp_rbac_matrix') : null;
  const matrix = savedRbacStr ? JSON.parse(savedRbacStr) : {};
  
  const isSystemAdmin = user?.username === 'admin';
  let empRoleId = 'role_sales_rep';
  let empOverrides = {};
  
  if (isSystemAdmin) {
    empRoleId = 'role_system_admin';
  } else if (user?.username?.startsWith('EMP-')) {
    const empId = user.username;
    const empData = matrix[empId];
    if (empData) {
      empRoleId = empData.roleId;
      empOverrides = empData.overrides;
    } else {
      // Default fallback if no matrix data
      if (user.roles?.includes('role_hr_assistant')) empRoleId = 'role_hr_assistant';
      if (user.roles?.includes('role_accountant')) empRoleId = 'role_accountant';
    }
  }

  const canView = (moduleKey: string) => {
    return hasPermission(empRoleId, empOverrides, moduleKey, 'view');
  };
  // ------------------

  const mainNavItems = [
    { name: "企業總覽 (Dashboard)", href: "/", icon: LayoutDashboard, perm: 'CORE_DASHBOARD' },
    { name: "專案管理 (Projects)", href: "/projects", icon: Briefcase, perm: 'CORE_DASHBOARD' },
  ].filter(i => canView(i.perm));

  const accountingItems = [
    { name: "會計總覽 (Overview)", href: "/accounting", icon: LayoutDashboard, perm: 'ACC_OVERVIEW' },
    { name: "傳票管理 (Vouchers)", href: "/accounting/vouchers", icon: Landmark, perm: 'ACC_VOUCHERS' },
    { name: "會計科目 (Accounts)", href: "/accounting/accounts", icon: Puzzle, perm: 'ACC_ACCOUNTS' },
    { name: "銀行帳戶 (Banks)", href: "/accounting/banks", icon: Users, perm: 'ACC_BANKS' },
    { name: "損益表 (P&L)", href: "/accounting/reports/profit-and-loss", icon: BarChart3, perm: 'ACC_PNL' },
    { name: "資產負債表 (Balance Sheet)", href: "/accounting/reports/balance-sheet", icon: BarChart3, perm: 'ACC_BALANCE_SHEET' },
  ].filter(i => canView(i.perm));

  const [manufacturingEnabled, setManufacturingEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('erp_module_manufacturing');
      if (val === 'false') setManufacturingEnabled(false);
    }
  }, []);

  const inventoryItems = [
    { name: "進銷存總覽 (Dashboard)", href: "/inventory", icon: LayoutDashboard, perm: 'INV_DASHBOARD' },
    { name: "商品管理 (Products)", href: "/inventory/products", icon: PackageSearch, perm: 'INV_PRODUCTS' },
    { name: "倉庫與庫存 (Warehouses)", href: "/inventory/warehouses", icon: Building, perm: 'INV_PRODUCTS' },
    ...(manufacturingEnabled ? [
      { name: "物料管理 (Materials)", href: "/inventory/boms", icon: Settings, perm: 'INV_PRODUCTS' },
      { name: "生產製造 (Manufacturing)", href: "/inventory/manufacturing", icon: Activity, perm: 'INV_PRODUCTS' }
    ] : []),
    { name: "客戶與廠商 (Partners)", href: "/inventory/partners", icon: Users, perm: 'INV_PARTNERS' },
    { name: "銷貨管理 (Sales)", href: "/inventory/sales", icon: TrendingUp, perm: 'INV_SALES' },
    { name: "採購管理 (Purchases)", href: "/inventory/purchases", icon: FolderTree, perm: 'INV_PURCHASE' },
  ].filter(i => canView(i.perm));

  const hrItems = [
    { name: "人資總覽 (Dashboard)", href: "/hr", icon: LayoutDashboard, perm: 'HR_DASHBOARD' },
    { name: "員工管理 (Employees)", href: "/hr/employees", icon: Users, perm: 'HR_EMPLOYEES' },
    { name: "部門架構 (Departments)", href: "/hr/departments", icon: FolderTree, perm: 'HR_DEPARTMENTS' },
    { name: "出勤打卡 (Attendance)", href: "/hr/attendance", icon: Landmark, perm: 'HR_ATTENDANCE' },
    { name: "請假與特休 (Leaves)", href: "/hr/leaves", icon: Activity, perm: 'HR_ATTENDANCE' },
    { name: "加班申請 (Overtimes)", href: "/hr/overtimes", icon: Activity, perm: 'HR_ATTENDANCE' },
    { name: "假別餘額 (Leave Balances)", href: "/hr/leave-balances", icon: Activity, perm: 'HR_ATTENDANCE' },
    { name: "費用報支 (Expenses)", href: "/hr/expenses", icon: DollarSign, perm: 'HR_PAYROLL' },
    { name: "簽核中心 (Approvals)", href: "/hr/approvals", icon: CheckSquare, perm: 'HR_APPROVALS' },
    { name: "薪資結算 (Payroll)", href: "/hr/payroll", icon: DollarSign, perm: 'HR_PAYROLL' },
    { name: "人資參數 (HR Settings)", href: "/hr/settings", icon: Settings, perm: 'SYS_SETTINGS' },
  ].filter(i => canView(i.perm));

  const crmItems = [
    { name: "銷售看板 (Pipeline)", href: "/crm", icon: LayoutDashboard, perm: 'CRM_PIPELINE' },
    { name: "客戶名單 (Customers)", href: "/crm/customers", icon: Users, perm: 'CRM_CUSTOMERS' },
  ].filter(i => canView(i.perm));

  const settingsItems = [
    { name: "系統設定 (Settings)", href: "/settings", icon: Settings, perm: 'SYS_SETTINGS' },
    { name: "組織架構設定 (Organization)", href: "/settings/organization", icon: Building, perm: 'SYS_SETTINGS' },
    { name: "權限與角色 (Roles)", href: "/settings/permissions", icon: ShieldCheck, perm: 'SYS_ROLES' },
    { name: "員工權限總覽 (Employee)", href: "/settings/employee-permissions", icon: Users, perm: 'SYS_EMPLOYEE_PERMS' },
    { name: "帳號管理 (Accounts)", href: "/settings/accounts", icon: ShieldAlert, perm: 'SYS_ACCOUNTS' },
    { name: "簽核流程設定 (Workflows)", href: "/settings/workflows", icon: CheckSquare, perm: 'SYS_SETTINGS' },
  ].filter(i => canView(i.perm));

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
        {accountingItems.length > 0 && (
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
        )}

        {/* Inventory Accordion */}
        {inventoryItems.length > 0 && (
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
        )}

        {/* HR Accordion */}
        {hrItems.length > 0 && (
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
                {hrItems.map((item) => {
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
        )}

        {/* CRM Accordion */}
        {crmItems.length > 0 && (
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
        )}

        {/* Settings Navigation */}
        {settingsItems.length > 0 && (
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
        )}

        {/* Plugin Status Mini-Overview */}
        {(!isCollapsed && canView('SYS_SETTINGS')) && (
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
