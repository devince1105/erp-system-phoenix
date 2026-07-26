"use client";

import React, { useEffect, useState } from "react";
import { Users, FolderTree, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { hrApi } from "@/features/hr/api/hrApi";
import { LeaveRequest, OvertimeRequest, CalendarEvent } from "@/features/hr/types/hr";
import { HRCalendar } from "@/features/hr/components/HRCalendar";
import { DateDetailsPanel } from "@/features/hr/components/DateDetailsPanel";

export default function HRPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const loadEvents = async () => {
    try {
      const data = await hrApi.getCalendarEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employees, departments, leavesData, overtimesData, eventsData] = await Promise.all([
          hrApi.getEmployees(),
          hrApi.getDepartments(),
          hrApi.getLeaves(),
          hrApi.getOvertimes(),
          hrApi.getCalendarEvents()
        ]);
        
        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.status === 1).length,
          departments: departments.length
        });
        setLeaves(leavesData);
        setOvertimes(overtimesData);
        setEvents(eventsData);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* HR Calendar */}
        <div className="lg:col-span-2">
          <HRCalendar 
            leaves={leaves} 
            overtimes={overtimes} 
            events={events}
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(date)}
          />
        </div>

        {/* Date Details Panel */}
        <div className="lg:col-span-1 min-h-[400px]">
          <DateDetailsPanel 
            selectedDate={selectedDate}
            leaves={leaves}
            overtimes={overtimes}
            events={events}
            onEventCreated={loadEvents}
            onEventDeleted={loadEvents}
          />
        </div>
      </div>
    </div>
  );
}
