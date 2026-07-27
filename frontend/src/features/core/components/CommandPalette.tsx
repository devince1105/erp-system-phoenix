"use client";

import React, { useState, useEffect, useRef } from "react";
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
  PlusCircle,
  User,
  Building2,
  Package,
  Loader2
} from "lucide-react";
import { useCommandPalette } from "../contexts/CommandPaletteContext";

import { hrApi } from "@/features/hr/api/hrApi";
import { crmApi } from "@/features/crm/api/crmApi";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { Employee } from "@/features/hr/types/hr";
import { Customer } from "@/features/crm/types/crm";
import { Product } from "@/features/inventory/types/inventory";

export const CommandPalette = () => {
  const { isOpen, setIsOpen } = useCommandPalette();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch data only once when the palette is opened
  useEffect(() => {
    if (isOpen && !fetchedRef.current) {
      setIsLoading(true);
      Promise.all([
        hrApi.getEmployees().catch(() => []),
        crmApi.getCustomers().catch(() => []),
        inventoryApi.getProducts().catch(() => [])
      ]).then(([empData, custData, prodData]) => {
        setEmployees(empData);
        setCustomers(custData);
        setProducts(prodData);
        setIsLoading(false);
        fetchedRef.current = true;
      });
    }
  }, [isOpen]);

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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette Dialog */}
      <div className="relative w-full max-w-2xl px-4 animate-in fade-in zoom-in-95 duration-200">
        <Command 
          className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
          loop
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <div className="flex items-center px-4 border-b border-gray-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <Command.Input 
              autoFocus
              placeholder="輸入人員、客戶、商品名稱，或執行指令..."
              className="w-full bg-transparent border-0 py-4 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            <div className="hidden sm:flex items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
              <kbd className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-2 py-1 text-[10px] font-bold text-gray-500 shadow-sm">ESC</kbd>
            </div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
            <Command.Empty className="py-8 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1" />
              找不到相關結果
            </Command.Empty>

            {/* Dynamic Data Groups */}
            {!isLoading && (
              <>
                {employees.length > 0 && (
                  <Command.Group heading="員工 (Employees)" className="px-2 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 mt-1">
                    {employees.map(emp => (
                      <Command.Item 
                        key={`emp-${emp.id}`}
                        value={`employee 員工 ${emp.name} ${emp.email} ${emp.jobTitle}`}
                        onSelect={() => runCommand(() => router.push("/hr/employees"))}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">{emp.name}</p>
                            <p className="text-xs text-slate-500">{emp.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{emp.jobTitle || '員工'}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {customers.length > 0 && (
                  <Command.Group heading="客戶 (Customers)" className="px-2 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 mt-2">
                    {customers.map(cust => (
                      <Command.Item 
                        key={`cust-${cust.id}`}
                        value={`customer 客戶 ${cust.name} ${cust.contactPerson}`}
                        onSelect={() => runCommand(() => router.push("/crm/customers"))}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer aria-selected:bg-emerald-50 dark:aria-selected:bg-emerald-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">{cust.name}</p>
                            <p className="text-xs text-slate-500">聯絡人: {cust.contactPerson}</p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded font-medium">{cust.industry || '客戶'}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {products.length > 0 && (
                  <Command.Group heading="商品庫存 (Products)" className="px-2 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 mt-2">
                    {products.map(prod => (
                      <Command.Item 
                        key={`prod-${prod.id}`}
                        value={`product 商品 ${prod.name} ${prod.sku}`}
                        onSelect={() => runCommand(() => router.push("/inventory/products"))}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer aria-selected:bg-amber-50 dark:aria-selected:bg-amber-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">{prod.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{prod.sku}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-500 font-medium">${prod.unitPrice}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </>
            )}

            {/* Static Commands */}
            <Command.Group heading="快速操作 (Quick Actions)" className="px-2 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 mt-2">
              <Command.Item 
                value="new voucher 新增傳票"
                onSelect={() => runCommand(() => router.push("/accounting/vouchers/new"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-slate-400" />
                新增傳票 (New Voucher)
              </Command.Item>
              <Command.Item 
                value="new customer 新增客戶"
                onSelect={() => runCommand(() => router.push("/crm/customers"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <Users className="w-4 h-4 text-slate-400" />
                新增客戶 (New Customer)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="前往模組 (Navigation)" className="px-2 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 mt-2">
              <Command.Item 
                value="dashboard 企業總覽 首頁"
                onSelect={() => runCommand(() => router.push("/"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                企業總覽 (Dashboard)
              </Command.Item>
              <Command.Item 
                value="accounting 財務會計"
                onSelect={() => runCommand(() => router.push("/accounting"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <Landmark className="w-4 h-4 text-slate-400" />
                財務會計 (Accounting)
              </Command.Item>
              <Command.Item 
                value="inventory 進銷存系統"
                onSelect={() => runCommand(() => router.push("/inventory"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <PackageSearch className="w-4 h-4 text-slate-400" />
                進銷存系統 (Inventory)
              </Command.Item>
              <Command.Item 
                value="hr 人力資源 員工"
                onSelect={() => runCommand(() => router.push("/hr"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <Users className="w-4 h-4 text-slate-400" />
                人力資源 (HR)
              </Command.Item>
              <Command.Item 
                value="crm 客戶關係"
                onSelect={() => runCommand(() => router.push("/crm"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-slate-400" />
                客戶關係 (CRM)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="設定 (System)" className="px-2 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 mt-2">
              <Command.Item 
                value="settings 系統設定"
                onSelect={() => runCommand(() => router.push("/settings"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                系統設定 (Settings)
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
