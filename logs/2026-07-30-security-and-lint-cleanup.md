# 開發進度紀錄 — 2026-07-30

**主題**：專案健康檢查、機密外洩處理、相依套件漏洞修補、前端 Lint 全面清理
**分支**：`main`
**起始 commit**：`9f1630e`　**結束 commit**：`1d863fc`

---

## 摘要

對 ERP Phoenix（.NET 10 後端 + Next.js 16 前端 + MS-SQL）做整體檢查後，依嚴重程度分五個階段處理。最終：

- 前端 ESLint **0 問題**、`tsc` **0 錯誤**（起始為 164 個 lint 問題）。
- 後端 `dotnet build` **0 錯誤**，已知高風險相依漏洞已消除。
- 洩漏的資料庫密碼已輪替、移出設定檔並從 git 歷史清除。
- 執行期煙霧測試（登入 / 儀表板 / 報表 / 列表 / Modal）全數通過。

---

## 階段 1 — 機密外洩處理（最優先）

**問題**：`backend/src/ERP.Host/appsettings.Development.json` 自初始 commit 起即含一組明文 Azure SQL 正式密碼，且該檔被 git 追蹤並已推上 GitHub。

**處理**：
1. 使用者於 Azure Portal 輪替 `sqladmin` 密碼（SQL logical server → 重設密碼）。
2. 將 `appsettings.Development.json` 連線字串改為佔位符範本。
3. `ERP.Host.csproj` 加入 `<UserSecretsId>`，改用 .NET user-secrets 載入真實連線字串（Development 環境自動載入，`Program.cs` 免改）。
4. 以 `git filter-repo --replace-text` 改寫全部歷史，將舊密碼字串替換為 `***REMOVED-CREDENTIAL***`（26 個 commit 重寫）。
5. 重新加回 `origin` 並 `git push --force` 覆蓋遠端。

**commit**：`5508594`（已推送）
**備註**：`.env`（含舊 Azure 密碼）從未被 git 追蹤；輪替後其值已失效。備份 bundle 存於 scratchpad。

---

## 階段 2 — 相依套件高風險漏洞

**問題**：HR / MDM / CRM 三模組透過老套件 `Microsoft.AspNetCore.Mvc.Core 2.3.11` 間接引入 `Newtonsoft.Json 9.0.1`（NU1903，高風險）。

**處理**：將該套件替換為 `<FrameworkReference Include="Microsoft.AspNetCore.App" />`（與 Accounting / Inventory 模組一致），MVC 型別改由 .NET 10 shared framework 提供，順帶移除冗餘的 `Microsoft.AspNetCore.Authorization` 明示引用。

**結果**：NU1903 = 0，Newtonsoft.Json 已從三模組相依圖移除。
**commit**：`898d7ef`

---

## 階段 3 — 清理殘留檔案

刪除開發用的臨時 BCrypt 腳本 `backend/test_bcrypt.cs` 與 `backend/HashGen/`（未被 `ERP.slnx` 引用、不在任何模組編譯範圍）。

**commit**：`bc65036`

---

## 階段 4 — 前端 ESLint 全面清理（164 → 0）

依 React 19 / eslint-config-next 規則分三批處理。

### 4a — react-hooks（約 40 個）　commit `dd0cf3c`
- **資料載入頁**：fetch 函式改 `useCallback` 並列入 effect deps（解 immutability / exhaustive-deps）；state 更新移入 `.then()` callback，避免 effect 內同步 `setState`（解 set-state-in-effect）。
- **水合守衛**：新增共用 hook `src/utils/useHydrated.ts`（`useSyncExternalStore`），取代 `useState(false)+useEffect(setMounted)`（FinancialCharts、CRM/HR/Inventory 儀表板、ThemeToggle）。
- **Modal 表單重置**：改用 React 官方「render 期間比對前值」模式，以 `openKey`（開啟狀態 + 編輯對象 id）判斷是否重置（11 個 Modal）。
- **EmployeeModal**：以 `useState(() => Date.now())` 固定 now，消除 render 期間的 `Date.now()` 不純呼叫。
- **AuthContext**：localStorage 掛載讀取保留 effect（避免 SSR mismatch），以單行具註解的 `eslint-disable` 標注。

### 4b — no-unused-vars（85 個）　commit `46405b5`
移除未使用的 lucide-react 圖示 import、型別 import、殘留的 `totalPages` 區域變數、未使用的 map index 與解構欄位，並將 6 個空的 `catch (error)` 改為 optional catch。無行為變更。

### 4c — no-explicit-any（40 個）　commit `1d863fc`
- 新增 `src/utils/apiError.ts` 的 `getApiErrorMessage(err: unknown)`，統一取代所有 `catch (err: any)` 的錯誤訊息擷取。
- 傳票 / 員工 Modal 的欄位更新函式改泛型 `<K extends keyof T>`，維持型別安全。
- recharts tooltip formatter 改由 `Formatter` 型別自動推導（不再標 `any`）；兩處貨幣 formatter 以 `Number(value)` 防護（ValueType 可能 undefined）。
- 報表 render 輔助函式、圖表資料 state、Excel 匯出參數補上型別；bank payload 轉為 `Partial<BankAccount>`；移除空的 `NavbarProps` interface。

---

## 階段 5 — 收尾驗證

- **靜態**：前端 `eslint . ` → 0 問題；`tsc --noEmit` → 0 錯誤；後端 `dotnet build` → 0 錯誤（14 個既有 nullable/CS 警告，非本次範圍）。
- **執行期煙霧測試**（後端 :5000 + 前端 :3000）：
  - 登入 → 重導儀表板：`POST /api/auth/login` 200 OK。
  - 儀表板 FinancialCharts 正常出圖（`useHydrated` 運作正常）。
  - 資產負債表掛載即自動載入報表。
  - 會計科目列表資料正常。
  - 新增 Modal 為空白預設；編輯 Modal 正確帶入該筆資料（render-guard 的 `openKey` 切換驗證通過）。

---

## 行為變更備註（供後續注意）

- **報表頁**（資產負債表 / 損益表）：改日期後現在會**自動重查**（原本為手動按鈕，按鈕仍可用）。
- **資料頁重新整理**：不再閃 loading spinner（初次載入仍有），因移除了 effect 內同步 `setState`。
- **Modal 表單重置**：由 `[isOpen, initialData]` 改為以 `openKey`（`isOpen` + `initialData?.id`）判斷；同 id 但物件參考變更時不再重置（避免覆蓋使用者編輯）。

## 新增檔案

- `frontend/src/utils/useHydrated.ts` — SSR 水合守衛 hook。
- `frontend/src/utils/apiError.ts` — 統一 API 錯誤訊息擷取。

## 待辦

- 階段 2–4 的 5 個 commit（`898d7ef` … `1d863fc`）尚未推送：`git push origin main`。
- 後端 14 個既有 nullable/CS 警告尚未處理（非本次範圍）。
