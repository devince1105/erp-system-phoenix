import axios from 'axios';
import { Customer, SalesOpportunity } from '../types/crm';

const API_URL = 'http://localhost:5001/api/crm';

export const crmApi = {
  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const { data } = await axios.get(`${API_URL}/customers`);
    return data;
  },
  
  getCustomer: async (id: number): Promise<Customer> => {
    const { data } = await axios.get(`${API_URL}/customers/${id}`);
    return data;
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    const { data } = await axios.post(`${API_URL}/customers`, customer);
    return data;
  },

  updateCustomer: async (id: number, customer: Omit<Customer, 'id' | 'createdAt'>): Promise<void> => {
    await axios.put(`${API_URL}/customers/${id}`, { ...customer, id });
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/customers/${id}`);
  },

  // Opportunities
  getOpportunities: async (): Promise<SalesOpportunity[]> => {
    const { data } = await axios.get(`${API_URL}/opportunities`);
    return data;
  },

  createOpportunity: async (opportunity: Omit<SalesOpportunity, 'id' | 'createdAt' | 'customer'>): Promise<SalesOpportunity> => {
    const { data } = await axios.post(`${API_URL}/opportunities`, opportunity);
    return data;
  },

  updateOpportunityStage: async (id: number, stage: string): Promise<void> => {
    await axios.patch(`${API_URL}/opportunities/${id}/stage`, `"${stage}"`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
