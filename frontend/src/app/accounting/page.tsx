"use client";

import React, { useState, useEffect } from "react";
import { AccountTitlesTab } from "@/features/accounting/components/AccountTitlesTab";
import { VouchersTab } from "@/features/accounting/components/VouchersTab";
import { BankAccountsTab } from "@/features/accounting/components/BankAccountsTab";
import { CreateVoucherModal } from "@/features/accounting/components/CreateVoucherModal";
import { CreateBankAccountModal } from "@/features/accounting/components/CreateBankAccountModal";
import {
  AccountTitle,
  Voucher,
  BankAccount,
  CreateVoucherPayload,
  CreateBankAccountPayload
} from "@/features/accounting/types/accounting";
import {
  fetchAccountTitles,
  fetchVouchers,
  fetchBankAccounts,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  createBankAccount,
  updateBankAccount,
  syncBankAccountApi,
  deleteBankAccount
} from "@/features/accounting/api";
import { BookOpen, FileSpreadsheet, Landmark, ShieldCheck, Database, RefreshCw, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"vouchers" | "accountTitles" | "bankAccounts">("vouchers");
  const [accountTitles, setAccountTitles] = useState<AccountTitle[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [titlesData, vouchersData, bankData] = await Promise.all([
        fetchAccountTitles(),
        fetchVouchers(),
        fetchBankAccounts()
      ]);
      setAccountTitles(titlesData);
      setVouchers(vouchersData);
      setBankAccounts(bankData);
    } catch (err) {
      console.error("Failed to load ERP data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Voucher Handlers
  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsCreateModalOpen(true);
  };

  const handleCreateOrUpdateVoucherSubmit = async (payload: CreateVoucherPayload, editingId?: number): Promise<boolean> => {
    if (editingId) {
      const result = await updateVoucher(editingId, payload);
      if (result.success) {
        setToastMessage({ type: "success", text: "傳票修改成功！" });
        await loadData();
        setTimeout(() => setToastMessage(null), 4000);
        return true;
      } else {
        setToastMessage({ type: "error", text: result.error || "修改傳票失敗" });
        setTimeout(() => setToastMessage(null), 5000);
        return false;
      }
    } else {
      const result = await createVoucher(payload);
      if (result.success) {
        setToastMessage({ type: "success", text: `傳票開立成功！傳票單號: ${result.data?.voucherNo || ""}` });
        await loadData();
        setTimeout(() => setToastMessage(null), 4000);
        return true;
      } else {
        setToastMessage({ type: "error", text: result.error || "建立傳票失敗" });
        setTimeout(() => setToastMessage(null), 5000);
        return false;
      }
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm("確定要刪除這筆草稿傳票嗎？")) return;

    const result = await deleteVoucher(id);
    if (result.success) {
      setToastMessage({ type: "success", text: "傳票已成功刪除！" });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage({ type: "error", text: result.error || "刪除傳票失敗" });
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Bank Account Handlers
  const handleOpenCreateBankModal = () => {
    setEditingBankAccount(null);
    setIsBankModalOpen(true);
  };

  const handleOpenEditBankModal = (account: BankAccount) => {
    setEditingBankAccount(account);
    setIsBankModalOpen(true);
  };

  const handleCreateOrUpdateBankSubmit = async (payload: CreateBankAccountPayload, editingId?: number): Promise<boolean> => {
    if (editingId) {
      const result = await updateBankAccount(editingId, payload);
      if (result.success) {
        setToastMessage({ type: "success", text: "銀行帳戶設定更新成功！" });
        await loadData();
        setTimeout(() => setToastMessage(null), 4000);
        return true;
      } else {
        setToastMessage({ type: "error", text: result.error || "更新失敗" });
        setTimeout(() => setToastMessage(null), 5000);
        return false;
      }
    } else {
      const result = await createBankAccount(payload);
      if (result.success) {
        setToastMessage({ type: "success", text: `銀行帳戶 ${result.data?.bankName} 新增成功！` });
        await loadData();
        setTimeout(() => setToastMessage(null), 4000);
        return true;
      } else {
        setToastMessage({ type: "error", text: result.error || "新增銀行帳戶失敗" });
        setTimeout(() => setToastMessage(null), 5000);
        return false;
      }
    }
  };

  const handleSyncBankApi = async (id: number) => {
    const result = await syncBankAccountApi(id);
    if (result.success) {
      setToastMessage({ type: "success", text: result.message || "銀行 Open API 同步完成！" });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage({ type: "error", text: result.error || "銀行 API 同步失敗" });
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleDeleteBankAccount = async (id: number) => {
    if (!confirm("確定要刪除此銀行帳戶設定嗎？")) return;

    const result = await deleteBankAccount(id);
    if (result.success) {
      setToastMessage({ type: "success", text: "銀行帳戶已成功刪除！" });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage({ type: "error", text: result.error || "刪除失敗" });
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <div className="flex flex-col text-slate-100">

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-md transition ${
            toastMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-xs opacity-70 hover:opacity-100">關閉</button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">財務會計模組</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理傳票、銀行帳戶與會計科目。</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
              title="重新整理資料"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>新增傳票</span>
            </button>
          </div>
        </div>

        {/* Tab Selector (Jira Style) */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("vouchers")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition relative ${
                activeTab === "vouchers"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>傳票管理 ({vouchers.length})</span>
              {activeTab === "vouchers" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("accountTitles")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition relative ${
                activeTab === "accountTitles"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>會計科目 ({accountTitles.length})</span>
              {activeTab === "accountTitles" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("bankAccounts")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition relative ${
                activeTab === "bankAccounts"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Landmark className="h-4 w-4" />
              <span>銀行帳戶 & Open API ({bankAccounts.length})</span>
              {activeTab === "bankAccounts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-500 gap-2 font-mono pb-2 pr-2">
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Database: ERPPhoenixDB</span>
          </div>
        </div>

        {/* Tab Body View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl">
            <div className="h-8 w-8 rounded-full border-2 border-blue-600 dark:border-emerald-500 border-t-transparent animate-spin mb-3"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400">正在連接 MS-SQL Server 與讀取 API 資料...</p>
          </div>
        ) : activeTab === "vouchers" ? (
          <VouchersTab
            vouchers={vouchers}
            onOpenCreateModal={handleOpenCreateModal}
            onEditVoucher={handleOpenEditModal}
            onDeleteVoucher={handleDeleteVoucher}
          />
        ) : activeTab === "accountTitles" ? (
          <AccountTitlesTab accountTitles={accountTitles} />
        ) : (
          <BankAccountsTab
            bankAccounts={bankAccounts}
            onOpenCreateModal={handleOpenCreateBankModal}
            onEditAccount={handleOpenEditBankModal}
            onSyncAccountApi={handleSyncBankApi}
            onDeleteAccount={handleDeleteBankAccount}
          />
        )}

      </main>



      {/* Create / Edit Voucher Modal */}
      <CreateVoucherModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        accountTitles={accountTitles}
        editingVoucher={editingVoucher}
        onSubmit={handleCreateOrUpdateVoucherSubmit}
      />

      {/* Create / Edit Bank Account Modal */}
      <CreateBankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        accountTitles={accountTitles}
        editingAccount={editingBankAccount}
        onSubmit={handleCreateOrUpdateBankSubmit}
      />

    </div>
  );
}
