"use client";

import React, { useCallback, useState, useEffect } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { PayrollRecord, PayrollBreakdown } from "@/features/hr/types/hr";
import { Calculator, DollarSign, Plus, Save, FileText, X, TrendingUp, TrendingDown } from "lucide-react";
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

  const [breakdown, setBreakdown] = useState<PayrollBreakdown | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

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

  const openBreakdown = (p: PayrollRecord) => {
    setBreakdownLoading(true);
    setBreakdown({
      employeeId: p.employeeId, employeeName: p.employee?.name ?? `員工 #${p.employeeId}`,
      year: p.year, month: p.month, baseSalary: p.baseSalary, hourlyRate: 0,
      additions: [], deductions: [], totalAdditions: p.bonus, totalDeductions: p.deductions, netSalary: p.netSalary,
    });
    hrApi.getPayrollBreakdown(p.id)
      .then((data) => setBreakdown(data))
      .catch((error) => { console.error(error); alert("載入薪資明細失敗"); setBreakdown(null); })
      .finally(() => setBreakdownLoading(false));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(amount);
  };

  // Pagination calculation
  const totalItems = payrolls.length;
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
                            <div className="inline-flex items-center gap-1">
                              {isEditing ? (
                                <button onClick={() => handleSave(p)} className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors" title="儲存">
                                  <Save className="h-5 w-5" />
                                </button>
                              ) : (
                                <button onClick={() => handleEditClick(p)} className="p-1 text-blue-600 hover:text-blue-700 transition-colors" title="編輯加扣項">
                                  <Plus className="h-5 w-5" />
                                </button>
                              )}
                              <button onClick={() => openBreakdown(p)} className="p-1 text-slate-500 hover:text-violet-600 transition-colors" title="加扣項明細">
                                <FileText className="h-5 w-5" />
                              </button>
                            </div>
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

        {/* Breakdown Modal */}
        {breakdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  薪資加扣項明細 — {breakdown.employeeName}
                  <span className="text-sm font-normal text-slate-500">{breakdown.year}年{breakdown.month}月</span>
                </h2>
                <button onClick={() => setBreakdown(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Base + hourly rate */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-xs text-slate-500">本薪 (月)</p><p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(breakdown.baseSalary)}</p></div>
                  <div><p className="text-xs text-slate-500">時薪 (本薪 ÷ 240h)</p><p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{breakdownLoading ? "…" : formatCurrency(breakdown.hourlyRate)}</p></div>
                  <div><p className="text-xs text-slate-500">實發</p><p className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(breakdown.netSalary)}</p></div>
                </div>

                {/* Additions */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" /> 加項（加班費）
                    <span className="ml-auto font-mono">+{formatCurrency(breakdown.totalAdditions)}</span>
                  </div>
                  {breakdownLoading ? (
                    <p className="text-sm text-slate-400 py-2">載入中…</p>
                  ) : breakdown.additions.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2 pl-6">本月無核准加班。</p>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {breakdown.additions.map((it, i) => (
                          <tr key={i}>
                            <td className="py-2 pl-6 text-slate-500 w-24">{new Date(it.date).toLocaleDateString()}</td>
                            <td className="py-2 text-slate-700 dark:text-slate-300">{it.description}</td>
                            <td className="py-2 text-right text-slate-400 font-mono whitespace-nowrap">{formatCurrency(it.rate)}/h</td>
                            <td className="py-2 pl-3 text-right text-emerald-600 dark:text-emerald-400 font-mono font-medium whitespace-nowrap">+{formatCurrency(it.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Deductions */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    <TrendingDown className="w-4 h-4" /> 扣項（請假）
                    <span className="ml-auto font-mono">-{formatCurrency(breakdown.totalDeductions)}</span>
                  </div>
                  {breakdownLoading ? (
                    <p className="text-sm text-slate-400 py-2">載入中…</p>
                  ) : breakdown.deductions.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2 pl-6">本月無核准請假。</p>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {breakdown.deductions.map((it, i) => (
                          <tr key={i}>
                            <td className="py-2 pl-6 text-slate-500 w-24">{new Date(it.date).toLocaleDateString()}</td>
                            <td className="py-2 text-slate-700 dark:text-slate-300">{it.description}</td>
                            <td className="py-2 text-right text-slate-400 font-mono whitespace-nowrap">{formatCurrency(it.rate)}/h ×{it.multiplier}</td>
                            <td className="py-2 pl-3 text-right font-mono font-medium whitespace-nowrap">
                              {it.amount > 0 ? <span className="text-red-500 dark:text-red-400">-{formatCurrency(it.amount)}</span> : <span className="text-slate-400">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Reconciliation */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>本薪</span><span className="font-mono">{formatCurrency(breakdown.baseSalary)}</span></div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>加項</span><span className="font-mono">+{formatCurrency(breakdown.totalAdditions)}</span></div>
                  <div className="flex justify-between text-red-500 dark:text-red-400"><span>扣項</span><span className="font-mono">-{formatCurrency(breakdown.totalDeductions)}</span></div>
                  <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800 mt-1"><span>實發淨額</span><span className="font-mono">{formatCurrency(breakdown.netSalary)}</span></div>
                </div>

                <p className="text-xs text-slate-400">明細依核准通過的請假 / 加班單即時計算：時薪 = 本薪 ÷ 240 小時；加班採勞基法倍率（前 2 小時 ×1.34、其後 ×1.67），請假依假別計薪（事假無薪、病假半薪、特休/公假全薪）。</p>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
