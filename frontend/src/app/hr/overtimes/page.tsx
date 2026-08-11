"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { OvertimeRequest, Employee, ApprovalInstance } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { Clock3, Plus, X, Trash2, Eye, Check, Undo2 } from "lucide-react";

const emptyForm = {
  employeeId: "" as number | "",
  date: new Date().toISOString().split("T")[0],
  hours: 2,
  reason: "",
};

export default function OvertimesPage() {
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvals, setApprovals] = useState<Record<number, ApprovalInstance | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [detail, setDetail] = useState<OvertimeRequest | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getOvertimes(), hrApi.getEmployees()])
      .then(async ([otData, empData]) => {
        setOvertimes(otData);
        setEmployees(empData);
        const entries = await Promise.all(
          otData.map((o) => hrApi.getApproval("Overtime", o.id).then((inst) => [o.id, inst] as const))
        );
        setApprovals(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load overtimes", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const employeeName = (id: number) => employees.find((e) => e.id === id)?.name || `員工 #${id}`;

  const openCreate = () => {
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("請選擇員工");
    if (form.hours <= 0 || form.hours > 4) return alert("加班時數須介於 0 ~ 4 小時（勞基法上限）");
    if (!form.reason.trim()) return alert("請填寫加班事由");
    setIsSubmitting(true);
    try {
      await hrApi.createOvertime({
        employeeId: Number(form.employeeId),
        date: new Date(form.date).toISOString(),
        hours: Number(form.hours),
        reason: form.reason,
        status: "Pending",
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("送出失敗，請確認時數未超過 4 小時後重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetail = async (ot: OvertimeRequest) => {
    setDetail(ot);
    setDecideComment("");
    const inst = approvals[ot.id] ?? (await hrApi.getApproval("Overtime", ot.id));
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
    if (!confirm("確定要刪除這筆加班申請嗎？")) return;
    try {
      await hrApi.deleteOvertime(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  const pendingCount = overtimes.filter((o) => o.status === "Pending").length;
  const approvedCount = overtimes.filter((o) => o.status === "Approved").length;
  const totalHours = overtimes.filter((o) => o.status === "Approved").reduce((s, o) => s + o.hours, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "加班申請" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock3 className="h-6 w-6 text-orange-600" />
            加班申請 (Overtime Requests)
          </h1>
          <p className="text-sm text-slate-500 mt-1">提出加班申請（單日上限 4 小時）；送出後依簽核流程逐級核准，點「檢視」查看目前卡在哪一關。</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          新增加班申請
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">總申請數</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{overtimes.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">簽核中</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">已核准</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">已核准總時數</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{totalHours} <span className="text-sm font-normal text-slate-400">小時</span></p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入加班申請中...
          </div>
        ) : overtimes.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無加班申請，點右上角「新增加班申請」開始。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">員工</th>
                  <th className="px-6 py-3">加班日期</th>
                  <th className="px-6 py-3">時數</th>
                  <th className="px-6 py-3">事由</th>
                  <th className="px-6 py-3">簽核進度</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {overtimes.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{employeeName(o.employeeId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{new Date(o.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">{o.hours} 小時</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{o.reason || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><ApprovalFlow instance={approvals[o.id] ?? null} compact /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openDetail(o)} title="檢視 / 簽核" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20">
                          <Eye className="w-3.5 h-3.5" /> 檢視
                        </button>
                        <button onClick={() => handleDelete(o.id)} title="刪除（永久移除此筆）" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
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
        {overtimes.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={overtimes.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增加班申請</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">員工 <span className="text-red-500">*</span></label>
                <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                  <option value="">請選擇...</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}（{emp.department?.name ?? "-"}）</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">加班日期</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">時數（≤ 4）</label>
                  <input type="number" step="0.5" min="0.5" max="4" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">加班事由 <span className="text-red-500">*</span></label>
                <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required
                  placeholder="例如：專案趕工、月結作業、系統維護"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white text-sm font-medium rounded-sm">
                  <Clock3 className="w-4 h-4" /> {isSubmitting ? "送出中..." : "送出申請"}
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Clock3 className="w-5 h-5 text-orange-600" /> 加班申請明細</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{employeeName(detail.employeeId)}</p></div>
                <div><p className="text-xs text-slate-500">加班日期</p><p className="font-medium text-slate-800 dark:text-slate-200">{new Date(detail.date).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-slate-500">時數</p><p className="text-slate-700 dark:text-slate-300">{detail.hours} 小時</p></div>
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
