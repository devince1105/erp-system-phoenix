"use client";

import React from "react";
import { EmployeePermissionSettings } from "@/features/core/components/EmployeePermissionSettings";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

export default function PermissionsPage() {
  return (
    <div className="flex flex-col text-slate-900 dark:text-slate-100 min-h-[calc(100vh-4rem)]">
      <div className="px-6 pt-6 pb-2 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[
          { label: '首頁', href: '/' },
          { label: '系統設定', href: '/settings' },
          { label: '權限與角色管理' }
        ]} />
      </div>
      
      <div className="px-6 py-4 max-w-7xl mx-auto w-full flex-1">
        <EmployeePermissionSettings />
      </div>
    </div>
  );
}
