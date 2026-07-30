"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Save,
  Check,
  Briefcase,
  PackageSearch,
  Landmark,
  Plus,
  ChevronDown,
  ChevronRight,
  ListTree,
  Settings,
  LayoutDashboard
} from "lucide-react";


interface RoleTemplate {
  id: string;
  name: string;
  permissions: { [key: string]: boolean };
}

interface SubModule {
  id: string;
  name: string;
}

interface ModuleDef {
  id: string;
  name: string;
  icon: React.ElementType;
  subModules: SubModule[];
}

const HIERARCHICAL_MODULES: ModuleDef[] = [
  {
    id: 'CORE', name: '核心總覽 (Core)', icon: LayoutDashboard,
    subModules: [
      { id: 'CORE_DASHBOARD', name: '企業總覽 (Dashboard)' }
    ]
  },
  { 
    id: 'ACCOUNTING', name: '會計系統 (Accounting)', icon: Landmark,
    subModules: [
      { id: 'ACC_OVERVIEW', name: '會計總覽 (Overview)' },
      { id: 'ACC_VOUCHERS', name: '傳票管理 (Vouchers)' },
      { id: 'ACC_ACCOUNTS', name: '會計科目 (Accounts)' },
      { id: 'ACC_BANKS', name: '銀行帳戶 (Banks)' },
      { id: 'ACC_PNL', name: '損益表 (P&L)' },
      { id: 'ACC_BALANCE_SHEET', name: '資產負債表 (Balance Sheet)' }
    ]
  },
  { 
    id: 'INVENTORY', name: '進銷存系統 (Inventory)', icon: PackageSearch,
    subModules: [
      { id: 'INV_DASHBOARD', name: '進銷存總覽 (Dashboard)' },
      { id: 'INV_PRODUCTS', name: '商品管理 (Products)' },
      { id: 'INV_PARTNERS', name: '客戶與廠商 (Partners)' },
      { id: 'INV_SALES', name: '銷貨管理 (Sales)' },
      { id: 'INV_PURCHASE', name: '採購管理 (Purchases)' }
    ]
  },
  { 
    id: 'HR', name: '人力資源 (HR)', icon: Users,
    subModules: [
      { id: 'HR_DASHBOARD', name: '人資總覽 (Dashboard)' },
      { id: 'HR_EMPLOYEES', name: '員工管理 (Employees)' },
      { id: 'HR_DEPARTMENTS', name: '部門架構 (Departments)' },
      { id: 'HR_ATTENDANCE', name: '出勤與請假 (Attendance)' },
      { id: 'HR_APPROVALS', name: '簽核中心 (Approvals)' },
      { id: 'HR_PAYROLL', name: '薪資結算 (Payroll)' }
    ]
  },
  { 
    id: 'CRM', name: '客戶關係 (CRM)', icon: Briefcase,
    subModules: [
      { id: 'CRM_PIPELINE', name: '銷售看板 (Pipeline)' },
      { id: 'CRM_CUSTOMERS', name: '客戶名單 (Customers)' }
    ]
  },
  {
    id: 'SETTINGS', name: '系統設定 (Settings)', icon: Settings,
    subModules: [
      { id: 'SYS_SETTINGS', name: '系統設定 (Settings)' },
      { id: 'SYS_ROLES', name: '權限與角色 (Roles)' },
      { id: 'SYS_EMPLOYEE_PERMS', name: '員工權限總覽 (Employee)' },
      { id: 'SYS_ACCOUNTS', name: '帳號管理 (Accounts)' }
    ]
  }
];

const ACTIONS = [
  { id: 'view', name: '檢視 (View)' },
  { id: 'create', name: '新增 (Create)' },
  { id: 'edit', name: '修改 (Edit)' },
  { id: 'delete', name: '刪除 (Delete)' },
  { id: 'approve', name: '簽核 (Approve)' },
] as const;

