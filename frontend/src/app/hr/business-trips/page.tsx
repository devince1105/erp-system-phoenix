"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { BusinessTrip, Employee, ApprovalInstance } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { Plane, Plus, X, Trash2, MapPin, CalendarDays, Eye, Check, Undo2 } from "lucide-react";

const emptyForm = {
  employeeId: "" as number | "",
  destination: "",
  purpose: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  estimatedCost: 0,
  notes: "",
};

export default function BusinessTripsPage() {
  const [trips, setTrips] = useState<BusinessTrip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvals, setApprovals] = useState<Record<number, ApprovalInstance | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail / approval
  const [detailTrip, setDetailTrip] = useState<BusinessTrip | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getBusinessTrips(), hrApi.getEmployees()])
      .then(async ([tripData, empData]) => {
        setTrips(tripData);
        setEmployees(empData);
        const entries = await Promise.all(
          tripData.map((t) => hrApi.getApproval("BusinessTrip", t.id).then((inst) => [t.id, inst] as const))
        );
        setApprovals(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load business trips", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const employeeName = (id: number) => employees.find((e) => e.id === id)?.name || `員工 #${id}`;
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  const tripDays = (t: BusinessTrip) =>
    Math.max(1, Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1);

  const openCreate = () => {
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("請選擇出差員工");
    if (!form.destination.trim()) return alert("請填寫出差地點");
    if (new Date(form.endDate) < new Date(form.startDate)) return alert("結束日不可早於開始日");
    setIsSubmitting(true);
    try {
      await hrApi.createBusinessTrip({
        employeeId: Number(form.employeeId),
        destination: form.destination,
        purpose: form.purpose,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        estimatedCost: Number(form.estimatedCost),
        notes: form.notes || undefined,
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

  const openDetail = async (trip: BusinessTrip) => {
    setDetailTrip(trip);
    setDecideComment("");
    const inst = approvals[trip.id] ?? (await hrApi.getApproval("BusinessTrip", trip.id));
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
    if (!confirm("確定要刪除這筆出差申請嗎？")) return;
    try {
      await hrApi.deleteBusinessTrip(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  const pendingCount = trips.filter((t) => t.status === "Pending").length;
  const approvedCount = trips.filter((t) => t.status === "Approved").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "出差申請" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plane className="h-6 w-6 text-indigo-600" />
            出差申請 (Business Trips)
          </h1>
          <p className="text-sm text-slate-500 mt-1">事前申請出差；送出後依簽核流程逐級核准，點「檢視」查看目前卡在哪一關。</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增出差申請
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">總申請數</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{trips.length}</p>
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
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入出差申請中...
          </div>
        ) : trips.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無出差申請，點右上角「新增出差申請」開始。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">員工</th>
                  <th className="px-6 py-3">目的地 / 事由</th>
                  <th className="px-6 py-3">出差期間</th>
                  <th className="px-6 py-3 text-right">預估費用</th>
                  <th className="px-6 py-3">簽核進度</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trips.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{employeeName(t.employeeId)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        {t.destination}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{t.purpose || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        {new Date(t.startDate).toLocaleDateString()} ~ {new Date(t.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">共 {tripDays(t)} 天</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right text-slate-900 dark:text-white">{money(t.estimatedCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ApprovalFlow instance={approvals[t.id] ?? null} compact />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openDetail(t)} title="檢視 / 簽核" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} title="刪除（永久移除此筆）" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
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
        {trips.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={trips.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增出差申請</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">出差員工 <span className="text-red-500">*</span></label>
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
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">出差地點 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="例如：台中、日本東京"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">出差事由</label>
                <input
                  type="text"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="例如：客戶拜訪、參展、教育訓練"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">預估費用</label>
                  <input type="number" min={0} value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">
                  取消
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white text-sm font-medium rounded-sm">
                  <Plane className="w-4 h-4" />
                  {isSubmitting ? "送出中..." : "送出申請"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Approval Modal */}
      {detailTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-600" /> 出差申請明細
              </h2>
              <button onClick={() => setDetailTrip(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{employeeName(detailTrip.employeeId)}</p></div>
                <div><p className="text-xs text-slate-500">出差地點</p><p className="font-medium text-slate-800 dark:text-slate-200">{detailTrip.destination}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">事由</p><p className="text-slate-700 dark:text-slate-300">{detailTrip.purpose || "-"}</p></div>
                <div><p className="text-xs text-slate-500">出差期間</p><p className="text-slate-700 dark:text-slate-300">{new Date(detailTrip.startDate).toLocaleDateString()} ~ {new Date(detailTrip.endDate).toLocaleDateString()}（{tripDays(detailTrip)} 天）</p></div>
                <div><p className="text-xs text-slate-500">預估費用</p><p className="font-mono text-slate-800 dark:text-slate-200">{money(detailTrip.estimatedCost)}</p></div>
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
