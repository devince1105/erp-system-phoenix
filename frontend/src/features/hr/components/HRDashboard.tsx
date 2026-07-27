"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Users, AlertTriangle, Clock } from "lucide-react";
import { Employee, AttendanceRecord } from "@/features/hr/types/hr";

interface HRDashboardProps {
  employees: Employee[];
  attendances: AttendanceRecord[];
  layout?: "horizontal" | "vertical";
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#f43f5e", "#64748b"];

export const HRDashboard: React.FC<HRDashboardProps> = ({ employees, attendances, layout = "horizontal" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Today's date string matching local time (e.g., "2026-07-26")
  const localDate = new Date();
  const today = localDate.getFullYear() + '-' + String(localDate.getMonth() + 1).padStart(2, '0') + '-' + String(localDate.getDate()).padStart(2, '0');

  // 1. Filter today's attendances
  const todaysAttendances = attendances.filter(a => a.date.startsWith(today));

  // 2. Calculate statistics
  let present = 0;
  let late = 0;
  let leave = 0;
  let absent = 0;

  // We map by employee ID to see who didn't punch in
  const attendanceMap = new Map<number, AttendanceRecord>();
  todaysAttendances.forEach(a => attendanceMap.set(a.employeeId, a));

  const activeEmployees = employees.filter(e => e.status === 1); // 1 = Active
  const totalActive = activeEmployees.length;

  const abnormalList: { employeeName: string; reason: string; time?: string }[] = [];

  activeEmployees.forEach(emp => {
    const record = attendanceMap.get(emp.id);
    if (!record) {
      absent++;
      abnormalList.push({ employeeName: emp.name, reason: "未打卡缺席" });
    } else {
      let isLate = record.status === "Late";
      if (record.checkInTime) {
        const checkIn = new Date(record.checkInTime);
        // Late if after 09:00 AM local time
        if (checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 0)) {
          isLate = true;
        }
      }

      if (record.status === "Leave") {
        leave++;
      } else if (isLate) {
        late++;
        abnormalList.push({ employeeName: emp.name, reason: "遲到", time: record.checkInTime || "" });
      } else if (record.status === "Present") {
        present++;
      } else {
        // Fallback
        present++;
      }
    }
  });

  const pieData = [
    { name: "準時 (Present)", value: present },
    { name: "遲到 (Late)", value: late },
    { name: "缺席 (Absent)", value: absent },
    { name: "請假 (Leave)", value: leave }
  ].filter(d => d.value > 0);

  if (!mounted) {
    return <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"></div>;
  }

  const containerClass = layout === "horizontal" 
    ? "grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full" 
    : "flex flex-col gap-6";

  const cardClass = `bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col ${layout === "horizontal" ? "h-full" : ""}`;

  return (
    <div className={containerClass}>
      
      {/* Card 1: Attendance Pie Chart */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>今日出勤概況</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">全體員工出勤比例</p>
          </div>
          <span className="text-xs font-mono bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800/30">
            Total: {totalActive}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className={`${layout === "horizontal" ? "h-48" : "h-48"} w-full relative`}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(148, 163, 184, 0.1)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(val: any) => [`${val} 人`, "人數"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">尚無資料</div>
            )}
            {/* Center Label */}
            {pieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-500 font-medium">出勤率</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {totalActive > 0 ? Math.round(((present + late) / totalActive) * 100) : 0}%
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-[10px]">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: Abnormal List */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              <span>異常狀況</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">遲到與缺席名單</p>
          </div>
          <span className="text-xs font-mono bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">
            異常: {abnormalList.length}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-40 no-scrollbar">
            {abnormalList.length > 0 ? (
              abnormalList.map((abnormal, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{abnormal.employeeName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded">
                      {abnormal.reason}
                    </span>
                    {abnormal.time && (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {abnormal.time}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded">
                今日全體員工出勤狀況良好！
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
