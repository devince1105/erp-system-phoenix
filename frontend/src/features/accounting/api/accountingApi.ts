import axiosClient from '@/api/axiosClient';

// --- Types ---

export interface AccountTitle {
  id: number;
  code: string;
  name: string;
  category: number; // 0=Asset, 1=Liability, 2=Equity, 3=Revenue, 4=Expense
  description?: string;
  isActive: boolean;
}

export interface BankAccount {
  id: number;
  bankCode: string;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  accountTitleId?: number;
  accountTitle?: AccountTitle;
  apiType: number;
  isActive: boolean;
  lastSyncedAt?: string;
}

export interface VoucherDetail {
  id: number;
  voucherId: number;
  seqNo: number;
  accountTitleId: number;
  accountTitle?: AccountTitle;
  isDebit: boolean;
  amount: number;
  summary?: string;
}

export interface Voucher {
  id: number;
  voucherNo: string;
  voucherDate: string;
  type: number; // 0=General, 1=Payment, 2=Receipt
  status: number; // 0=Draft, 1=Posted, 2=Voided
  totalAmount: number;
  memo?: string;
  createdAt: string;
  postedAt?: string;
  details: VoucherDetail[];
}

export interface CreateVoucherDto {
  voucherDate: string;
  type: number;
  memo?: string;
  details: {
    accountTitleId: number;
    isDebit: boolean;
    amount: number;
    summary?: string;
  }[];
}

export interface ReportItem {
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

// --- API Service ---

export const accountingApi = {
  // Account Titles
  getAccountTitles: async () => {
    const res = await axiosClient.get<AccountTitle[]>('/accounttitles');
    return res.data;
  },
  
  // Bank Accounts
  getBankAccounts: async () => {
    const res = await axiosClient.get<BankAccount[]>('/bankaccounts');
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

  // Reports
  getProfitAndLoss: async (startDate: string, endDate: string) => {
    const res = await axiosClient.get<ProfitAndLossReport>(`/reports/profit-and-loss?startDate=${startDate}&endDate=${endDate}`);
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