const INITIAL_ROLES: RoleTemplate[] = [
  {
    id: 'role_system_admin',
    name: '👑 系統管理員 (System Admin)',
    permissions: {
      'CORE_DASHBOARD:view': true,
      'CRM_CUSTOMERS:view': true, 'CRM_CUSTOMERS:create': true, 'CRM_CUSTOMERS:edit': true, 'CRM_CUSTOMERS:delete': true, 'CRM_CUSTOMERS:approve': true,
      'CRM_PIPELINE:view': true, 'CRM_PIPELINE:create': true, 'CRM_PIPELINE:edit': true, 'CRM_PIPELINE:delete': true, 'CRM_PIPELINE:approve': true,
      'INV_DASHBOARD:view': true,
      'INV_PRODUCTS:view': true, 'INV_PRODUCTS:create': true, 'INV_PRODUCTS:edit': true, 'INV_PRODUCTS:delete': true, 'INV_PRODUCTS:approve': true,
      'INV_PARTNERS:view': true, 'INV_PARTNERS:create': true, 'INV_PARTNERS:edit': true, 'INV_PARTNERS:delete': true, 'INV_PARTNERS:approve': true,
      'INV_SALES:view': true, 'INV_SALES:create': true, 'INV_SALES:edit': true, 'INV_SALES:delete': true, 'INV_SALES:approve': true,
      'INV_PURCHASE:view': true, 'INV_PURCHASE:create': true, 'INV_PURCHASE:edit': true, 'INV_PURCHASE:delete': true, 'INV_PURCHASE:approve': true,
      'HR_DASHBOARD:view': true,
      'HR_EMPLOYEES:view': true, 'HR_EMPLOYEES:create': true, 'HR_EMPLOYEES:edit': true, 'HR_EMPLOYEES:delete': true, 'HR_EMPLOYEES:approve': true,
      'HR_DEPARTMENTS:view': true, 'HR_DEPARTMENTS:create': true, 'HR_DEPARTMENTS:edit': true, 'HR_DEPARTMENTS:delete': true, 'HR_DEPARTMENTS:approve': true,
      'HR_ATTENDANCE:view': true, 'HR_ATTENDANCE:create': true, 'HR_ATTENDANCE:edit': true, 'HR_ATTENDANCE:delete': true, 'HR_ATTENDANCE:approve': true,
      'HR_APPROVALS:view': true, 'HR_APPROVALS:create': true, 'HR_APPROVALS:edit': true, 'HR_APPROVALS:delete': true, 'HR_APPROVALS:approve': true,
      'HR_PAYROLL:view': true, 'HR_PAYROLL:create': true, 'HR_PAYROLL:edit': true, 'HR_PAYROLL:delete': true, 'HR_PAYROLL:approve': true,
      'ACC_OVERVIEW:view': true,
      'ACC_VOUCHERS:view': true, 'ACC_VOUCHERS:create': true, 'ACC_VOUCHERS:edit': true, 'ACC_VOUCHERS:delete': true, 'ACC_VOUCHERS:approve': true,
      'ACC_ACCOUNTS:view': true, 'ACC_ACCOUNTS:create': true, 'ACC_ACCOUNTS:edit': true, 'ACC_ACCOUNTS:delete': true, 'ACC_ACCOUNTS:approve': true,
      'ACC_BANKS:view': true, 'ACC_BANKS:create': true, 'ACC_BANKS:edit': true, 'ACC_BANKS:delete': true, 'ACC_BANKS:approve': true,
      'ACC_PNL:view': true, 'ACC_PNL:create': true, 'ACC_PNL:edit': true, 'ACC_PNL:delete': true, 'ACC_PNL:approve': true,
      'ACC_BALANCE_SHEET:view': true, 'ACC_BALANCE_SHEET:create': true, 'ACC_BALANCE_SHEET:edit': true, 'ACC_BALANCE_SHEET:delete': true, 'ACC_BALANCE_SHEET:approve': true,
      'SYS_SETTINGS:view': true, 'SYS_SETTINGS:create': true, 'SYS_SETTINGS:edit': true, 'SYS_SETTINGS:delete': true, 'SYS_SETTINGS:approve': true,
      'SYS_ROLES:view': true, 'SYS_ROLES:create': true, 'SYS_ROLES:edit': true, 'SYS_ROLES:delete': true, 'SYS_ROLES:approve': true,
      'SYS_EMPLOYEE_PERMS:view': true, 'SYS_EMPLOYEE_PERMS:create': true, 'SYS_EMPLOYEE_PERMS:edit': true, 'SYS_EMPLOYEE_PERMS:delete': true, 'SYS_EMPLOYEE_PERMS:approve': true,
      'SYS_ACCOUNTS:view': true, 'SYS_ACCOUNTS:create': true, 'SYS_ACCOUNTS:edit': true, 'SYS_ACCOUNTS:delete': true, 'SYS_ACCOUNTS:approve': true,
    }
  },
  {
    id: 'role_general_manager',
    name: '👔 總經理 (General Manager)',
    permissions: {
      'CORE_DASHBOARD:view': true,
      'CRM_CUSTOMERS:view': true, 'CRM_PIPELINE:view': true, 'CRM_PIPELINE:approve': true,
      'INV_DASHBOARD:view': true, 'INV_PRODUCTS:view': true, 'INV_PARTNERS:view': true, 'INV_SALES:view': true, 'INV_SALES:approve': true, 'INV_PURCHASE:view': true, 'INV_PURCHASE:approve': true,
      'HR_DASHBOARD:view': true, 'HR_EMPLOYEES:view': true, 'HR_DEPARTMENTS:view': true, 'HR_ATTENDANCE:view': true, 'HR_APPROVALS:view': true, 'HR_PAYROLL:view': true, 'HR_PAYROLL:approve': true,
      'ACC_OVERVIEW:view': true, 'ACC_VOUCHERS:view': true, 'ACC_ACCOUNTS:view': true, 'ACC_BANKS:view': true, 'ACC_PNL:view': true, 'ACC_BALANCE_SHEET:view': true,
      'SYS_SETTINGS:view': true, 'SYS_ROLES:view': true, 'SYS_EMPLOYEE_PERMS:view': true, 'SYS_ACCOUNTS:view': true
    }
  },
  {
    id: 'role_sales_manager',
    name: '💼 業務經理 (Sales Manager)',
    permissions: {
      'CORE_DASHBOARD:view': true,
      'CRM_CUSTOMERS:view': true, 'CRM_CUSTOMERS:create': true, 'CRM_CUSTOMERS:edit': true, 'CRM_CUSTOMERS:delete': true,
      'CRM_PIPELINE:view': true, 'CRM_PIPELINE:create': true, 'CRM_PIPELINE:edit': true, 'CRM_PIPELINE:approve': true,
      'INV_DASHBOARD:view': true, 'INV_PRODUCTS:view': true, 'INV_SALES:view': true, 'INV_SALES:create': true, 'INV_SALES:approve': true,
    }
  },
  {
    id: 'role_sales_rep',
    name: '💼 業務專員 (Sales Rep)',
    permissions: {
      'CRM_CUSTOMERS:view': true, 'CRM_CUSTOMERS:create': true, 'CRM_CUSTOMERS:edit': true,
      'CRM_PIPELINE:view': true, 'CRM_PIPELINE:create': true, 'CRM_PIPELINE:edit': true,
      'INV_PRODUCTS:view': true, 'INV_SALES:view': true, 'INV_SALES:create': true,
    }
  },
  {
    id: 'role_hr_manager',
    name: '👥 人資經理 (HR Manager)',
    permissions: {
      'HR_EMPLOYEES:view': true, 'HR_EMPLOYEES:create': true, 'HR_EMPLOYEES:edit': true, 'HR_EMPLOYEES:delete': true,
      'HR_ATTENDANCE:view': true, 'HR_ATTENDANCE:create': true, 'HR_ATTENDANCE:edit': true, 'HR_ATTENDANCE:approve': true,
      'HR_PAYROLL:view': true, 'HR_PAYROLL:create': true, 'HR_PAYROLL:edit': true, 'HR_PAYROLL:approve': true,
    }
  },
  {
    id: 'role_hr_assistant',
    name: '👥 人資助理 (HR Assistant)',
    permissions: {
      'HR_EMPLOYEES:view': true, 'HR_EMPLOYEES:create': true, 'HR_EMPLOYEES:edit': true,
      'HR_ATTENDANCE:view': true, 'HR_ATTENDANCE:create': true, 'HR_ATTENDANCE:edit': true,
    }
  },
  {
    id: 'role_accountant',
    name: '💰 會計專員 (Accountant)',
    permissions: {
      'ACC_VOUCHERS:view': true, 'ACC_VOUCHERS:create': true, 'ACC_VOUCHERS:edit': true, 'ACC_VOUCHERS:delete': true, 'ACC_VOUCHERS:approve': true,
      'ACC_ACCOUNTS:view': true, 'ACC_ACCOUNTS:create': true, 'ACC_ACCOUNTS:edit': true,
      'ACC_REPORTS:view': true, 'ACC_REPORTS:create': true,
      'INV_PURCHASE:view': true, 'INV_SALES:view': true,
    }
  },
  {
    id: 'role_inventory_manager',
    name: '📦 倉管主管 (Inventory Manager)',
    permissions: {
      'INV_PRODUCTS:view': true, 'INV_PRODUCTS:create': true, 'INV_PRODUCTS:edit': true, 'INV_PRODUCTS:delete': true,
      'INV_PARTNERS:view': true, 'INV_PARTNERS:create': true, 'INV_PARTNERS:edit': true,
      'INV_SALES:view': true, 'INV_SALES:edit': true, 'INV_SALES:approve': true,
      'INV_PURCHASE:view': true, 'INV_PURCHASE:create': true, 'INV_PURCHASE:edit': true, 'INV_PURCHASE:approve': true,
    }
  }
];

