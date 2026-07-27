export enum ProjectStatus {
  Planning = 0,
  Active = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4
}

export interface Project {
  id: number;
  code: string;
  name: string;
  departmentId?: number;
  managerId?: number;
  budget: number;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface ProjectFinancials {
  projectId?: number;
  projectCode: string;
  budget: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  budgetRemaining: number;
  details: {
    salesCount: number;
    purchaseCount: number;
    voucherCount: number;
  };
}
