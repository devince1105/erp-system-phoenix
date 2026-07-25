'use client';

import React, { useEffect, useState } from 'react';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { Product } from '@/features/inventory/types/inventory';
import { PackageSearch, Plus, Tag } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await inventoryApi.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-blue-600" />
            商品管理 (Products)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理進銷存系統中的所有商品與料件，並檢視即時庫存。</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
          <Plus className="w-4 h-4" />
          新增商品
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入商品中...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm text-slate-500">
            目前還沒有建立任何商品。
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block">
                      {product.sku}
                    </p>
                  </div>
                </div>
                
                <div className={`flex flex-col items-end`}>
                   <span className={`text-xs font-bold uppercase tracking-wider ${
                      product.stockQuantity <= 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                     庫存: {product.stockQuantity}
                   </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">售價 (Unit Price)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    <span className="text-sm text-slate-400 font-normal mr-1">$</span>
                    {product.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">成本 (Cost Price)</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                    <span className="text-sm text-slate-400 font-normal mr-1">$</span>
                    {product.costPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  編輯商品
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
