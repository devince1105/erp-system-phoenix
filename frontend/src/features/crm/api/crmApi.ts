import axiosClient from '@/api/axiosClient';
import { Customer, SalesOpportunity } from '../types/crm';

export const crmApi = {
  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const { data } = await axiosClient.get(`/crm/customers`);
    return data;
  },
  
  getCustomer: async (id: number): Promise<Customer> => {
    const { data } = await axiosClient.get(`/crm/customers/${id}`);
    return data;
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    const { data } = await axiosClient.post(`/crm/customers`, customer);
    return data;
  },

  updateCustomer: async (id: number, customer: Omit<Customer, 'id' | 'createdAt'>): Promise<void> => {
    await axiosClient.put(`/crm/customers/${id}`, { ...customer, id });
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await axiosClient.delete(`/crm/customers/${id}`);
  },

  // Opportunities
  getOpportunities: async (): Promise<SalesOpportunity[]> => {
    const { data } = await axiosClient.get(`/crm/opportunities`);
    return data;
  },

  createOpportunity: async (opportunity: Omit<SalesOpportunity, 'id' | 'createdAt' | 'customer'>): Promise<SalesOpportunity> => {
    const { data } = await axiosClient.post(`/crm/opportunities`, opportunity);
    return data;
  },

  updateOpportunityStage: async (id: number, stage: string): Promise<void> => {
    await axiosClient.patch(`/crm/opportunities/${id}/stage`, `"${stage}"`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
