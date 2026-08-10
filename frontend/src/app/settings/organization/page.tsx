"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderTree, Plus, CheckCircle2, Building, Trash2, Edit2, TrendingUp, MapPin, Save, X } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { hrApi } from "@/features/hr/api/hrApi";
import { JobGrade } from "@/features/hr/types/hr";

export default function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'grades' | 'branches'>('departments');

  // Job grades (real data — salary bands drive the salary-band check on /hr/salaries)
  const [grades, setGrades] = useState<JobGrade[]>([]);
  const [gradeEdit, setGradeEdit] = useState<Partial<JobGrade> | null>(null);
  const loadGrades = useCallback(() => { hrApi.getJobGrades().then(setGrades).catch(console.error); }, []);
  useEffect(() => { loadGrades(); }, [loadGrades]);

  const saveGrade = async () => {
    if (!gradeEdit) return;
    if (!gradeEdit.code?.trim() || !gradeEdit.title?.trim()) return alert("請填寫代碼與名稱");
    if ((gradeEdit.maxSalary ?? 0) < (gradeEdit.minSalary ?? 0)) return alert("上限不可小於下限");
    try {
      const payload = { code: gradeEdit.code, title: gradeEdit.title, minSalary: Number(gradeEdit.minSalary) || 0, maxSalary: Number(gradeEdit.maxSalary) || 0, sortOrder: gradeEdit.sortOrder ?? grades.length + 1, isActive: true };
      if (gradeEdit.id) await hrApi.updateJobGrade(gradeEdit.id, payload);
      else await hrApi.createJobGrade(payload);
      setGradeEdit(null); loadGrades();
    } catch (err) { const e = err as { response?: { data?: { message?: string } } }; alert(e.response?.data?.message ?? "儲存失敗"); }
  };
  const deleteGrade = async (g: JobGrade) => {
    if (!confirm(`刪除職級 ${g.code}?`)) return;
    try { await hrApi.deleteJobGrade(g.id); loadGrades(); }
    catch (err) { const e = err as { response?: { data?: { message?: string } } }; alert(e.response?.data?.message ?? "刪除失敗"); }
  };

  // Mock Data
  const [departments] = useState([
    { id: 1, name: '管理部', manager: '王大明', code: 'MGT', headcount: 3, branch: '台北總公司' },
    { id: 2, name: '業務部', manager: '李明哲', code: 'SAL', headcount: 8, branch: '台北總公司' },
    { id: 3, name: '研發部', manager: '陳工程', code: 'RND', headcount: 15, branch: '新竹研發中心' },
    { id: 4, name: '財務部', manager: '林美玲', code: 'FIN', headcount: 4, branch: '高雄廠區' },
  ]);

  const [branches] = useState([
    { id: 1, name: '台北總公司', code: 'HQ', location: '台北市信義區', manager: '王大明', type: '總部' },
    { id: 2, name: '新竹研發中心', code: 'RD', location: '新竹科學園區', manager: '陳工程', type: '研發' },
    { id: 3, name: '台中營業所', code: 'TC', location: '台中市西屯區', manager: '李明哲', type: '營業所' },
    { id: 4, name: '高雄廠區', code: 'KH', location: '高雄市前鎮區', manager: '林美玲', type: '工廠' },
  ]);


  const handleSave = () => {
    alert("✅ 組織架構與職級設定已儲存！");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '系統設定', href: '/settings/permissions' },
        { label: '組織與職級設定' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building className="h-6 w-6 text-indigo-600" />
            組織架構與職級設定 (Organization)
          </h1>
          <p className="text-sm text-slate-500 mt-1">統一管理公司的部門編制與職稱職級對照表</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          儲存組織設定
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("branches")}
            className={`py-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "branches" 
                ? "text-indigo-600 border-indigo-600" 
                : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <MapPin className="w-4 h-4" /> 營運據點與分公司
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`py-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "departments" 
                ? "text-indigo-600 border-indigo-600" 
                : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FolderTree className="w-4 h-4" /> 內部部門編制
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`py-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "grades" 
                ? "text-indigo-600 border-indigo-600" 
                : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 職級與職稱表 (Grades)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> 新增部門
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500">
                      <th className="p-4 font-medium">所屬據點</th>
                      <th className="p-4 font-medium">部門代碼</th>
                      <th className="p-4 font-medium">部門名稱</th>
                      <th className="p-4 font-medium">部門主管</th>
                      <th className="p-4 font-medium">編制人數</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                            {dept.branch}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">{dept.code}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{dept.name}</td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs text-indigo-700 dark:text-indigo-300 font-bold">
                            {dept.manager[0]}
                          </div>
                          {dept.manager}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{dept.headcount} 人</td>
                        <td className="p-4 text-right">
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors mr-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">每個職級的薪資上下限,會在「員工薪資」頁把關 —— 員工本薪不可超出所屬職級的薪資帶。</p>
                <button onClick={() => setGradeEdit({ code: '', title: '', minSalary: 0, maxSalary: 0 })} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors shrink-0">
                  <Plus className="w-4 h-4" /> 新增職級
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500">
                      <th className="p-4 font-medium">職級代碼</th>
                      <th className="p-4 font-medium">對應職稱</th>
                      <th className="p-4 font-medium text-right">薪資下限</th>
                      <th className="p-4 font-medium text-right">薪資上限</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {grades.map((g) => {
                      const editing = gradeEdit?.id === g.id;
                      return (
                        <tr key={g.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            {editing ? <input value={gradeEdit!.code ?? ''} onChange={(e) => setGradeEdit({ ...gradeEdit!, code: e.target.value })} className="w-16 px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200 font-mono text-sm" />
                              : <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{g.code}</span>}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {editing ? <input value={gradeEdit!.title ?? ''} onChange={(e) => setGradeEdit({ ...gradeEdit!, title: e.target.value })} className="w-48 px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200 text-sm" /> : g.title}
                          </td>
                          <td className="p-4 text-right font-mono text-sm">
                            {editing ? <input type="number" value={gradeEdit!.minSalary ?? 0} onChange={(e) => setGradeEdit({ ...gradeEdit!, minSalary: Number(e.target.value) })} className="w-28 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200" /> : <span className="text-slate-600 dark:text-slate-300">{g.minSalary.toLocaleString()}</span>}
                          </td>
                          <td className="p-4 text-right font-mono text-sm">
                            {editing ? <input type="number" value={gradeEdit!.maxSalary ?? 0} onChange={(e) => setGradeEdit({ ...gradeEdit!, maxSalary: Number(e.target.value) })} className="w-28 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200" /> : <span className="text-slate-600 dark:text-slate-300">{g.maxSalary.toLocaleString()}</span>}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            {editing ? (
                              <>
                                <button onClick={saveGrade} className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded mr-1"><Save className="w-4 h-4" /></button>
                                <button onClick={() => setGradeEdit(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setGradeEdit(g)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors mr-1"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteGrade(g)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {gradeEdit && !gradeEdit.id && (
                      <tr className="bg-indigo-50/40 dark:bg-indigo-900/10">
                        <td className="p-4"><input value={gradeEdit.code ?? ''} onChange={(e) => setGradeEdit({ ...gradeEdit, code: e.target.value })} placeholder="L4" className="w-16 px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200 font-mono text-sm" /></td>
                        <td className="p-4"><input value={gradeEdit.title ?? ''} onChange={(e) => setGradeEdit({ ...gradeEdit, title: e.target.value })} placeholder="職稱" className="w-48 px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200 text-sm" /></td>
                        <td className="p-4 text-right"><input type="number" value={gradeEdit.minSalary ?? 0} onChange={(e) => setGradeEdit({ ...gradeEdit, minSalary: Number(e.target.value) })} className="w-28 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200" /></td>
                        <td className="p-4 text-right"><input type="number" value={gradeEdit.maxSalary ?? 0} onChange={(e) => setGradeEdit({ ...gradeEdit, maxSalary: Number(e.target.value) })} className="w-28 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-slate-950 dark:text-slate-200" /></td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button onClick={saveGrade} className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded mr-1"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setGradeEdit(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><X className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> 新增營運據點
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500">
                      <th className="p-4 font-medium">據點代碼</th>
                      <th className="p-4 font-medium">據點名稱 (分公司/廠區)</th>
                      <th className="p-4 font-medium">據點類型</th>
                      <th className="p-4 font-medium">實際位置</th>
                      <th className="p-4 font-medium">據點負責人</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {branches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{branch.code}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {branch.name}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium">
                            {branch.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{branch.location}</td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">{branch.manager}</td>
                        <td className="p-4 text-right">
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors mr-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
