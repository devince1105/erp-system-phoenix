import axiosClient from '@/api/axiosClient';
import { Employee, Department } from '../types/hr';

export const hrApi = {
  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const { data } = await axiosClient.get('/hr/departments');
    return data;
  },

  getDepartment: async (id: number): Promise<Department> => {
    const { data } = await axiosClient.get(`/hr/departments/${id}`);
    return data;
  },

  createDepartment: async (department: Partial<Department>): Promise<Department> => {
    const { data } = await axiosClient.post('/hr/departments', department);
    return data;
  },

  updateDepartment: async (id: number, department: Partial<Department>): Promise<void> => {
    await axiosClient.put(`/hr/departments/${id}`, department);
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/departments/${id}`);
  },

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const { data } = await axiosClient.get('/hr/employees');
    return data;
  },

  getEmployee: async (id: number): Promise<Employee> => {
    const { data } = await axiosClient.get(`/hr/employees/${id}`);
    return data;
  },

  createEmployee: async (employee: Partial<Employee>): Promise<Employee> => {
    const { data } = await axiosClient.post('/hr/employees', employee);
    return data;
  },

  updateEmployee: async (id: number, employee: Partial<Employee>): Promise<void> => {
    await axiosClient.put(`/hr/employees/${id}`, employee);
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await axiosClient.delete(`/hr/employees/${id}`);
  },
};
