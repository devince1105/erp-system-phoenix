import axiosClient from '@/api/axiosClient';
import { Department, Employee, AttendanceRecord, LeaveRequest, PayrollRecord, OvertimeRequest, CalendarEvent, Project, ApprovalRequest } from '../types/hr';

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
  updateAttendance: async (id: number, record: Partial<AttendanceRecord>): Promise<void> => {
    await axiosClient.put(`/hr/attendances/${id}`, record);
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

  // Calendar
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

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const { data } = await axiosClient.get('/hr/projects');
    return data;
  },
  createProject: async (project: Partial<Project>): Promise<Project> => {
    const { data } = await axiosClient.post('/hr/projects', project);
    return data;
  },

  // Approvals
  getApprovals: async (type?: 'pending' | 'history' | 'my-requests'): Promise<ApprovalRequest[]> => {
    const { data } = await axiosClient.get(`/hr/approvals${type ? `?type=${type}` : ''}`);
    return data;
  },
  getApproval: async (id: number): Promise<ApprovalRequest> => {
    const { data } = await axiosClient.get(`/hr/approvals/${id}`);
    return data;
  },
  createApproval: async (request: Partial<ApprovalRequest>): Promise<ApprovalRequest> => {
    const { data } = await axiosClient.post('/hr/approvals', request);
    return data;
  },
  processApproval: async (id: number, action: 'Approved' | 'Rejected' | 'Forwarded', comment: string): Promise<void> => {
    await axiosClient.post(`/hr/approvals/${id}/process`, { action, comment });
  }
};
