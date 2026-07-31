"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { BusinessTrip, Employee } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Plane, Plus, X, Check, XCircle, Clock, Trash2, MapPin, CalendarDays, Undo2 } from "lucide-react";

const emptyForm = {
  employeeId: "" as number | "",
  destination: "",
  purpose: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  estimatedCost: 0,
  notes: "",
};

function statusBadge(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50";
    case "Completed":
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50";
  }
}

const statusLabel: Record<string, string> = { Pending: "待審核", Approved: "已核准", Rejected: "已駁回", Completed: "已完成" };

export default function BusinessTripsPage() {
  const [trips, setTrips] = useState<BusinessTrip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getBusinessTrips(), hrApi.getEmployees()])
      .then(([tripData, empData]) => {
        setTrips(tripData);
        setEmployees(empData);
      })
      .catch((err) => console.error("Failed to load business trips", err))
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

  const handleStatus = async (id: number, status: string) => {
    try {
      await hrApi.updateBusinessTripStatus(id, status);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("更新狀態失敗");
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

  const tripDays = (t: BusinessTrip) =>
    Math.max(1, Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1);
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
          <p className="text-sm text-slate-500 mt-1">事前申請出差；核准後即可據以申請差旅報支（預先授權，較易過審）。</p>
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
          <p className="text-xs text-slate-500">待審核</p>
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
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trips.map((t) => (
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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusBadge(t.status)}`}>
                        {t.status === "Approved" ? <Check className="w-3 h-3" /> : t.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {statusLabel[t.status] ?? t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        {t.status === "Pending" && (
                          <>
                            <button onClick={() => handleStatus(t.id, "Approved")} title="核准" className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatus(t.id, "Rejected")} title="駁回（保留紀錄，狀態改為已駁回）" className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded">
                              <Undo2 className="w-4 h-4" />
                            </button>
                            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" aria-hidden />
                          </>
                        )}
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
      </div>

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
    </div>
  );
}
