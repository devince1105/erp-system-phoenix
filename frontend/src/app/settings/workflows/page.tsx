"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { WorkflowConfig, WorkflowStepConfig, RoleOption, ApprovalFormTemplate } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { CheckSquare, Plus, Trash2, ArrowUp, ArrowDown, Save, ShieldAlert, FileText, CheckCircle2, X, FilePlus, Sparkles } from "lucide-react";

export default function WorkflowsPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.includes("Admin");

  const [builtins, setBuiltins] = useState<WorkflowConfig[]>([]);
  const [templates, setTemplates] = useState<ApprovalFormTemplate[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [activeLabel, setActiveLabel] = useState<string>("");
  const [steps, setSteps] = useState<WorkflowStepConfig[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", description: "", requireQuantity: true, requireAmount: false });

  const activeTemplate = templates.find((t) => t.formType === activeKey) ?? null;

  const loadLists = useCallback(() => {
    return Promise.all([hrApi.getWorkflows(), hrApi.getApprovalTemplates()]).then(([wf, tpls]) => {
      setBuiltins(wf.workflows);
      setRoles(wf.availableRoles);
      setTemplates(tpls);
      return wf.workflows;
    });
  }, []);

  const selectForm = useCallback((formType: string, label: string) => {
    setActiveKey(formType);
    setActiveLabel(label);
    setDirty(false);
    setSaved(false);
    hrApi.getWorkflow(formType).then((r) => setSteps(r.workflow.steps)).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadLists()
      .then((wf) => { if (wf[0]) selectForm(wf[0].formType, wf[0].formLabel); })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [isAdmin, loadLists, selectForm]);

  const roleLabel = (role: string) => roles.find((r) => r.role === role)?.label ?? role;
  const roleName = (role: string) => roles.find((r) => r.role === role)?.approverName;

  const mutate = (fn: (s: WorkflowStepConfig[]) => WorkflowStepConfig[]) => { setSteps((p) => fn([...p])); setDirty(true); setSaved(false); };
  const addStep = () => { const r = roles[0]; if (r) mutate((s) => [...s, { stepOrder: s.length + 1, role: r.role, label: r.label }]); };
  const removeStep = (i: number) => mutate((s) => s.filter((_, idx) => idx !== i));
  const move = (i: number, d: -1 | 1) => mutate((s) => { const j = i + d; if (j < 0 || j >= s.length) return s; [s[i], s[j]] = [s[j], s[i]]; return s; });
  const setRole = (i: number, role: string) => mutate((s) => s.map((x, idx) => (idx === i ? { ...x, role, label: roleLabel(role) } : x)));
  const setLabel = (i: number, label: string) => mutate((s) => s.map((x, idx) => (idx === i ? { ...x, label } : x)));

  const saveSteps = async () => {
    setIsSaving(true);
    try {
      await hrApi.saveWorkflow(activeKey, steps.map((s, i) => ({ stepOrder: i + 1, role: s.role, label: s.label })));
      setDirty(false); setSaved(true);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "儲存失敗");
    } finally { setIsSaving(false); }
  };

  const createTemplate = async () => {
    if (!newForm.name.trim()) return alert("請填寫表單名稱");
    try {
      const t = await hrApi.createApprovalTemplate({ ...newForm, isActive: true });
      setShowNew(false);
      setNewForm({ name: "", description: "", requireQuantity: true, requireAmount: false });
      await loadLists();
      selectForm(t.formType, t.name);
    } catch (err) {
      console.error(err); alert("建立失敗");
    }
  };

  const toggleActive = async () => {
    if (!activeTemplate) return;
    await hrApi.updateApprovalTemplate(activeTemplate.id, { ...activeTemplate, isActive: !activeTemplate.isActive });
    await loadLists();
  };
  const deleteTemplate = async () => {
    if (!activeTemplate) return;
    if (!confirm(`確定刪除自訂表單「${activeTemplate.name}」？`)) return;
    try {
      await hrApi.deleteApprovalTemplate(activeTemplate.id);
      const wf = await loadLists();
      if (wf[0]) selectForm(wf[0].formType, wf[0].formLabel);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "刪除失敗");
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "系統設定", href: "/settings" }, { label: "簽核流程" }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">僅限系統管理員</h2>
          <p className="text-sm text-slate-500 mt-2">簽核流程設定會影響所有單據的簽核路徑,僅系統管理員可調整。</p>
        </div>
      </div>
    );
  }

  const linkClass = (key: string) => `w-full text-left px-4 py-2.5 rounded-sm border text-sm transition-colors ${
    activeKey === key
      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium"
      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "系統設定", href: "/settings" }, { label: "簽核流程" }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-blue-600" />
          簽核流程設定 (Workflows)
        </h1>
        <p className="text-sm text-slate-500 mt-1">設定內建單據的簽核關卡,或<strong className="text-slate-700 dark:text-slate-300">自訂一種新申請單</strong>(領用、用印、外出…)並指定其簽核流程。變更後新提交的單據即依此逐級簽核。</p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">載入中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5">
          {/* Left: form list */}
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">內建單據</p>
              {builtins.map((w) => (
                <button key={w.formType} onClick={() => selectForm(w.formType, w.formLabel)} className={linkClass(w.formType)}>
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" />{w.formLabel}</span>
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">自訂申請單</p>
              {templates.map((t) => (
                <button key={t.formType} onClick={() => selectForm(t.formType, t.name)} className={linkClass(t.formType)}>
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-violet-500" />
                    <span className="truncate">{t.name}</span>
                    {!t.isActive && <span className="text-[10px] text-slate-400 ml-auto shrink-0">停用</span>}
                  </span>
                </button>
              ))}
              <button onClick={() => setShowNew(true)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-violet-600 dark:text-violet-400 border border-dashed border-violet-300 dark:border-violet-800 rounded-sm hover:bg-violet-50 dark:hover:bg-violet-900/20">
                <FilePlus className="w-4 h-4" /> 新增自訂表單
              </button>
            </div>
          </div>

          {/* Right: editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white">{activeLabel} 的簽核流程</h2>
              <div className="flex items-center gap-3">
                {saved && !dirty && <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />已儲存</span>}
                <button onClick={saveSteps} disabled={!dirty || isSaving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-sm">
                  <Save className="w-4 h-4" /> {isSaving ? "儲存中..." : "儲存流程"}
                </button>
              </div>
            </div>

            {activeTemplate && (
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 text-sm bg-violet-50/40 dark:bg-violet-900/10">
                <span className="text-slate-500">{activeTemplate.description || "自訂申請單"}</span>
                <span className="text-xs text-slate-400">欄位:主旨{activeTemplate.requireQuantity ? "・數量" : ""}{activeTemplate.requireAmount ? "・金額" : ""}・事由・附件</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={toggleActive} className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">{activeTemplate.isActive ? "停用" : "啟用"}</button>
                  <button onClick={deleteTemplate} className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />刪除</button>
                </div>
              </div>
            )}

            <div className="p-6 space-y-3">
              {steps.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded">此流程沒有任何關卡,單據送出後將直接核准。請至少新增一關。</p>
              )}
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-800/20">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                  <select value={step.role} onChange={(e) => setRole(idx, e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 w-44 shrink-0">
                    {roles.map((r) => <option key={r.role} value={r.role}>{r.label}{r.approverName ? `（${r.approverName}）` : ""}</option>)}
                  </select>
                  <input type="text" value={step.label} onChange={(e) => setLabel(idx, e.target.value)}
                    placeholder="顯示名稱（例如：資訊部主管）"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                  <span className="text-xs text-slate-500 shrink-0 w-24 truncate" title={roleName(step.role) ?? "依申請人"}>{roleName(step.role) ? `→ ${roleName(step.role)}` : "依申請人"}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30" title="上移"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => move(idx, 1)} disabled={idx === steps.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30" title="下移"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => removeStep(idx)} className="p-1.5 text-slate-400 hover:text-red-600" title="刪除關卡"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button onClick={addStep} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Plus className="w-4 h-4" /> 新增關卡
              </button>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">可選簽核人:直屬主管、部門主管(依申請人),或任一部門主管(帶出實際姓名)。流程由上而下逐級簽核;主管不在時可由其簽核代理人代簽。</p>
            </div>
          </div>
        </div>
      )}

      {/* New template modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><FilePlus className="w-5 h-5 text-violet-600" />新增自訂申請單</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">表單名稱 <span className="text-red-500">*</span></label>
                <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="例如：電腦物品領用申請單、用印申請單、外出申請單"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">說明</label>
                <input type="text" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="這張單的用途"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="flex items-center gap-6 text-sm">
                <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={newForm.requireQuantity} onChange={(e) => setNewForm({ ...newForm, requireQuantity: e.target.checked })} /> 需要「數量」欄位
                </label>
                <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={newForm.requireAmount} onChange={(e) => setNewForm({ ...newForm, requireAmount: e.target.checked })} /> 需要「金額」欄位
                </label>
              </div>
              <p className="text-xs text-slate-400">建立後可在右側設定它的簽核關卡(例如 直屬主管 → 資訊部主管)。</p>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button onClick={createTemplate} className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-sm"><FilePlus className="w-4 h-4" />建立</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
