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
  departmentId?: number;
  department?: Department;
  jobTitle?: string;
  hireDate: string;
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

  createdAt: string;
  updatedAt?: string;
  educations?: Education[];
  experiences?: Experience[];
  jobHistories?: JobHistory[];
}
