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

## 推送紀錄

- 階段 1（`5508594`）於當下即以 `git push --force` 覆蓋遠端（歷史改寫後）。
- 階段 2–4 及本紀錄 commit（`898d7ef` … `7765313`）已推送至 `origin/main`。
- 確認同步：`git fetch` 後 `origin/main` == 本機 `HEAD` == `7765313`，工作區乾淨。
  - 註：先前 `git push` 曾回報「Everything up-to-date」，係因 filter-repo 重建 remote 後 remote-tracking ref 過期；`git fetch` 後確認遠端實際已含全部 commit。

## 階段 6 — 後端 nullable 警告清理（後續補做）

清除 HR 模組 14 個既有編譯警告：
- **CS8602**（8）：EF `ThenInclude` 鏈中 `Employee` 導覽屬性可為 null，改用 `e!.Department`（expression tree 內 null-forgiving，執行期無影響）— Attendances / Leaves / Overtimes / Payrolls。
- **CS8600**（2）：Departments / Employees 的 cache `TryGetValue` out 變數宣告為 nullable。
- **CS8618**（4）：`CalendarEvent` 的 required string 屬性初始化為 `string.Empty`。

**結果**：後端 `dotnet build` → **0 warnings, 0 errors**。
**commit**：`06645a5`

## 階段 7 — JWT 簽章金鑰硬編（深入安全檢視發現）

**問題（嚴重 / 認證繞過）**：`Program.cs` 與 `AuthController.GenerateJwtToken` 都以硬編字串 `nexus_erp_...` 作為 `Jwt:Key` 的 fallback。由於任何地方都未設定 `Jwt:Key`，系統實際使用這把**公開在原始碼（且已在 GitHub）**的金鑰簽發與驗證 JWT——任何看得到原始碼的人都能偽造任意使用者（含 Admin）的 token。

**處理**：
1. 兩處改為從設定讀取 `Jwt:Key`，缺少即 `throw`（fail-fast），永不再靜默使用弱金鑰。
2. 以 `openssl rand -base64 48` 產生強隨機金鑰，存入 dev user-secrets（`UserSecretsId=erp-phoenix-host`，不進 git）。正式環境須另行設定自己的金鑰。

**驗證**：後端啟動正常（金鑰讀到）；`POST /api/auth/login` 簽發 token；`/api/AccountTitles` 在有效 admin token → 200、無 token → 401、**偽造簽章 → 401**。
**commit**：`377be07`
**副作用**：換金鑰後，先前用舊金鑰簽的 token 全部失效（前端會出現 401，需重新登入）——此為預期行為，也證明舊 token 已無法使用。

## 階段 8 — 各系統 3 個月示範資料灌製（EF Seeder）

**需求**：模擬寫入近三個月（2026-05 ~ 07）各模組資料到 **Azure MS-SQL**。

**關鍵限制**：`SalesOrders`/`PurchaseOrders` 的 Create API 強制 `OrderDate = DateTime.UtcNow`，無法透過 API 產生歷史日期；`Vouchers`/`Attendance` 則吃傳入日期。因此改用 **EF Core seeder**（可控制歷史日期、尊重 schema、程式碼內確保傳票借貸平衡）。

**新增工具**：`backend/tools/ERP.Seeder`（console，沿用 `erp-phoenix-host` user-secrets 連線，不碰明文密碼；每模組 idempotent）。commit `6662389`、`992331f`。

**灌入量（散佈 5–7 月，API + 畫面雙重驗證）**：
- HR：7 部門、30 員工（SME 規模，含主管）、請假額度、~1,820 出勤、90 薪資、18 請假
- MDM：18 企業夥伴　Inventory：14 採購單 + 53 銷售單（沿用既有 partner）
- CRM：12 客戶、16 商機（跨階段）　Accounting：45 張平衡傳票（租金/水電/薪資/銷貨/進貨）

## 階段 9 — CRM API 修正 + Settings 功能移植

- **CRM api bug**（`4be722a`）：`crmApi` 原本硬編 `http://localhost:5001/api/crm` 且用原始 axios（不帶 JWT）→ 改用共用 `axiosClient`（吃 `NEXT_PUBLIC_API_URL` + auth interceptor）。
- **前端連線**：新增 `frontend/.env.local`（gitignore）指向後端 `:5000`（axiosClient 預設是 :5001)。
- **Settings 移植**（`890cb89`）：從 **Antigravity 分支 `feature/hr-payroll-and-settings`** 挑出純前端檔案移到 main（頁面權限 / 員工權限 / 職位級距 / 簽核流程 4 頁 + `utils/rbac.ts`），清到 main lint 標準（tsc/eslint 0），Sidebar 加子連結，四頁瀏覽器實測正常。
  - ⚠️ **該分支不可整包 merge**：它會把 Azure 密碼寫回 appsettings（`b518773`）、拿掉 `[Authorize]`（`ce5ec42`）、刪除本次資安/lint 修復。只能挑檔案移植。
  - 排錯備忘：Turbopack 曾對「先前 404 過、後來才新增」的路由（workflows）快取 404 → `rm -rf .next && pnpm dev` 解決。

## 尚待處理 / 建議（後續）

- ~~**CORS 過寬**（`AllowAnyOrigin`）~~ ✅ 已處理（階段 10，`6350917`）：改為 `Cors:AllowedOrigins` 白名單,預設本機開發來源,policy 更名 "AppCors"。正式環境請於設定填入真實網域。
- **舊金鑰與舊密碼仍存在於 git 歷史**：DB 密碼已於階段 1.4 清除；JWT 舊金鑰（`377be07` 之前）尚在歷史中，但換金鑰後已失效，風險低。若要徹底清除可再跑一次 `git filter-repo --replace-text`。
- **啟動時自動 migrate**（`Program.cs` 對六個 DbContext 呼叫 `Database.Migrate()`）：正式多實例環境建議改由部署流程執行 migration，避免併發衝突。
- 選配：再對傳票 / 庫存 / HR 等頁面做執行期點測（已完成主要流程）。
