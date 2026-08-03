"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { GenericApprovalRequest, ApprovalFormTemplate, Employee, ApprovalInstance } from "@/features/hr/types/hr";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { Sparkles, Plus, X, Trash2, Eye, Check, Undo2, Upload, FileText } from "lucide-react";

const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url);

export default function RequestsPage() {
  const [requests, setRequests] = useState<GenericApprovalRequest[]>([]);
  const [templates, setTemplates] = useState<ApprovalFormTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvals, setApprovals] = useState<Record<number, ApprovalInstance | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ templateId: "" as number | "", employeeId: "" as number | "", title: "", quantity: 1, amount: 0, reason: "", attachmentUrl: "" });

  const [detail, setDetail] = useState<GenericApprovalRequest | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);

  const template = templates.find((t) => t.id === Number(form.templateId));

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getGenericRequests(), hrApi.getActiveApprovalTemplates(), hrApi.getEmployees()])
      .then(async ([reqs, tpls, emps]) => {
        setRequests(reqs);
        setTemplates(tpls);
        setEmployees(emps);
        const entries = await Promise.all(reqs.map((r) => hrApi.getApproval(`Tpl${r.templateId}`, r.id).then((inst) => [r.id, inst] as const)));
        setApprovals(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load requests", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const employeeName = (id: number) => employees.find((e) => e.id === id)?.name || `員工 #${id}`;

  const openCreate = () => {
    setForm({ templateId: templates[0]?.id ?? "", employeeId: employees[0]?.id ?? "", title: "", quantity: 1, amount: 0, reason: "", attachmentUrl: "" });
    setIsModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try { const url = await hrApi.uploadReceipt(file); setForm((f) => ({ ...f, attachmentUrl: url })); }
    catch (err) { console.error(err); alert("附件上傳失敗"); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.templateId) return alert("請選擇申請表單");
    if (!form.employeeId) return alert("請選擇申請人");
    if (!form.title.trim()) return alert("請填寫主旨");
    setIsSubmitting(true);
    try {
      await hrApi.createGenericRequest({
        templateId: Number(form.templateId),
        employeeId: Number(form.employeeId),
        title: form.title,
        quantity: template?.requireQuantity ? Number(form.quantity) : undefined,
        amount: template?.requireAmount ? Number(form.amount) : undefined,
        reason: form.reason,
        attachmentUrl: form.attachmentUrl || undefined,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err); alert("送出失敗");
    } finally { setIsSubmitting(false); }
  };

  const openDetail = async (r: GenericApprovalRequest) => {
    setDetail(r);
    setDecideComment("");
    setDetailApproval(approvals[r.id] ?? (await hrApi.getApproval(`Tpl${r.templateId}`, r.id)));
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
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      alert(e.response?.status === 403 ? (e.response.data?.message ?? "您不是此關卡的簽核人。") : "簽核失敗");
    } finally { setIsDeciding(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定刪除這筆申請?")) return;
    try { await hrApi.deleteGenericRequest(id); fetchData(); } catch (err) { console.error(err); alert("刪除失敗"); }
  };

  const templateName = (id: number) => templates.find((t) => t.id === id)?.name ?? `表單 #${id}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "萬用申請" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-600" />
            萬用申請 (Requests)
          </h1>
          <p className="text-sm text-slate-500 mt-1">選擇一種申請表單填寫送出,依該表單設定的流程逐級簽核。表單種類由管理員於「系統設定 → 簽核流程」自訂。</p>
        </div>
        <button onClick={openCreate} disabled={templates.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-sm shadow-sm">
          <Plus className="w-4 h-4" /> 新增申請
        </button>
      </div>

      {templates.length === 0 && !isLoading && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-sm p-4 text-sm text-amber-700 dark:text-amber-400">
          目前沒有可用的申請表單。請管理員先到「系統設定 → 簽核流程 → 新增自訂表單」建立。
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">載入中...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-500">尚無申請。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">申請人</th>
                  <th className="px-6 py-3">表單</th>
                  <th className="px-6 py-3">主旨</th>
                  <th className="px-6 py-3">簽核進度</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{employeeName(r.employeeId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400"><Sparkles className="w-3 h-3" />{r.template?.name ?? templateName(r.templateId)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">{r.title}{r.quantity ? ` ×${r.quantity}` : ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><ApprovalFlow instance={approvals[r.id] ?? null} compact /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openDetail(r)} title="檢視 / 簽核" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded hover:bg-violet-50 dark:hover:bg-violet-900/20"><Eye className="w-3.5 h-3.5" />檢視</button>
                        <button onClick={() => handleDelete(r.id)} title="刪除" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新增申請</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">申請表單 <span className="text-red-500">*</span></label>
                  <select value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">申請人 <span className="text-red-500">*</span></label>
                  <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200">
                    <option value="">請選擇...</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}（{emp.department?.name ?? "-"}）</option>)}
                  </select>
                </div>
              </div>
              {template?.description && <p className="text-xs text-slate-500">{template.description}</p>}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">主旨 / 品名 <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                  placeholder="例如:滑鼠、無線鍵盤"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              {(template?.requireQuantity || template?.requireAmount) && (
                <div className="grid grid-cols-2 gap-4">
                  {template?.requireQuantity && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">數量</label>
                      <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
                    </div>
                  )}
                  {template?.requireAmount && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">金額</label>
                      <input type="number" min="0" step="100" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200 font-mono" />
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">事由 / 說明</label>
                <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="例如:原滑鼠故障需更換"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-sm text-sm dark:text-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">附件 (選填)</label>
                <div className="flex items-center gap-3">
                  <label className={`inline-flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-sm cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 ${isUploading ? "opacity-60 pointer-events-none" : ""}`}>
                    <Upload className="w-4 h-4" />{isUploading ? "上傳中..." : form.attachmentUrl ? "重新選擇" : "上傳圖片 / 檔案"}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
                  </label>
                  {form.attachmentUrl && (
                    <a href={form.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400">
                      {isImageUrl(form.attachmentUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.attachmentUrl} alt="附件" className="h-10 w-10 object-cover rounded border border-slate-200 dark:border-slate-700" />
                      ) : <FileText className="w-5 h-5" />}
                      已上傳
                    </a>
                  )}
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">取消</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white text-sm font-medium rounded-sm">
                  <Sparkles className="w-4 h-4" /> {isSubmitting ? "送出中..." : "送出申請"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-600" />{detail.template?.name ?? templateName(detail.templateId)}</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{employeeName(detail.employeeId)}</p></div>
                <div><p className="text-xs text-slate-500">主旨</p><p className="font-medium text-slate-800 dark:text-slate-200">{detail.title}</p></div>
                {detail.quantity != null && <div><p className="text-xs text-slate-500">數量</p><p className="text-slate-700 dark:text-slate-300">{detail.quantity}</p></div>}
                {detail.amount != null && <div><p className="text-xs text-slate-500">金額</p><p className="text-slate-700 dark:text-slate-300 font-mono">${detail.amount.toLocaleString()}</p></div>}
                <div className="col-span-2"><p className="text-xs text-slate-500">事由</p><p className="text-slate-700 dark:text-slate-300">{detail.reason || "-"}</p></div>
                {detail.attachmentUrl && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">附件</p>
                    <a href={detail.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      {isImageUrl(detail.attachmentUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={detail.attachmentUrl} alt="附件" className="h-16 w-16 object-cover rounded border border-slate-200 dark:border-slate-700" />
                      ) : <FileText className="w-6 h-6" />}
                      點擊檢視
                    </a>
                  </div>
                )}
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
                    <button onClick={() => handleDecide(false)} disabled={isDeciding} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"><Undo2 className="w-4 h-4" />駁回</button>
                    <button onClick={() => handleDecide(true)} disabled={isDeciding} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm font-medium rounded-sm"><Check className="w-4 h-4" />{isDeciding ? "處理中..." : "核准此關卡"}</button>
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
