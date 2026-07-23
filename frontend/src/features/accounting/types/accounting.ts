export enum AccountCategory {
  Asset = 1,      // 資產
  Liability = 2,  // 負債
  Equity = 3,     // 權益
  Revenue = 4,    // 收入
  Expense = 5     // 費用
}

export interface AccountTitle {
  id: number;
  code: string;
  name: string;
  category: AccountCategory;
  level: number;
  parentId?: number | null;
  isActive: boolean;
  createdAt: string;
}

export enum VoucherType {
  General = 1,    // 轉帳分錄
  CashIn = 2,     // 現金收入
  CashOut = 3     // 現金支出
}

export enum VoucherStatus {
  Draft = 1,      // 草稿
  Approved = 2,   // 已審核
  Posted = 3      // 已過帳
}

export interface VoucherDetail {
  id?: number;
  voucherId?: number;
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
  type: VoucherType;
  status: VoucherStatus;
  totalAmount: number;
  memo?: string;
  createdAt: string;
  details: VoucherDetail[];
}

export interface CreateVoucherPayload {
  voucherDate: string;
  type: VoucherType;
  memo?: string;
  details: {
    accountTitleId: number;
    isDebit: boolean;
    amount: number;
    summary?: string;
  }[];
}

export enum BankApiIntegrationType {
  None = 0,               // 未串接 (人工對帳)
  MockBankApi = 1,        // 模擬測試 API (沙盒 Sandbox)
  OpenBankingFWI = 2,     // 財金 Open Banking API
  DirectWebAPI = 3        // 銀行直連 Web API
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
  apiType: BankApiIntegrationType;
  apiEndpoint?: string;
  apiClientId?: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface CreateBankAccountPayload {
  bankCode: string;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  accountTitleId?: number;
  apiType: BankApiIntegrationType;
  apiEndpoint?: string;
  apiClientId?: string;
}
