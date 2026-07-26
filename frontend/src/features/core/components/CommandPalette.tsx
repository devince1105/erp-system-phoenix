"use client";

import React, { useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { 
  Search, 
  LayoutDashboard, 
  Landmark, 
  Users, 
  PackageSearch,
  Briefcase,
  Settings,
  PlusCircle
} from "lucide-react";
import { useCommandPalette } from "../contexts/CommandPaletteContext";

export const CommandPalette = () => {
  const { isOpen, setIsOpen } = useCommandPalette();
  const router = useRouter();

  // Handle closing on Escape is built into cmdk, but we need to sync state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    command();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette Dialog */}
      <div className="relative w-full max-w-2xl px-4 animate-in fade-in zoom-in-95 duration-200">
        <Command 
          className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          loop
        >
          <div className="flex items-center px-4 border-b border-gray-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <Command.Input 
              autoFocus
              placeholder="輸入指令或搜尋... (Type a command or search...)"
              className="w-full bg-transparent border-0 py-4 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-gray-500 font-sans shadow-sm">ESC</kbd>
            </div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              找不到相關結果 (No results found.)
            </Command.Empty>

            <Command.Group heading="快速操作 (Quick Actions)" className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/accounting/vouchers/new"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/30 aria-selected:text-blue-700 dark:aria-selected:text-blue-400"
              >
                <PlusCircle className="w-4 h-4" />
                新增傳票 (New Voucher)
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/crm/customers"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/30 aria-selected:text-blue-700 dark:aria-selected:text-blue-400"
              >
                <Users className="w-4 h-4" />
                新增客戶 (New Customer)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="前往模組 (Navigation)" className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 mt-2">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                企業總覽 (Dashboard)
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/accounting"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-slate-800"
              >
                <Landmark className="w-4 h-4 text-blue-500" />
                財務會計 (Accounting)
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/inventory"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-slate-800"
              >
                <PackageSearch className="w-4 h-4 text-emerald-500" />
                進銷存系統 (Inventory)
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/hr"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-slate-800"
              >
                <Users className="w-4 h-4 text-purple-500" />
                人力資源 (HR)
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/crm"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-slate-800"
              >
                <Briefcase className="w-4 h-4 text-rose-500" />
                客戶關係 (CRM)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="設定檔 (System)" className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 mt-2">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/settings"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-slate-800"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                系統設定 (Settings)
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
