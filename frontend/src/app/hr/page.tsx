"use client";

import React, { useEffect, useState } from "react";
import { Users, FolderTree, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { hrApi } from "@/features/hr/api/hrApi";

export default function HRDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employees, departments] = await Promise.all([
          hrApi.getEmployees(),
          hrApi.getDepartments()
        ]);
        
        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.status === 1).length,
          departments: departments.length
        });
      } catch (err) {
        console.error("Failed to load HR stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">人力資源總覽 (HR Dashboard)</h1>
        <p className="text-sm text-slate-500 mt-1">管理與檢視企業內部組織及人員狀態</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Cards */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <span className="text-sm font-medium">總員工人數 (Total Employees)</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalEmployees}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <span className="text-sm font-medium">在職員工 (Active)</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.activeEmployees}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-sm shadow-sm flex flex-col hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <FolderTree className="h-5 w-5 text-purple-600 dark:text-purple-500" />
              <span className="text-sm font-medium">部門數量 (Departments)</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.departments}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm p-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">快速操作</h2>
          <div className="space-y-3">
            <Link href="/hr/employees" className="flex items-center justify-between p-3 rounded-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">員工名冊</h3>
                  <p className="text-xs text-slate-500">檢視與管理所有員工資料</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </Link>

            <Link href="/hr/departments" className="flex items-center justify-between p-3 rounded-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md text-purple-600 dark:text-purple-400">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">組織架構</h3>
                  <p className="text-xs text-slate-500">管理各部門與主管設定</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
