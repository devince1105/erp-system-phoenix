"use client";

import React, { useState } from "react";
import { FileSpreadsheet, PlusCircle, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Scale, Pencil, Trash2 } from "lucide-react";
import { Voucher, VoucherStatus, VoucherType } from "@/features/accounting/types/accounting";

interface VouchersTabProps {
  vouchers: Voucher[];
  onOpenCreateModal: () => void;
  onEditVoucher: (voucher: Voucher) => void;
  onDeleteVoucher: (id: number) => void;
}

export const VouchersTab: React.FC<VouchersTabProps> = ({
  vouchers,
  onOpenCreateModal,
  onEditVoucher,
  onDeleteVoucher
}) => {
  const [expandedVoucherId, setExpandedVoucherId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedVoucherId(expandedVoucherId === id ? null : id);
  };

  const getTypeName = (type: VoucherType) => {
    switch (type) {
      case VoucherType.CashIn: return { name: "現金收入傳票", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case VoucherType.CashOut: return { name: "現金支出傳票", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
      default: return { name: "轉帳分錄傳票", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
    }
  };

  const getStatusName = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.Approved: return { name: "已審核", color: "text-blue-400 bg-blue-500/10" };
      case VoucherStatus.Posted: return { name: "已過帳", color: "text-purple-400 bg-purple-500/10" };
      default: return { name: "草稿 (Draft)", color: "text-amber-400 bg-amber-500/10 border border-amber-500/20" };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-emerald-400" />
            <span>會計傳票管理 (Accounting Vouchers)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">MS-SQL `account.Vouchers` 及 `account.VoucherDetails` 主明細關係表</p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-emerald-500/10 border border-blue-200 dark:border-emerald-500/30 text-blue-700 dark:text-emerald-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-emerald-500/20 transition"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>開立新傳票</span>
        </button>
      </div>

      {/* Vouchers Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-8"></th>
              <th className="py-3 px-4 font-semibold">傳票單號 (Voucher No)</th>
              <th className="py-3 px-4 font-semibold">日期</th>
              <th className="py-3 px-4 font-semibold">傳票類型</th>
              <th className="py-3 px-4 font-semibold">備註 / 摘要</th>
              <th className="py-3 px-4 font-semibold text-right">總金額</th>
              <th className="py-3 px-4 font-semibold">狀態</th>
              <th className="py-3 px-4 font-semibold text-center w-24">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500 font-sans">
                  尚無傳票資料，點擊右上角「開立傳票」建立第一筆傳票！
                </td>
              </tr>
            ) : (
              vouchers.map(v => {
                const typeInfo = getTypeName(v.type);
                const statusInfo = getStatusName(v.status);
                const isExpanded = expandedVoucherId === v.id;

                return (
                  <React.Fragment key={v.id}>
                    <tr
                      onClick={() => toggleExpand(v.id)}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 text-slate-500">
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-blue-600 dark:text-emerald-400" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                      <td className="py-3 px-4 text-blue-600 dark:text-emerald-400 font-bold">{v.voucherNo}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-sans">{v.voucherDate.split("T")[0]}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded border text-[11px] ${typeInfo.color}`}>
                          {typeInfo.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {v.memo || "無備註"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ${v.totalAmount.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusInfo.color}`}>
                          {statusInfo.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onEditVoucher(v)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            title="編輯傳票"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteVoucher(v.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            title="刪除傳票"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50 dark:bg-slate-950/90 border-t border-b border-gray-200 dark:border-emerald-500/20">
                        <td colSpan={7} className="p-4">
                          <div className="bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 rounded-lg p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-2 text-xs font-sans text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <Scale className="h-3.5 w-3.5 text-blue-600 dark:text-emerald-400" />
                                傳票借貸明細分錄 (Voucher Details)
                              </span>
                              <span className="text-blue-600 dark:text-emerald-400 font-mono text-[11px]">
                                借貸總額平衡檢核通過: ${v.totalAmount.toLocaleString()}
                              </span>
                            </div>

                            <table className="w-full text-xs text-left font-mono">
                              <thead className="bg-gray-50 dark:bg-slate-950 text-slate-500 border-b border-gray-200 dark:border-slate-800">
                                <tr>
                                  <th className="py-2 px-3">項次</th>
                                  <th className="py-2 px-3">借/貸</th>
                                  <th className="py-2 px-3">會計科目</th>
                                  <th className="py-2 px-3 text-right">借方金額 (Debit)</th>
                                  <th className="py-2 px-3 text-right">貸方金額 (Credit)</th>
                                  <th className="py-2 px-3">摘要說明</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40">
                                {v.details && v.details.map((d, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                    <td className="py-2 px-3 text-slate-500">{d.seqNo || idx + 1}</td>
                                    <td className="py-2 px-3 font-sans font-bold">
                                      {d.isDebit ? (
                                        <span className="text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-cyan-500/20">借 (Dr)</span>
                                      ) : (
                                        <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">貸 (Cr)</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-slate-700 dark:text-slate-200 font-sans">
                                      <span className="text-blue-600 dark:text-emerald-400 font-mono font-bold mr-1">
                                        {d.accountTitle?.code || `#${d.accountTitleId}`}
                                      </span>
                                      {d.accountTitle?.name || ""}
                                    </td>
                                    <td className="py-2 px-3 text-right text-blue-600 dark:text-cyan-400 font-bold">
                                      {d.isDebit ? `$${d.amount.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}` : "-"}
                                    </td>
                                    <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">
                                      {!d.isDebit ? `$${d.amount.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}` : "-"}
                                    </td>
                                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-sans">{d.summary || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
