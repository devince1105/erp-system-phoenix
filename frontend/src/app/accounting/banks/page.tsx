'use client';

import React, { useEffect, useState } from 'react';
import { accountingApi } from '@/features/accounting/api/accountingApi';
import { BankAccount, CreateBankAccountPayload, AccountTitle } from '@/features/accounting/types/accounting';
import { Wallet, Plus, RefreshCw, AlertCircle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { CreateBankAccountModal } from '@/features/accounting/components/CreateBankAccountModal';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';

export default function BankAccountsPage() {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [accountTitles, setAccountTitles] = useState<AccountTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | undefined>(undefined);

  useEffect(() => {
    fetchBanks();
    fetchAccountTitles();
  }, []);

  const fetchAccountTitles = async () => {
    try {
      const data = await accountingApi.getAccountTitles();
      // Only keep asset accounts (category 0 or 1 depending on enum) for bank accounts, or just pass all.
      // In types/accounting.ts AccountCategory.Asset is 1.
      setAccountTitles(data as unknown as AccountTitle[]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBanks = async () => {
    try {
      const data = await accountingApi.getBankAccounts();
      setBanks(data);
    } catch (error) {
      console.error('Failed to fetch bank accounts', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (id: number) => {
    setSyncingId(id);
    setNotification(null);
    try {
      const res = await accountingApi.syncBankAccount(id);
      setNotification({ type: 'success', message: res.message || 'Sync successful!' });
      fetchBanks(); // Refresh balances
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data || err.message || 'Failed to sync with Open API.' 
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleSave = async (payload: CreateBankAccountPayload, editingId?: number) => {
    try {
      if (editingId) {
        await accountingApi.updateBankAccount(editingId, payload as any);
        setNotification({ type: 'success', message: '銀行帳戶已更新' });
      } else {
        await accountingApi.createBankAccount(payload as any);
        setNotification({ type: 'success', message: '銀行帳戶已新增' });
      }
      fetchBanks();
      return true;
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data || '儲存失敗' });
      return false;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '會計系統', href: '/accounting' },
        { label: '銀行帳戶管理' }
      ]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            銀行帳戶管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理公司銀行帳戶，並支援 Open Banking API 自動連線。</p>
        </div>
        <button 
          onClick={() => { setEditingBank(undefined); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4" />
          新增銀行帳戶
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-sm border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入銀行帳戶中...
          </div>
        ) : banks.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm text-slate-500">
            尚未整合任何銀行帳戶。
          </div>
        ) : (
          banks.map((bank) => (
            <div key={bank.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {bank.bankName}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 font-mono">{bank.accountNumber}</p>
                </div>
                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  bank.apiType > 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                  {bank.apiType > 0 ? 'API 介接' : '手動管理'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1">
                <p className="text-sm text-slate-500 mb-1">目前餘額 ({bank.currency})</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  <span className="text-lg text-slate-400 font-normal mr-1">$</span>
                  {bank.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span className="block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  最後同步時間: {bank.lastSyncedAt ? new Date(bank.lastSyncedAt).toLocaleString() : '從未同步'}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setEditingBank(bank); setIsModalOpen(true); }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  設定
                </button>
                <button 
                  onClick={() => handleSync(bank.id)}
                  disabled={syncingId === bank.id || bank.apiType === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-sm transition-colors group"
                >
                  <RefreshCw className={`w-4 h-4 ${syncingId === bank.id ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  {syncingId === bank.id ? '同步中...' : '立即同步'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <CreateBankAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountTitles={accountTitles}
        editingAccount={editingBank}
        onSubmit={handleSave}
      />
    </div>
  );
}
