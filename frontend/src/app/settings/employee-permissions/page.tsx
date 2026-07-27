"use client";

import React from "react";
import { EmployeeOverviewMatrix } from "@/features/core/components/EmployeeOverviewMatrix";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

export default function EmployeePermissionsPage() {
  return (
    <div className="flex flex-col text-slate-900 dark:text-slate-100 min-h-[calc(100vh-4rem)]">
      <div className="px-6 pt-6 pb-2 max-w-[1400px] mx-auto w-full">
        <Breadcrumbs items={[
          { label: '首頁', href: '/' },
          { label: '系統設定', href: '/settings' },
          { label: '員工權限總覽' }
        ]} />
      </div>
      
      <div className="px-6 py-4 max-w-[1400px] mx-auto w-full flex-1">
        <EmployeeOverviewMatrix />
      </div>
    </div>
  );
}
