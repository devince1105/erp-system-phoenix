import { Product, Partner, PurchaseOrder, SalesOrder } from "../types/inventory";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Helper for API calls
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `API Error: ${response.status}`);
  }
  return response.status !== 204 ? response.json() : (null as T);
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
