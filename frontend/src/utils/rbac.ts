export const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'role_sales_rep': {
    'CORE_DASHBOARD:view': true,
    'CRM_CUSTOMERS:view': true, 'CRM_CUSTOMERS:create': true, 'CRM_CUSTOMERS:edit': true,
    'CRM_PIPELINE:view': true, 'CRM_PIPELINE:create': true, 'CRM_PIPELINE:edit': true,
    'INV_DASHBOARD:view': true, 'INV_PRODUCTS:view': true, 'INV_SALES:view': true, 'INV_SALES:create': true,
  },
  'role_hr_assistant': {
    'CORE_DASHBOARD:view': true,
    'HR_DASHBOARD:view': true,
    'HR_EMPLOYEES:view': true, 'HR_EMPLOYEES:create': true, 'HR_EMPLOYEES:edit': true,
    'HR_ATTENDANCE:view': true, 'HR_ATTENDANCE:create': true, 'HR_ATTENDANCE:edit': true,
    'HR_DEPARTMENTS:view': true
  },
  'role_accountant': {
    'CORE_DASHBOARD:view': true,
    'ACC_OVERVIEW:view': true,
    'ACC_VOUCHERS:view': true, 'ACC_VOUCHERS:create': true, 'ACC_VOUCHERS:edit': true, 'ACC_VOUCHERS:delete': true, 'ACC_VOUCHERS:approve': true,
    'ACC_ACCOUNTS:view': true, 'ACC_BANKS:view': true,
    'ACC_PNL:view': true, 'ACC_BALANCE_SHEET:view': true,
    'INV_PURCHASE:view': true, 'INV_SALES:view': true,
  },
  'role_general_manager': {
    'CORE_DASHBOARD:view': true,
    'CRM_CUSTOMERS:view': true, 'CRM_PIPELINE:view': true, 'CRM_PIPELINE:approve': true,
    'INV_DASHBOARD:view': true, 'INV_PRODUCTS:view': true, 'INV_SALES:view': true, 'INV_SALES:approve': true, 'INV_PURCHASE:view': true, 'INV_PURCHASE:approve': true,
    'INV_PARTNERS:view': true,
    'HR_DASHBOARD:view': true, 'HR_EMPLOYEES:view': true, 'HR_DEPARTMENTS:view': true, 'HR_ATTENDANCE:view': true, 'HR_PAYROLL:view': true, 'HR_PAYROLL:approve': true,
    'HR_APPROVALS:view': true,
    'ACC_OVERVIEW:view': true, 'ACC_VOUCHERS:view': true, 'ACC_ACCOUNTS:view': true, 'ACC_BANKS:view': true, 'ACC_PNL:view': true, 'ACC_BALANCE_SHEET:view': true,
    'SYS_SETTINGS:view': true, 'SYS_ROLES:view': true, 'SYS_EMPLOYEE_PERMS:view': true, 'SYS_ACCOUNTS:view': true
  }
};

export const hasPermission = (
  roleId: string, 
  overrides: { [key: string]: boolean }, 
  moduleKey: string, 
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' = 'view'
): boolean => {
  const key = `${moduleKey}:${action}`;
  
  // 0. Super Admin Override
  if (roleId === 'role_system_admin') return true;

  // 1. Check specific overrides first
  if (overrides && overrides[key] !== undefined) {
    return overrides[key];
  }
  
  // 2. Fallback to role permissions
  return ROLE_PERMISSIONS[roleId]?.[key] || false;
};

// Helper for the sidebar to know if a parent module should be visible at all
// If the user has ANY view permission in the submodules, show the parent
export const canViewAnySubModule = (
  roleId: string,
  overrides: { [key: string]: boolean },
  subModuleKeys: string[]
): boolean => {
  return subModuleKeys.some(modKey => hasPermission(roleId, overrides, modKey, 'view'));
};
