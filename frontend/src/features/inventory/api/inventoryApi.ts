import { Product, Partner, PurchaseOrder, SalesOrder } from "../types/inventory";

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

  // Sales Orders
  getSalesOrders: () => fetchApi<SalesOrder[]>("/SalesOrders"),
  getSalesOrder: (id: number) => fetchApi<SalesOrder>(`/SalesOrders/${id}`),
  createSalesOrder: (data: Partial<SalesOrder>) => fetchApi<SalesOrder>("/SalesOrders", { method: "POST", body: JSON.stringify(data) }),
  confirmSalesOrder: (id: number) => fetchApi<SalesOrder>(`/SalesOrders/${id}/confirm`, { method: "POST" }),

  // Purchase Orders
  getPurchaseOrders: () => fetchApi<PurchaseOrder[]>("/PurchaseOrders"),
  getPurchaseOrder: (id: number) => fetchApi<PurchaseOrder>(`/PurchaseOrders/${id}`),
  createPurchaseOrder: (data: Partial<PurchaseOrder>) => fetchApi<PurchaseOrder>("/PurchaseOrders", { method: "POST", body: JSON.stringify(data) }),
  confirmPurchaseOrder: (id: number) => fetchApi<PurchaseOrder>(`/PurchaseOrders/${id}/confirm`, { method: "POST" }),
};
