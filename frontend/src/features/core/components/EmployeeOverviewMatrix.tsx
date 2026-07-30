"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search,
  Save,
  ShieldAlert,
  ShieldCheck,
  Settings2,
  XCircle,
  Briefcase,
  PackageSearch,
  Landmark,
  LayoutDashboard,
  Eye,
  PenLine,
  Minus
} from "lucide-react";
import { hrApi } from "@/features/hr/api/hrApi";
import { ROLE_PERMISSIONS } from "@/utils/rbac";

// --- Types ---

interface SubModule { id: string; name: string; }
interface ModuleDef { id: string; name: string; icon: React.ElementType; subModules: SubModule[]; }

interface Employee {
  id: string;
  name: string;
  department: string;
  roleId: string;
  overrides: { [key: string]: boolean };
}

// --- Data ---
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
    id: 'SETTINGS', name: '系統設定 (Settings)', icon: Settings2,
    subModules: [
      { id: 'SYS_SETTINGS', name: '系統設定 (Settings)' },
      { id: 'SYS_ROLES', name: '權限與角色 (Roles)' },
      { id: 'SYS_EMPLOYEE_PERMS', name: '員工權限總覽 (Employee)' },
      { id: 'SYS_ACCOUNTS', name: '帳號管理 (Accounts)' }
    ]
  }
];

const ACTIONS = [
  { id: 'view', name: '檢視' },
  { id: 'create', name: '新增' },
  { id: 'edit', name: '修改' },
  { id: 'delete', name: '刪除' },
  { id: 'approve', name: '簽核' },
] as const;

// Removed local ROLE_PERMISSIONS and MOCK_EMPLOYEES

