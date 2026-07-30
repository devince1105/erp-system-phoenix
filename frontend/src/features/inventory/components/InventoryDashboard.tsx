"use client";

import React, { useMemo } from "react";
import { useHydrated } from "@/utils/useHydrated";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PackageSearch, TrendingUp, AlertOctagon } from "lucide-react";
import { Product, SalesOrder } from "@/features/inventory/types/inventory";

interface InventoryDashboardProps {
  products: Product[];
  salesOrders: SalesOrder[];
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ products, salesOrders }) => {
  const mounted = useHydrated();

  // 1. Calculate Low Stock Alerts (threshold: 10)
  const lowStockProducts = products.filter(p => p.stockQuantity < 10).sort((a, b) => a.stockQuantity - b.stockQuantity);

  // 2. Calculate Top 5 Best Selling Products this month
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-07"
  
  const topProductsData = useMemo(() => {
    const productSalesMap = new Map<number, { name: string; quantity: number }>();

    salesOrders
      .filter(order => order.status !== 2 && (order.orderDate.startsWith(currentMonth) || order.createdAt.startsWith(currentMonth))) // 2 = Cancelled
      .forEach(order => {
        order.items?.forEach(item => {
          const qty = item.quantity;
          const pid = item.productId;
          const pName = item.product?.name || products.find(p => p.id === pid)?.name || `Unknown (${pid})`;
          
          if (!productSalesMap.has(pid)) {
            productSalesMap.set(pid, { name: pName, quantity: 0 });
          }
          productSalesMap.get(pid)!.quantity += qty;
        });
      });

    const sortedSales = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // If no sales data this month, provide a gentle fallback or just empty
    return sortedSales;
  }, [salesOrders, currentMonth, products]);

  if (!mounted) {
    return <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>進銷存 (Inventory) - 庫存與銷售戰情</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">低水位警報與本月熱銷排行榜</p>
        </div>
        <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/30">
          Products: {products.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        
        {/* Top 5 Best Selling */}
        <div className="flex flex-col">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            本月 Top 5 熱銷商品
          </h4>
          <div className="flex-1 h-40">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(val: any) => [`${val} 件`, "銷量"]}
                  />
                  <Bar dataKey="quantity" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-gray-200 dark:border-slate-800 rounded">
                本月尚無銷售紀錄
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="flex flex-col">
          <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
            <AlertOctagon className="h-3.5 w-3.5" />
            庫存短缺警報 (低於 10 件)
          </h4>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-40 no-scrollbar">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{product.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{product.sku}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      product.stockQuantity === 0 
                        ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' 
                        : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                    }`}>
                      剩餘: {product.stockQuantity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded">
                目前全品項庫存充足！
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
