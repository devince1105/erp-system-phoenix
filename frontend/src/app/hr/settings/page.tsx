"use client";

import React, { useEffect, useState } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { HrParameterSetting } from "@/features/hr/types/hr";
import { Plus, Trash2, Save } from "lucide-react";

export default function HrSettingsPage() {
  const [settings, setSettings] = useState<HrParameterSetting[]>([]);
  const [loading, setLoading] = useState(true);

  // For adding new
  const [newGroup, setNewGroup] = useState("LeaveMultiplier");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await hrApi.getHrParameterSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newKey || !newValue) return;
    try {
      await hrApi.createHrParameterSetting({
        settingGroup: newGroup,
        key: newKey,
        value: newValue,
      });
      setNewKey("");
      setNewValue("");
      fetchSettings();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hrApi.deleteHrParameterSetting(id);
      fetchSettings();
    } catch (error) {
      console.error(error);
    }
  };

  const groups = Array.from(new Set(settings.map(s => s.settingGroup)));
  // ensure we always show at least the standard groups
  if (!groups.includes("LeaveMultiplier")) groups.push("LeaveMultiplier");
  if (!groups.includes("InsuranceBracket")) groups.push("InsuranceBracket");
  if (!groups.includes("SeniorityLeaveBracket")) groups.push("SeniorityLeaveBracket");

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">人資參數設定</h1>
          <p className="text-sm text-gray-500 mt-1">管理請假扣薪倍率、特休級距、勞健保級距等系統變數</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">新增參數</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">參數群組</label>
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="LeaveMultiplier">請假扣薪倍率 (LeaveMultiplier)</option>
              <option value="OvertimeMultiplier">加班倍率 (OvertimeMultiplier)</option>
              <option value="InsuranceBracket">勞健保級距 (InsuranceBracket)</option>
              <option value="SeniorityLeaveBracket">年資特休級距 (SeniorityLeaveBracket)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">鍵值 (Key)</label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g. 事假, 30000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">設定值 (Value)</label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. 1.0, 750"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> 新增
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map(group => {
          const groupSettings = settings.filter(s => s.settingGroup === group);
          return (
            <div key={group} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{group}</h3>
              </div>
              <div className="p-0">
                {groupSettings.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">尚無資料</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/20">
                        <th className="px-6 py-3 font-medium">鍵值 (Key)</th>
                        <th className="px-6 py-3 font-medium">設定值 (Value)</th>
                        <th className="px-6 py-3 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {groupSettings.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {s.key}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {s.value}
                          </td>
                          <td className="px-6 py-3 text-sm text-right">
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
