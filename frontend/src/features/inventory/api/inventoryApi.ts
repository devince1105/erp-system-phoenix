import { Product, Partner, PurchaseOrder, SalesOrder, Warehouse, InventoryStock } from "../types/inventory";

import axiosClient from "@/api/axiosClient";

// Helper for API calls
async function fetchApi<T>(url: string, options?: { method?: string; body?: string }): Promise<T> {
  const response = await axiosClient.request<T>({
    url,
    method: options?.method || "GET",
    data: options?.body ? JSON.parse(options.body) : undefined,
  });
  return response.data;
}

export const inventoryApi = {
  // Products
  getProducts: () => fetchApi<Product[]>("/Products"),
  getProduct: (id: number) => fetchApi<Product>(`/Products/${id}`),
  createProduct: (data: Partial<Product>) => fetchApi<Product>("/Products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<Product>) => fetchApi<void>(`/Products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) => fetchApi<void>(`/Products/${id}`, { method: "DELETE" }),

  // Partners
  getPartners: (type?: number) => fetchApi<Partner[]>(type ? `/Partners?type=${type}` : "/Partners"),
  createPartner: (data: Partial<Partner>) => fetchApi<Partner>("/Partners", { method: "POST", body: JSON.stringify(data) }),
  updatePartner: (id: number, data: Partial<Partner>) => fetchApi<void>(`/Partners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePartner: (id: number) => fetchApi<void>(`/Partners/${id}`, { method: "DELETE" }),

  // Sales Orders
  getSalesOrders: (projectCode?: string) => fetchApi<SalesOrder[]>(projectCode ? `/SalesOrders?projectCode=${projectCode}` : "/SalesOrders"),
  getSalesOrder: (id: number) => fetchApi<SalesOrder>(`/SalesOrders/${id}`),
  createSalesOrder: (data: Partial<SalesOrder>) => fetchApi<SalesOrder>("/SalesOrders", { method: "POST", body: JSON.stringify(data) }),
  updateSalesOrder: (id: number, data: Partial<SalesOrder>) => fetchApi<void>(`/SalesOrders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSalesOrder: (id: number) => fetchApi<void>(`/SalesOrders/${id}`, { method: "DELETE" }),
  confirmSalesOrder: (id: number) => fetchApi<SalesOrder>(`/SalesOrders/${id}/confirm`, { method: "POST" }),

  // Purchase Orders
  getPurchaseOrders: (projectCode?: string) => fetchApi<PurchaseOrder[]>(projectCode ? `/PurchaseOrders?projectCode=${projectCode}` : "/PurchaseOrders"),
  getPurchaseOrder: (id: number) => fetchApi<PurchaseOrder>(`/PurchaseOrders/${id}`),
  createPurchaseOrder: (data: Partial<PurchaseOrder>) => fetchApi<PurchaseOrder>("/PurchaseOrders", { method: "POST", body: JSON.stringify(data) }),
  updatePurchaseOrder: (id: number, data: Partial<PurchaseOrder>) => fetchApi<void>(`/PurchaseOrders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePurchaseOrder: (id: number) => fetchApi<void>(`/PurchaseOrders/${id}`, { method: "DELETE" }),
  confirmPurchaseOrder: (id: number) => fetchApi<PurchaseOrder>(`/PurchaseOrders/${id}/confirm`, { method: "POST" }),

  // Warehouses
  getWarehouses: () => fetchApi<Warehouse[]>("/Warehouses"),
  getWarehouse: (id: number) => fetchApi<Warehouse>(`/Warehouses/${id}`),
  createWarehouse: (data: Partial<Warehouse>) => fetchApi<Warehouse>("/Warehouses", { method: "POST", body: JSON.stringify(data) }),
  updateWarehouse: (id: number, data: Partial<Warehouse>) => fetchApi<void>(`/Warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWarehouse: (id: number) => fetchApi<void>(`/Warehouses/${id}`, { method: "DELETE" }),
  getWarehouseStocks: (id: number) => fetchApi<InventoryStock[]>(`/Warehouses/${id}/stocks`),
};
