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
  HrParameterSetting,
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
