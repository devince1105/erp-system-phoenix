import React from "react";
import { Voucher, VoucherType } from "@/features/accounting/types/accounting";

interface VoucherPrintViewProps {
  voucher: Voucher;
}

export const VoucherPrintView: React.FC<VoucherPrintViewProps> = ({ voucher }) => {
  const getTypeName = (type: VoucherType) => {
    switch (type) {
      case VoucherType.CashIn: return "現金收入傳票";
      case VoucherType.CashOut: return "現金支出傳票";
      default: return "轉帳傳票";
    }
  };

  const totalDebit = voucher.details.filter(d => d.isDebit).reduce((acc, curr) => acc + curr.amount, 0);
  const totalCredit = voucher.details.filter(d => !d.isDebit).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto font-serif h-screen">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold tracking-widest border-b-2 border-black inline-block pb-1 px-8 mb-2">
          {getTypeName(voucher.type)}
        </h1>
      </div>

      {/* Meta info */}
      <div className="flex justify-between items-end mb-2 text-sm">
        <div className="flex gap-4">
          <p><strong>傳票日期：</strong> {voucher.voucherDate.split("T")[0]}</p>
          <p><strong>傳票編號：</strong> {voucher.voucherNo}</p>
        </div>
        <div>
          <p><strong>列印時間：</strong> {new Date().toLocaleString("zh-TW")}</p>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border-2 border-black text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 w-12 text-center">項次</th>
            <th className="border border-black px-2 py-2">會計科目</th>
            <th className="border border-black px-2 py-2 w-1/3">摘要</th>
            <th className="border border-black px-2 py-2 w-32 text-right">借方金額</th>
            <th className="border border-black px-2 py-2 w-32 text-right">貸方金額</th>
          </tr>
        </thead>
        <tbody>
          {voucher.details.map((detail, index) => (
            <tr key={detail.id || index}>
              <td className="border border-black px-2 py-2 text-center">{detail.seqNo}</td>
              <td className="border border-black px-2 py-2">
                {detail.accountTitle?.code} {detail.accountTitle?.name}
              </td>
              <td className="border border-black px-2 py-2">{detail.summary}</td>
              <td className="border border-black px-2 py-2 text-right">
                {detail.isDebit ? detail.amount.toLocaleString("zh-TW", { minimumFractionDigits: 2 }) : ""}
              </td>
              <td className="border border-black px-2 py-2 text-right">
                {!detail.isDebit ? detail.amount.toLocaleString("zh-TW", { minimumFractionDigits: 2 }) : ""}
              </td>
            </tr>
          ))}
          {/* Fill empty rows to make it look like a standard voucher */}
          {Array.from({ length: Math.max(0, 5 - voucher.details.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border border-black px-2 py-3"></td>
              <td className="border border-black px-2 py-3"></td>
              <td className="border border-black px-2 py-3"></td>
              <td className="border border-black px-2 py-3"></td>
              <td className="border border-black px-2 py-3"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan={3} className="border border-black px-2 py-2 text-right">
              合計：
            </td>
            <td className="border border-black px-2 py-2 text-right">
              ${totalDebit.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}
            </td>
            <td className="border border-black px-2 py-2 text-right">
              ${totalCredit.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Signatures */}
      <div className="flex justify-between mt-8 border border-black p-4 text-sm">
        <div className="w-1/4 text-center">
          <p className="mb-8">核准 (Approved)</p>
          <div className="border-b border-black mx-4"></div>
        </div>
        <div className="w-1/4 text-center">
          <p className="mb-8">覆核 (Reviewed)</p>
          <div className="border-b border-black mx-4"></div>
        </div>
        <div className="w-1/4 text-center">
          <p className="mb-8">會計 (Accountant)</p>
          <div className="border-b border-black mx-4"></div>
        </div>
        <div className="w-1/4 text-center">
          <p className="mb-8">製單 (Prepared)</p>
          <div className="border-b border-black mx-4"></div>
        </div>
      </div>
      
    </div>
  );
};
