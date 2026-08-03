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

export interface WorkflowStepConfig {
  stepOrder: number;
  role: string;
  label: string;
}
export interface WorkflowConfig {
  formType: string;
  formLabel: string;
  steps: WorkflowStepConfig[];
}
export interface RoleOption {
  role: string;
  label: string;
}
export interface WorkflowOptions {
  workflows: WorkflowConfig[];
  availableRoles: RoleOption[];
}

export interface EmployeeSalary {
  id: number;
  name: string;
  departmentName?: string;
  jobTitle: string;
  baseSalary: number;
  hourlyRate: number;
}

export interface ApprovalReport {
  summary: {
    total: number; pending: number; approved: number; rejected: number;
    approvalRate: number; avgCycleHours: number | null;
  };
  byFormType: {
    formType: string; label: string; total: number; pending: number; approved: number;
    rejected: number; approvalRate: number; avgCycleHours: number | null;
  }[];
  byStage: { label: string; decided: number; avgDecideHours: number | null; pendingNow: number }[];
  stuck: {
    instanceId: number; formType: string; formLabel: string; documentId: number;
    currentLabel: string; stepOrder: number; totalSteps: number; ageHours: number;
  }[];
}

export interface PayrollLineItem {
  kind: string;        // "Addition" | "Deduction"
  category: string;    // 加班, 事假(無薪), 病假(半薪), 特休(全薪)...
  description: string;
  date: string;
  hours: number;
  rate: number;
  multiplier: number;
  amount: number;
}

export interface PayrollBreakdown {
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  baseSalary: number;
  hourlyRate: number;
  additions: PayrollLineItem[];
  deductions: PayrollLineItem[];
  totalAdditions: number;
  totalDeductions: number;
  netSalary: number;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  description?: string;
  type: string; // 'Announcement', 'Note'
  createdAt?: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  employee?: Employee;
  leaveType: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryStructure {
  id: number;
  employeeId: number;
  employee?: Employee;
  baseSalary: number;
  housingAllowance: number;
  mealAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  laborInsuranceDeduction: number;
  healthInsuranceDeduction: number;
  otherDeductions: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprovalStep {
  id: number;
  stepOrder: number;
  role: string;
  label: string;
  status: string; // Pending, Approved, Rejected, Skipped
  approverUserId?: number;
  decidedAt?: string;
  comment?: string;
}

export interface ApprovalInstance {
  id: number;
  formType: string;
  documentId: number;
  status: string; // Pending, Approved, Rejected
  currentStepOrder: number;
  createdAt?: string;
  completedAt?: string;
  steps: ApprovalStep[];
}

export interface BusinessTrip {
  id: number;
  employeeId: number;
  employee?: Employee;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  status: string; // Pending, Approved, Rejected, Completed
  approvedByUserId?: number;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface PurchaseRequest {
  id: number;
  employeeId: number;
  employee?: Employee;
  itemName: string;
  category: string; // 辦公用品 / 設備 / 軟體授權 / 其他
  quantity: number;
  estimatedCost: number;
  purpose: string;
  status: string; // Pending, Approved, Rejected, Completed
  approvedByUserId?: number;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface ExpenseClaim {
  id: number;
  employeeId: number;
  employee?: Employee;
  expenseType?: string; // Travel (差旅報支) or General (費用報銷)
  businessTripId?: number;
  businessTrip?: BusinessTrip;
  purchaseRequestId?: number;
  purchaseRequest?: PurchaseRequest;
  description: string;
  category: string;
  amount: number;
  receiptUrl?: string;
  status: string; // Pending, Approved, Rejected
  claimDate: string;
  processedDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HrParameterSetting {
  id: number;
  parameterName: string;
  parameterValue: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
