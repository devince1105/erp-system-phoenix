import React, { useState } from "react";
import { X } from "lucide-react";
import { Department, Employee } from "../types/hr";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Partial<Department>) => Promise<void>;
  initialData?: Department | null;
  employees: Employee[]; // for selecting a manager
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSave, initialData, employees }) => {
  const [formData, setFormData] = useState<Partial<Department>>({
    name: "",
    managerId: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editKey = isOpen ? (initialData?.id ?? "new") : null;
  const [loadedKey, setLoadedKey] = useState<number | string | null>(null);
  if (editKey !== loadedKey) {
    setLoadedKey(editKey);
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: "",
          managerId: undefined
        });
      }
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        managerId: formData.managerId ? Number(formData.managerId) : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("儲存失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {initialData ? "編輯部門" : "新增部門"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">部門名稱 (Name) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">部門主管 (Manager)</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.managerId || ""}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">(無)</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name} - {e.jobTitle || "無職稱"}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "儲存中..." : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
