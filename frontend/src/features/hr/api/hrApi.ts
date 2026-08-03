import axiosClient from '@/api/axiosClient';
import {
  Department,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  OvertimeRequest,
  CalendarEvent,
  LeaveBalance,
  SalaryStructure,
  ExpenseClaim,
  BusinessTrip,
  PurchaseRequest,
  ApprovalInstance,
  ApprovalReport,
  HrParameterSetting,
  PayrollBreakdown,
  EmployeeSalary,
  WorkflowOptions,
  WorkflowStepConfig,
} from '../types/hr';

export const hrApi = {
  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const { data } = await axiosClient.get('/hr/departments');
    return data;
  },

  getDepartment: async (id: number): Promise<Department> => {
    const { data } = await axiosClient.get(`/hr/departments/${id}`);
    return data;
  },

  createDepartment: async (department: Partial<Department>): Promise<Department> => {
    const { data } = await axiosClient.post('/hr/departments', department);
    return data;
  },

  updateDepartment: async (id: number, department: Partial<Department>): Promise<void> => {
    await axiosClient.put(`/hr/departments/${id}`, department);
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/departments/${id}`);
  },

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const { data } = await axiosClient.get('/hr/employees');
    return data;
  },

  getEmployee: async (id: number): Promise<Employee> => {
    const { data } = await axiosClient.get(`/hr/employees/${id}`);
    return data;
  },

  createEmployee: async (employee: Partial<Employee>): Promise<Employee> => {
    const { data } = await axiosClient.post('/hr/employees', employee);
    return data;
  },

  updateEmployee: async (id: number, employee: Partial<Employee>): Promise<void> => {
    await axiosClient.put(`/hr/employees/${id}`, employee);
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/employees/${id}`);
  },

  // Employee salaries (confidential — Admin/HR/Accountant only)
  getEmployeeSalaries: async (): Promise<EmployeeSalary[]> => {
    const { data } = await axiosClient.get<EmployeeSalary[]>('/hr/employees/salaries');
    return data;
  },
  updateEmployeeBaseSalary: async (id: number, baseSalary: number): Promise<void> => {
    await axiosClient.put(`/hr/employees/${id}/base-salary`, { baseSalary });
  },

  // Attendances
  getAttendances: async (): Promise<AttendanceRecord[]> => {
    const { data } = await axiosClient.get('/hr/attendances');
    return data;
  },
  createAttendance: async (record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const { data } = await axiosClient.post('/hr/attendances', record);
    return data;
  },

  // Leaves
  getLeaves: async (): Promise<LeaveRequest[]> => {
    const { data } = await axiosClient.get('/hr/leaves');
    return data;
  },
  createLeave: async (request: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    const { data } = await axiosClient.post('/hr/leaves', request);
    return data;
  },
  updateLeave: async (id: number, request: Partial<LeaveRequest>): Promise<void> => {
    await axiosClient.put(`/hr/leaves/${id}`, request);
  },
  deleteLeave: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/leaves/${id}`);
  },

  // Overtimes
  getOvertimes: async (): Promise<OvertimeRequest[]> => {
    const { data } = await axiosClient.get('/hr/overtimes');
    return data;
  },
  createOvertime: async (request: Partial<OvertimeRequest>): Promise<OvertimeRequest> => {
    const { data } = await axiosClient.post('/hr/overtimes', request);
    return data;
  },
  updateOvertime: async (id: number, request: Partial<OvertimeRequest>): Promise<void> => {
    await axiosClient.put(`/hr/overtimes/${id}`, request);
  },
  deleteOvertime: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/overtimes/${id}`);
  },

  // Payrolls
  getPayrolls: async (): Promise<PayrollRecord[]> => {
    const { data } = await axiosClient.get('/hr/payrolls');
    return data;
  },
  generatePayrolls: async (year: number, month: number): Promise<void> => {
    await axiosClient.post(`/hr/payrolls/generate/${year}/${month}`);
  },
  updatePayroll: async (id: number, record: Partial<PayrollRecord>): Promise<void> => {
    await axiosClient.put(`/hr/payrolls/${id}`, record);
  },
  getPayrollBreakdown: async (id: number): Promise<PayrollBreakdown> => {
    const { data } = await axiosClient.get<PayrollBreakdown>(`/hr/payrolls/${id}/breakdown`);
    return data;
  },

  // Calendar Events
  getCalendarEvents: async (): Promise<CalendarEvent[]> => {
    const { data } = await axiosClient.get('/hr/calendarEvents');
    return data;
  },
  createCalendarEvent: async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data } = await axiosClient.post('/hr/calendarEvents', event);
    return data;
  },
  deleteCalendarEvent: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/calendarEvents/${id}`);
  },

  // Leave Balances
  getLeaveBalances: async (): Promise<LeaveBalance[]> => {
    const { data } = await axiosClient.get('/hr/leaveBalances');
    return data;
  },
  getEmployeeLeaveBalances: async (employeeId: number): Promise<LeaveBalance[]> => {
    const { data } = await axiosClient.get(`/hr/leaveBalances/employee/${employeeId}`);
    return data;
  },
  createLeaveBalance: async (balance: Partial<LeaveBalance>): Promise<LeaveBalance> => {
    const { data } = await axiosClient.post('/hr/leaveBalances', balance);
    return data;
  },
  updateLeaveBalance: async (id: number, balance: Partial<LeaveBalance>): Promise<void> => {
    await axiosClient.put(`/hr/leaveBalances/${id}`, balance);
  },
  deleteLeaveBalance: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/leaveBalances/${id}`);
  },

  // Salary Structures
  getSalaryStructures: async (): Promise<SalaryStructure[]> => {
    const { data } = await axiosClient.get('/hr/salaryStructures');
    return data;
  },
  getEmployeeSalaryStructures: async (employeeId: number): Promise<SalaryStructure[]> => {
    const { data } = await axiosClient.get(`/hr/salaryStructures/employee/${employeeId}`);
    return data;
  },
  createSalaryStructure: async (structure: Partial<SalaryStructure>): Promise<SalaryStructure> => {
    const { data } = await axiosClient.post('/hr/salaryStructures', structure);
    return data;
  },
  updateSalaryStructure: async (id: number, structure: Partial<SalaryStructure>): Promise<void> => {
    await axiosClient.put(`/hr/salaryStructures/${id}`, structure);
  },
  deleteSalaryStructure: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/salaryStructures/${id}`);
  },

  // Expense Claims
  getExpenseClaims: async (): Promise<ExpenseClaim[]> => {
    const { data } = await axiosClient.get('/hr/expenseClaims');
    return data;
  },
  getEmployeeExpenseClaims: async (employeeId: number): Promise<ExpenseClaim[]> => {
    const { data } = await axiosClient.get(`/hr/expenseClaims/employee/${employeeId}`);
    return data;
  },
  createExpenseClaim: async (claim: Partial<ExpenseClaim>): Promise<ExpenseClaim> => {
    const { data } = await axiosClient.post('/hr/expenseClaims', claim);
    return data;
  },
  updateExpenseClaim: async (id: number, claim: Partial<ExpenseClaim>): Promise<void> => {
    await axiosClient.put(`/hr/expenseClaims/${id}`, claim);
  },
  updateExpenseClaimStatus: async (id: number, status: string): Promise<void> => {
    await axiosClient.patch(`/hr/expenseClaims/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  deleteExpenseClaim: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/expenseClaims/${id}`);
  },

  // Business Trips (出差申請單)
  getBusinessTrips: async (): Promise<BusinessTrip[]> => {
    const { data } = await axiosClient.get('/hr/businessTrips');
    return data;
  },
  createBusinessTrip: async (trip: Partial<BusinessTrip>): Promise<BusinessTrip> => {
    const { data } = await axiosClient.post('/hr/businessTrips', trip);
    return data;
  },
  updateBusinessTripStatus: async (id: number, status: string): Promise<void> => {
    await axiosClient.patch(`/hr/businessTrips/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  deleteBusinessTrip: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/businessTrips/${id}`);
  },

  // Purchase Requests (採購申請單)
  getPurchaseRequests: async (): Promise<PurchaseRequest[]> => {
    const { data } = await axiosClient.get('/hr/purchaseRequests');
    return data;
  },
  createPurchaseRequest: async (request: Partial<PurchaseRequest>): Promise<PurchaseRequest> => {
    const { data } = await axiosClient.post('/hr/purchaseRequests', request);
    return data;
  },
  updatePurchaseRequest: async (id: number, request: Partial<PurchaseRequest>): Promise<void> => {
    await axiosClient.put(`/hr/purchaseRequests/${id}`, request);
  },
  deletePurchaseRequest: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/purchaseRequests/${id}`);
  },

  // Approval workflow (簽核實例)
  getApproval: async (formType: string, documentId: number): Promise<ApprovalInstance | null> => {
    try {
      const { data } = await axiosClient.get<ApprovalInstance>(`/hr/approvals/${formType}/${documentId}`);
      return data;
    } catch {
      return null;
    }
  },
  decideApproval: async (instanceId: number, approve: boolean, comment?: string): Promise<ApprovalInstance> => {
    const { data } = await axiosClient.post<ApprovalInstance>(`/hr/approvals/${instanceId}/decide`, { approve, comment });
    return data;
  },
  // Pending approval instances the current user is authorized to decide (Admin sees all).
  getMyApprovals: async (): Promise<ApprovalInstance[]> => {
    const { data } = await axiosClient.get<ApprovalInstance[]>('/hr/approvals/mine');
    return data;
  },
  // Approval analytics (簽核報表) — Admin/HR/Manager only.
  getApprovalReport: async (): Promise<ApprovalReport> => {
    const { data } = await axiosClient.get<ApprovalReport>('/hr/approvals/report');
    return data;
  },

  // Approval workflow configuration (簽核流程設定) — Admin only.
  getWorkflows: async (): Promise<WorkflowOptions> => {
    const { data } = await axiosClient.get<WorkflowOptions>('/hr/workflows');
    return data;
  },
  saveWorkflow: async (formType: string, steps: WorkflowStepConfig[]): Promise<void> => {
    await axiosClient.put(`/hr/workflows/${formType}`, { steps });
  },

  // Upload a receipt image/PDF; returns the stored file URL.
  uploadReceipt: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await axiosClient.post<{ url: string }>('/hr/receipts/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },

  // HR Parameter Settings
  getHrParameterSettings: async (): Promise<HrParameterSetting[]> => {
    const { data } = await axiosClient.get('/hr/hrParameterSettings');
    return data;
  },
  getHrParameterSettingByName: async (parameterName: string): Promise<HrParameterSetting> => {
    const { data } = await axiosClient.get(`/hr/hrParameterSettings/by-name/${parameterName}`);
    return data;
  },
  createHrParameterSetting: async (setting: Partial<HrParameterSetting>): Promise<HrParameterSetting> => {
    const { data } = await axiosClient.post('/hr/hrParameterSettings', setting);
    return data;
  },
  updateHrParameterSetting: async (id: number, setting: Partial<HrParameterSetting>): Promise<void> => {
    await axiosClient.put(`/hr/hrParameterSettings/${id}`, setting);
  },
  deleteHrParameterSetting: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/hrParameterSettings/${id}`);
  },
};
