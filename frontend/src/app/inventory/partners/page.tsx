'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { Partner } from '@/features/inventory/types/inventory';
import { PartnerModal } from '@/features/inventory/components/PartnerModal';
import { Users, Plus, Building2, User, Trash2, Edit2, Eye } from 'lucide-react';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Pagination } from '@/features/core/components/Pagination';
import { mutate } from 'swr';

export default function PartnersPage() {
  const { data: partners = [], isLoading } = useSWR('/api/Partners', () => inventoryApi.getPartners(), {
    revalidateOnFocus: false
  });
  
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'supplier'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>(undefined);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPartners = partners.filter(p => {
    if (activeTab === 'customer') return p.type === 1;
    if (activeTab === 'supplier') return p.type === 2;
    return true;
  });

  const paginatedPartners = filteredPartners.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSave = async (data: Partial<Partner>) => {
    if (editingPartner) {
      await inventoryApi.updatePartner(editingPartner.id, data);
    } else {
      await inventoryApi.createPartner(data);
    }
    mutate('/api/Partners');
  };

  const handleDelete = async (id: number) => {
    if (confirm('確定要刪除這筆資料嗎？')) {
      try {
        await inventoryApi.deletePartner(id);
        mutate('/api/Partners');
      } catch (error) {
        console.error('Delete failed', error);
        alert('刪除失敗');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '進銷存系統 (Inventory)', href: '/inventory' },
        { label: '廠商與客戶管理' }
      ]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            客戶與廠商管理 (Partners)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理所有往來的客戶與供應商資料。</p>
        </div>
        <button 
          onClick={() => { setEditingPartner(undefined); setViewMode(false); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          新增對象
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          全部 (All)
        </button>
        <button
          onClick={() => { setActiveTab('customer'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'customer'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          客戶 (Customers)
        </button>
        <button
          onClick={() => { setActiveTab('supplier'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'supplier'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          供應商 (Suppliers)
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入資料中...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            目前還沒有建立任何客戶或廠商。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">名稱</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">類型</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">統一編號</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">聯絡人</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">聯絡電話</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">地址</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {partner.type === 1 ? (
                          <User className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Building2 className="h-4 w-4 text-purple-500" />
                        )}
                        {partner.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                        partner.type === 1 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                          : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                      }`}>
                        {partner.type === 1 ? '客戶' : '供應商'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {partner.taxId || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 dark:text-white">
                        {partner.contactPerson || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 dark:text-white">
                        {partner.phone || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px] inline-block" title={partner.address}>
                        {partner.address || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingPartner(partner); setViewMode(true); setIsModalOpen(true); }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 rounded-sm transition-colors"
                          title="檢視"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingPartner(partner); setViewMode(false); setIsModalOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(partner.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-sm transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredPartners.length > 0 && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredPartners.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPartner}
        readOnly={viewMode}
      />
    </div>
  );
}
