'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { accountingApi, AccountTitle } from '@/features/accounting/api/accountingApi';
import { ListTree, Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { AccountTitleModal } from '@/features/accounting/components/AccountTitleModal';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';

export default function AccountTitlesPage() {
  const [accounts, setAccounts] = useState<AccountTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<AccountTitle | undefined>(undefined);

  const fetchAccounts = useCallback(() => {
    accountingApi.getAccountTitles()
      .then(data => setAccounts(data))
      .catch(err => console.error('Failed to fetch account titles', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSave = async (data: Partial<AccountTitle>) => {
    if (editingTitle) {
      await accountingApi.updateAccountTitle(editingTitle.id, data);
    } else {
      await accountingApi.createAccountTitle(data);
    }
    fetchAccounts();
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`確定要刪除會計科目「${name}」嗎？`)) {
      try {
        await accountingApi.deleteAccountTitle(id);
        fetchAccounts();
      } catch (err) {
        console.error(err);
        alert('刪除失敗，此科目可能已被使用。');
      }
    }
  };

  const filteredAccounts = accounts.filter(a => 
    a.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (category: number) => {
    switch (category) {
      case 0: return <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-400">資產 (Asset)</span>;
      case 1: return <span className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium dark:bg-red-900/30 dark:text-red-400">負債 (Liability)</span>;
      case 2: return <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-medium dark:bg-purple-900/30 dark:text-purple-400">權益 (Equity)</span>;
      case 3: return <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-medium dark:bg-emerald-900/30 dark:text-emerald-400">收益 (Revenue)</span>;
      case 4: return <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-medium dark:bg-orange-900/30 dark:text-orange-400">費用 (Expense)</span>;
      default: return <span>未知</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '會計系統', href: '/accounting' },
        { label: '會計科目設定' }
      ]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTree className="h-6 w-6 text-blue-600" />
            會計科目設定
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理與設定總帳的會計科目表。</p>
        </div>
        <button 
          onClick={() => { setEditingTitle(undefined); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          新增科目
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋科目代碼或名稱..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 transition-all"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          類別篩選
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">科目代碼</th>
                <th className="px-6 py-4">名稱</th>
                <th className="px-6 py-4">類別</th>
                <th className="px-6 py-4">說明</th>
                <th className="px-6 py-4 text-center">狀態</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    載入科目中...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    找不到符合條件的會計科目。
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                      {acc.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {acc.name}
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(acc.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      -
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        acc.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {acc.isActive ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingTitle(acc); setIsModalOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc.id, acc.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-sm transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AccountTitleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingTitle}
      />
    </div>
  );
}
