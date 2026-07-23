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

  // To support features like creating a voucher from the navbar, we will need context or props,
  // but for now, we just pass empty functions, or let pages handle their own floating action buttons.
  // Actually, Navbar had specific props for the accounting page (onOpenCreateModal). 
  // Let's adapt Navbar to be more generic, or move the specific actions out.
  // We will leave Navbar generic here.
  
  return (
    <div className="h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-slate-950 transition-colors">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0"></div>
          <div className="relative z-10 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