export const EmployeePermissionSettings = () => {
  // Expanded modules state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(HIERARCHICAL_MODULES.map(m => m.id)));

  const toggleExpand = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  const toggleAllExpand = () => {
    if (expandedModules.size === HIERARCHICAL_MODULES.length) {
      setExpandedModules(new Set());
    } else {
      setExpandedModules(new Set(HIERARCHICAL_MODULES.map(m => m.id)));
    }
  };

  // State for Role Templates
  const [roles, setRoles] = useState<RoleTemplate[]>(INITIAL_ROLES);
  const [editingRoleId, setEditingRoleId] = useState("role_hr_assistant");
  
  const editingRole = roles.find(r => r.id === editingRoleId) || roles[0];
  
  const handleRolePermToggle = (subModuleId: string, action: string) => {
    const key = `${subModuleId}:${action}`;
    const newRoles = roles.map(role => {
      if (role.id === editingRoleId) {
        const newPerms = { ...role.permissions };
        newPerms[key] = !newPerms[key];
        return { ...role, permissions: newPerms };
      }
      return role;
    });
    setRoles(newRoles);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            角色模板管理 (Role Templates)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            定義各部門與職級的角色權限模板，作為指派給員工的預設權限基礎。
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
        <div className="flex-1 max-w-sm">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
            編輯目標角色
          </label>
          <div className="flex gap-2">
            <select 
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={editingRoleId}
              onChange={(e) => setEditingRoleId(e.target.value)}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <button className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-800" title="新增角色">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 pt-6">
          <button onClick={toggleAllExpand} className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
            <ListTree className="w-3.5 h-3.5"/> {expandedModules.size === HIERARCHICAL_MODULES.length ? '全部收合' : '全部展開'}
          </button>
          <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" />
            儲存角色權限
          </button>
        </div>
      </div>

      {/* Hierarchical Permission Matrix */}
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
          提示：點擊矩陣中的方塊即可開啟或關閉該角色在該子功能的權限。藍底打勾代表「允許」。
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">模組 / 子功能 (Module/Feature)</th>
                {ACTIONS.map(action => (
                  <th key={action.id} className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center w-24">
                    {action.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
              {HIERARCHICAL_MODULES.map(module => (
                <React.Fragment key={module.id}>
                  {/* Main Module Row */}
                  <tr 
                    className="bg-gray-50/80 dark:bg-slate-800/80 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                    onClick={() => toggleExpand(module.id)}
                  >
                    <td colSpan={ACTIONS.length + 1} className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                          {expandedModules.has(module.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                          <module.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">
                          {module.name}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Sub Module Rows */}
                  {expandedModules.has(module.id) && module.subModules.map(sub => (
                    <tr key={sub.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="px-6 py-3 pl-16 whitespace-nowrap border-l-[3px] border-transparent hover:border-indigo-400">
                        <div className="flex items-center gap-3 relative before:content-[''] before:absolute before:-left-6 before:top-1/2 before:w-4 before:h-px before:bg-gray-300 dark:before:bg-slate-700">
                           <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                            {sub.name}
                          </span>
                        </div>
                      </td>
                      
                      {ACTIONS.map(action => {
                        const isAllowed = !!editingRole.permissions[`${sub.id}:${action.id}`];
                        const boxStyle = isAllowed ? "bg-indigo-500 border-indigo-600 shadow-sm" : "bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-700 hover:border-indigo-400";
                        const icon = isAllowed ? <Check className="w-4 h-4 text-white" /> : null;

                        return (
                          <td key={action.id} className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleRolePermToggle(sub.id, action.id)}
                              className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all duration-200 ${boxStyle}`}
                            >
                              {icon}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
