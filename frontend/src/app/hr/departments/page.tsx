"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { hrApi } from "@/features/hr/api/hrApi";
import { Department, Employee } from "@/features/hr/types/hr";
import { DepartmentModal } from "@/features/hr/components/DepartmentModal";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, empData] = await Promise.all([
        hrApi.getDepartments(),
        hrApi.getEmployees()
      ]);
      setDepartments(deptData);
      setEmployees(empData);
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
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這個部門嗎？")) return;
    try {
      await hrApi.deleteDepartment(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete department", error);
      alert("刪除失敗");
    }
  };

  const handleSave = async (departmentData: Partial<Department>) => {
    if (editingDepartment) {
      await hrApi.updateDepartment(editingDepartment.id, departmentData);
    } else {
      await hrApi.createDepartment(departmentData);
    }
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '部門組織' }
      ]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            部門管理 (Departments)
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理公司組織架構與部門主管</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-sm hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          新增部門
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">載入中...</div>
        ) : departments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FolderTree className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">尚無部門資料</h3>
            <p className="text-slate-500 text-sm mb-6">點擊上方「新增部門」來建立第一筆組織紀錄。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">部門名稱</th>
                  <th className="px-6 py-4">部門主管</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {dept.manager?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="編輯"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
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

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingDepartment}
        employees={employees}
      />
    </div>
  );
}
