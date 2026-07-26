"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchAccountTitles,
  fetchVouchers
} from "@/features/accounting/api";
import { hrApi } from "@/features/hr/api/hrApi";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { AccountTitle, Voucher } from "@/features/accounting/types/accounting";
import { Employee, AttendanceRecord } from "@/features/hr/types/hr";
import { Product, SalesOrder } from "@/features/inventory/types/inventory";

import { StatCards } from "@/features/accounting/components/StatCards";
import { FinancialCharts } from "@/features/accounting/components/FinancialCharts";
import { HRDashboard } from "@/features/hr/components/HRDashboard";
import { InventoryDashboard } from "@/features/inventory/components/InventoryDashboard";
import { Activity, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [accountTitles, setAccountTitles] = useState<AccountTitle[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [
        titlesData, 
        vouchersData, 
        empData, 
        attData, 
        prodData, 
        salesData
      ] = await Promise.all([
        fetchAccountTitles(),
        fetchVouchers(),
        hrApi.getEmployees(),
        hrApi.getAttendances(),
        inventoryApi.getProducts(),
        inventoryApi.getSalesOrders()
      ]);
      setAccountTitles(titlesData);
      setVouchers(vouchersData);
      setEmployees(empData);
      setAttendances(attData);
      setProducts(prodData);
      setSalesOrders(salesData);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">企業營運總覽</h1>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wider border border-slate-200 dark:border-slate-700 shadow-sm">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>High-Level Executive Overview</span>
          </div>
          
          {/* Main Financial Overview */}
          <StatCards vouchers={vouchers} accountTitles={accountTitles} />
          <FinancialCharts vouchers={vouchers} accountTitles={accountTitles} />

          {/* Departmental Dashboards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <div className="h-auto min-h-[320px]">
              <HRDashboard employees={employees} attendances={attendances} />
            </div>
            <div className="h-auto min-h-[320px]">
              <InventoryDashboard products={products} salesOrders={salesOrders} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
