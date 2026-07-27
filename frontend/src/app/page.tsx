"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchAccountTitles,
  fetchVouchers
} from "@/features/accounting/api";
import { hrApi } from "@/features/hr/api/hrApi";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { crmApi } from "@/features/crm/api/crmApi";
import { AccountTitle, Voucher } from "@/features/accounting/types/accounting";
import { Employee, AttendanceRecord } from "@/features/hr/types/hr";
import { Product, SalesOrder } from "@/features/inventory/types/inventory";
import { SalesOpportunity } from "@/features/crm/types/crm";

import { useAuth } from "@/features/core/contexts/AuthContext";
import { hasPermission } from "@/utils/rbac";
import { PersonalPortal } from "@/features/core/components/PersonalPortal";

import { StatCards } from "@/features/accounting/components/StatCards";
import { FinancialCharts } from "@/features/accounting/components/FinancialCharts";
import { HRDashboard } from "@/features/hr/components/HRDashboard";
import { InventoryDashboard } from "@/features/inventory/components/InventoryDashboard";
import { CRMDashboard } from "@/features/crm/components/CRMDashboard";
import { ArrowUpRight, ArrowDownRight, Package, Users, ShoppingCart, DollarSign, Activity, TrendingUp, Calendar, AlertCircle, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [accountTitles, setAccountTitles] = useState<AccountTitle[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { user } = useAuth();
  
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
      if (user.roles?.includes('role_hr_assistant')) empRoleId = 'role_hr_assistant';
      if (user.roles?.includes('role_accountant')) empRoleId = 'role_accountant';
    }
  }

  const canView = (moduleKey: string) => {
    return hasPermission(empRoleId, empOverrides, moduleKey, 'view');
  };
  // ------------------

  const loadData = async () => {
    try {
      const [
        titlesData, 
        vouchersData, 
        empData, 
        attData, 
        prodData, 
        salesData,
        oppData
      ] = await Promise.all([
        fetchAccountTitles(),
        fetchVouchers(),
        hrApi.getEmployees(),
        hrApi.getAttendances(),
        inventoryApi.getProducts(),
        inventoryApi.getSalesOrders(),
        crmApi.getOpportunities()
      ]);
      setAccountTitles(titlesData);
      setVouchers(vouchersData);
      setEmployees(empData);
      setAttendances(attData);
      setProducts(prodData);
      setSalesOrders(salesData);
      setOpportunities(oppData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            企業營運總覽
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">即時掌握公司整體財務與營運績效。</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 dark:border-cyan-500 border-t-transparent animate-spin mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">載入數據與圖表中...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <PersonalPortal user={user} />
          
          {(canView('ACC_OVERVIEW') || canView('ACC_PNL') || canView('CRM_PIPELINE') || canView('HR_DASHBOARD') || canView('INV_DASHBOARD')) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wider border border-slate-200 dark:border-slate-700 shadow-sm mt-8">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>部門專屬看板 (Department Dashboards)</span>
            </div>
          )}
          
          {/* Main Financial Overview (Requires Accounting Dashboard/Overview Perms) */}
          {(canView('ACC_OVERVIEW') || canView('ACC_PNL')) && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 border-l-4 border-emerald-500 rounded-sm">
                財務與營收概況
              </div>
              <StatCards vouchers={vouchers} accountTitles={accountTitles} />
              <FinancialCharts vouchers={vouchers} accountTitles={accountTitles} />
            </div>
          )}

          {/* Departmental Dashboards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {canView('CRM_PIPELINE') && (
              <div className="h-auto min-h-[320px] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                <div className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 border-l-4 border-blue-500 rounded-sm">
                  客戶與商機動態
                </div>
                <CRMDashboard opportunities={opportunities} />
              </div>
            )}
            
            {canView('HR_DASHBOARD') && (
              <div className="h-auto min-h-[320px] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <div className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 border-l-4 border-purple-500 rounded-sm">
                  人力資源狀態
                </div>
                <HRDashboard employees={employees} attendances={attendances} />
              </div>
            )}
          </div>
          
          {canView('INV_DASHBOARD') && (
            <div className="grid grid-cols-1 gap-6 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="h-auto min-h-[320px]">
                <div className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 border-l-4 border-amber-500 rounded-sm">
                  進銷存與訂單
                </div>
                <InventoryDashboard products={products} salesOrders={salesOrders} />
              </div>
            </div>
          )}
          
          {/* Fallback for users with no dashboard modules allowed is no longer needed since everyone sees the portal */}
        </div>
      )}

    </div>
  );
}
