"use client";

import React, { useState, useRef, useEffect } from "react";
import { Puzzle, ShieldCheck, LogOut, PlusCircle, RefreshCw, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              />
            </div>
          </div>
        </div>


        {/* System Status Badges & Action Buttons */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-4 text-sm font-medium">
              <ThemeToggle />
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 p-1.5 pr-2.5 rounded-lg transition-colors focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase">
                      {user?.username ? user.username.charAt(0) : "G"}
                    </span>
                  </div>
                  <span className="text-slate-800 dark:text-slate-200 font-medium ml-1 hidden sm:block">
                    {user?.username || "Guest"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
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
                          setIsDropdownOpen(false);
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

      </div>
    </header>
  );
};
