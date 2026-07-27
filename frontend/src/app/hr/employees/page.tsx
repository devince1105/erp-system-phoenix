"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Pencil, Trash2, Search, Mail, Phone, Briefcase, Building2, MoreHorizontal, UserCheck, Filter, Download, Printer } from "lucide-react";
import dynamic from "next/dynamic";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { hrApi } from "@/features/hr/api/hrApi";
import { Employee, Department } from "@/features/hr/types/hr";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { ReportPrintView } from "@/features/accounting/components/ReportPrintView";

const EmployeeModal = dynamic(() => import("@/features/hr/components/EmployeeModal").then(mod => mod.EmployeeModal), { ssr: false });

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDepartmentId, setActiveDepartmentId] = useState<number | "all">("all");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empData, deptData] = await Promise.all([
        hrApi.getEmployees(),
        hrApi.getDepartments()
      ]);
      setEmployees(empData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Failed to fetch HR data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這位員工嗎？")) return;
    try {
      await hrApi.deleteEmployee(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete employee", error);
      alert("刪除失敗");
    }
  };

  const handleSave = async (employeeData: Partial<Employee>) => {
    if (editingEmployee) {
      await hrApi.updateEmployee(editingEmployee.id, employeeData);
    } else {
      await hrApi.createEmployee(employeeData);
    }
    fetchData();
  };

  const getStatusText = (status: number) => {
    switch(status) {
      case 1: return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-sm text-xs font-bold">在職</span>;
      case 2: return <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-sm text-xs font-bold">留停</span>;
      case 3: return <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-sm text-xs font-bold">離職</span>;
      default: return "-";
    }
  };

  const getStatusTextStr = (status: number) => {
    switch(status) {
      case 1: return "在職";
      case 2: return "留停";
      case 3: return "離職";
      default: return "-";
    }
  };

  const handleExportExcel = () => {
    const data = employees
      .filter(emp => activeDepartmentId === "all" || emp.departmentId === activeDepartmentId)
      .filter(emp => debouncedSearchQuery === "" || emp.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      .map(emp => ({
        "員工姓名": emp.name,
        "信箱": emp.email,
        "部門": emp.department?.name || "-",
        "職稱": emp.jobTitle || "-",
        "狀態": getStatusTextStr(emp.status)
      }));
    exportToExcel(data, "員工名冊");
  };

  const handleExportPDF = async () => {
    const headers = ["員工姓名", "信箱", "部門", "職稱", "狀態"];
    const data = employees
      .filter(emp => activeDepartmentId === "all" || emp.departmentId === activeDepartmentId)
      .filter(emp => debouncedSearchQuery === "" || emp.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      .map(emp => [
        emp.name,
        emp.email,
        emp.department?.name || "-",
        emp.jobTitle || "-",
        getStatusTextStr(emp.status)
      ]);
      
    await exportToPDF("員工名冊", "員工清單 (Employee Roster)", headers, data);
  };

  return (
    <>
    <div className="max-w-6xl mx-auto space-y-6 print:hidden">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '員工管理' }
      ]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            員工管理 (Employees)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理公司人員名單與基本資料</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋員工姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 shadow-sm w-48 sm:w-64 transition-colors"
            />
          </div>
          <button onClick={handleExportExcel} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-medium rounded-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button onClick={handleExportPDF} className="hidden sm:flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Printer className="w-4 h-4" />
            列印
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-sm hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            新增員工
          </button>
        </div>
      </div>

      {/* Department Tabs */}
      {!loading && departments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          <button
            onClick={() => setActiveDepartmentId("all")}
            className={`px-4 py-1 mb-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors border-1 border-solid border-blue-500/50 ${
              activeDepartmentId === "all"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            全部部門 ({employees.length})
          </button>
          {departments.map(dept => {
            const count = employees.filter(e => e.departmentId === dept.id).length;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveDepartmentId(dept.id)}
                className={`px-4 py-1 mb-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors border-1 border-solid border-blue-500/50 ${
                  activeDepartmentId === dept.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                {dept.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">載入中...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">尚無員工資料</h3>
            <p className="text-slate-500 text-sm mb-6">點擊上方「新增員工」來建立第一筆人員紀錄。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">員工姓名</th>
                  <th className="px-6 py-4">信箱</th>
                  <th className="px-6 py-4">部門</th>
                  <th className="px-6 py-4">職稱</th>
                  <th className="px-6 py-4">狀態</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {employees
                  .filter(emp => activeDepartmentId === "all" || emp.departmentId === activeDepartmentId)
                  .filter(emp => debouncedSearchQuery === "" || emp.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
                  .map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {emp.department?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {emp.jobTitle || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusText(emp.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="編輯"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
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

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingEmployee}
        departments={departments}
      />
    </div>

    {/* Print View */}
    <ReportPrintView 
      title="員工名冊 (Employee Roster)"
      companyName="Phoenix ERP"
      dateString={`資料截至：${new Date().toLocaleDateString()}`}
      hideSignatures={true}
    >
      <table className="w-full text-sm text-left border-collapse border border-black text-black">
        <thead>
          <tr className="bg-gray-100 border-b border-black text-black">
            <th className="px-4 py-2 border-r border-black font-bold">員工姓名</th>
            <th className="px-4 py-2 border-r border-black font-bold">信箱</th>
            <th className="px-4 py-2 border-r border-black font-bold">部門</th>
            <th className="px-4 py-2 border-r border-black font-bold">職稱</th>
            <th className="px-4 py-2 font-bold text-center">狀態</th>
          </tr>
        </thead>
        <tbody>
          {employees
            .filter(emp => activeDepartmentId === "all" || emp.departmentId === activeDepartmentId)
            .filter(emp => debouncedSearchQuery === "" || emp.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
            .map((emp, idx) => (
            <tr key={emp.id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
              <td className="px-4 py-2 border-r border-b border-black">{emp.name}</td>
              <td className="px-4 py-2 border-r border-b border-black">{emp.email}</td>
              <td className="px-4 py-2 border-r border-b border-black">{emp.department?.name || "-"}</td>
              <td className="px-4 py-2 border-r border-b border-black">{emp.jobTitle || "-"}</td>
              <td className="px-4 py-2 border-b border-black text-center">{getStatusTextStr(emp.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportPrintView>
    </>
  );
}
