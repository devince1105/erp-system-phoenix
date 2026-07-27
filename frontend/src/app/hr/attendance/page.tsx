"use client";

import React, { useState, useEffect } from "react";
import { hrApi } from "@/features/hr/api/hrApi";
import { Employee, AttendanceRecord, LeaveRequest, OvertimeRequest, Department } from "@/features/hr/types/hr";
import { Pagination } from "@/features/core/components/Pagination";
import { Clock, Calendar, Search, MapPin, Clock3 } from "lucide-react";
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { HRDashboard as HRDashboardOverview } from "@/features/hr/components/HRDashboard";
import { useAuth } from "@/features/core/contexts/AuthContext";

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('role_admin') || user?.roles?.includes('role_hr_manager');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For Demo: Pick an employee to simulate login
  const [selectedEmpId, setSelectedEmpId] = useState<number | "">(user?.id || "");

  useEffect(() => {
    if (user?.id && selectedEmpId === "") setSelectedEmpId(user.id);
  }, [user]);

  // Filtering & Pagination
  const currentYear = new Date().getFullYear();
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | "">("");
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | "">("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  
  const [attPage, setAttPage] = useState(1);
  const [attPageSize, setAttPageSize] = useState(10);
  
  const [leavePage, setLeavePage] = useState(1);
  const [leavePageSize, setLeavePageSize] = useState(10);
  
  const [overtimePage, setOvertimePage] = useState(1);
  const [overtimePageSize, setOvertimePageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [emps, depts, atts, lvs, ovts] = await Promise.all([
        hrApi.getEmployees(),
        hrApi.getDepartments(),
        hrApi.getAttendances(),
        hrApi.getLeaves(),
        hrApi.getOvertimes()
      ]);
      setEmployees(emps);
      setDepartments(depts);
      setAttendances(atts);
      setLeaves(lvs);
      setOvertimes(ovts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!selectedEmpId) return alert("請先選擇員工");
    const localDate = new Date();
    const dateStr = localDate.getFullYear() + '-' + String(localDate.getMonth() + 1).padStart(2, '0') + '-' + String(localDate.getDate()).padStart(2, '0');
    
    const existing = attendances.find(a => a.employeeId === Number(selectedEmpId) && a.date.startsWith(dateStr));
    if (existing && existing.checkInTime) {
       return alert("今日已經打過上班卡了！");
    }

    const record: Partial<AttendanceRecord> = {
      employeeId: Number(selectedEmpId),
      date: dateStr + 'T00:00:00',
      checkInTime: new Date().toISOString(),
      status: "Present"
    };
    await hrApi.createAttendance(record);
    fetchData();
  };

  const handleClockOut = async () => {
    if (!selectedEmpId) return alert("請先選擇員工");
    const localDate = new Date();
    const dateStr = localDate.getFullYear() + '-' + String(localDate.getMonth() + 1).padStart(2, '0') + '-' + String(localDate.getDate()).padStart(2, '0');
    
    const existing = attendances.find(a => a.employeeId === Number(selectedEmpId) && a.date.startsWith(dateStr));
    if (!existing) {
       return alert("今日尚未打上班卡，無法下班打卡！");
    }
    if (existing.checkOutTime) {
       return alert("今日已經打過下班卡了！");
    }
    
    await hrApi.updateAttendance(existing.id, {
      ...existing,
      checkOutTime: new Date().toISOString()
    });
    fetchData();
  };

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const handleApplyLeave = async () => {
    if (!selectedEmpId) return alert("請先選擇員工");
    if (!leaveForm.startDate || !leaveForm.endDate) return alert("請填寫日期");

    const request: Partial<LeaveRequest> = {
      employeeId: Number(selectedEmpId),
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: "Pending"
    };
    await hrApi.createLeave(request);
    setLeaveForm({ leaveType: "Annual", startDate: "", endDate: "", reason: "" });
    fetchData();
  };

  const [overtimeForm, setOvertimeForm] = useState({
    date: "",
    hours: "",
    reason: ""
  });

  const handleApplyOvertime = async () => {
    if (!selectedEmpId) return alert("請先選擇員工");
    if (!overtimeForm.date || !overtimeForm.hours) return alert("請填寫日期與時數");
    
    const hours = Number(overtimeForm.hours);
    if (isNaN(hours) || hours <= 0) return alert("請填寫正確的時數");
    if (hours > 4) return alert("依據勞基法規定，單日加班不得超過 4 小時。");

    // Basic validation for total hours (Assuming a normal 8 hour day)
    // A more rigorous validation would check the actual attendance record for the day
    // But this meets the basic requirement
    if (hours + 8 > 12) return alert("每日正常工時 + 加班工時不得超過 12 小時。");

    const request: Partial<OvertimeRequest> = {
      employeeId: Number(selectedEmpId),
      date: overtimeForm.date,
      hours: hours,
      reason: overtimeForm.reason,
      status: "Pending"
    };
    try {
      await hrApi.createOvertime(request);
      setOvertimeForm({ date: "", hours: "", reason: "" });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data || "加班申請失敗");
    }
  };

  const calculateWorkHours = (att: AttendanceRecord) => {
    if (!att.checkInTime || !att.checkOutTime) return "-";
    const inT = new Date(att.checkInTime);
    const outT = new Date(att.checkOutTime);
    let breakHours = 1; // Default break deduction
    if (att.breakOutTime && att.breakInTime) {
      const bOut = new Date(att.breakOutTime);
      const bIn = new Date(att.breakInTime);
      breakHours = (bIn.getTime() - bOut.getTime()) / (1000 * 60 * 60);
    }
    const totalHours = (outT.getTime() - inT.getTime()) / (1000 * 60 * 60);
    const actualHours = Math.max(0, totalHours - breakHours);
    return actualHours.toFixed(1) + "h";
  };

  // Filter calculations
  const filteredAttendances = attendances.filter(a => {
    if (filterDepartmentId && a.employee?.departmentId !== Number(filterDepartmentId)) return false;
    if (filterEmployeeId && a.employeeId !== Number(filterEmployeeId)) return false;
    if (filterYear !== "all" || filterMonth !== "all") {
      const d = new Date(a.date);
      if (filterYear !== "all" && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== "all" && (d.getMonth() + 1) !== Number(filterMonth)) return false;
    }
    return true;
  });
    
  const filteredLeaves = leaves.filter(l => {
    if (filterDepartmentId && l.employee?.departmentId !== Number(filterDepartmentId)) return false;
    if (filterEmployeeId && l.employeeId !== Number(filterEmployeeId)) return false;
    if (filterYear !== "all" || filterMonth !== "all") {
      const d = new Date(l.startDate);
      if (filterYear !== "all" && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== "all" && (d.getMonth() + 1) !== Number(filterMonth)) return false;
    }
    return true;
  });

  const filteredOvertimes = overtimes.filter(o => {
    if (filterDepartmentId && o.employee?.departmentId !== Number(filterDepartmentId)) return false;
    if (filterEmployeeId && o.employeeId !== Number(filterEmployeeId)) return false;
    if (filterYear !== "all" || filterMonth !== "all") {
      const d = new Date(o.date);
      if (filterYear !== "all" && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== "all" && (d.getMonth() + 1) !== Number(filterMonth)) return false;
    }
    return true;
  });

  // Pagination calculations - Attendances
  const attTotalItems = filteredAttendances.length;
  const attTotalPages = Math.ceil(attTotalItems / attPageSize) || 1;
  const attStartIndex = (attPage - 1) * attPageSize;
  const paginatedAttendances = filteredAttendances.slice(attStartIndex, attStartIndex + attPageSize);

  // Pagination calculations - Leaves
  const leaveTotalItems = filteredLeaves.length;
  const leaveTotalPages = Math.ceil(leaveTotalItems / leavePageSize) || 1;
  const leaveStartIndex = (leavePage - 1) * leavePageSize;
  const paginatedLeaves = filteredLeaves.slice(leaveStartIndex, leaveStartIndex + leavePageSize);

  // Pagination calculations - Overtimes
  const overtimeTotalItems = filteredOvertimes.length;
  const overtimeTotalPages = Math.ceil(overtimeTotalItems / overtimePageSize) || 1;
  const overtimeStartIndex = (overtimePage - 1) * overtimePageSize;
  const paginatedOvertimes = filteredOvertimes.slice(overtimeStartIndex, overtimeStartIndex + overtimePageSize);

  if (isLoading) return <div className="p-8 text-center text-slate-500">載入中...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '出勤與請假' }
      ]} />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              出勤與請假 (Attendance & Leave)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">管理員工每日打卡與請假紀錄</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">模擬登入身份：</span>
                <select
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">-- 選擇員工 --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department?.name || '無部門'})</option>
                  ))}
                </select>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                當前登入：{user?.fullName}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column: Actions */}
          <div className="space-y-6">
            
            {/* Clock In Card */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-500" />
                今日打卡
              </h2>
              <div className="text-center mb-6">
                <div className="text-4xl font-light text-slate-800 dark:text-slate-200 tracking-wider">
                  {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleClockIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-sm flex justify-center items-center gap-2 transition-colors"
                >
                  <MapPin className="w-5 h-5" /> 上班打卡
                </button>
                <button 
                  onClick={handleClockOut}
                  className="w-full bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-sm flex justify-center items-center gap-2 transition-colors border border-slate-600"
                >
                  <Clock3 className="w-5 h-5" /> 下班打卡
                </button>
              </div>
            </div>

            {/* Today's Attendance Overview & Abnormal List */}
            <HRDashboardOverview employees={employees} attendances={attendances} layout="vertical" />

            {/* Leave Request Card */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-500" />
                請假申請
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">假別</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900"
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                  >
                    <option value="Annual">特休 (Annual Leave)</option>
                    <option value="Sick">病假 (Sick Leave)</option>
                    <option value="Personal">事假 (Personal Leave)</option>
                    <option value="Official">公假 (Official Leave)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">開始日期</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">結束日期</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">事由</label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 h-20"
                    placeholder="請簡述原因..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  />
                </div>
                <button
                  onClick={handleApplyLeave}
                  disabled={!selectedEmpId}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-md font-medium transition-colors"
                >
                  送出申請 (Submit)
                </button>
              </div>
            </div>

            {/* Overtime Request Card */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Clock3 className="h-5 w-5 text-amber-500" />
                加班申請
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">加班日期</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900"
                      value={overtimeForm.date}
                      onChange={(e) => setOvertimeForm({...overtimeForm, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">時數 (最高 4 小時)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="4"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900"
                      placeholder="例如: 2.5"
                      value={overtimeForm.hours}
                      onChange={(e) => setOvertimeForm({...overtimeForm, hours: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">加班事由</label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 h-20"
                    placeholder="請簡述原因..."
                    value={overtimeForm.reason}
                    onChange={(e) => setOvertimeForm({...overtimeForm, reason: e.target.value})}
                  />
                </div>
                <button
                  onClick={handleApplyOvertime}
                  disabled={!selectedEmpId}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-white rounded-md font-medium transition-colors"
                >
                  送出申請 (Submit)
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Records */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Attendance List */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">近期打卡紀錄</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    value={filterYear}
                    onChange={(e) => {
                      setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value));
                      setAttPage(1); setLeavePage(1);
                    }}
                  >
                    <option value="all">所有年份</option>
                    {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                      <option key={y} value={y}>{y} 年</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    value={filterMonth}
                    onChange={(e) => {
                      setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value));
                      setAttPage(1); setLeavePage(1);
                    }}
                  >
                    <option value="all">所有月份</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <select
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    value={filterDepartmentId}
                    onChange={(e) => {
                      setFilterDepartmentId(e.target.value ? Number(e.target.value) : "");
                      setFilterEmployeeId(""); // Reset employee when changing department
                      setAttPage(1);
                      setLeavePage(1);
                      setOvertimePage(1);
                    }}
                  >
                    <option value="">-- 所有部門 --</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    value={filterEmployeeId}
                    onChange={(e) => {
                      setFilterEmployeeId(e.target.value ? Number(e.target.value) : "");
                      setAttPage(1);
                      setLeavePage(1);
                      setOvertimePage(1);
                    }}
                  >
                    <option value="">-- 所有員工 --</option>
                    {employees
                      .filter(emp => filterDepartmentId ? emp.departmentId === filterDepartmentId : true)
                      .map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                      <th className="p-4 font-medium">員工</th>
                      <th className="p-4 font-medium whitespace-nowrap">日期</th>
                      <th className="p-4 font-medium whitespace-nowrap">上班</th>
                      <th className="p-4 font-medium whitespace-nowrap">下班</th>
                      <th className="p-4 font-medium whitespace-nowrap">工時</th>
                      <th className="p-4 font-medium whitespace-nowrap">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedAttendances.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{att.employee?.name}</div>
                          <div className="text-xs text-slate-500">{att.employee?.department?.name}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {new Date(att.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                        </td>
                        <td className="p-4 text-slate-900 dark:text-slate-100 font-semibold">
                          {calculateWorkHours(att)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-sm ${
                            att.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            att.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            att.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paginatedAttendances.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">目前尚無紀錄</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {filteredAttendances.length > 0 && !isLoading && (
                <Pagination
                  currentPage={attPage}
                  pageSize={attPageSize}
                  totalItems={attTotalItems}
                  onPageChange={setAttPage}
                  onPageSizeChange={setAttPageSize}
                />
              )}
            </div>

            {/* Leave Requests List */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  請假單申請紀錄
                  {(filterYear !== "all" || filterMonth !== "all" || filterEmployeeId !== "") && (
                    <span className="text-xs font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-sm">
                      依上方條件過濾中
                    </span>
                  )}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                      <th className="p-4 font-medium">員工</th>
                      <th className="p-4 font-medium">假別</th>
                      <th className="p-4 font-medium">起訖日期</th>
                      <th className="p-4 font-medium">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedLeaves.map(lv => (
                      <tr key={lv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{lv.employee?.name}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {lv.leaveType}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {new Date(lv.startDate).toLocaleDateString()} ~ {new Date(lv.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            {lv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paginatedLeaves.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">目前尚無請假單</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {filteredLeaves.length > 0 && !isLoading && (
                <Pagination
                  currentPage={leavePage}
                  pageSize={leavePageSize}
                  totalItems={leaveTotalItems}
                  onPageChange={setLeavePage}
                  onPageSizeChange={setLeavePageSize}
                />
              )}
            </div>

            {/* Overtime Requests List */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  加班單申請紀錄
                  {(filterYear !== "all" || filterMonth !== "all" || filterEmployeeId !== "") && (
                    <span className="text-xs font-normal bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-sm">
                      依上方條件過濾中
                    </span>
                  )}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                      <th className="p-4 font-medium">員工</th>
                      <th className="p-4 font-medium">日期</th>
                      <th className="p-4 font-medium">時數</th>
                      <th className="p-4 font-medium">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedOvertimes.map(ovt => (
                      <tr key={ovt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{ovt.employee?.name}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {new Date(ovt.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                          {ovt.hours} h
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            ovt.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            ovt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {ovt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paginatedOvertimes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">目前尚無加班單</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {filteredOvertimes.length > 0 && !isLoading && (
                <Pagination
                  currentPage={overtimePage}
                  pageSize={overtimePageSize}
                  totalItems={overtimeTotalItems}
                  onPageChange={setOvertimePage}
                  onPageSizeChange={setOvertimePageSize}
                />
              )}
            </div>

          </div>
        </div>
    </div>
  );
}
