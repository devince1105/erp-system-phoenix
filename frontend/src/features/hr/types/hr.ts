export interface Department {
  id: number;
  name: string;
  managerId?: number;
  manager?: Employee;
  createdAt: string;
  updatedAt?: string;
}

export type EmployeeStatus = 1 | 2 | 3; // 1: Active, 2: OnLeave, 3: Terminated

export interface Education {
  id?: number;
  schoolName: string;
  degree?: string;
  major?: string;
  startDate: string;
  endDate?: string;
}

export interface Experience {
  id?: number;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface JobHistory {
  id?: number;
  departmentId?: number;
  department?: Department;
  jobTitle: string;
  startDate: string;
  endDate?: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  status: EmployeeStatus;

  // --- Personal & Contact Info ---
  phone?: string;
  mobile?: string;
  lineId?: string;
  registeredAddress?: string;
  contactAddress?: string;
  dateOfBirth?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  departmentId?: number;
  department?: Department;
  jobTitle: string;
  baseSalary: number;
  hireDate: string;

  createdAt: string;
  updatedAt?: string;
  educations?: Education[];
  experiences?: Experience[];
  jobHistories?: JobHistory[];
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employee?: Employee;
  date: string;
  checkInTime: string | null;
  breakOutTime: string | null;
  breakInTime: string | null;
  checkOutTime: string | null;
  status: string; // Present, Absent, Late, Leave
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employee?: Employee;
  leaveType: string; // Annual, Sick, Personal, Official
  startDate: string;
  endDate: string;
  reason: string;
  status: string; // Pending, Approved, Rejected
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimeRequest {
  id: number;
  employeeId: number;
  employee?: Employee;
  date: string;
  hours: number;
  reason: string;
  status: string; // Pending, Approved, Rejected
  createdAt?: string;
  updatedAt?: string;
}



export interface PayrollRecord {
  id: number;
  employeeId: number;
  employee?: Employee;
  year: number;
  month: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paymentDate?: string;
  status: string; // Draft, Processed, Paid
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  description?: string;
  type: string; // 'Announcement', 'Note'
  createdAt?: string;
}
