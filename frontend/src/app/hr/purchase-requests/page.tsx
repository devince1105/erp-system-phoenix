"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { PurchaseRequest, Employee, ApprovalInstance } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { ShoppingCart, Plus, X, Trash2, Eye, Check, Undo2 } from "lucide-react";

const CATEGORIES = ["辦公用品", "設備", "軟體授權", "其他"];

const emptyForm = {
  employeeId: "" as number | "",
  itemName: "",
  category: "辦公用品",
  quantity: 1,
  estimatedCost: 0,
  purpose: "",
};

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvals, setApprovals] = useState<Record<number, ApprovalInstance | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [detail, setDetail] = useState<PurchaseRequest | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getPurchaseRequests(), hrApi.getEmployees()])
      .then(async ([prData, empData]) => {
        setRequests(prData);
        setEmployees(empData);
        const entries = await Promise.all(
          prData.map((p) => hrApi.getApproval("Purchase", p.id).then((inst) => [p.id, inst] as const))
        );
        setApprovals(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load purchase requests", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const employeeName = (id: number) => employees.find((e) => e.id === id)?.name || `員工 #${id}`;
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 0 }).format(n);

  const openCreate = () => {
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("請選擇員工");
    if (!form.itemName.trim()) return alert("請填寫採購品項");
    if (form.estimatedCost <= 0) return alert("預估金額需大於 0");
    setIsSubmitting(true);
    try {
      await hrApi.createPurchaseRequest({
        employeeId: Number(form.employeeId),
        itemName: form.itemName,
        category: form.category,
        quantity: Number(form.quantity),
        estimatedCost: Number(form.estimatedCost),
        purpose: form.purpose,
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

  const openDetail = async (pr: PurchaseRequest) => {
    setDetail(pr);
    setDecideComment("");
    const inst = approvals[pr.id] ?? (await hrApi.getApproval("Purchase", pr.id));
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
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      console.error(err);
      alert(e.response?.status === 403 ? (e.response.data?.message ?? "您無權簽核此關卡。") : "簽核失敗");
    } finally {
      setIsDeciding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這筆採購申請嗎？")) return;
    try {
      await hrApi.deletePurchaseRequest(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const approvedTotal = requests.filter((r) => r.status === "Approved").reduce((s, r) => s + r.estimatedCost, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "採購申請" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-cyan-600" />
            採購申請 (Purchase Requests)
          </h1>
          <p className="text-sm text-slate-500 mt-1">提出請購申請；核准後即預先授權採購，之後的費用報銷可關聯此單以加速審核。</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          新增採購申請
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">總申請數</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">簽核中</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">已核准（{approvedCount} 筆，預估）</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1 font-mono">{formatCurrency(approvedTotal)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入採購申請中...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無採購申請，點右上角「新增採購申請」開始。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">申請人</th>
                  <th className="px-6 py-3">品項</th>
                  <th className="px-6 py-3">類別</th>
                  <th className="px-6 py-3 text-right">數量</th>
                  <th className="px-6 py-3 text-right">預估金額</th>
                  <th className="px-6 py-3">簽核進度</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{employeeName(r.employeeId)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate" title={r.itemName}>{r.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400">{r.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300">{r.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(r.estimatedCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><ApprovalFlow instance={approvals[r.id] ?? null} compact /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openDetail(r)} title="檢視 / 簽核" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                          <Eye className="w-3.5 h-3.5" /> 檢視
                        </button>
                        <button onClick={() => handleDelete(r.id)} title="刪除（永久移除此筆）" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
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
        {requests.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={requests.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增採購申請</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">申請人 <span className="text-red-500">*</span></label>
                  <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    <option value="">請選擇...</option>
                    {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}（{emp.department?.name ?? "-"}）</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">類別</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">採購品項 <span className="text-red-500">*</span></label>
                <input type="text" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required
                  placeholder="例如：人體工學椅 x2、螢幕、軟體授權"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">數量</label>
                  <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">預估金額（總計）<span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="100" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">用途說明</label>
                <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="例如：汰換老舊設備、專案需求"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white text-sm font-medium rounded-sm">
                  <ShoppingCart className="w-4 h-4" /> {isSubmitting ? "送出中..." : "送出申請"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Approval Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-cyan-600" /> 採購申請明細</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{employeeName(detail.employeeId)}</p></div>
                <div><p className="text-xs text-slate-500">類別</p><p className="font-medium text-slate-800 dark:text-slate-200">{detail.category}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">品項</p><p className="text-slate-700 dark:text-slate-300">{detail.itemName}</p></div>
                <div><p className="text-xs text-slate-500">數量</p><p className="text-slate-700 dark:text-slate-300">{detail.quantity}</p></div>
                <div><p className="text-xs text-slate-500">預估金額</p><p className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(detail.estimatedCost)}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">用途</p><p className="text-slate-700 dark:text-slate-300">{detail.purpose || "-"}</p></div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">簽核流程</p>
                <ApprovalFlow instance={detailApproval} />
              </div>
              {detailApproval && detailApproval.status === "Pending" && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">簽核意見（選填）</label>
                  <textarea value={decideComment} onChange={(e) => setDecideComment(e.target.value)} rows={2} placeholder="輸入核准或駁回的意見..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
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
