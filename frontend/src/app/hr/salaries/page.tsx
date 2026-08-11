"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { EmployeeSalary, JobGrade } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { Wallet, Lock, Save, Pencil, X, ShieldAlert, AlertTriangle } from "lucide-react";

const PRIVILEGED = ["Admin", "HR", "Accountant"];

export default function SalariesPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));
  const canGrade = !!user?.roles?.some((r) => ["Admin", "HR"].includes(r));

  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [grades, setGrades] = useState<JobGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getEmployeeSalaries(), hrApi.getJobGrades()])
      .then(([sal, gr]) => { setSalaries(sal); setGrades(gr); })
      .catch((err) => console.error("Failed to load salaries", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { if (canView) fetchData(); }, [canView, fetchData]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 0 }).format(n);
  const band = (s: EmployeeSalary) => (s.minSalary != null && s.maxSalary != null ? `${s.minSalary.toLocaleString()}–${s.maxSalary.toLocaleString()}` : null);

  const startEdit = (s: EmployeeSalary) => { setEditingId(s.id); setEditValue(s.baseSalary); };

  const save = async (id: number) => {
    if (editValue < 0) return alert("本薪不可為負數");
    setIsSaving(true);
    try {
      await hrApi.updateEmployeeBaseSalary(id, Number(editValue));
      setEditingId(null);
      fetchData();
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      console.error(err);
      // 400 = out of the grade's salary band (防呆); 403 = no permission.
      alert(e.response?.data?.message ?? (e.response?.status === 403 ? "您無權變更薪資。" : "儲存失敗"));
    } finally { setIsSaving(false); }
  };

  const changeGrade = async (s: EmployeeSalary, gradeId: number | null) => {
    try { await hrApi.updateEmployeeGrade(s.id, gradeId); fetchData(); }
    catch (err) { const e = err as { response?: { data?: { message?: string } } }; alert(e.response?.data?.message ?? "改派職級失敗"); }
  };

  const totalMonthly = salaries.reduce((s, e) => s + e.baseSalary, 0);
  const paginated = salaries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const editGrade = editingId != null ? salaries.find((s) => s.id === editingId) : undefined;
  const outOfBand = !!editGrade && editGrade.minSalary != null && editGrade.maxSalary != null && (editValue < editGrade.minSalary || editValue > editGrade.maxSalary);

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "員工薪資" }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">此頁面為機密資料</h2>
          <p className="text-sm text-slate-500 mt-2">員工薪資僅限系統管理員、人資與會計人員檢視。若需存取，請聯絡管理員調整您的角色權限。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "員工薪資" }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="h-6 w-6 text-indigo-600" />
          員工薪資設定 (Salaries)
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"><Lock className="w-3 h-3" /> 機密</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">本薪須落在該員工<strong className="text-slate-700 dark:text-slate-300">職級的薪資帶</strong>內(超出會被擋);時薪 = 本薪 ÷ 240。職級表可於「系統設定 → 組織與職級」維護。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4"><p className="text-xs text-slate-500">員工數</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{salaries.length}</p></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4"><p className="text-xs text-slate-500">月本薪合計</p><p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">{formatCurrency(totalMonthly)}</p></div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">載入中...</div>
        ) : salaries.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無員工資料。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">員工</th>
                  <th className="px-6 py-3">部門</th>
                  <th className="px-6 py-3">職級 · 薪資帶</th>
                  <th className="px-6 py-3 text-right">月本薪</th>
                  <th className="px-6 py-3 text-right">時薪 (÷240)</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((s) => {
                  const isEditing = editingId === s.id;
                  const previewHourly = isEditing ? editValue / 240 : s.hourlyRate;
                  const b = band(s);
                  const salaryOutOfBand = s.minSalary != null && s.maxSalary != null && (s.baseSalary < s.minSalary || s.baseSalary > s.maxSalary);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{s.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{s.departmentName ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {canGrade ? (
                          <select value={s.jobGradeId ?? ""} onChange={(e) => changeGrade(s, e.target.value ? Number(e.target.value) : null)}
                            className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-xs dark:text-slate-200">
                            <option value="">未定級</option>
                            {grades.map((g) => <option key={g.id} value={g.id}>{g.code} {g.title}</option>)}
                          </select>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{s.jobGradeCode ? `${s.jobGradeCode} ${s.jobGradeTitle}` : "未定級"}</span>
                        )}
                        {b && <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{b}</div>}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="inline-flex flex-col items-end gap-0.5">
                            <input type="number" min="0" step="1000" value={editValue} onChange={(e) => setEditValue(Number(e.target.value))}
                              className={`w-32 px-2 py-1 text-right border rounded focus:outline-none focus:ring-1 bg-white dark:bg-slate-950 dark:text-slate-200 font-mono ${outOfBand ? "border-red-400 focus:ring-red-500" : "border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"}`} />
                            {outOfBand && <span className="text-[10px] text-red-500 inline-flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />超出薪資帶 {b}</span>}
                          </div>
                        ) : salaryOutOfBand ? (
                          <span className="inline-flex items-center justify-end gap-1 font-mono font-semibold text-red-600 dark:text-red-400" title={`超出職級 ${s.jobGradeCode} 薪資帶 ${b}`}>
                            <AlertTriangle className="w-3.5 h-3.5" />{formatCurrency(s.baseSalary)}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(s.baseSalary)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-slate-500">{formatCurrency(Math.round(previewHourly * 100) / 100)}/h</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => save(s.id)} disabled={isSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-50" title="儲存"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title="取消"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(s)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"><Pencil className="w-3.5 h-3.5" /> 調整</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {salaries.length > 0 && !isLoading && (
          <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={salaries.length} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        )}
      </div>

      <p className="text-xs text-slate-400">改派職級時,若原本薪超出新職級薪資帶,系統會自動夾至帶內。調整本薪後,下次執行「薪資結算」即以新本薪計算。</p>
    </div>
  );
}
