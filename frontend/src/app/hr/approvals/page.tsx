"use client";

import React, { useCallback, useState, useEffect } from "react";
import { CalendarCheck, CalendarDays, Clock3, Eye, Check, Undo2, X } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { ApprovalFlow } from "@/features/hr/components/ApprovalFlow";
import { hrApi } from "@/features/hr/api/hrApi";
import { LeaveRequest, OvertimeRequest, ApprovalInstance } from "@/features/hr/types/hr";

const LEAVE_TYPES: Record<string, string> = { Annual: "特休", Sick: "病假", Personal: "事假", Official: "公假" };
const leaveLabel = (k: string) => LEAVE_TYPES[k] ?? k;

type PendingLeave = { req: LeaveRequest; approval: ApprovalInstance };
type PendingOvertime = { req: OvertimeRequest; approval: ApprovalInstance };

export default function LeaveOvertimeApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"leaves" | "overtimes">("leaves");
  const [leaves, setLeaves] = useState<PendingLeave[]>([]);
  const [overtimes, setOvertimes] = useState<PendingOvertime[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailType, setDetailType] = useState<"leave" | "overtime" | null>(null);
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const [detailOvertime, setDetailOvertime] = useState<OvertimeRequest | null>(null);
  const [detailApproval, setDetailApproval] = useState<ApprovalInstance | null>(null);
  const [decideComment, setDecideComment] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    Promise.all([hrApi.getLeaves(), hrApi.getOvertimes(), hrApi.getMyApprovals()])
      .then(async ([lvData, ovData, mine]) => {
        // Only keep documents whose current step this user is authorized to decide.
        const mineKeys = new Set(mine.map((i) => `${i.formType}:${i.documentId}`));
        const lvPending = lvData.filter((l) => l.status === "Pending" && mineKeys.has(`Leave:${l.id}`));
        const ovPending = ovData.filter((o) => o.status === "Pending" && mineKeys.has(`Overtime:${o.id}`));
        const [lvInst, ovInst] = await Promise.all([
          Promise.all(lvPending.map((l) => hrApi.getApproval("Leave", l.id).then((a) => ({ req: l, approval: a })))),
          Promise.all(ovPending.map((o) => hrApi.getApproval("Overtime", o.id).then((a) => ({ req: o, approval: a })))),
        ]);
        setLeaves(lvInst.filter((x): x is PendingLeave => x.approval?.status === "Pending"));
        setOvertimes(ovInst.filter((x): x is PendingOvertime => x.approval?.status === "Pending"));
      })
      .catch((error) => console.error("Failed to fetch approvals data", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const days = (l: LeaveRequest) =>
    Math.max(1, Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1);

  const openLeaveDetail = (p: PendingLeave) => {
    setDetailType("leave");
    setDetailLeave(p.req);
    setDetailOvertime(null);
    setDetailApproval(p.approval);
    setDecideComment("");
  };

  const openOvertimeDetail = (p: PendingOvertime) => {
    setDetailType("overtime");
    setDetailOvertime(p.req);
    setDetailLeave(null);
    setDetailApproval(p.approval);
    setDecideComment("");
  };

  const closeDetail = () => {
    setDetailType(null);
    setDetailLeave(null);
    setDetailOvertime(null);
    setDetailApproval(null);
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
      console.error(err);
      alert(e.response?.status === 403 ? (e.response.data?.message ?? "您無權簽核此關卡。") : "簽核失敗");
      if (e.response?.status === 403) { closeDetail(); fetchData(); }
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '假勤簽核' }
      ]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-blue-600" />
          假勤簽核 (Leave &amp; Overtime)
        </h1>
        <p className="text-sm text-slate-500 mt-1">審核目前輪到您的請假與加班申請。點「檢視」查看明細與簽核流程後,再於明細內核准或駁回（費用相關請至差旅報支 / 費用報銷）。</p>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => { setActiveTab("leaves"); setCurrentPage(1); }}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
            activeTab === "leaves"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          待批假單 ({leaves.length})
        </button>
        <button
          onClick={() => { setActiveTab("overtimes"); setCurrentPage(1); }}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
            activeTab === "overtimes"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          待批加班單 ({overtimes.length})
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">載入中...</div>
        ) : activeTab === "leaves" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">員工姓名</th>
                  <th className="px-6 py-4">假別</th>
                  <th className="px-6 py-4">起訖日期</th>
                  <th className="px-6 py-4">事由</th>
                  <th className="px-6 py-4">簽核進度</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {leaves.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">目前沒有待您簽核的假單</td></tr>
                ) : leaves.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(({ req: lv, approval }) => (
                  <tr key={lv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{lv.employee?.name ?? `員工 #${lv.employeeId}`}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{leaveLabel(lv.leaveType)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(lv.startDate).toLocaleDateString()} ~ {new Date(lv.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={lv.reason}>{lv.reason}</td>
                    <td className="px-6 py-4"><ApprovalFlow instance={approval} compact /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openLeaveDetail({ req: lv, approval })} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Eye className="w-3.5 h-3.5" /> 檢視
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">員工姓名</th>
                  <th className="px-6 py-4">加班日期</th>
                  <th className="px-6 py-4">時數</th>
                  <th className="px-6 py-4">事由</th>
                  <th className="px-6 py-4">簽核進度</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {overtimes.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">目前沒有待您簽核的加班單</td></tr>
                ) : overtimes.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(({ req: ov, approval }) => (
                  <tr key={ov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{ov.employee?.name ?? `員工 #${ov.employeeId}`}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(ov.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold">{ov.hours} h</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={ov.reason}>{ov.reason}</td>
                    <td className="px-6 py-4"><ApprovalFlow instance={approval} compact /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openOvertimeDetail({ req: ov, approval })} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Eye className="w-3.5 h-3.5" /> 檢視
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (activeTab === "leaves" ? leaves.length : overtimes.length) > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={activeTab === "leaves" ? leaves.length : overtimes.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Detail / Approval Modal */}
      {detailType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {detailType === "leave"
                  ? <><CalendarDays className="w-5 h-5 text-violet-600" /> 請假申請明細</>
                  : <><Clock3 className="w-5 h-5 text-orange-600" /> 加班申請明細</>}
              </h2>
              <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              {detailType === "leave" && detailLeave && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{detailLeave.employee?.name ?? `員工 #${detailLeave.employeeId}`}</p></div>
                  <div><p className="text-xs text-slate-500">假別</p><p className="font-medium text-slate-800 dark:text-slate-200">{leaveLabel(detailLeave.leaveType)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-slate-500">起訖日期</p><p className="text-slate-700 dark:text-slate-300">{new Date(detailLeave.startDate).toLocaleDateString()} ~ {new Date(detailLeave.endDate).toLocaleDateString()}（{days(detailLeave)} 天）</p></div>
                  <div className="col-span-2"><p className="text-xs text-slate-500">事由</p><p className="text-slate-700 dark:text-slate-300">{detailLeave.reason || "-"}</p></div>
                </div>
              )}
              {detailType === "overtime" && detailOvertime && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-500">申請人</p><p className="font-medium text-slate-800 dark:text-slate-200">{detailOvertime.employee?.name ?? `員工 #${detailOvertime.employeeId}`}</p></div>
                  <div><p className="text-xs text-slate-500">加班日期</p><p className="font-medium text-slate-800 dark:text-slate-200">{new Date(detailOvertime.date).toLocaleDateString()}</p></div>
                  <div><p className="text-xs text-slate-500">時數</p><p className="text-slate-700 dark:text-slate-300">{detailOvertime.hours} 小時</p></div>
                  <div className="col-span-2"><p className="text-xs text-slate-500">事由</p><p className="text-slate-700 dark:text-slate-300">{detailOvertime.reason || "-"}</p></div>
                </div>
              )}
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
