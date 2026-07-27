export interface Warehouse {
  id: number;
  code: string;
  name: string;
  location?: string;
  manager?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryStock {
  id: number;
  productId: number;
  product?: Product;
  warehouseId: number;
  warehouse?: Warehouse;
  quantity: number;
  safetyStock: number;
  lastUpdated: string;
}

export interface Product {
  id: number;
  sku: string;
  serialNumber?: string;
  name: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt?: string;
}

export type PartnerType = 1 | 2; // 1: Customer, 2: Supplier

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  taxId?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type OrderStatus = 0 | 1 | 2; // 0: Draft, 1: Confirmed, 2: Cancelled

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: number;
  orderNo: string;
  orderDate: string;
  supplierId: number;
  supplier?: Partner;
  status: OrderStatus;
  totalAmount: number;
  memo?: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export interface SalesOrderItem {
  id: number;
  salesOrderId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalesOrder {
  id: number;
  orderNo: string;
  orderDate: string;
  customerId: number;
  customer?: Partner;
  status: OrderStatus;
  totalAmount: number;
  memo?: string;
  createdAt: string;
}

export interface BomItem {
  id?: number;
  bomId?: number;
  componentProductId: number;
  componentProduct?: Product;
  quantity: number;
  unit: string;
}

export interface Bom {
  id: number;
  productId: number;
  product?: Product;
  name: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  items: BomItem[];
}

export type WorkOrderStatus = 0 | 1 | 2 | 3; // 0: Draft, 1: InProgress, 2: Completed, 3: Cancelled

export interface WorkOrder {
  id: number;
  orderNo: string;
  productId: number;
  product?: Product;
  bomId: number;
  bom?: Bom;
  plannedQuantity: number;
  completedQuantity: number;
  status: WorkOrderStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

