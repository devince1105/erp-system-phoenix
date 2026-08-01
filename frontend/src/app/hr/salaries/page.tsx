"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { EmployeeSalary } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Wallet, Lock, Save, Pencil, X, ShieldAlert } from "lucide-react";

const PRIVILEGED = ["Admin", "HR", "Accountant"];

export default function SalariesPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    hrApi.getEmployeeSalaries()
      .then((data) => setSalaries(data))
      .catch((err) => console.error("Failed to load salaries", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Non-privileged users see the access-denied card (which ignores isLoading),
    // so only the privileged path needs to load data.
    if (canView) fetchData();
  }, [canView, fetchData]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 0 }).format(n);

  const startEdit = (s: EmployeeSalary) => {
    setEditingId(s.id);
    setEditValue(s.baseSalary);
  };

  const save = async (id: number) => {
    if (editValue < 0) return alert("本薪不可為負數");
    setIsSaving(true);
    try {
      await hrApi.updateEmployeeBaseSalary(id, Number(editValue));
      setEditingId(null);
      fetchData();
    } catch (err) {
      const e = err as { response?: { status?: number } };
      console.error(err);
      alert(e.response?.status === 403 ? "您無權變更薪資。" : "儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const totalMonthly = salaries.reduce((s, e) => s + e.baseSalary, 0);

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" />
            員工薪資設定 (Salaries)
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <Lock className="w-3 h-3" /> 機密
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">設定每位員工的月本薪；時薪 = 本薪 ÷ 240 小時，作為加班/請假計薪基準。僅限 Admin / 人資 / 會計。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">員工數</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{salaries.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
          <p className="text-xs text-slate-500">月本薪合計</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">{formatCurrency(totalMonthly)}</p>
        </div>
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
                  <th className="px-6 py-3">職稱</th>
                  <th className="px-6 py-3 text-right">月本薪</th>
                  <th className="px-6 py-3 text-right">時薪 (÷240)</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salaries.map((s) => {
                  const isEditing = editingId === s.id;
                  const previewHourly = isEditing ? editValue / 240 : s.hourlyRate;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{s.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{s.departmentName ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{s.jobTitle || "-"}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <input type="number" min="0" step="1000" value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-32 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 dark:text-slate-200 font-mono" />
                        ) : (
                          <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(s.baseSalary)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-slate-500">
                        {formatCurrency(Math.round(previewHourly * 100) / 100)}/h
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => save(s.id)} disabled={isSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-50" title="儲存"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title="取消"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(s)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <Pencil className="w-3.5 h-3.5" /> 調整
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">調整本薪後，下次執行「薪資結算」即以新本薪計算；已產生的薪資單需重新結算才會套用。</p>
    </div>
  );
}
