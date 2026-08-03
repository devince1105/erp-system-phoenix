"use client";

import React, { useCallback, useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { ApprovalReport } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { BarChart3, ShieldAlert, Clock, AlertTriangle, CheckCircle2, XCircle, Hourglass } from "lucide-react";

const PRIVILEGED = ["Admin", "HR", "Manager"];

const fmtHours = (h: number | null): string => {
  if (h === null) return "—";
  if (h < 1) return `${Math.round(h * 60)} 分`;
  if (h < 48) return `${h.toFixed(1)} 時`;
  return `${(h / 24).toFixed(1)} 天`;
};

export default function ApprovalReportPage() {
  const { user } = useAuth();
  const canView = !!user?.roles?.some((r) => PRIVILEGED.includes(r));

  const [report, setReport] = useState<ApprovalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    hrApi.getApprovalReport()
      .then((data) => setReport(data))
      .catch((err) => console.error("Failed to load approval report", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (canView) fetchData();
  }, [canView, fetchData]);

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "簽核報表" }]} />
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-sm p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">此報表為管理資料</h2>
          <p className="text-sm text-slate-500 mt-2">簽核報表僅限系統管理員、人資與主管檢視。</p>
        </div>
      </div>
    );
  }

  const s = report?.summary;
  const maxStagePending = Math.max(1, ...(report?.byStage.map((x) => x.pendingNow) ?? [1]));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "人力資源系統 (HRM)", href: "/hr" }, { label: "簽核報表" }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          簽核報表 (Approval Analytics)
        </h1>
        <p className="text-sm text-slate-500 mt-1">簽核吞吐、各關卡耗時與目前卡關瓶頸，資料即時取自簽核實例。</p>
      </div>

      {isLoading || !report ? (
        <div className="py-16 text-center text-slate-500">載入報表中...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
              <p className="text-xs text-slate-500">總單據</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{s!.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
              <p className="text-xs text-slate-500 flex items-center gap-1"><Hourglass className="w-3 h-3 text-amber-500" />簽核中</p>
              <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{s!.pending}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
              <p className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />已核准</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{s!.approved}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
              <p className="text-xs text-slate-500 flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" />已駁回</p>
              <p className="text-2xl font-bold text-red-500 mt-1 tabular-nums">{s!.rejected}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
              <p className="text-xs text-slate-500">通過率</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1 tabular-nums">{s!.approvalRate}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">平均週期 {fmtHours(s!.avgCycleHours)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By form type */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">依表單類型</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-2 font-medium">表單</th>
                      <th className="px-3 py-2 font-medium text-right">總數</th>
                      <th className="px-3 py-2 font-medium text-right">簽核中</th>
                      <th className="px-3 py-2 font-medium text-right">通過率</th>
                      <th className="px-5 py-2 font-medium text-right">平均週期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.byFormType.map((f) => (
                      <tr key={f.formType} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{f.label}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">{f.total}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{f.pending > 0 ? <span className="text-amber-600 font-medium">{f.pending}</span> : <span className="text-slate-400">0</span>}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">{f.approved + f.rejected === 0 ? "—" : `${f.approvalRate}%`}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-slate-500">{fmtHours(f.avgCycleHours)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By stage (bottleneck) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">各關卡分析</h2>
                <p className="text-xs text-slate-400 mt-0.5">目前積壓（簽核中）與歷史平均簽核耗時</p>
              </div>
              <div className="p-4 space-y-3">
                {report.byStage.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">尚無關卡資料。</p>
                ) : report.byStage.map((st) => (
                  <div key={st.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{st.label}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtHours(st.avgDecideHours)}</span>
                        <span className="tabular-nums">積壓 <b className={st.pendingNow > 0 ? "text-amber-600" : "text-slate-400"}>{st.pendingNow}</b></span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 dark:bg-amber-500" style={{ width: `${(st.pendingNow / maxStagePending) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottleneck list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">目前卡最久（待簽核 TOP）</h2>
            </div>
            {report.stuck.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">目前沒有待簽核的單據，暢通無阻。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-2 font-medium">表單</th>
                      <th className="px-3 py-2 font-medium">單號</th>
                      <th className="px-3 py-2 font-medium">目前卡在</th>
                      <th className="px-3 py-2 font-medium">進度</th>
                      <th className="px-5 py-2 font-medium text-right">已等待</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.stuck.map((it) => (
                      <tr key={it.instanceId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{it.formLabel}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-500">#{it.documentId}</td>
                        <td className="px-3 py-2.5"><span className="inline-flex px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">{it.currentLabel}</span></td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-500">{it.stepOrder} / {it.totalSteps}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">{fmtHours(it.ageHours)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
