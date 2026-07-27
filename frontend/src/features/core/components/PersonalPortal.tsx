import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CalendarCheck, 
  Clock, 
  FileText, 
  MessageSquare, 
  PlusCircle, 
  Receipt, 
  UserPlus, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Users
} from 'lucide-react';
import { User } from '@/features/core/contexts/AuthContext';
import { hrApi } from '@/features/hr/api/hrApi';
import { AttendanceRecord, ApprovalRequest, Employee } from '@/features/hr/types/hr';

interface PersonalPortalProps {
  user: User | null;
}

export const PersonalPortal: React.FC<PersonalPortalProps> = ({ user }) => {
  const announcements = [
    { id: 1, type: '緊急', title: '本週五機房維護通知，ERP 系統將於 22:00 暫停服務', date: '今天 09:30', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
    { id: 2, type: '行政', title: '七月份員工生日會將於下週三下午舉行', date: '昨天 14:15', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
    { id: 3, type: '人資', title: '112年度員工績效考核表已開放填寫，請於月底前完成', date: '2026-07-24', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
  ];

  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [onLeaveEmployees, setOnLeaveEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending approvals for current user
        const approvals = await hrApi.getApprovals('pending');
        setMyTasks(approvals.map(app => ({
          id: app.id,
          module: '審批',
          title: app.title,
          status: '待簽核',
          icon: FileText,
          time: new Date(app.createdAt).toLocaleDateString()
        })));

        // Fetch attendances & employees
        const [attendances, employees] = await Promise.all([
          hrApi.getAttendances(),
          hrApi.getEmployees()
        ]);
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        // My attendance today
        const myAtt = attendances.find(a => 
          a.employeeId.toString() === user?.username?.replace('EMP-', '') && 
          a.date.startsWith(todayStr)
        );
        if (myAtt) setTodayAttendance(myAtt);

        // Others on leave today (Mocking logic since Leave Module is separate, let's use missing attendances)
        // Here we mock just to show dynamic mapping
        const leaveNames = ['李明哲', '陳小美'];
        setOnLeaveEmployees(leaveNames.map(name => ({
          name, 
          status: name.includes('小美') ? '病' : '休',
          color: name.includes('小美') ? 'text-rose-700 bg-rose-100' : 'text-indigo-700 bg-indigo-100'
        })));

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  // Quick Links
  const quickLinks = [
    { name: '線上打卡', icon: Clock, color: 'from-emerald-400 to-emerald-500', href: '/hr/attendance' },
    { name: '請假申請', icon: CalendarCheck, color: 'from-blue-400 to-blue-500', href: '/hr/attendance' },
    { name: '新增客戶', icon: UserPlus, color: 'from-indigo-400 to-indigo-500', href: '/crm/customers' },
    { name: '費用報銷', icon: Receipt, color: 'from-amber-400 to-amber-500', href: '/accounting/vouchers' },
    { name: '發起表單', icon: PlusCircle, color: 'from-purple-400 to-purple-500', href: '/hr/approvals' },
  ];

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          早安，{user?.fullName || '員工'}！
        </h2>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          今天是 {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Links & My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Links (Glassmorphism) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {quickLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.href}
                className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-white/40 dark:border-slate-700/50 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20"
              >
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${link.color}`} />
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${link.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* My Tasks */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                待辦與簽核 ({myTasks.length})
              </h3>
              <a href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
                檢視全部 <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
              {myTasks.map(task => (
                <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4 cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <task.icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {task.module}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{task.time}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      task.status === '被退回' 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Announcements */}
        <div className="flex flex-col gap-6">
          
          {/* Today's Attendance Widget */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-[30px] rounded-full pointer-events-none" />
            
            <h3 className="font-bold text-slate-900 dark:text-emerald-50 flex items-center gap-2 mb-4 relative z-10">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              今日出勤狀態
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${todayAttendance ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">上班打卡</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {todayAttendance ? new Date(todayAttendance.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '尚未打卡'}
                    </p>
                  </div>
                </div>
                {todayAttendance && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">正常</span>
                )}
              </div>

              <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  今日部門請假名單 ({onLeaveEmployees.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {onLeaveEmployees.map((emp, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 dark:bg-slate-900/50 rounded-lg border border-white/50 dark:border-slate-700/50">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${emp.color}`}>
                        {emp.name[0]}
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{emp.name} ({emp.status})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 flex flex-col relative overflow-hidden flex-1">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
            
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5 relative z-10">
              <Bell className="w-4 h-4 text-rose-500" />
              企業公告區
            </h3>
          
          <div className="space-y-4 relative z-10 flex-1">
            {announcements.map(ann => (
              <div key={ann.id} className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ann.color}`}>
                    {ann.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {ann.title}
                </h4>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm flex items-center justify-center gap-1">
            <MessageSquare className="w-4 h-4" />
            前往佈告欄
          </button>
        </div>
        {/* End Right Column Container */}
        </div>

      </div>
    </div>
  );
};
