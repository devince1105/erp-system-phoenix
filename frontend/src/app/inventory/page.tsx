"use client";

import React, { useEffect, useState } from "react";
import { PackageSearch, Users, TrendingUp, FolderTree, AlertCircle } from "lucide-react";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { SalesOrder, PurchaseOrder } from "@/features/inventory/types/inventory";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function InventoryDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    salesCount: 0,
    salesTotal: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
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

        // Calculate sales trend (by month)
        const trendMap: Record<string, number> = {};
        sales.forEach(s => {
          const d = new Date(s.orderDate);
          const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          trendMap[month] = (trendMap[month] || 0) + s.totalAmount;
        });
        const trendData = Object.entries(trendMap)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setSalesData(trendData);

        // Calculate top products
        const productMap: Record<string, number> = {};
        sales.forEach(s => {
          s.items?.forEach(i => {
            const pName = i.product?.name || `Product ID ${i.productId}`;
            productMap[pName] = (productMap[pName] || 0) + i.quantity;
          });
        });
        const topProducts = Object.entries(productMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setTopProductsData(topProducts);

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
        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm p-5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">營收趨勢分析 (Sales Trend)</h2>
          </div>
          <div className="h-72 w-full">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <RechartsTooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '營收']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">無足夠的銷貨資料</div>
            )}
          </div>
        </div>
        
        {/* Top Products Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm p-5">
          <div className="flex items-center gap-2 mb-6">
            <PackageSearch className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">熱銷商品排行 (Top Products)</h2>
          </div>
          <div className="h-72 w-full">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    formatter={(value: number) => [value, '銷售數量']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">無商品銷售資料</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
