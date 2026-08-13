"use client";

import React, { useCallback, useState, useEffect } from "react";
import { crmApi } from "@/features/crm/api/crmApi";
import { Customer } from "@/features/crm/types/crm";
import { Users, Search, Building2, User, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { CustomerModal } from "@/features/crm/components/CustomerModal";
import { Pagination } from "@/features/core/components/Pagination";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCustomers = useCallback(() => {
    crmApi.getCustomers()
      .then(data => setCustomers(data))
      .catch(err => console.error("Failed to load customers", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`確定要刪除客戶「${name}」嗎？這個操作無法復原。`)) {
      try {
        await crmApi.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        console.error(err);
        alert("刪除失敗");
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '客戶關係管理 (CRM)', href: '/crm' },
        { label: '客戶與商機' }
      ]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-rose-600" />
            客戶名單 (Customers)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理所有 B2B 與 B2C 客戶檔案與聯絡資訊。</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-rose-600/20 transition-all focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="h-4 w-4" />
          新增客戶
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {/* Search Bar matching the clean container style */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="搜尋客戶名稱、聯絡人或產業類別..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-slate-200 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入資料中...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            找不到符合條件的客戶資料
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">名稱</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">類型</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">產業</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">聯絡人</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">聯絡電話</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-rose-500" />
                        {customer.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                        customer.type === 'B2B' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {customer.industry || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {customer.contactPerson || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 dark:text-white">
                        {customer.phone || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(customer)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 rounded-sm transition-colors"
                          title="檢視"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id, customer.name)}
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

        {/* Pagination UI */}
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="bg-white dark:bg-slate-900">
            <Pagination 
              currentPage={currentPage} 
              pageSize={pageSize}
              totalItems={filteredCustomers.length}
              onPageChange={setCurrentPage} 
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCustomers}
        customer={selectedCustomer}
        readOnly={viewMode}
      />
    </div>
  );
}
