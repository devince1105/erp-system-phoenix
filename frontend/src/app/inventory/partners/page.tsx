'use client';

import React, { useEffect, useState } from 'react';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { Partner } from '@/features/inventory/types/inventory';
import { Users, Plus, Building2, User } from 'lucide-react';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const data = await inventoryApi.getPartners();
      setPartners(data);
    } catch (error) {
      console.error('Failed to fetch partners', error);
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
            <Users className="h-6 w-6 text-blue-600" />
            客戶與廠商管理 (Partners)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理所有往來的客戶與供應商資料。</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
          <Plus className="w-4 h-4" />
          新增對象
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入資料中...
          </div>
        ) : partners.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm text-slate-500">
            目前還沒有建立任何客戶或廠商。
          </div>
        ) : (
          partners.map((partner) => (
            <div key={partner.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {partner.type === 1 ? (
                      <User className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Building2 className="h-4 w-4 text-purple-500" />
                    )}
                    {partner.name}
                  </h3>
                  {partner.taxId && (
                    <p className="text-sm text-slate-500 mt-1 font-mono">統編: {partner.taxId}</p>
                  )}
                </div>
                
                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  partner.type === 1 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                    : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                }`}>
                  {partner.type === 1 ? '客戶 (Customer)' : '供應商 (Supplier)'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-3">
                <div className="text-sm">
                  <span className="text-slate-500 block mb-1">聯絡人</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">{partner.contactPerson || '-'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 block mb-1">聯絡電話</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">{partner.phone || '-'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 block mb-1">地址</span>
                  <span className="text-slate-900 dark:text-slate-100">{partner.address || '-'}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  編輯資料
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
