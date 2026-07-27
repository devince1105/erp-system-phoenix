import axiosClient from "@/api/axiosClient";
import { Project } from "../types/project";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { accountingApi } from "@/features/accounting/api/accountingApi";

async function fetchApi<T>(url: string, options?: { method?: string; body?: string }): Promise<T> {
  const response = await axiosClient.request<T>({
    url,
    method: options?.method || "GET",
    data: options?.body ? JSON.parse(options.body) : undefined,
  });
  return response.data;
}

export const projectApi = {
  getProjects: () => fetchApi<Project[]>("/hr/projects"),
  getProject: (id: number) => fetchApi<Project>(`/hr/projects/${id}`),
  createProject: (data: Partial<Project>) => fetchApi<Project>("/hr/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: number, data: Partial<Project>) => fetchApi<void>(`/hr/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: number) => fetchApi<void>(`/hr/projects/${id}`, { method: "DELETE" }),

  getProjectFinancials: async (projectCode: string, budget: number = 0) => {
    try {
      const salesOrders = await inventoryApi.getSalesOrders(projectCode);
      const purchaseOrders = await inventoryApi.getPurchaseOrders(projectCode);
      const vouchers = await accountingApi.getVouchers(projectCode);

      const totalRevenue = salesOrders.reduce((acc, so) => acc + so.totalAmount, 0);
      const totalPurchases = purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
      const totalExpenses = vouchers.reduce((acc, v) => acc + v.totalAmount, 0);

      const totalCost = totalPurchases + totalExpenses;
      const profit = totalRevenue - totalCost;
      const budgetRemaining = budget - totalCost;

      return {
        projectCode,
        budget,
        totalRevenue,
        totalCost,
        profit,
        budgetRemaining,
        details: {
          salesCount: salesOrders.length,
          purchaseCount: purchaseOrders.length,
          voucherCount: vouchers.length
        }
      };
    } catch (e) {
      console.error("Failed to fetch project financials:", e);
      return null;
    }
  }
};
