import axiosClient from '@/api/axiosClient';

import { 
  AccountTitle, 
  BankAccount, 
  VoucherDetail, 
  Voucher, 
  CreateVoucherPayload as CreateVoucherDto 
} from '../types/accounting';

export type { AccountTitle, BankAccount, VoucherDetail, Voucher, CreateVoucherDto };

export interface ReportItem {
  code?: string;
  title: string;
  amount: number;
}

export interface ProfitAndLossReport {
  startDate: string;
  endDate: string;
  revenues: ReportItem[];
  expenses: ReportItem[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: ReportItem[];
  liabilities: ReportItem[];
  equity: ReportItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowReport {
  startDate: string;
  endDate: string;
  netIncome: number;
  operating: { addbacks: ReportItem[]; workingCapital: ReportItem[]; total: number };
  investing: { items: ReportItem[]; total: number };
  financing: { items: ReportItem[]; total: number };
  netChange: number;
  openingCash: number;
  endingCash: number;
  reconciles: boolean;
  cashMovementCheck: number;
}

// --- API Service ---

export const accountingApi = {
  // Account Titles
  getAccountTitles: async () => {
    const res = await axiosClient.get<AccountTitle[]>('/accounttitles');
    return res.data;
  },
  createAccountTitle: async (data: Partial<AccountTitle>) => {
    const res = await axiosClient.post<AccountTitle>('/accounttitles', data);
    return res.data;
  },
  updateAccountTitle: async (id: number, data: Partial<AccountTitle>) => {
    const res = await axiosClient.put(`/accounttitles/${id}`, data);
    return res.data;
  },
  deleteAccountTitle: async (id: number) => {
    const res = await axiosClient.delete(`/accounttitles/${id}`);
    return res.data;
  },
  
  // Bank Accounts
  getBankAccounts: async () => {
    const res = await axiosClient.get<BankAccount[]>('/bankaccounts');
    return res.data;
  },
  createBankAccount: async (data: Partial<BankAccount>) => {
    const res = await axiosClient.post<BankAccount>('/bankaccounts', data);
    return res.data;
  },
  updateBankAccount: async (id: number, data: Partial<BankAccount>) => {
    const res = await axiosClient.put(`/bankaccounts/${id}`, data);
    return res.data;
  },
  syncBankAccount: async (id: number) => {
    const res = await axiosClient.post(`/bankaccounts/${id}/sync`);
    return res.data;
  },
  
  // Vouchers
  getVouchers: async () => {
    const res = await axiosClient.get<Voucher[]>('/vouchers');
    return res.data;
  },
  getVoucher: async (id: number) => {
    const res = await axiosClient.get<Voucher>(`/vouchers/${id}`);
    return res.data;
  },
  // Upload a supporting-document image/PDF (憑證); returns the stored file URL.
  uploadAttachment: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await axiosClient.post<{ url: string }>('/attachments/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },
  createVoucher: async (data: CreateVoucherDto) => {
    const res = await axiosClient.post<Voucher>('/vouchers', data);
    return res.data;
  },
  updateVoucher: async (id: number, data: CreateVoucherDto) => {
    const res = await axiosClient.put(`/vouchers/${id}`, data);
    return res.data;
  },
  deleteVoucher: async (id: number) => {
    const res = await axiosClient.delete(`/vouchers/${id}`);
    return res.data;
  },
  postVoucher: async (id: number) => {
    const res = await axiosClient.post(`/vouchers/${id}/post`);
    return res.data;
  },

  // Reports
  getProfitAndLoss: async (startDate: string, endDate: string) => {
    const res = await axiosClient.get<ProfitAndLossReport>(`/reports/profit-and-loss?startDate=${startDate}&endDate=${endDate}`);
    return res.data;
  },
  getCashFlow: async (startDate: string, endDate: string) => {
    const res = await axiosClient.get<CashFlowReport>(`/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`);
    return res.data;
  },
  getBalanceSheet: async (asOfDate: string) => {
    const res = await axiosClient.get<BalanceSheetReport>(`/reports/balance-sheet?asOfDate=${asOfDate}`);
    return res.data;
  },

  // Settings
  getClosingDate: async () => {
    const res = await axiosClient.get<string>('/settings/closing-date');
    return res.data;
  },
  setClosingDate: async (date: string) => {
    const res = await axiosClient.post('/settings/closing-date', `"${date}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  },
  getCompanyName: async () => {
    const res = await axiosClient.get<string>('/settings/company-name');
    return res.data;
  },
  setCompanyName: async (name: string) => {
    const res = await axiosClient.post('/settings/company-name', `"${name}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  }
};
