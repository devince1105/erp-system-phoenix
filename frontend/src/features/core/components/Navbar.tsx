"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Puzzle, 
  LogOut, 
  ChevronDown, 
  User, 
  Search,
  Bell,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { useCommandPalette } from "@/features/core/contexts/CommandPaletteContext";
import { ThemeToggle } from "./ThemeToggle";

type NotificationType = 'alert' | 'success' | 'info';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  isRead: boolean;
}

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { setIsOpen } = useCommandPalette();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: '庫存警告 (Low Stock)',
      message: '[MacBook Pro 16"] 庫存量低於安全水位 (剩餘 2 台)！',
      type: 'alert',
      time: '10 分鐘前',
      isRead: false
    },
    {
      id: '2',
      title: '簽核提醒 (Approval)',
      message: '[請假單] 王小明 申請特休，等待您的簽核。',
      type: 'info',
      time: '1 小時前',
      isRead: false
    },
    {
      id: '3',
      title: '系統廣播 (System Update)',
      message: 'ERP 系統升級成功，目前版本為 v2.4.0。',
      type: 'success',
      time: '昨天',
      isRead: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotifBg = (type: NotificationType) => {
    switch (type) {
      case 'alert': return 'bg-rose-50 dark:bg-rose-500/10';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-500/10';
      case 'info': return 'bg-blue-50 dark:bg-blue-500/10';
    }
  };

  return (
    <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40 transition-colors">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 w-64 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <Puzzle className="h-4 w-4 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-wide hidden sm:block">
            Phoenix ERP
          </h1>
        </div>

        {/* Mock Search Bar (Center) */}
        <div className="flex-1 flex justify-start lg:justify-center">
          <div className="w-full max-w-md hidden sm:flex items-center">
            <div className="relative w-full">
              <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between pl-3 pr-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md leading-5 bg-gray-50/50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  <span className="text-sm">搜尋全站資料或執行指令...</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="hidden sm:inline-block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-sans text-gray-500 shadow-sm">
                    Cmd K
                  </kbd>
                </div>
              </button>
            </div>
          </div>
        </div>


        {/* System Status Badges & Action Buttons */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      通知中心 
                      {unreadCount > 0 && (
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} 新訊息
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        標示為已讀
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-sm">
                        目前沒有任何通知
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                          >
                            <div className={`mt-0.5 p-2 rounded-full h-fit shrink-0 ${getNotifBg(notif.type)}`}>
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-bold ${notif.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                  {notif.title}
                                </p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-medium">
                                <Clock className="w-3 h-3" />
                                {notif.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
                    <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline w-full py-2">
                      查看歷史通知
                    </button>
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 p-1.5 pr-2.5 rounded-lg transition-colors focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 shadow-sm">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase">
                    {user?.username ? user.username.charAt(0) : "G"}
                  </span>
                </div>
                <span className="text-slate-800 dark:text-slate-200 font-medium ml-1 hidden sm:block text-sm">
                  {user?.username || "Guest"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.fullName || "System Administrator"}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user?.username || "admin"}
                    </p>
                  </div>
                  
                  <div className="p-1">
                    <button 
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Profile Settings
                    </button>
                  </div>
                  
                  <div className="p-1 border-t border-gray-100 dark:border-slate-700">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-red-500/70 dark:text-red-400/70" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </header>
  );
};
