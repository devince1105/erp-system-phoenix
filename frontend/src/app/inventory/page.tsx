"use client";

import React, { useEffect, useState } from "react";
import { PackageSearch, Users, TrendingUp, FolderTree, AlertCircle } from "lucide-react";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";

export default function InventoryDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    salesCount: 0,
    salesTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, customers, sales] = await Promise.all([
          inventoryApi.getProducts(),
          inventoryApi.getPartners(1), // Customer
          inventoryApi.getSalesOrders(),
        ]);
        
        setStats({
          products: products.length,
          customers: customers.length,
          salesCount: sales.length,
          salesTotal: sales.reduce((acc, curr) => acc + curr.totalAmount, 0)
        });
      } catch (err) {
        console.error("Failed to load inventory stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">進銷存系統 (Inventory)</h1>
        <p className="text-sm text-slate-500 mt-1">即時掌握庫存與銷售動態</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
            <PackageSearch className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <span className="text-sm font-medium">總商品數 (Products)</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.products}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <span className="text-sm font-medium">總客戶數 (Customers)</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.customers}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <span className="text-sm font-medium">銷貨單數 (Sales Orders)</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.salesCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
            <FolderTree className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            <span className="text-sm font-medium">總銷售額 (Revenue)</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">${stats.salesTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">低庫存警示 (Low Stock)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">目前沒有低於安全庫存的商品。</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">近期動態 (Recent Activity)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">尚無近期動態。</p>
        </div>
      </div>
    </div>
  );
}
