import { AccountTitle, AccountCategory, Voucher, CreateVoucherPayload, BankAccount, BankApiIntegrationType, CreateBankAccountPayload } from "@/features/accounting/types/accounting";
import axiosClient from "@/api/axiosClient";
import { getApiErrorMessage } from "@/utils/apiError";

export async function fetchAccountTitles(category?: AccountCategory): Promise<AccountTitle[]> {
  try {
    const url = category 
      ? `/AccountTitles?category=${category}`
      : `/AccountTitles`;
    
    const res = await axiosClient.get(url);
    return res.data;
  } catch (err) {
    console.warn("Backend API fetch failed, using fallback/demo data:", err);
    return getFallbackAccountTitles();
  }
}

export async function fetchVouchers(): Promise<Voucher[]> {
  try {
    const res = await axiosClient.get("/Vouchers");
    return res.data;
  } catch (err) {
    console.warn("Backend API fetch failed for vouchers:", err);
    return getFallbackVouchers();
  }
}

export async function createVoucher(payload: CreateVoucherPayload): Promise<{ success: boolean; data?: Voucher; error?: string }> {
  try {
    const res = await axiosClient.post("/Vouchers", payload);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "建立連線失敗") };
  }
}

export async function updateVoucher(id: number, payload: CreateVoucherPayload): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosClient.put(`/Vouchers/${id}`, payload);
    return { success: true };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "修改連線失敗") };
  }
}

export async function deleteVoucher(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosClient.delete(`/Vouchers/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "刪除連線失敗") };
  }
}

export async function postVoucher(id: number): Promise<{ success: boolean; data?: Voucher; error?: string }> {
  try {
    const res = await axiosClient.post(`/Vouchers/${id}/post`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "過帳連線失敗") };
  }
}

// Bank Account APIs
export async function fetchBankAccounts(): Promise<BankAccount[]> {
  try {
    const res = await axiosClient.get("/BankAccounts");
    return res.data;
  } catch (err) {
    console.warn("Backend API fetch failed for bank accounts:", err);
    return getFallbackBankAccounts();
  }
}

export async function createBankAccount(payload: CreateBankAccountPayload): Promise<{ success: boolean; data?: BankAccount; error?: string }> {
  try {
    const res = await axiosClient.post("/BankAccounts", payload);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "無法連線至 API") };
  }
}

export async function updateBankAccount(id: number, payload: CreateBankAccountPayload): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosClient.put(`/BankAccounts/${id}`, payload);
    return { success: true };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "連線失敗") };
  }
}

export async function syncBankAccountApi(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await axiosClient.post(`/BankAccounts/${id}/sync`);
    return { success: true, message: res.data?.message || "同步成功" };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "連線失敗") };
  }
}

export async function deleteBankAccount(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosClient.delete(`/BankAccounts/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err, "刪除失敗") };
  }
}

function getFallbackBankAccounts(): BankAccount[] {
  return [
    {
      id: 1,
      bankCode: "808",
      bankName: "玉山銀行",
      branchName: "營業部",
      accountNumber: "0808-988-123456",
      accountName: "○○企業股份有限公司",
      currency: "TWD",
      balance: 1280500,
      accountTitleId: 2,
      apiType: BankApiIntegrationType.OpenBankingFWI,
      apiEndpoint: "https://api.esunbank.com.tw/open-banking/v1",
      apiClientId: "ESUN_ERP_CLIENT_2026",
      isActive: true,
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      bankCode: "013",
      bankName: "國泰世華銀行",
      branchName: "敦南分行",
      accountNumber: "0130-100-888999",
      accountName: "○○企業股份有限公司",
      currency: "TWD",
      balance: 650000,
      accountTitleId: 2,
      apiType: BankApiIntegrationType.MockBankApi,
      apiEndpoint: "https://sandbox.cathaybk.com.tw/v1",
      apiClientId: "CATHAY_SANDBOX_KEY",
      isActive: true,
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];
}

// Demo fallback data when backend is starting or offline
function getFallbackAccountTitles(): AccountTitle[] {
  return [
    { id: 1, code: "1101", name: "現金及約當現金", category: AccountCategory.Asset, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 2, code: "1102", name: "銀行存款", category: AccountCategory.Asset, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 3, code: "1103", name: "應收帳款", category: AccountCategory.Asset, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 4, code: "1104", name: "存貨", category: AccountCategory.Asset, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 6, code: "2101", name: "應付帳款", category: AccountCategory.Liability, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 7, code: "2102", name: "應付薪資", category: AccountCategory.Liability, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 10, code: "3101", name: "普通股股本", category: AccountCategory.Equity, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 12, code: "4101", name: "銷貨收入", category: AccountCategory.Revenue, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 15, code: "6101", name: "薪資支出", category: AccountCategory.Expense, level: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 16, code: "6201", name: "租金支出", category: AccountCategory.Expense, level: 1, isActive: true, createdAt: new Date().toISOString() }
  ];
}

function getFallbackVouchers(): Voucher[] {
  return [
    {
      id: 1,
      voucherNo: "V20260722001",
      voucherDate: new Date().toISOString().split("T")[0],
      type: 1,
      status: 1,
      totalAmount: 1000,
      memo: "7月銷貨收入傳票",
      createdAt: new Date().toISOString(),
      details: [
        { id: 1, voucherId: 1, seqNo: 1, accountTitleId: 1, accountTitle: { id: 1, code: "1101", name: "現金及約當現金", category: 1, level: 1, isActive: true, createdAt: "" }, isDebit: true, amount: 1000, summary: "收到客戶現金" },
        { id: 2, voucherId: 1, seqNo: 2, accountTitleId: 12, accountTitle: { id: 12, code: "4101", name: "銷貨收入", category: 4, level: 1, isActive: true, createdAt: "" }, isDebit: false, amount: 1000, summary: "銷售商品" }
      ]
    }
  ];
}
