"use client";

import React, { useState, useEffect } from "react";
import { X, Landmark, Globe, Key, Save } from "lucide-react";
import { BankAccount, BankApiIntegrationType, CreateBankAccountPayload, AccountTitle } from "@/features/accounting/types/accounting";

interface CreateBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountTitles: AccountTitle[];
  editingAccount?: BankAccount | null;
  onSubmit: (payload: CreateBankAccountPayload, editingId?: number) => Promise<boolean>;
}

export const CreateBankAccountModal: React.FC<CreateBankAccountModalProps> = ({
  isOpen,
  onClose,
  accountTitles,
  editingAccount,
  onSubmit
}) => {
  const [bankCode, setBankCode] = useState<string>("808");
  const [bankName, setBankName] = useState<string>("玉山銀行");
  const [branchName, setBranchName] = useState<string>("營業部");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("○○企業股份有限公司");
  const [currency, setCurrency] = useState<string>("TWD");
  const [balance, setBalance] = useState<number | string>(100000);
  const [accountTitleId, setAccountTitleId] = useState<number>(2); // Default to 1102
  const [apiType, setApiType] = useState<BankApiIntegrationType>(BankApiIntegrationType.OpenBankingFWI);
  const [apiEndpoint, setApiEndpoint] = useState<string>("https://api.esunbank.com.tw/open-banking/v1");
  const [apiClientId, setApiClientId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingAccount) {
      setBankCode(editingAccount.bankCode);
      setBankName(editingAccount.bankName);
      setBranchName(editingAccount.branchName || "");
      setAccountNumber(editingAccount.accountNumber);
      setAccountName(editingAccount.accountName);
      setCurrency(editingAccount.currency);
      setBalance(editingAccount.balance);
      setAccountTitleId(editingAccount.accountTitleId || 2);
      setApiType(editingAccount.apiType);
      setApiEndpoint(editingAccount.apiEndpoint || "");
      setApiClientId(editingAccount.apiClientId || "");
    } else {
      setBankCode("808");
      setBankName("玉山銀行");
      setBranchName("營業部");
      setAccountNumber("");
      setAccountName("○○企業股份有限公司");
      setCurrency("TWD");
      setBalance(100000);
      setApiType(BankApiIntegrationType.OpenBankingFWI);
      setApiEndpoint("https://api.esunbank.com.tw/open-banking/v1");
      setApiClientId("");
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!bankCode || !bankName || !accountNumber || !accountName) {
      setErrorMsg("請填寫完整的銀行代碼、銀行名稱、帳號與戶名！");
      return;
    }

    setIsSubmitting(true);
    const payload: CreateBankAccountPayload = {
      bankCode,
      bankName,
      branchName: branchName || undefined,
      accountNumber,
      accountName,
      currency,
      balance: Number(balance) || 0,
      accountTitleId: Number(accountTitleId) || undefined,
      apiType,
      apiEndpoint: apiEndpoint || undefined,
      apiClientId: apiClientId || undefined
    };

    const success = await onSubmit(payload, editingAccount?.id);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {editingAccount ? `設定/修改銀行帳戶 (${editingAccount.bankName})` : "新增銀行帳戶與 Open API 串接"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Section 1: Basic Bank Account Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5" />
              <span>1. 銀行基本帳戶資訊</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">銀行代碼 (Code)</label>
                <input
                  type="text"
                  placeholder="808"
                  value={bankCode}
                  onChange={e => setBankCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">銀行名稱 (Bank Name)</label>
                <input
                  type="text"
                  placeholder="玉山銀行"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">分行名稱 (Branch)</label>
                <input
                  type="text"
                  placeholder="營業部"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">銀行帳號 (Account No)</label>
                <input
                  type="text"
                  placeholder="0808-988-123456"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">戶名 (Account Name)</label>
                <input
                  type="text"
                  placeholder="○○企業股份有限公司"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">幣別 (Currency)</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500"
                >
                  <option value="TWD">TWD (新台幣)</option>
                  <option value="USD">USD (美元)</option>
                  <option value="EUR">EUR (歐元)</option>
                  <option value="JPY">JPY (日圓)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">初始帳戶餘額 ($)</label>
                <input
                  type="number"
                  step="any"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-right focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">對應會計科目</label>
                <select
                  value={accountTitleId}
                  onChange={e => setAccountTitleId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500"
                >
                  {accountTitles.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Open Banking API Integration Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span>2. 銀行 Open API 串接與連線設定</span>
            </h4>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">API 串接模式 (Integration Mode)</label>
              <select
                value={apiType}
                onChange={e => setApiType(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
              >
                <option value={BankApiIntegrationType.None}>未串接 (人工線下對帳)</option>
                <option value={BankApiIntegrationType.OpenBankingFWI}>財金公司 Open Banking 開放銀行 API</option>
                <option value={BankApiIntegrationType.MockBankApi}>沙盒測試模式 (Mock Sandbox API)</option>
                <option value={BankApiIntegrationType.DirectWebAPI}>銀行直連 Enterprise Web API</option>
              </select>
            </div>

            {apiType !== BankApiIntegrationType.None && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3 text-cyan-400" />
                    <span>銀行 API Endpoint URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.esunbank.com.tw/open-banking/v1"
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                    <Key className="h-3 w-3 text-amber-400" />
                    <span>API Client ID / Key 金鑰</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ESUN_ERP_CLIENT_2026"
                    value={apiClientId}
                    onChange={e => setApiClientId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "儲存中..." : "儲存銀行帳戶設定"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
