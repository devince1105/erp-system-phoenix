"use client";

import React, { useState } from "react";
import { LeaveRequest, OvertimeRequest, CalendarEvent } from "@/features/hr/types/hr";
import { hrApi } from "@/features/hr/api/hrApi";
import { Plane, Clock, Megaphone, StickyNote, Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";

interface DateDetailsPanelProps {
  selectedDate: string;
  leaves: LeaveRequest[];
  overtimes: OvertimeRequest[];
  events: CalendarEvent[];
  onEventCreated: () => void;
  onEventDeleted: () => void;
}

export const DateDetailsPanel: React.FC<DateDetailsPanelProps> = ({ 
  selectedDate, leaves, overtimes, events, onEventCreated, onEventDeleted 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "Announcement" });

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

  const isDateInLeave = (dateStr: string, leave: LeaveRequest) => {
    const d = new Date(dateStr);
    const start = new Date(leave.startDate.split('T')[0]);
    const end = new Date(leave.endDate.split('T')[0]);
    return d >= start && d <= end;
  };

  const dayLeaves = leaves.filter(l => l.status === "Approved" && isDateInLeave(selectedDate, l));
  const dayOvertimes = overtimes.filter(o => o.status === "Approved" && o.date.startsWith(selectedDate));
  const dayEvents = events.filter(e => e.date === selectedDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    try {
      setIsSubmitting(true);
      await hrApi.createCalendarEvent({
        date: selectedDate,
        title: newEvent.title,
        type: newEvent.type
      });
      setNewEvent({ title: "", type: "Announcement" });
      onEventCreated();
    } catch (err) {
      console.error("Failed to create event", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hrApi.deleteCalendarEvent(id);
      onEventDeleted();
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {selectedDate} 日期資訊
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Events / Announcements */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">公告與記事</h3>
          {dayEvents.length === 0 ? (
            <div className="text-sm text-slate-400 italic bg-gray-50 dark:bg-slate-800/30 p-3 rounded border border-dashed border-gray-200 dark:border-slate-700">無相關紀錄</div>
          ) : (
            <div className="space-y-2">
              {dayEvents.map(evt => (
                <div key={evt.id} className={`p-2.5 rounded-sm border flex items-start justify-between group ${
                  evt.type === 'Announcement' ? 'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {evt.type === 'Announcement' ? <Megaphone className="h-4 w-4 mt-0.5 text-sky-600 dark:text-sky-400" /> : <StickyNote className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />}
                    <div>
                      <div className={`text-sm font-medium ${evt.type === 'Announcement' ? 'text-sky-800 dark:text-sky-300' : 'text-emerald-800 dark:text-emerald-300'}`}>{evt.title}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{evt.type === 'Announcement' ? '重要公告' : '一般記事'}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(evt.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HR Records */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">出勤狀態</h3>
          {dayLeaves.length === 0 && dayOvertimes.length === 0 ? (
            <div className="text-sm text-slate-400 italic">無請假或加班紀錄</div>
          ) : (
            <div className="space-y-2">
              {dayLeaves.map(leave => (
                <div key={leave.id} className="p-2.5 rounded-sm bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50 flex items-center gap-2">
                  <Plane className="h-4 w-4 text-purple-500 shrink-0" />
                  <div className="flex flex-col w-full">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">{leave.employee?.name} <span className="text-purple-600 dark:text-purple-400 font-normal ml-1">({translateLeaveType(leave.leaveType)})</span></span>
                    <span className="text-[11px] text-purple-600/80 dark:text-purple-400/80 font-mono mt-0.5">
                      {leave.startDate.replace('T', ' ').substring(0, 16)} ~ {leave.endDate.replace('T', ' ').substring(0, 16)}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{leave.reason}</span>
                  </div>
                </div>
              ))}
              {dayOvertimes.map(ot => (
                <div key={ot.id} className="p-2.5 rounded-sm bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{ot.employee?.name} <span className="text-amber-600 dark:text-amber-400 font-normal ml-1">({ot.hours} 小時)</span></span>
                    <span className="text-[10px] text-slate-500">{ot.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">新增事項</h3>
          <div className="flex gap-2">
            <select 
              value={newEvent.type}
              onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
              className="px-2 py-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 w-24 shrink-0"
            >
              <option value="Announcement">公告</option>
              <option value="Note">記事</option>
            </select>
            <input 
              type="text" 
              placeholder="輸入內容..." 
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 placeholder-slate-400"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !newEvent.title.trim()}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-sm transition-colors"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" /> 新增
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
