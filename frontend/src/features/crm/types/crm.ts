export interface Customer {
  id: number;
  name: string;
  type: string; // "B2B" | "B2C"
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  createdAt: string;
}

export interface SalesOpportunity {
  id: number;
  customerId: number;
  customer?: Customer;
  title: string;
  estimatedValue: number;
  stage: string; // "Requirement" | "Proposal" | "Contract" | "Execution" | "Review" | "Closed" | "Lost"
  expectedCloseDate: string | null;
  notes: string;
  createdAt: string;
}
