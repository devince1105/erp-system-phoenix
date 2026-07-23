"use client";

import React, { useState } from "react";
import { Landmark, Plus, RefreshCw, Key, Globe, ShieldCheck, CreditCard, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { BankAccount, BankApiIntegrationType } from "@/features/accounting/types/accounting";

interface BankAccountsTabProps {
  bankAccounts: BankAccount[];
  onOpenCreateModal: () => void;
  onEditAccount: (account: BankAccount) => void;
  onSyncAccountApi: (id: number) => void;
  onDeleteAccount: (id: number) => void;
}

export const BankAccountsTab: React.FC<BankAccountsTabProps> = ({
  bankAccounts,
  onOpenCreateModal,
  onEditAccount,
  onSyncAccountApi,
  onDeleteAccount
}) => {
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const getApiTypeName = (type: BankApiIntegrationType) => {
    switch (type) {
      case BankApiIntegrationType.OpenBankingFWI:
        return { name: "財金 Open Banking API", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case BankApiIntegrationType.MockBankApi:
        return { name: "沙盒測試 (Mock API)", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
      case BankApiIntegrationType.DirectWebAPI:
        return { name: "銀行直連 Enterprise API", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      default:
        return { name: "未串接 (人工對帳)", color: "bg-slate-800 text-slate-400 border-slate-700" };
    }
  };

  const handleSyncClick = async (id: number) => {
    setSyncingId(id);
    await onSyncAccountApi(id);
    setSyncingId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-600 dark:text-emerald-400" />
            <span>銀行帳戶與 Open API 串接管理 (Bank Accounts & Open Banking)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">MS-SQL `account.BankAccounts` 帳戶變更與開放銀行 Web API 連線金鑰設定</p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-xs hover:bg-blue-700 dark:hover:from-emerald-400 dark:hover:to-teal-400 transition shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>設定/新增銀行帳戶</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {bankAccounts.map(account => {
          const apiTypeInfo = getApiTypeName(account.apiType);
          const isSyncing = syncingId === account.id;

          return (
            <div
              key={account.id}
              className="bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-gray-300 dark:hover:border-slate-700 transition relative overflow-hidden group"
            >
              <div>
                {/* Header: Bank Name & API Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-emerald-500/10 border border-blue-200 dark:border-emerald-500/20 flex items-center justify-center font-mono font-bold text-blue-600 dark:text-emerald-400 text-sm">
                      {account.bankCode}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {account.bankName}
                        {account.branchName && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({account.branchName})</span>}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{account.accountName}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded border text-[11px] font-sans ${apiTypeInfo.color}`}>
                    {apiTypeInfo.name}
                  </span>
                </div>

                {/* Account Number & Balance */}
                <div className="mt-4 p-3 bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800/80 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">帳號 Account Number</span>
                    <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{account.accountNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">可用餘額 ({account.currency})</span>
                    <span className="text-lg font-bold font-mono text-blue-600 dark:text-emerald-400">
                      ${account.balance.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Open API Connection Details */}
                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {account.apiEndpoint ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <Globe className="h-3 w-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate">API Endpoint: {account.apiEndpoint}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <Globe className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>尚未設定 API Endpoint URL</span>
                    </div>
                  )}

                  {account.apiClientId && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <Key className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span>Client ID: {account.apiClientId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Sync Action & Edit/Delete */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {account.lastSyncedAt ? (
                    <>同步時間: {new Date(account.lastSyncedAt).toLocaleTimeString()}</>
                  ) : (
                    <>尚未進行同步</>
                  )}
                </span>

                <div className="flex items-center space-x-2">
                  {account.apiType !== BankApiIntegrationType.None && (
                    <button
                      onClick={() => handleSyncClick(account.id)}
                      disabled={isSyncing}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 dark:bg-emerald-500/10 border border-blue-200 dark:border-emerald-500/30 text-blue-700 dark:text-emerald-400 text-[11px] hover:bg-blue-100 dark:hover:bg-emerald-500/20 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>API 同步</span>
                    </button>
                  )}

                  <button
                    onClick={() => onEditAccount(account)}
                    className="p-1.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition"
                    title="編輯銀行帳戶與 API 金鑰"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition"
                    title="刪除銀行帳戶"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
