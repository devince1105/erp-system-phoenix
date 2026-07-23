"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Scale, AlertTriangle, CheckCircle, Save } from "lucide-react";
import { AccountTitle, VoucherType, CreateVoucherPayload, Voucher } from "@/features/accounting/types/accounting";

interface CreateVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountTitles: AccountTitle[];
  editingVoucher?: Voucher | null;
  onSubmit: (payload: CreateVoucherPayload, editingId?: number) => Promise<boolean>;
}

interface DetailRow {
  accountTitleId: number;
  isDebit: boolean;
  amount: number | string;
  summary: string;
}

export const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({
  isOpen,
  onClose,
  accountTitles,
  editingVoucher,
  onSubmit
}) => {
  const [voucherDate, setVoucherDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<VoucherType>(VoucherType.General);
  const [memo, setMemo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [details, setDetails] = useState<DetailRow[]>([]);

  React.useEffect(() => {
    if (editingVoucher) {
      setVoucherDate(editingVoucher.voucherDate.split("T")[0]);
      setType(editingVoucher.type);
      setMemo(editingVoucher.memo || "");
      setDetails(
        editingVoucher.details.map(d => ({
          accountTitleId: d.accountTitleId,
          isDebit: d.isDebit,
          amount: d.amount,
          summary: d.summary || ""
        }))
      );
    } else if (accountTitles.length > 0 && details.length === 0) {
      const defaultDebitTitle = accountTitles[0]?.id || 1;
      const defaultCreditTitle = accountTitles.find(t => t.code === "4101")?.id || accountTitles[1]?.id || 12;
      setDetails([
        { accountTitleId: defaultDebitTitle, isDebit: true, amount: 1000, summary: "現金流入" },
        { accountTitleId: defaultCreditTitle, isDebit: false, amount: 1000, summary: "銷貨收入" }
      ]);
    }
  }, [editingVoucher, accountTitles]);

  if (!isOpen) return null;

  // Realtime Debit / Credit totals
  const totalDebit = details
    .filter(d => d.isDebit)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const totalCredit = details
    .filter(d => !d.isDebit)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const handleAddRow = () => {
    setDetails([
      ...details,
      { accountTitleId: accountTitles[0]?.id || 1, isDebit: true, amount: 0, summary: "" }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (details.length <= 2) return; // Keep at least 2 rows
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: keyof DetailRow, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isBalanced) {
      setErrorMsg(`傳票借貸不平衡！借方總額: $${totalDebit}, 貸方總額: $${totalCredit}，差額: $${difference}`);
      return;
    }

    setIsSubmitting(true);
    const payload: CreateVoucherPayload = {
      voucherDate,
      type,
      memo: memo || undefined,
      details: details.map(d => ({
        accountTitleId: Number(d.accountTitleId),
        isDebit: d.isDebit,
        amount: Number(d.amount),
        summary: d.summary || undefined
      }))
    };

    const success = await onSubmit(payload, editingVoucher?.id);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {editingVoucher ? `編輯會計傳票 (${editingVoucher.voucherNo})` : "開立會計傳票 (New Accounting Voucher)"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Top Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">傳票日期 (Date)</label>
              <input
                type="date"
                value={voucherDate}
                onChange={e => setVoucherDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">傳票類型 (Type)</label>
              <select
                value={type}
                onChange={e => setType(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={VoucherType.General}>轉帳分錄傳票 (General)</option>
                <option value={VoucherType.CashIn}>現金收入傳票 (Cash In)</option>
                <option value={VoucherType.CashOut}>現金支出傳票 (Cash Out)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">傳票摘要 / 備註 (Memo)</label>
              <input
                type="text"
                placeholder="輸入傳票整體備註..."
                value={memo}
                onChange={e => setMemo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Details Table Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-200">分錄明細列 (Voucher Entries)</h4>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>新增分錄列</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-24">借/貸</th>
                    <th className="py-2.5 px-3">會計科目 (Account Title)</th>
                    <th className="py-2.5 px-3 w-36">金額 ($)</th>
                    <th className="py-2.5 px-3">分錄摘要</th>
                    <th className="py-2.5 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {details.map((row, idx) => (
                    <tr key={idx} className="bg-slate-900/40 hover:bg-slate-800/30">
                      
                      {/* Debit / Credit Select */}
                      <td className="py-2 px-3 font-sans">
                        <select
                          value={row.isDebit ? "debit" : "credit"}
                          onChange={e => handleRowChange(idx, "isDebit", e.target.value === "debit")}
                          className={`w-full bg-slate-950 border rounded px-2 py-1 text-xs font-bold ${
                            row.isDebit ? "text-cyan-400 border-cyan-500/30" : "text-rose-400 border-rose-500/30"
                          }`}
                        >
                          <option value="debit" className="text-cyan-400">借 (Dr)</option>
                          <option value="credit" className="text-rose-400">貸 (Cr)</option>
                        </select>
                      </td>

                      {/* Account Title Select */}
                      <td className="py-2 px-3 font-sans">
                        <select
                          value={row.accountTitleId}
                          onChange={e => handleRowChange(idx, "accountTitleId", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-emerald-500"
                        >
                          {accountTitles.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.code} - {t.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Amount Input */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.amount}
                          onChange={e => handleRowChange(idx, "amount", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white font-bold focus:border-emerald-500"
                        />
                      </td>

                      {/* Summary Input */}
                      <td className="py-2 px-3 font-sans">
                        <input
                          type="text"
                          placeholder="摘要..."
                          value={row.summary}
                          onChange={e => handleRowChange(idx, "summary", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:border-emerald-500 placeholder-slate-600"
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={details.length <= 2}
                          className="text-slate-500 hover:text-rose-400 disabled:opacity-30 p-1 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Realtime Balance Status Indicator */}
          <div className={`p-4 rounded-xl border flex items-center justify-between font-sans ${
            isBalanced 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm">
                  {isBalanced ? "借貸金額平衡 (Debit == Credit)" : "借貸金額不平衡！無法儲存"}
                </span>
                {!isBalanced && (
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    借方與貸方差額為 ${difference.toLocaleString("zh-TW")}，請修改分錄金額至相等。
                  </p>
                )}
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs">
                借總: <span className="text-cyan-400 font-bold">${totalDebit.toLocaleString()}</span> | 
                貸總: <span className="text-rose-400 font-bold">${totalCredit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isBalanced || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "儲存中..." : "確認開立傳票"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