export const EmployeeOverviewMatrix = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    // Load persisted RBAC config
    const savedRbacStr = localStorage.getItem('erp_rbac_matrix');
    const savedRbac = savedRbacStr ? JSON.parse(savedRbacStr) : {};

    hrApi.getEmployees().then(data => {
      const mapped: Employee[] = data.map(emp => {
        const empIdStr = `EMP-${emp.id.toString().padStart(3, '0')}`;
        const deptName = emp.department?.name || '';
        const title = emp.jobTitle || '';
        
        let roleId = 'role_sales_rep';
        if (deptName.includes('HR') || deptName.includes('人資')) {
          roleId = title.includes('經理') || title.includes('Manager') ? 'role_hr_manager' : 'role_hr_assistant';
        } else if (deptName.includes('會計') || deptName.includes('財務') || deptName.includes('Accounting')) {
          roleId = 'role_accountant';
        } else if (title.includes('總經理') || title.includes('General')) {
          roleId = 'role_general_manager';
        }

        // Apply saved overrides/role if exists
        const persisted = savedRbac[empIdStr];

        return {
          id: empIdStr,
          name: emp.name,
          department: deptName || '未分類',
          roleId: persisted?.roleId || roleId,
          overrides: persisted?.overrides || {}
        };
      });
      setEmployees(mapped);
    }).catch(err => {
      console.error("Failed to fetch employees", err);
    });
  }, []);

  // Popover State
  const [activeCell, setActiveCell] = useState<{ empId: string, subModId: string } | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Calculate highest permission level for summary badge
  const getSummaryBadge = (emp: Employee, subModId: string) => {
    let hasView = false;
    let hasEdit = false;
    let hasApprove = false;
    let hasOverride = false;

    ACTIONS.forEach(a => {
      const key = `${subModId}:${a.id}`;
      const rolePerm = ROLE_PERMISSIONS[emp.roleId]?.[key] || false;
      const override = emp.overrides[key];
      
      if (override !== undefined) hasOverride = true;
      
      const finalPerm = override !== undefined ? override : rolePerm;
      
      if (finalPerm) {
        if (a.id === 'view') hasView = true;
        if (a.id === 'edit' || a.id === 'create' || a.id === 'delete') hasEdit = true;
        if (a.id === 'approve') hasApprove = true;
      }
    });

    // Badge Design (Icon only)
    let icon = <Minus className="w-5 h-5 text-gray-400 dark:text-slate-500" />;
    
    if (hasApprove) {
      icon = <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    } else if (hasEdit) {
      icon = <PenLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    } else if (hasView) {
      icon = <Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    }

    return (
      <div 
        className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
          hasApprove ? 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800' :
          hasEdit ? 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800' :
          hasView ? 'bg-sky-100 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-800' :
          'bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
        } ${hasOverride ? 'ring-2 ring-rose-400/50 dark:ring-rose-500/50 shadow-sm' : ''}`}
        title={hasApprove ? '全權限 (簽核)' : hasEdit ? '可編輯' : hasView ? '僅檢視' : '無權限'}
      >
        {icon}
        {hasOverride && (
          <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title="有特例微調" />
        )}
      </div>
    );
  };

  const handleCellClick = (e: React.MouseEvent, empId: string, subModId: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX - 100 });
    setActiveCell({ empId, subModId });
  };

  const togglePermission = (actionId: string) => {
    if (!activeCell) return;
    const { empId, subModId } = activeCell;
    const key = `${subModId}:${actionId}`;
    
    setEmployees(prev => {
      const next = prev.map(emp => {
        if (emp.id !== empId) return emp;
        
        const rolePerm = ROLE_PERMISSIONS[emp.roleId]?.[key] || false;
        const currentOverride = emp.overrides[key];
        const newOverrides = { ...emp.overrides };

        if (currentOverride === undefined) {
          newOverrides[key] = !rolePerm; // Toggle from role default
        } else {
          delete newOverrides[key]; // Clear override back to role default
        }

        return { ...emp, overrides: newOverrides };
      });
      
      // Save to localStorage whenever it changes
      const rbacMap = next.reduce((acc, curr) => {
        acc[curr.id] = { roleId: curr.roleId, overrides: curr.overrides };
        return acc;
      }, {} as Record<string, unknown>);
      localStorage.setItem('erp_rbac_matrix', JSON.stringify(rbacMap));
      
      return next;
    });
  };

  // Build flattened sub-modules list for columns
  const allSubModules = HIERARCHICAL_MODULES.flatMap(m => m.subModules);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            員工權限總覽 (Pivot Matrix)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            宏觀檢視全公司員工的頁面權限，點擊單元格即可進行微觀特例調整。
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="搜尋員工..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
           </div>
           <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" />
            儲存所有特例
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Helper Legend */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-medium text-slate-500">
           <div className="flex flex-wrap items-center gap-6">
             <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                全權限 (可簽核)
             </span>
             <span className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                可編輯 (新增/修改/刪除)
             </span>
             <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                僅檢視
             </span>
             <span className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                無權限
             </span>
             <div className="h-4 w-px bg-gray-300 dark:bg-slate-700 hidden md:block"></div>
             <span className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-rose-500" /> 特例設定 (Override)
             </span>
           </div>
           <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
             💡 提示：點擊表格內的圖示即可開啟微調面板
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              {/* Main Module Group Header */}
              <tr>
                <th rowSpan={2} className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-r border-gray-200 dark:border-slate-800 sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[200px] align-bottom pb-4">
                  員工名單 (Roles)
                </th>
                {HIERARCHICAL_MODULES.map(module => (
                  <th key={module.id} colSpan={module.subModules.length} className="px-4 py-3 border-b border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-center gap-2">
                       <module.icon className="w-4 h-4 text-indigo-500" />
                       {module.name.split(' (')[0]}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Sub Module Header */}
              <tr>
                {allSubModules.map(sub => (
                  <th key={sub.id} className="px-4 py-3 border-b border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <div className="writing-mode-vertical sm:writing-mode-horizontal whitespace-nowrap">
                      {sub.name.split(' (')[0]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-6 py-4 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/30">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{emp.name} <span className="text-slate-400 font-normal">({emp.id})</span></span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium bg-indigo-50 dark:bg-indigo-900/30 w-fit px-2 py-0.5 rounded">
                        {emp.department}
                      </span>
                    </div>
                  </td>
                  {allSubModules.map(sub => (
                    <td 
                      key={sub.id} 
                      className="px-4 py-3 border-r border-gray-100 dark:border-slate-800 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={(e) => handleCellClick(e, emp.id, sub.id)}
                    >
                      {getSummaryBadge(emp, sub.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popover */}
      {activeCell && (
        <>
          {/* Backdrop to catch outside clicks */}
          <div className="fixed inset-0 z-40" onClick={() => setActiveCell(null)} />
          
          <div 
            className="fixed z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl w-80 animate-in zoom-in-95 duration-200"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-500" />
                  微調特例權限
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {employees.find(e => e.id === activeCell.empId)?.name} ➔ {allSubModules.find(s => s.id === activeCell.subModId)?.name}
                </p>
              </div>
              <button onClick={() => setActiveCell(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-2">
              {ACTIONS.map(action => {
                const emp = employees.find(e => e.id === activeCell.empId)!;
                const key = `${activeCell.subModId}:${action.id}`;
                const rolePerm = ROLE_PERMISSIONS[emp.roleId]?.[key] || false;
                const currentOverride = emp.overrides[key];
                const hasOverride = currentOverride !== undefined;
                const finalVal = hasOverride ? currentOverride : rolePerm;

                let stateText = "角色繼承";
                let stateColor = "text-slate-500";
                if (hasOverride) {
                  stateText = finalVal ? "特例允許" : "特例禁止";
                  stateColor = finalVal ? "text-emerald-600 font-bold" : "text-rose-600 font-bold";
                }

                return (
                  <div key={action.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{action.name}</span>
                    <div className="flex items-center gap-4">
                       <span className={`text-xs ${stateColor}`}>{stateText}</span>
                       <button
                         onClick={() => togglePermission(action.id)}
                         className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                           finalVal ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-slate-700'
                         } ${hasOverride ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-rose-400 dark:ring-rose-500' : ''}`}
                       >
                         <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${finalVal ? 'translate-x-5' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-b-2xl border-t border-gray-100 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-500"/> 紅色光環代表特例已生效</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
