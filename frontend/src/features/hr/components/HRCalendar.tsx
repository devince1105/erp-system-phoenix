"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plane, Megaphone, StickyNote } from "lucide-react";
import { LeaveRequest, OvertimeRequest, CalendarEvent } from "@/features/hr/types/hr";

interface HRCalendarProps {
  leaves: LeaveRequest[];
  overtimes: OvertimeRequest[];
  events: CalendarEvent[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export const HRCalendar: React.FC<HRCalendarProps> = ({ leaves, overtimes, events, selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const translateLeaveType = (type: string) => {
    const map: Record<string, string> = {
      'Annual': '特休',
      'Sick': '病假',
      'Personal': '事假',
      'Unpaid': '無薪假',
      'Official': '公假',
      'Marriage': '婚假',
      'Bereavement': '喪假',
      'Maternity': '產假',
      'Paternity': '陪產假'
    };
    return map[type] || type;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Format date to YYYY-MM-DD
  const formatDate = (d: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${year}-${pad(month + 1)}-${pad(d)}`;
  };

  // Helper to check if a date is within leave period
  const isDateInLeave = (dateStr: string, leave: LeaveRequest) => {
    const d = new Date(dateStr);
    const start = new Date(leave.startDate.split('T')[0]);
    const end = new Date(leave.endDate.split('T')[0]);
    return d >= start && d <= end;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {year} 年 {month + 1} 月
          </h2>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400">
            今天
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
        {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
          <div key={day} className={`py-2 text-center text-xs font-medium ${idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[100px] border-b border-r border-gray-100 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-900/20"></div>;
          }

          const dateStr = formatDate(day);
          const isToday = dateStr === new Date().toISOString().split("T")[0];
          
          const dayLeaves = leaves.filter(l => l.status === "Approved" && isDateInLeave(dateStr, l));
          const dayOvertimes = overtimes.filter(o => o.status === "Approved" && o.date.startsWith(dateStr));
          const dayEvents = events.filter(e => e.date === dateStr);
          const isSelected = selectedDate === dateStr;

          const totalItems = dayEvents.length + dayLeaves.length + dayOvertimes.length;
          const displayLimit = 3;
          
          let displayedCount = 0;

          return (
            <div 
              key={`day-${day}`} 
              onClick={() => onDateSelect(dateStr)}
              className={`min-h-[100px] h-32 p-1 border-b border-r cursor-pointer transition-colors relative flex flex-col ${
                isSelected 
                  ? 'bg-blue-100/50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' 
                  : isToday 
                    ? 'bg-blue-50/30 dark:bg-blue-900/10 border-gray-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30' 
                    : 'border-gray-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex justify-between items-start mb-1 px-1 shrink-0">
                <span className={`text-sm font-medium ${
                  isToday 
                    ? 'text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center' 
                    : isSelected 
                      ? 'text-blue-700 dark:text-blue-300 font-bold' 
                      : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {day}
                </span>
              </div>
              
              <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                {/* Events */}
                {dayEvents.slice(0, displayLimit - displayedCount).map(evt => {
                  displayedCount++;
                  return (
                    <div key={`e-${evt.id}`} className={`px-1.5 py-0.5 text-[10px] rounded flex items-center gap-1 truncate ${
                      evt.type === 'Announcement' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    }`} title={evt.title}>
                      {evt.type === 'Announcement' ? <Megaphone className="h-2.5 w-2.5 shrink-0" /> : <StickyNote className="h-2.5 w-2.5 shrink-0" />}
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}
                {/* Leaves */}
                {dayLeaves.slice(0, displayLimit - displayedCount).map(leave => {
                  displayedCount++;
                  return (
                    <div key={`l-${leave.id}`} className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1 truncate" title={`${leave.employee?.name} - ${translateLeaveType(leave.leaveType)}`}>
                      <Plane className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{leave.employee?.name}</span>
                    </div>
                  );
                })}
                
                {/* Overtimes */}
                {dayOvertimes.slice(0, displayLimit - displayedCount).map(ot => {
                  displayedCount++;
                  return (
                    <div key={`o-${ot.id}`} className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center gap-1 truncate" title={`${ot.employee?.name} - ${ot.hours} 小時`}>
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{ot.employee?.name}</span>
                    </div>
                  );
                })}

                {/* More indicator */}
                {totalItems > displayLimit && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1 mt-0.5">
                    還有 {totalItems - displayLimit} 筆...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
