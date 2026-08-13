"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { LeaveRequest, Employee, ApprovalInstance } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { CalendarDays, Plus, X, Trash2, Eye, Check, Undo2 } from "lucide-react";

const LEAVE_TYPES = [
  { key: "Annual", label: "特休" },
  { key: "Sick", label: "病假" },
  { key: "Personal", label: "事假" },
  { key: "Official", label: "公假" },
];
const leaveLabel = (k: string) => LEAVE_TYPES.find((t) => t.key === k)?.label ?? k;

const emptyForm = {
  employeeId: "" as number | "",
  leaveType: "Annual",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  reason: "",
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvals, setApprovals] = useState<Record<number, ApprovalInstance | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [detail, setDetail] = useState<LeaveRequest | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getLeaves(), hrApi.getEmployees()])
      .then(async ([lvData, empData]) => {
        setLeaves(lvData);
        setEmployees(empData);
        const entries = await Promise.all(
          lvData.map((l) => hrApi.getApproval("Leave", l.id).then((inst) => [l.id, inst] as const))
        );
        setApprovals(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load leaves", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const employeeName = (id: number) => employees.find((e) => e.id === id)?.name || `員工 #${id}`;
  const days = (l: LeaveRequest) =>
    Math.max(1, Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1);

  const openCreate = () => {
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("請選擇員工");
    if (new Date(form.endDate) < new Date(form.startDate)) return alert("結束日不可早於開始日");
    if (!form.reason.trim()) return alert("請填寫請假事由");
    setIsSubmitting(true);
    try {
      await hrApi.createLeave({
        employeeId: Number(form.employeeId),
        leaveType: form.leaveType,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason,
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

  const openDetail = async (lv: LeaveRequest) => {
    setDetail(lv);
    setDecideComment("");
    const inst = approvals[lv.id] ?? (await hrApi.getApproval("Leave", lv.id));
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
    if (!confirm("確定要刪除這筆請假申請嗎？")) return;
    try {
      await hrApi.deleteLeave(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "請假申請" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-violet-600" />
            請假申請 (Leave Requests)
          </h1>
          <p className="text-sm text-slate-500 mt-1">提出請假申請；送出後依簽核流程逐級核准，點「檢視」查看目前卡在哪一關。</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          新增請假申請
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">總申請數</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leaves.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">簽核中</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">已核准</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入請假申請中...
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無請假申請，點右上角「新增請假申請」開始。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">員工</th>
                  <th className="px-6 py-3">假別</th>
                  <th className="px-6 py-3">起訖日期</th>
                  <th className="px-6 py-3">事由</th>
                  <th className="px-6 py-3">簽核進度</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{employeeName(l.employeeId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">{leaveLabel(l.leaveType)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(l.startDate).toLocaleDateString()} ~ {new Date(l.endDate).toLocaleDateString()}
                      <span className="text-xs text-slate-400 ml-1">（{days(l)} 天）</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{l.reason || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><ApprovalFlow instance={approvals[l.id] ?? null} compact /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openDetail(l)} title="檢視 / 簽核" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(l.id)} title="刪除（永久移除此筆）" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
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
        {leaves.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={leaves.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增請假申請</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">員工 <span className="text-red-500">*</span></label>
                  <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    <option value="">請選擇...</option>
                    {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}（{emp.department?.name ?? "-"}）</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">假別 <span className="text-red-500">*</span></label>
                  <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    {LEAVE_TYPES.map((t) => (<option key={t.key} value={t.key}>{t.label}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">開始日</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">結束日</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">請假事由 <span className="text-red-500">*</span></label>
                <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required
                  placeholder="例如：家庭旅遊、身體不適就醫、個人事務"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white text-sm font-medium rounded-sm">
                  <CalendarDays className="w-4 h-4" /> {isSubmitting ? "送出中..." : "送出申請"}
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><CalendarDays className="w-5 h-5 text-violet-600" /> 請假申請明細</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{employeeName(detail.employeeId)}</p></div>
                <div><p className="text-xs text-slate-500">假別</p><p className="font-medium text-slate-800 dark:text-slate-200">{leaveLabel(detail.leaveType)}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">起訖日期</p><p className="text-slate-700 dark:text-slate-300">{new Date(detail.startDate).toLocaleDateString()} ~ {new Date(detail.endDate).toLocaleDateString()}（{days(detail)} 天）</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">事由</p><p className="text-slate-700 dark:text-slate-300">{detail.reason || "-"}</p></div>
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
