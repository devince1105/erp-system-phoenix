"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { Employee } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Users, ShieldAlert, Save, UserCheck, Plane } from "lucide-react";

const PRIVILEGED = ["Admin", "HR"];

export default function ApprovalOrgPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [managerId, setManagerId] = useState<number | "">("");
  const [delegateId, setDelegateId] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    hrApi.getEmployees()
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Failed to load employees", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (canView) fetchData();
  }, [canView, fetchData]);

  const nameOf = (id?: number) => employees.find((e) => e.id === id)?.name ?? (id ? `#${id}` : "—");

  const startEdit = (e: Employee) => {
    setEditingId(e.id);
    setManagerId(e.managerId ?? "");
    setDelegateId(e.delegateEmployeeId ?? "");
  };

  const save = async (id: number) => {
    setIsSaving(true);
    try {
      await hrApi.updateSupervision(id, managerId === "" ? null : Number(managerId), delegateId === "" ? null : Number(delegateId));
      setEditingId(null);
      fetchData();
    } catch (err) {
      const e = err as { response?: { data?: string } };
      console.error(err);
      alert(typeof e.response?.data === "string" ? e.response.data : "儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "簽核組織" }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">僅限管理員 / 人資</h2>
          <p className="text-sm text-slate-500 mt-2">簽核組織(直屬主管與代理人)影響簽核路徑,僅系統管理員與人資可調整。</p>
        </div>
      </div>
    );
  }

  const withDelegate = employees.filter((e) => e.delegateEmployeeId).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "簽核組織" }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          簽核組織 (主管 / 代理)
        </h1>
        <p className="text-sm text-slate-500 mt-1">設定每位員工的<strong className="text-slate-700 dark:text-slate-300">直屬主管</strong>,以及主管不在時的<strong className="text-slate-700 dark:text-slate-300">簽核代理人</strong>。簽核單會依此帶出實際簽核人;代理人可在主管出差/請假時代簽。</p>
      </div>

      {withDelegate > 0 && (
        <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
          <Plane className="w-4 h-4" /> 目前有 {withDelegate} 位已指定簽核代理人
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">載入中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">員工</th>
                  <th className="px-6 py-3">部門</th>
                  <th className="px-6 py-3">直屬主管</th>
                  <th className="px-6 py-3">簽核代理人</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((e) => {
                  const isEditing = editingId === e.id;
                  const others = employees.filter((o) => o.id !== e.id);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{e.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">{e.department?.name ?? "-"}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">
                        {isEditing ? (
                          <select value={managerId} onChange={(ev) => setManagerId(ev.target.value ? Number(ev.target.value) : "")}
                            className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 w-40">
                            <option value="">（預設:部門主管）</option>
                            {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                          </select>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{e.managerId ? nameOf(e.managerId) : <span className="text-slate-400">預設:部門主管</span>}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">
                        {isEditing ? (
                          <select value={delegateId} onChange={(ev) => setDelegateId(ev.target.value ? Number(ev.target.value) : "")}
                            className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 w-40">
                            <option value="">（無代理）</option>
                            {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                          </select>
                        ) : e.delegateEmployeeId ? (
                          <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400"><UserCheck className="w-3.5 h-3.5" />{nameOf(e.delegateEmployeeId)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => save(e.id)} disabled={isSaving} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"><Save className="w-3.5 h-3.5" />儲存</button>
                            <button onClick={() => setEditingId(null)} className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">取消</button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(e)} className="px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">設定</button>
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
      <p className="text-xs text-slate-400">「直屬主管」未設定時,簽核流程的「直屬主管」關卡會自動用部門主管。代理人設定後,主管出差/請假期間該代理人即可代簽,簽核紀錄會標示「代簽」。</p>
    </div>
  );
}
