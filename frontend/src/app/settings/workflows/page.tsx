"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { WorkflowConfig, WorkflowStepConfig, RoleOption } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { CheckSquare, Plus, Trash2, ArrowUp, ArrowDown, Save, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export default function WorkflowsPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.includes("Admin");

  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [activeType, setActiveType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedType, setSavedType] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    hrApi.getWorkflows()
      .then((data) => {
        setWorkflows(data.workflows);
        setRoles(data.availableRoles);
        setActiveType((prev) => prev || data.workflows[0]?.formType || "");
      })
      .catch((err) => console.error("Failed to load workflows", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const active = workflows.find((w) => w.formType === activeType);
  const roleLabel = (role: string) => roles.find((r) => r.role === role)?.label ?? role;

  const updateSteps = (mut: (steps: WorkflowStepConfig[]) => WorkflowStepConfig[]) => {
    setWorkflows((prev) => prev.map((w) => (w.formType === activeType ? { ...w, steps: mut([...w.steps]) } : w)));
    setDirty(true);
    setSavedType(null);
  };

  const addStep = () => {
    const first = roles[0];
    if (!first) return;
    updateSteps((steps) => [...steps, { stepOrder: steps.length + 1, role: first.role, label: first.label }]);
  };
  const removeStep = (idx: number) => updateSteps((steps) => steps.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => updateSteps((steps) => {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return steps;
    [steps[idx], steps[j]] = [steps[j], steps[idx]];
    return steps;
  });
  const setRole = (idx: number, role: string) => updateSteps((steps) =>
    steps.map((s, i) => (i === idx ? { ...s, role, label: roleLabel(role) } : s)));
  const setLabel = (idx: number, label: string) => updateSteps((steps) =>
    steps.map((s, i) => (i === idx ? { ...s, label } : s)));

  const save = async () => {
    if (!active) return;
    setIsSaving(true);
    try {
      const steps = active.steps.map((s, i) => ({ stepOrder: i + 1, role: s.role, label: s.label }));
      await hrApi.saveWorkflow(active.formType, steps);
      setDirty(false);
      setSavedType(active.formType);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      console.error(err);
      alert(e.response?.data?.message ?? "儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "系統設定", href: "/settings" }, { label: "簽核流程" }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">僅限系統管理員</h2>
          <p className="text-sm text-slate-500 mt-2">簽核流程設定會影響所有單據的簽核路徑，僅系統管理員可調整。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "系統設定", href: "/settings" }, { label: "簽核流程" }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-blue-600" />
          簽核流程設定 (Workflows)
        </h1>
        <p className="text-sm text-slate-500 mt-1">設定各類單據的簽核關卡與順序。變更後<strong className="text-slate-700 dark:text-slate-300">新提交</strong>的單據即依此流程逐級簽核（既有單據不受影響）。</p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">載入中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
          {/* Form type list */}
          <div className="space-y-1">
            {workflows.map((w) => (
              <button key={w.formType} onClick={() => setActiveType(w.formType)}
                className={`w-full text-left px-4 py-3 rounded-sm border text-sm transition-colors ${
                  activeType === w.formType
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}>
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" />{w.formLabel}</span>
                <span className="text-xs text-slate-400 mt-0.5 block pl-6">{w.steps.length} 關</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm">
            {!active ? (
              <div className="py-12 text-center text-slate-400">請選擇左側表單類型</div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <h2 className="font-bold text-slate-900 dark:text-white">{active.formLabel} 的簽核流程</h2>
                  <div className="flex items-center gap-3">
                    {savedType === active.formType && !dirty && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />已儲存</span>
                    )}
                    <button onClick={save} disabled={!dirty || isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-sm">
                      <Save className="w-4 h-4" /> {isSaving ? "儲存中..." : "儲存"}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {active.steps.length === 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded">此流程沒有任何關卡，單據送出後將直接核准。</p>
                  )}
                  {active.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-800/20">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                      <select value={step.role} onChange={(e) => setRole(idx, e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 w-44 shrink-0">
                        {roles.map((r) => <option key={r.role} value={r.role}>{r.label}{r.approverName ? `（${r.approverName}）` : ""}</option>)}
                      </select>
                      <input type="text" value={step.label} onChange={(e) => setLabel(idx, e.target.value)}
                        placeholder="顯示名稱（例如：資訊部主管）"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                      {(() => {
                        const opt = roles.find((r) => r.role === step.role);
                        return (
                          <span className="text-xs text-slate-500 shrink-0 w-24 truncate" title={opt?.approverName ?? "依申請人所屬"}>
                            {opt?.approverName ? `→ ${opt.approverName}` : "依申請人"}
                          </span>
                        );
                      })()}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30" title="上移"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={() => move(idx, 1)} disabled={idx === active.steps.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30" title="下移"><ArrowDown className="w-4 h-4" /></button>
                        <button onClick={() => removeStep(idx)} className="p-1.5 text-slate-400 hover:text-red-600" title="刪除關卡"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}

                  <button onClick={addStep} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Plus className="w-4 h-4" /> 新增關卡
                  </button>

                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">可用角色僅限 直屬主管 / 部門主管 / 財務部（簽核引擎能解析的角色）；顯示名稱可自訂。流程由上而下逐級簽核。</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
