"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { ExpenseClaim, Employee, BusinessTrip } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Receipt, Plus, Plane, Hotel, Utensils, Package, X, Check, XCircle, Clock, Trash2, ShieldCheck, Upload, FileText, Undo2 } from "lucide-react";

const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url);

// Travel-oriented expense categories (stored as the free-text Category on the backend)
const CATEGORIES = [
  { key: "交通費", icon: Plane, color: "text-blue-600 dark:text-blue-400" },
  { key: "住宿費", icon: Hotel, color: "text-purple-600 dark:text-purple-400" },
  { key: "餐費", icon: Utensils, color: "text-amber-600 dark:text-amber-400" },
  { key: "差旅雜支", icon: Package, color: "text-slate-600 dark:text-slate-400" },
];

const emptyForm = {
  employeeId: "" as number | "",
  businessTripId: "" as number | "",
  category: "交通費",
  description: "",
  amount: 0,
  claimDate: new Date().toISOString().split("T")[0],
  receiptUrl: "",
  notes: "",
};

function statusBadge(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50";
  }
}

const statusLabel: Record<string, string> = { Pending: "待審核", Approved: "已核准", Rejected: "已駁回" };

export default function ExpensesPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trips, setTrips] = useState<BusinessTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getExpenseClaims(), hrApi.getEmployees(), hrApi.getBusinessTrips()])
      .then(([claimData, empData, tripData]) => {
        setClaims(claimData);
        setEmployees(empData);
        setTrips(tripData);
      })
      .catch((err) => console.error("Failed to load expense claims", err))
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
    if (!form.employeeId) return alert("請選擇報支員工");
    if (form.amount <= 0) return alert("金額必須大於 0");
    setIsSubmitting(true);
    try {
      await hrApi.createExpenseClaim({
        employeeId: Number(form.employeeId),
        businessTripId: form.businessTripId ? Number(form.businessTripId) : undefined,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        claimDate: new Date(form.claimDate).toISOString(),
        receiptUrl: form.receiptUrl || undefined,
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
      await hrApi.updateExpenseClaimStatus(id, status);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("更新狀態失敗");
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

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這筆報支嗎？")) return;
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
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "差旅報支" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-600" />
            差旅報支 (Travel Expenses)
          </h1>
          <p className="text-sm text-slate-500 mt-1">申請差旅費用報支（交通、住宿、餐費），送出後由主管簽核。</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增報支
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">總報支筆數</p>
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

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入報支資料中...
          </div>
        ) : claims.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無報支紀錄，點右上角「新增報支」開始申請。</div>
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
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {claims.map((c) => {
                  const cat = CATEGORIES.find((x) => x.key === c.category);
                  const Icon = cat?.icon ?? Package;
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
                            <Receipt className="w-3 h-3" /> 收據
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right text-slate-900 dark:text-white">{money(c.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.claimDate ? new Date(c.claimDate).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusBadge(c.status)}`}>
                          {c.status === "Approved" ? <Check className="w-3 h-3" /> : c.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {statusLabel[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          {c.status === "Pending" && (
                            <>
                              <button onClick={() => handleStatus(c.id, "Approved")} title="核准" className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleStatus(c.id, "Rejected")} title="駁回（保留紀錄，狀態改為已駁回）" className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded">
                                <Undo2 className="w-4 h-4" />
                              </button>
                              <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" aria-hidden />
                            </>
                          )}
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
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增差旅報支</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">報支員工 <span className="text-red-500">*</span></label>
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">關聯出差申請單 (選填)</label>
                <select
                  value={form.businessTripId}
                  onChange={(e) => setForm({ ...form, businessTripId: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                >
                  <option value="">不關聯（一般報支）</option>
                  {trips
                    .filter((t) => t.status === "Approved" && (!form.employeeId || t.employeeId === Number(form.employeeId)))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.destination}（{new Date(t.startDate).toLocaleDateString()} ~ {new Date(t.endDate).toLocaleDateString()}）
                      </option>
                    ))}
                </select>
                {form.businessTripId ? (
                  <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> 已關聯核准的出差單，此報支視為預先授權，簽核較易通過。
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">關聯已核准的出差單可加速簽核；無出差單也可直接報支。</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">金額 <span className="text-red-500">*</span></label>
                  <input
                    type="number" min={0}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">申請日期</label>
                  <input
                    type="date"
                    value={form.claimDate}
                    onChange={(e) => setForm({ ...form, claimDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">費用說明</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="例如：台北→台中 高鐵來回、出差住宿一晚"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200"
                />
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
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-sm">
                  <Receipt className="w-4 h-4" />
                  {isSubmitting ? "送出中..." : "送出報支"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
