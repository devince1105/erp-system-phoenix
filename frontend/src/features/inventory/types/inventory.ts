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
  receivedAt?: string;
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
  deliveredAt?: string;
  createdAt: string;
  items: SalesOrderItem[];
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WarehouseStock {
  id: number;
  warehouseId: number;
  warehouseCode?: string;
  warehouseName?: string;
  productId: number;
  productSku?: string;
  productName?: string;
  quantity: number;
  safetyStock: number;
  isLowStock?: boolean;
  updatedAt: string;
}

export interface StockMatrixWarehouse {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  isDefault: boolean;
  quantity: number;
  safetyStock: number;
  isLowStock: boolean;
}

export interface StockMatrixItem {
  productId: number;
  productSku: string;
  productName: string;
  serialNumber?: string;
  costPrice: number;
  unitPrice: number;
  productTotalStock: number;
  warehouseTotalStock: number;
  hasLowStockAlert: boolean;
  warehouses: StockMatrixWarehouse[];
}

export interface StockMatrixResponse {
  warehouses: { id: number; code: string; name: string; isDefault: boolean }[];
  totalProducts: number;
  items: StockMatrixItem[];
}

export type StockTransferStatus = 0 | 1 | 2; // 0: Draft, 1: Completed, 2: Cancelled

export interface StockTransferItem {
  id?: number;
  stockTransferId?: number;
  productId: number;
  product?: Product;
  quantity: number;
}

export interface StockTransfer {
  id: number;
  transferNo: string;
  fromWarehouseId: number;
  fromWarehouse?: Warehouse;
  toWarehouseId: number;
  toWarehouse?: Warehouse;
  transferDate: string;
  status: StockTransferStatus;
  remark?: string;
  createdAt: string;
  completedAt?: string;
  items: StockTransferItem[];
}

export interface CreateStockTransferPayload {
  fromWarehouseId: number;
  toWarehouseId: number;
  transferDate?: string;
  remark?: string;
  items: { productId: number; quantity: number }[];
}

