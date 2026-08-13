"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { ExpenseClaim, Employee, ApprovalInstance, PurchaseRequest } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { Wallet, Plus, Utensils, Cake, Package, X, Check, Trash2, Upload, FileText, Undo2, Eye, ReceiptText, ShoppingCart } from "lucide-react";

const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url);

// Daily office-spend categories (費用報銷, non-travel).
const CATEGORIES = [
  { key: "餐飲/聚餐", icon: Utensils, color: "text-amber-600 dark:text-amber-400" },
  { key: "慶生/下午茶", icon: Cake, color: "text-pink-600 dark:text-pink-400" },
  { key: "辦公用品", icon: Package, color: "text-blue-600 dark:text-blue-400" },
  { key: "其他雜支", icon: Wallet, color: "text-slate-600 dark:text-slate-400" },
];

const emptyForm = {
  employeeId: "" as number | "",
  category: "餐飲/聚餐",
  description: "",
  amount: 0,
  claimDate: new Date().toISOString().split("T")[0],
  receiptUrl: "",
  purchaseRequestId: "" as number | "",
};

export default function OfficeExpensesPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [approvals, setApprovals] = useState<Record<number, ApprovalInstance | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [detailClaim, setDetailClaim] = useState<ExpenseClaim | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getExpenseClaims(), hrApi.getEmployees(), hrApi.getPurchaseRequests()])
      .then(async ([claimData, empData, prData]) => {
        const general = claimData.filter((c) => c.expenseType === "General");
        setClaims(general);
        setEmployees(empData);
        setPurchaseRequests(prData);
        const entries = await Promise.all(
          general.map((c) => hrApi.getApproval("ExpenseClaim", c.id).then((inst) => [c.id, inst] as const))
        );
        setApprovals(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load office expenses", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const employeeName = (id: number) => employees.find((e) => e.id === id)?.name || `員工 #${id}`;
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

  const openCreate = () => {
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("請選擇報支員工");
    if (form.amount <= 0) return alert("金額必須大於 0");
    setIsSubmitting(true);
    try {
      await hrApi.createExpenseClaim({
        employeeId: Number(form.employeeId),
        expenseType: "General",
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        claimDate: new Date(form.claimDate).toISOString(),
        receiptUrl: form.receiptUrl || undefined,
        purchaseRequestId: form.purchaseRequestId ? Number(form.purchaseRequestId) : undefined,
        status: "Pending",
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("送出失敗，請重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await hrApi.uploadReceipt(file);
      setForm((f) => ({ ...f, receiptUrl: url }));
    } catch (err) {
      console.error(err);
      alert("收據上傳失敗，請確認為 5MB 內的圖片或 PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const openDetail = async (claim: ExpenseClaim) => {
    setDetailClaim(claim);
    setDecideComment("");
    const inst = approvals[claim.id] ?? (await hrApi.getApproval("ExpenseClaim", claim.id));
    setDetailApproval(inst);
  };

  const handleDecide = async (approve: boolean) => {
    if (!detailApproval) return;
    setIsDeciding(true);
    try {
      const updated = await hrApi.decideApproval(detailApproval.id, approve, decideComment || undefined);
      setDetailApproval(updated);
      setDecideComment("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("簽核失敗");
    } finally {
      setIsDeciding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這筆報銷嗎？")) return;
    try {
      await hrApi.deleteExpenseClaim(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  const pendingTotal = claims.filter((c) => c.status === "Pending").reduce((s, c) => s + c.amount, 0);
  const approvedTotal = claims.filter((c) => c.status === "Approved").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "費用報銷" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-teal-600" />
            費用報銷 (Office Expenses)
          </h1>
          <p className="text-sm text-slate-500 mt-1">日常辦公室開銷報銷（聚餐、慶生下午茶、辦公用品等），與出差無關，送出後依簽核流程核准。</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增報銷
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">總報銷筆數</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{claims.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">待審核金額</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{money(pendingTotal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">已核准金額</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{money(approvedTotal)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入報銷資料中...
          </div>
        ) : claims.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無報銷紀錄，點右上角「新增報銷」開始申請。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">員工</th>
                  <th className="px-6 py-3">類別</th>
                  <th className="px-6 py-3">說明</th>
                  <th className="px-6 py-3 text-right">金額</th>
                  <th className="px-6 py-3">申請日</th>
                  <th className="px-6 py-3">簽核進度</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {claims.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((c) => {
                  const cat = CATEGORIES.find((x) => x.key === c.category);
                  const Icon = cat?.icon ?? Wallet;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{employeeName(c.employeeId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className={`w-4 h-4 ${cat?.color ?? "text-slate-500"}`} />
                          {c.category || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                        <div className="truncate">{c.description || "-"}</div>
                        {c.receiptUrl && (
                          <a href={c.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                            <ReceiptText className="w-3 h-3" /> 收據
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right text-slate-900 dark:text-white">{money(c.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.claimDate ? new Date(c.claimDate).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ApprovalFlow instance={approvals[c.id] ?? null} compact />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => openDetail(c)} title="檢視 / 簽核" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} title="刪除（永久移除此筆）" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {claims.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={claims.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增費用報銷</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">報銷員工 <span className="text-red-500">*</span></label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                  >
                    <option value="">請選擇...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}（{emp.department?.name ?? "-"}）</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">類別 <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.key}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">金額 <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">申請日期</label>
                  <input type="date" value={form.claimDate} onChange={(e) => setForm({ ...form, claimDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">費用說明</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="例如：部門聚餐、七月壽星下午茶、影印紙採購"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-cyan-600" /> 關聯採購申請單 (選填)
                </label>
                <select value={form.purchaseRequestId}
                  onChange={(e) => setForm({ ...form, purchaseRequestId: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                  <option value="">不關聯（無預先請購）</option>
                  {purchaseRequests
                    .filter((p) => p.status === "Approved" && (!form.employeeId || p.employeeId === Number(form.employeeId)))
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.itemName}（{p.category}・預估 ${p.estimatedCost.toLocaleString()}）</option>
                    ))}
                </select>
                <p className="text-xs text-slate-400">關聯已核准的請購單可作為預先授權，加速報銷審核。</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">收據 / 發票 (選填)</label>
                <div className="flex items-center gap-3">
                  <label className={`inline-flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-sm cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 ${isUploading ? "opacity-60 pointer-events-none" : ""}`}>
                    <Upload className="w-4 h-4" />
                    {isUploading ? "上傳中..." : form.receiptUrl ? "重新選擇" : "上傳圖片 / 發票"}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceiptUpload} disabled={isUploading} />
                  </label>
                  {form.receiptUrl && (
                    <a href={form.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      {isImageUrl(form.receiptUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.receiptUrl} alt="收據預覽" className="h-10 w-10 object-cover rounded border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                      已上傳，點擊檢視
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-400">支援 jpg / png / webp / gif / pdf，5MB 內。</p>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">
                  取消
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white text-sm font-medium rounded-sm">
                  <ReceiptText className="w-4 h-4" />
                  {isSubmitting ? "送出中..." : "送出報銷"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Approval Modal */}
      {detailClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-teal-600" /> 費用報銷明細
              </h2>
              <button onClick={() => setDetailClaim(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{employeeName(detailClaim.employeeId)}</p></div>
                <div><p className="text-xs text-slate-500">類別</p><p className="font-medium text-slate-800 dark:text-slate-200">{detailClaim.category || "-"}</p></div>
                <div><p className="text-xs text-slate-500">金額</p><p className="font-mono text-slate-800 dark:text-slate-200">{money(detailClaim.amount)}</p></div>
                <div><p className="text-xs text-slate-500">申請日</p><p className="text-slate-700 dark:text-slate-300">{detailClaim.claimDate ? new Date(detailClaim.claimDate).toLocaleDateString() : "-"}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">說明</p><p className="text-slate-700 dark:text-slate-300">{detailClaim.description || "-"}</p></div>
                {detailClaim.purchaseRequestId && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">關聯採購申請單</p>
                    {(() => {
                      const pr = purchaseRequests.find((p) => p.id === detailClaim.purchaseRequestId);
                      return (
                        <span className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {pr ? `${pr.itemName}（預估 ${money(pr.estimatedCost)}）` : `請購單 #${detailClaim.purchaseRequestId}`}
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">・已預先授權</span>
                        </span>
                      );
                    })()}
                  </div>
                )}
                {detailClaim.receiptUrl && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">收據 / 發票</p>
                    <a href={detailClaim.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      {isImageUrl(detailClaim.receiptUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={detailClaim.receiptUrl} alt="收據" className="h-16 w-16 object-cover rounded border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                      點擊檢視
                    </a>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">簽核流程</p>
                <ApprovalFlow instance={detailApproval} />
              </div>

              {detailApproval && detailApproval.status === "Pending" && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">簽核意見（選填）</label>
                  <textarea
                    value={decideComment}
                    onChange={(e) => setDecideComment(e.target.value)}
                    rows={2}
                    placeholder="輸入核准或駁回的意見..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => handleDecide(false)} disabled={isDeciding} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50">
                      <Undo2 className="w-4 h-4" /> 駁回
                    </button>
                    <button onClick={() => handleDecide(true)} disabled={isDeciding} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm font-medium rounded-sm">
                      <Check className="w-4 h-4" /> {isDeciding ? "處理中..." : "核准此關卡"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
