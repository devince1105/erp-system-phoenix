"use client";

import React from "react";
import { Puzzle, ShieldCheck, LogOut, PlusCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
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
              
              <div className="flex items-center gap-2">
                <span className="text-slate-800 dark:text-slate-200">{user?.fullName || "Guest"}</span>
                <button 
                  onClick={logout}
                  className="ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
