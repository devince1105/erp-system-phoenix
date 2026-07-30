"use client";

import React, { useState } from "react";
import { FolderTree, Plus, CheckCircle2, Building, Trash2, Edit2, TrendingUp, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

export default function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'grades' | 'branches'>('departments');

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

  const [grades] = useState([
    { id: 1, grade: 'L1', title: '助理 / 專員', salaryRange: '30k - 40k', roleType: 'SpecificUser' },
    { id: 2, grade: 'L2', title: '工程師 / 管理師', salaryRange: '40k - 60k', roleType: 'SpecificUser' },
    { id: 3, grade: 'L3', title: '高級工程師 / 高級管理師', salaryRange: '60k - 80k', roleType: 'SpecificUser' },
    { id: 4, grade: 'M1', title: '課長 / 副理 (直屬主管)', salaryRange: '70k - 90k', roleType: 'DirectSupervisor' },
    { id: 5, grade: 'M2', title: '經理 / 部門主管', salaryRange: '90k - 130k', roleType: 'DepartmentManager' },
    { id: 6, grade: 'D1', title: '處長 / 總監', salaryRange: '130k - 200k', roleType: 'Director' },
    { id: 7, grade: 'C1', title: '總經理 / 執行長', salaryRange: '250k+', roleType: 'CEO' },
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
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> 新增職級
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500">
                      <th className="p-4 font-medium">職級代碼 (Grade)</th>
                      <th className="p-4 font-medium">對應職稱 (Title)</th>
                      <th className="p-4 font-medium">簽核角色對映 (Role Mapping)</th>
                      <th className="p-4 font-medium">建議薪資區間</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                            {grade.grade}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{grade.title}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                            {grade.roleType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-sm">{grade.salaryRange}</td>
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
