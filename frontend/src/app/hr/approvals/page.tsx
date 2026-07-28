"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, XCircle, CheckCircle, Clock } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { hrApi } from "@/features/hr/api/hrApi";
import { ExpenseClaim, LeaveRequest, OvertimeRequest } from "@/features/hr/types/hr";

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"leaves" | "overtimes" | "expenses">("leaves");
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lvData, ovData, expData] = await Promise.all([
        hrApi.getLeaves(),
        hrApi.getOvertimes(),
        hrApi.getExpenseClaims(),
      ]);
      setLeaves(lvData.filter(l => l.status === "Pending"));
      setOvertimes(ovData.filter(o => o.status === "Pending"));
      setExpenses(expData.filter(e => e.status === "Pending"));
    } catch (error) {
      console.error("Failed to fetch approvals data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveLeave = async (id: number, request: LeaveRequest) => {
    try {
      await hrApi.updateLeave(id, { ...request, status: "Approved" });
      fetchData();
    } catch (error) {
      alert("核准失敗");
    }
  };

  const handleRejectLeave = async (id: number, request: LeaveRequest) => {
    try {
      await hrApi.updateLeave(id, { ...request, status: "Rejected" });
      fetchData();
    } catch (error) {
      alert("退回失敗");
    }
  };

  const handleApproveOvertime = async (id: number, request: OvertimeRequest) => {
    try {
      await hrApi.updateOvertime(id, { ...request, status: "Approved" });
      fetchData();
    } catch (error) {
      alert("核准失敗");
    }
  };

  const handleRejectOvertime = async (id: number, request: OvertimeRequest) => {
    try {
      await hrApi.updateOvertime(id, { ...request, status: "Rejected" });
      fetchData();
    } catch (error) {
      alert("退回失敗");
    }
  };

  const handleApproveExpense = async (id: number) => {
    try {
      await hrApi.updateExpenseClaimStatus(id, "Approved");
      fetchData();
    } catch (error) {
      alert("核准失敗");
    }
  };

  const handleRejectExpense = async (id: number) => {
    try {
      await hrApi.updateExpenseClaimStatus(id, "Rejected");
      fetchData();
    } catch (error) {
      alert("退回失敗");
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '簽核中心' }
      ]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-blue-600" />
          簽核中心 (Approval Center)
        </h1>
        <p className="text-sm text-slate-500 mt-1">統一處理員工請假、加班與費用報銷申請</p>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("leaves")}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
            activeTab === "leaves" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          待批假單 ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab("overtimes")}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
            activeTab === "overtimes" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          待批加班單 ({overtimes.length})
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
            activeTab === "expenses"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          待批報銷 ({expenses.length})
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">載入中...</div>
        ) : activeTab === "expenses" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">員工姓名</th>
                  <th className="px-6 py-4">類別</th>
                  <th className="px-6 py-4">說明</th>
                  <th className="px-6 py-4">金額</th>
                  <th className="px-6 py-4">申請日期</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {expenses.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">目前沒有待簽核的報銷單</td></tr>
                ) : expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{exp.employee?.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{exp.category}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={exp.description}>{exp.description}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(exp.claimDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleApproveExpense(exp.id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm text-xs font-medium inline-flex items-center gap-1 transition-colors">
                        <CheckCircle className="h-3 w-3" /> 核准
                      </button>
                      <button onClick={() => handleRejectExpense(exp.id)} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-sm text-xs font-medium inline-flex items-center gap-1 transition-colors">
                        <XCircle className="h-3 w-3" /> 駁回
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "leaves" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">員工姓名</th>
                  <th className="px-6 py-4">假別</th>
                  <th className="px-6 py-4">起訖日期</th>
                  <th className="px-6 py-4">事由</th>
                  <th className="px-6 py-4">申請時間</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {leaves.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">目前沒有待簽核的假單</td></tr>
                ) : leaves.map(lv => (
                  <tr key={lv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{lv.employee?.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{lv.leaveType}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(lv.startDate).toLocaleDateString()} ~ {new Date(lv.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={lv.reason}>{lv.reason}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(lv.createdAt || "").toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleApproveLeave(lv.id, lv)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm text-xs font-medium inline-flex items-center gap-1 transition-colors">
                        <CheckCircle className="h-3 w-3" /> 核准
                      </button>
                      <button onClick={() => handleRejectLeave(lv.id, lv)} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-sm text-xs font-medium inline-flex items-center gap-1 transition-colors">
                        <XCircle className="h-3 w-3" /> 駁回
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
                  <th className="px-6 py-4">申請時間</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {overtimes.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">目前沒有待簽核的加班單</td></tr>
                ) : overtimes.map(ov => (
                  <tr key={ov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{ov.employee?.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(ov.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold">{ov.hours} h</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={ov.reason}>{ov.reason}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(ov.createdAt || "").toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleApproveOvertime(ov.id, ov)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm text-xs font-medium inline-flex items-center gap-1 transition-colors">
                        <CheckCircle className="h-3 w-3" /> 核准
                      </button>
                      <button onClick={() => handleRejectOvertime(ov.id, ov)} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-sm text-xs font-medium inline-flex items-center gap-1 transition-colors">
                        <XCircle className="h-3 w-3" /> 駁回
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
