"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";
import { hrApi } from "@/features/hr/api/hrApi";
import { Employee, LeaveBalance } from "@/features/hr/types/hr";

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    employeeId: "",
    leaveType: "Annual",
    year: currentYear,
    totalDays: 14,
    usedDays: 0,
  });

  const fetchData = useCallback(() => {
    Promise.all([
      hrApi.getLeaveBalances(),
      hrApi.getEmployees(),
    ])
      .then(([balanceData, employeeData]) => {
        setBalances(balanceData.sort((a, b) => b.year - a.year || a.employeeId - b.employeeId));
        setEmployees(employeeData);
      })
      .catch(error => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) {
      alert("請選擇員工");
      return;
    }

    try {
      await hrApi.createLeaveBalance({
        employeeId: Number(form.employeeId),
        leaveType: form.leaveType,
        year: form.year,
        totalDays: form.totalDays,
        usedDays: form.usedDays,
        remainingDays: form.totalDays - form.usedDays,
      });
      setForm({ employeeId: "", leaveType: "Annual", year: currentYear, totalDays: 14, usedDays: 0 });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("新增失敗");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此假別餘額？")) return;
    try {
      await hrApi.deleteLeaveBalance(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("刪除失敗");
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginated = balances.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: "首頁", href: "/" },
        { label: "人力資源系統 (HRM)", href: "/hr" },
        { label: "假別餘額" },
      ]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-blue-600" />
          假別餘額 (Leave Balances)
        </h1>
        <p className="text-sm text-slate-500 mt-1">管理員工各年度假別配額與使用情形</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">員工</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800"
          >
            <option value="">選擇員工</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">假別</label>
          <select
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800"
          >
            <option value="Annual">特休</option>
            <option value="Sick">病假</option>
            <option value="Personal">事假</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">年度</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">配額天數</label>
          <input
            type="number"
            step="0.5"
            value={form.totalDays}
            onChange={(e) => setForm({ ...form, totalDays: Number(e.target.value) })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增
        </button>
      </form>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">載入中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">員工</th>
                  <th className="px-6 py-4">假別</th>
                  <th className="px-6 py-4">年度</th>
                  <th className="px-6 py-4">配額</th>
                  <th className="px-6 py-4">已用</th>
                  <th className="px-6 py-4">剩餘</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">尚無假別餘額資料</td></tr>
                ) : paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium">{item.employee?.name ?? `#${item.employeeId}`}</td>
                    <td className="px-6 py-4">{item.leaveType}</td>
                    <td className="px-6 py-4">{item.year}</td>
                    <td className="px-6 py-4">{item.totalDays}</td>
                    <td className="px-6 py-4">{item.usedDays}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{item.remainingDays}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {balances.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={balances.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}
    </div>
  );
}
