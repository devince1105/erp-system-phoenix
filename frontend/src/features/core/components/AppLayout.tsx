"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Exclude AppLayout on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden print:h-auto print:block">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <div className="flex flex-1 min-h-0 print:block print:h-auto">
        <div className="print:hidden h-full">
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-slate-950 transition-colors print:overflow-visible print:bg-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0 print:hidden"></div>
          <div className="relative z-10 p-6 print:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
