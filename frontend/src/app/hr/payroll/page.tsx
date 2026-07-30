"use client";

import React, { useCallback, useState, useEffect } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { Employee, PayrollRecord } from "@/features/hr/types/hr";
import { Calculator, CheckCircle2, DollarSign, Download, Plus, Save } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { Pagination } from "@/features/core/components/Pagination";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ bonus: 0, deductions: 0, status: "Draft" });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPayrolls = useCallback(() => {
    hrApi.getPayrolls()
      .then(allPayrolls => {
        // Filter by selected year/month in frontend for simplicity (ideally backend should filter)
        const filtered = allPayrolls.filter(p => p.year === selectedYear && p.month === selectedMonth);
        setPayrolls(filtered);
        setCurrentPage(1); // Reset to first page on data load
      })
      .catch(error => console.error(error))
      .finally(() => setIsLoading(false));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleGenerate = async () => {
    if (!confirm(`確定要產生 ${selectedYear}年${selectedMonth}月 的全體薪資單嗎？`)) return;
    try {
      setIsLoading(true);
      await hrApi.generatePayrolls(selectedYear, selectedMonth);
      await fetchPayrolls();
    } catch (error) {
      console.error(error);
      alert("產生失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (p: PayrollRecord) => {
    setEditingId(p.id);
    setEditForm({ bonus: p.bonus, deductions: p.deductions, status: p.status });
  };

  const handleSave = async (p: PayrollRecord) => {
    try {
      await hrApi.updatePayroll(p.id, {
        ...p,
        bonus: editForm.bonus,
        deductions: editForm.deductions,
        status: editForm.status
      });
      setEditingId(null);
      fetchPayrolls();
    } catch (error) {
      console.error(error);
      alert("儲存失敗");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(amount);
  };

  // Pagination calculation
  const totalItems = payrolls.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPayrolls = payrolls.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '薪資結算' }
      ]} />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-500" />
              薪資結算 (Payroll)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">核算員工每月薪資、獎金與扣款</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </select>
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m} 月</option>
              ))}
            </select>
            
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition shadow-sm"
            >
              <Calculator className="h-4 w-4" />
              自動結算本月薪資
            </button>
          </div>
        </div>

        {/* Payroll List */}
        <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">載入中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-medium w-1/5">員工姓名</th>
                    <th className="p-4 font-medium text-right">本薪 (Base)</th>
                    <th className="p-4 font-medium text-right">加項 (Bonus)</th>
                    <th className="p-4 font-medium text-right">扣項 (Deductions)</th>
                    <th className="p-4 font-medium text-right">實發 (Net Salary)</th>
                    <th className="p-4 font-medium text-center">狀態</th>
                    <th className="p-4 font-medium text-center w-24">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payrolls.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        這個月尚未產生任何薪資單。<br />
                        請點擊右上方的「自動結算本月薪資」。
                      </td>
                    </tr>
                  ) : (
                    paginatedPayrolls.map((p) => {
                      const isEditing = editingId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{p.employee?.name}</div>
                            <div className="text-xs text-slate-500">{p.employee?.department?.name || '無部門'} | {p.employee?.jobTitle}</div>
                          </td>
                          <td className="p-4 text-right text-slate-600 dark:text-slate-300 font-mono">
                            {formatCurrency(p.baseSalary)}
                          </td>
                          <td className="p-4 text-right">
                            {isEditing ? (
                              <input 
                                type="number" 
                                className="w-24 px-2 py-1 text-right border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={editForm.bonus}
                                onChange={e => setEditForm({...editForm, bonus: Number(e.target.value)})}
                              />
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono">+{formatCurrency(p.bonus)}</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isEditing ? (
                              <input 
                                type="number" 
                                className="w-24 px-2 py-1 text-right border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                value={editForm.deductions}
                                onChange={e => setEditForm({...editForm, deductions: Number(e.target.value)})}
                              />
                            ) : (
                              <span className="text-red-500 dark:text-red-400 font-mono">-{formatCurrency(p.deductions)}</span>
                            )}
                          </td>
                          <td className="p-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                            {isEditing 
                              ? formatCurrency(p.baseSalary + editForm.bonus - editForm.deductions)
                              : formatCurrency(p.netSalary)
                            }
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <select 
                                className="px-2 py-1 border border-slate-300 rounded text-sm"
                                value={editForm.status}
                                onChange={e => setEditForm({...editForm, status: e.target.value})}
                              >
                                <option value="Draft">草稿</option>
                                <option value="Processed">已覆核</option>
                                <option value="Paid">已發放</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                p.status === 'Processed' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {p.status === 'Paid' ? '已發放' : p.status === 'Processed' ? '已覆核' : '草稿'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <button onClick={() => handleSave(p)} className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors" title="儲存">
                                <Save className="h-5 w-5" />
                              </button>
                            ) : (
                              <button onClick={() => handleEditClick(p)} className="p-1 text-blue-600 hover:text-blue-700 transition-colors" title="編輯加扣項">
                                <Plus className="h-5 w-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {payrolls.length > 0 && !isLoading && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>

    </div>
  );
}
