# 開發進度紀錄 — 2026-07-30

**主題**：專案健康檢查、機密外洩處理、相依套件漏洞修補、前端 Lint 全面清理
**分支**：`main`
**起始 commit**：`9f1630e`　**結束 commit**：`28a9477`（階段 13–16 於 2026-07-31、階段 17–20 於 2026-08-01、階段 21–22 於 2026-08-02 續補）

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

## 階段 11 — 差旅報支系統（出差申請 → 差旅報支）

**需求**：差旅報支應對應「出差申請單」——出差不強制先申請，但**關聯已核准的出差單**時視為預先授權、較易過審。

**後端**（`00805ee`）：
- 新增 `BusinessTrip`（出差申請單）實體 + `BusinessTripsController`（CRUD + 核准/駁回，`/api/hr/BusinessTrips`，`[Authorize]`）。
- `ExpenseClaim` 加**選填** `BusinessTripId` FK（可獨立報支,也可掛核准出差單）。
- EF migration `AddBusinessTrips`（BusinessTrips 表 + nullable FK + index），啟動時自動套用到 Azure,API 實測 `POST → 201`。

**前端**（`d800daf`）：
- `/hr/business-trips`：出差申請/列表/核准（摘要卡 + 天數計算）。
- `/hr/expenses`：差旅報支（類別 交通/住宿/餐費/雜支）+ 核准/駁回 + **關聯出差單選單**（只列該員工已核准的出差單）+ 預先授權提示。
- `hrApi` + 型別新增 `BusinessTrip`、`ExpenseClaim.businessTripId`；Sidebar 加「出差申請」「差旅報支」。

**端到端驗證**（瀏覽器）：建出差單 → 核准 → 建關聯報支（顯示「已預先授權」）→ 列表顯示。tsc/eslint 0。

**日後可強化**：出差單多筆明細（交通/住宿/餐費拆行）、收據檔案上傳、關聯已核准出差單時自動預核。

**注意事項**：`dotnet ef` 工具因 `dotnet-tools.json` 放在非標準路徑（應為 `.config/dotnet-tools.json`）而無法用 manifest 解析,本次改以全域安裝 `dotnet-ef` 建 migration。

## 階段 12 — 通用簽核流程系統（簽核實例引擎）

**需求**：所有需簽核的單據不該在列表 Row 直接核准/駁回,而是**點進明細**查看後判決;判決依 `/settings/workflows` 設定的**表單類型**逐級跑給不同層級簽核,且申請人能看到**目前卡在哪一關**。

**後端引擎**（`56dc6e7`）：
- `ApprovalInstance`（簽核實例,每張單一份:FormType、DocumentId、Status、CurrentStepOrder）+ `ApprovalStep`（關卡:順序、角色、狀態、簽核人、時間、意見）。
- `ApprovalService`：`WorkflowDefinitions` 流程定義（BusinessTrip / ExpenseClaim / Leave / Purchase,對應 `/settings/workflows`）、`CreateAsync`（送單自動展開關卡）、`DecideAsync`（核准/駁回當前關卡並推進,完成時同步單據狀態）。
- `ApprovalsController`：`GET /api/hr/Approvals/{formType}/{documentId}`、`POST /{id}/decide`。
- BusinessTrip / ExpenseClaim 建立時自動起單;migration `AddApprovalInstances`（已套用 Azure）。
- `/settings/workflows` 補上「出差申請單」「差旅報支單」表單類型,與後端 registry 一致。

**前端**（`d371df0` 出差、`eb9d9f7` 報支）：
- `ApprovalFlow` 可重用 stepper（compact 給列表、full 給明細）,highlight「審核中」關卡。
- 出差申請 + 差旅報支:Row 改「檢視」→ 明細顯示單據 + 完整流程 stepper + **在明細內**核准/駁回(含意見);列表顯示精簡流程指示「待○○簽核 (n/m)」。移除 Row 直接簽核。
- `hrApi.getApproval / decideApproval` + `ApprovalInstance/Step` 型別。

**端到端驗證**（瀏覽器）：建出差單 → 列表「待直屬主管簽核 (0/2)」→ 檢視 → 核准第 1 關(填意見)→ stepper 第 1 關轉綠、自動進第 2 關「部門主管 審核中」、意見記錄。tsc/eslint 0。

**尚可強化**：嚴格角色控管（目前 admin 皆可簽,待接組織/職級）、流程設定持久化（settings 目前 mockup + 後端 registry,編輯未儲存）、套用到請假/採購頁、引擎前的舊單據無實例。

## 階段 13 — 收據影像上傳（可插拔儲存）〔2026-07-31〕

**需求**：差旅／費用報支要能附上收據影像(高鐵票、發票、收據),明細可檢視。

**後端**（`aa778e1`）：
- `IReceiptStorage` 介面 + 兩種實作:`LocalReceiptStorage`（存 `wwwroot/receipts`,開發用）與 Cloudflare R2（AWSSDK.S3,正式用）,以設定切換。
- `ReceiptsController`：`POST /api/hr/receipts/upload`（multipart)→ 回傳檔案 URL。`ExpenseClaim.ReceiptUrl` 存連結。
- 由 `DotNetEnv` 載入 `.env`（R2 金鑰等機密由使用者自管,不進 git)。

**前端**：報支明細/表單可上傳並顯示縮圖(`<img>` 以 eslint-disable 標註)。

**排錯備忘**：上傳後收據 404 —— `UseStaticFiles()` 預設服務路徑與實際存檔位置不符(啟動時 `wwwroot` 不存在→`WebRootPath` 為 null)。改用明確 `PhysicalFileProvider` 指向 `ContentRootPath/wwwroot` 解決。

## 階段 14 — 費用拆分：差旅報支 vs 費用報銷〔2026-07-31〕

**需求**：報支分兩類——**差旅報支**(有出差)與**費用報銷**(日常辦公室開銷:餐飲/聚餐、慶生/下午茶、辦公用品、雜支,無出差)。兩者類似但費用報銷不掛出差單。

**後端**（`b2ac0d4`）：`ExpenseClaim` 加 `ExpenseType`（Travel/General）;migration `AddExpenseType`（已套用 Azure）。

**前端**（`b2ac0d4`）：
- `/hr/expenses` 差旅報支:篩 `Travel`,保留關聯出差單。
- `/hr/office-expenses` 費用報銷（新頁,teal 主題）:篩 `General`,辦公室類別,無出差關聯。
- Sidebar 加「費用報銷」;型別加 `expenseType`。

## 階段 15 — 簽核中心抽離報銷、更名「假勤簽核」〔2026-07-31〕

- 費用報銷已有自己的簽核入口,故從舊「簽核中心」抽離,頁面（`/hr/approvals`）**更名為「假勤簽核」**、改用 `CalendarCheck` 圖示,只留待批假單/加班單兩頁籤（`b088856`）。

## 階段 16 — 請假／加班獨立頁,接通用簽核引擎〔2026-07-31〕

**需求**：比照差旅,把**員工請假申請單／加班申請單**做成獨立頁,接通用簽核引擎——讓假勤也能升級成「明細 + 流程 stepper」。

**後端**（`a6ca0b0`）：
- `WorkflowDefinitions` 註冊 `Leave` / `Overtime` 流程（直屬主管→部門主管）。
- `ApprovalService.SyncDocumentStatusAsync` 加 Leave / Overtime 回寫（核准時寫 `ApprovedAt`）。
- `LeavesController` / `OvertimesController` 注入 `ApprovalService`,送單後 `CreateAsync("Leave"/"Overtime", id)` 自動起單。無需 migration(沿用 `ApprovalInstances` 表)。

**前端**（`a6ca0b0`）：
- `/hr/leaves`（請假,紫色):假別 特休/病假/事假/公假、起訖日期 + 天數統計。
- `/hr/overtimes`（加班,橘色):單日時數上限 4 小時(勞基法)、已核准總時數統計。
- 兩頁均:建立 modal、列表 compact `ApprovalFlow`、**檢視**明細含完整 stepper + **駁回/核准此關卡**(可填意見)。
- `hrApi` 加 `deleteLeave` / `deleteOvertime`;Sidebar 加「請假申請」「加班申請」。

**排錯備忘**：後端 `Reason` 為非可空字串,ASP.NET 隱含 `[Required]` 會擋空字串 → 兩表單「事由」改必填。

**端到端驗證**（瀏覽器）：建請假 →「待直屬主管簽核 (0/2)」→ 檢視 → 核准第 1 關 → 轉綠、自動進「部門主管 審核中」;加班同樣通過。tsc/eslint 0。

**尚待收尾**：假勤簽核 `/hr/approvals` 接引擎 → 已於階段 17 完成。

## 階段 17 — 假勤簽核改走簽核引擎 + 舊資料回填〔2026-08-01〕

**需求**：把假勤簽核 `/hr/approvals` 從舊的「Row 直接改狀態」升級為引擎驅動的簽核收件匣,與差旅一致。

**前端**（`f7373f0`）：
- `/hr/approvals` 重寫為**簽核收件匣**:列表只列「有 Pending 簽核實例」的假單/加班單(真正待辦佇列),每列顯示 compact `ApprovalFlow`。
- Row 操作改為單一「檢視」→ 明細 modal(依假單/加班單顯示不同欄位）+ 完整 stepper + **在明細內**核准/駁回(可填意見),走 `decideApproval`。
- 移除舊的 `updateLeave`/`updateOvertime` 直接改狀態(不再繞過簽核實例)。

**後端**（`f7373f0`）：
- `ApprovalService.BackfillAsync(formType)`:為「仍 Pending 但無實例」的舊單據補建簽核實例(冪等,已有實例者跳過)。
- `POST /api/hr/approvals/backfill/{formType}`（`[Authorize]`)觸發回填。
- 執行結果:回填 **7 筆**引擎上線前的舊 Pending 假單(加班單 0 筆,唯一一筆已有實例)。

**驗證**：API 層確認 8 筆 Pending 假單 + 1 筆加班單皆有 Pending 實例,收件匣完整顯示;tsc/eslint 0。決策流程與差旅/請假頁一致(已於階段 16 於瀏覽器實測同款 stepper 推進)。

**環境備忘**：後端在 :5000 需以 `ASPNETCORE_ENVIRONMENT=Development`（載入 user-secrets 的 `Jwt:Key`）+ `--no-launch-profile --urls http://localhost:5000` 啟動(預設 launch profile 會綁 :5001,前端 `.env.local` 指向 :5000)。

**尚待處理**：嚴格角色控管 → 已於階段 18 完成;採購申請單 + 費用報銷選填關聯。

## 階段 18 — 簽核嚴格角色控管〔2026-08-01〕

**需求**：簽核收件匣應「只列輪到我的關卡」,且只有該關卡的簽核人能核准/駁回。

**設計**:token 已帶 `employee_id` 與 `role` claims;`Department.ManagerId` 為部門主管(員工)。
- **Admin** → 超級簽核人(可見/可簽全部),維持 demo 可用(admin 未綁員工)。
- **DirectSupervisor / DepartmentManager** → 申請人所屬部門的 `ManagerId`。
- **Finance** → 會計/財務部主管,或具 `Accountant` 角色者。

**後端**（`a1c257d`）:
- `ApprovalService.CanDecideAsync`(解析當前關卡授權)、`CanDecideInstanceAsync`、`GetPendingForUserAsync`(回傳我可簽的 Pending 實例;Admin 回全部)。
- `POST /approvals/{id}/decide` 加授權檢查 → 非簽核人回 **403**。
- `GET /approvals/mine` 供收件匣過濾。

**前端**（`a1c257d`）:假勤簽核收件匣改用 `getMyApprovals()` 過濾,只列可簽項;決策遇 403 顯示「您不是此關卡的簽核人」並刷新。

**驗證**:admin `/mine` 回全部 20 筆 Pending(bypass 正確);tsc/eslint 0。非 admin 強制驗證已實作,測試需建立綁定員工的主管帳號(依使用者自管帳密原則,未自動建立)。

## 階段 19 — 薪資加扣項明細（請假/加班溯源）〔2026-08-01〕

**需求**:薪資結算要能點進明細,看到該員工「因為什麼緣故有加扣項」——核准的請假/加班單即時帶入計算(時薪 × 時數)。

**發現**:`GeneratePayrolls` 其實已從核准的加班/請假計算 Bonus/Deductions,但 `PayrollRecord` 只存彙總、看不到明細;且種子 90 筆薪資為合成值,與實際核准單據不對應。

**後端**（`98b6576`）:
- 抽出 `PayrollCalculator`(單一計算來源):時薪 = 本薪 ÷ 240;加班採勞基法倍率(前 2h ×1.34、其後 ×1.67);請假依假別計薪並裁切至當月(事假無薪、病假半薪、特休/公假全薪)。
- `GeneratePayrolls` 改用之 → 儲存彙總與明細**完全對帳**。
- `GET /payrolls/{id}/breakdown` 回傳逐項加項/扣項(即時由核准單據重算)。

**前端**（`98b6576`）:薪資頁每列加「明細」鈕 → modal 顯示本薪/時薪、加項(加班)清單、扣項(請假)清單(日期、時數、時薪×倍率、金額)、以及 本薪→加→扣→實發 對帳。

**驗證**:重算郭建宏 2026-05 → 病假(半薪) 2 天 16h × NT$312.5/h × 0.5 = NT$2,500,實發 72,500;儲存值與 breakdown **RECONCILES**;tsc/eslint 0。（加班明細路徑同一計算器,現有資料無核准加班故清單為空。）

**尚待強化**:種子資料的歷史薪資為合成值,需重新 generate 才會與核准單據對帳;加班需有核准單才會出現加項。

## 階段 20 — 員工薪資設定（機密,限 Admin/HR/會計）〔2026-08-01〕

**需求**:缺一個設定員工本薪的頁面;薪資屬機密,只有 Admin/人資/會計看得到。

**發現的權限漏洞**:`SalaryStructuresController` 僅 `[Authorize]`(任何登入者可讀全公司薪資結構);`EmployeesController` 回傳的 Employee 帶 `BaseSalary`,對所有登入者外洩本薪(前端只擋頁面,API 沒擋欄位)。前端亦無任何本薪設定入口(只有 `/settings/organization` 的寫死職級表)。

**後端**（`79ead5f`）:
- `GET /employees/salaries`、`PUT /employees/{id}/base-salary`,皆 `[Authorize(Roles="Admin,HR,Accountant")]`。
- **堵漏**:一般 `GET /employees`、`GET /employees/{id}` 把 `BaseSalary` 遮成 0(本薪不隨一般員工 payload 外流);`UpdateEmployee` 保留原本薪(一般編輯不動薪資,薪資只走專用端點)。`SalaryStructuresController` 收緊為同一組角色。

**前端**（`79ead5f`）:
- `/hr/salaries`(員工薪資設定):逐人設定月本薪 + 即時「時薪 = 本薪 ÷ 240」預覽;以 `useAuth().roles` 前端把關(非授權角色顯示「機密」擋頁),Sidebar 連結對非授權角色隱藏。

**驗證**:一般員工清單 `baseSalary` 全為 0(不外洩);`/employees/salaries` 回 30 筆含時薪;調薪 75000→78000(時薪 312.5→325)成功;**一般員工編輯回填遮罩後的 0 仍保留原薪(PRESERVED)**;tsc/eslint 0。（角色 403 由 ASP.NET `[Authorize(Roles)]` 保證;非 admin 帳號測試同階段 18 需另建帳號。）

## 階段 21 — 示範角色帳號（會計/業務/人資）〔2026-08-02〕

**需求**:建立會計/業務/人資等角色帳號,密碼同 admin,用來實測角色控管與薪資權限。

**後端**（`07cbe5d`）:
- `IdentityDemoSeeder`(**僅 Development、冪等**):確保 HR/Sales/Manager 角色存在,建立 `hr`／`accountant`／`sales` 三個登入帳號(BCrypt 雜湊,密碼 `Admin123!`),各綁定對應部門主管員工(業務部=1、會計部=2、人資部=3),使 `employee_id` claim 能驅動簽核授權與薪資把關。掛在 Program.cs 啟動 migrate 區塊、`IsDevelopment()` 後。

**驗證**(以真實帳號):
- 薪資把關:`sales` 讀/寫薪資 → **403**;`accountant`／`hr` → 200。
- 簽核收件匣 `/mine`:`sales`(業務部主管)只見業務部假單、`accountant` 見含財務關卡報銷、`admin` 全見(bypass)—— 階段 18 的角色控管至此可實際體驗。

⚠️ 這些是**弱密碼示範帳號,僅限 Development**;正式環境不會種入(環境判斷擋掉)。

## 階段 22 — 採購申請單 ↔ 費用報銷關聯〔2026-08-02〕

**需求**:比照 出差申請 ↔ 差旅報支,做 採購申請單(請購單),費用報銷可選填關聯已核准的請購單作預先授權。

**後端**（`28a9477`）:
- `PurchaseRequest` 實體(品項/類別/數量/預估金額/用途)+ `PurchaseRequestsController`,接既有 **"Purchase" 流程(直屬主管→財務部)**,狀態由簽核實例回寫。
- `ExpenseClaim` 加選填 `PurchaseRequestId`(對稱於 `BusinessTripId`)。migration `AddPurchaseRequests`(新表 + FK + nullable 欄,已套用)。
- `ApprovalService` 補 Purchase 的 `SyncDocumentStatusAsync` 與 `ApplicantEmployeeIdAsync`。

**前端**（`28a9477`）:
- `/hr/purchase-requests`(採購申請,cyan):建立/列表/檢視 + 完整簽核 stepper + 明細內核准駁回。
- 費用報銷表單加「關聯採購申請單」下拉(只列該員工已核准的請購單),明細顯示關聯單並標「已預先授權」。Sidebar 加「採購申請」。

**端到端驗證**(API):建請購單 → 核准兩關(直屬主管→財務部)→ 狀態 Approved → 建 General 報銷關聯之 → `purchaseRequestId` 回寫並讀回 **LINK OK**;tsc/eslint 0。

## 階段 23–25 — P0 改進(對照 Ragic 藍圖)〔2026-08-03〕

先產出「現況 vs Ragic 藍圖」roadmap(artifact),再依 P0 推進:

- **階段 23 — 簽核報表**(`ea57db1`):`ApprovalService.GetReportAsync` + `GET /hr/approvals/report`(Admin/HR/Manager)。吞吐(狀態/表單別)、各關卡平均簽核耗時、卡關 TOP,即時由簽核實例算出、零新資料表。前端 `/hr/approval-report` 儀表板(角色把關)。
- **階段 24 — 現金流量表**(`5b326c9`):`GET /reports/cash-flow` 間接法,依科目代碼分類(現金/流動/非流動/權益)彙總營業/投資/理財三段。因本帳未將損益結轉權益,三段和恰等於現金科目實際變動(`reconciles` 對帳)。前端 `/accounting/reports/cash-flow`(會計式括號負數、期初→期末、Excel、對帳徽章)。三本表補齊。
- **階段 25 — 傳票憑證附件**(`d8a253a`):`Voucher.AttachmentUrl` + migration;新增 `POST /api/attachments/upload`(會計端,重用 `ERP.Shared` 的 `IReceiptStorage`,同 HR 收據可插拔本機/R2)。傳票 新增/編輯 可上傳影像縮圖、清單顯示迴紋針。驗證:上傳→建/改傳票回寫→檔案 200。

- **階段 26 — 簽核流程設定持久化**(`ad17735`):新增 `WorkflowStepDefinition` 實體 + migration;`ApprovalService.CreateAsync` 改由 DB 解析各表單流程(`ResolveFlowAsync`,無資料時 fallback 預設),啟動時冪等 seed 預設值。新增 `GET/PUT /hr/workflows`(僅 Admin);`/settings/workflows` 由假資料改為真編輯器(關卡增刪、換角色、改名、重排、儲存;角色限 直屬主管/部門主管/財務部)。驗證:把 請假 改成 3 關 → 新提交假單即展開 3 關;不支援角色回 400;非 admin 403。**P0 四項全部完成。**

## 階段 27 — 簽核關卡帶出實際簽核人 + 代理簽核〔2026-08-03〕

**需求(使用者提出)**:簽核單每一關要顯示**實際負責人的名字**(不能只有「直屬主管」);且該主管出國/請假時可由**其他主管代簽**。同時點出:`直屬主管` 與 `部門主管` 目前都解析成同一人(部門主管),因員工無「直屬主管」欄位。

**後端**(`fe9b09e`):
- `Employee` 加 `ManagerId`(直屬主管)、`DelegateEmployeeId`(簽核代理人);`ApprovalStep` 加 `ApproverEmployeeId`(預期簽核人快照)、`SignedByEmployeeId`(實際簽核人)+ 兩個 `[NotMapped]` 顯示名。migration `AddApproverResolutionAndDelegation`。
- `ResolveApproverEmployeeIdAsync`:直屬主管→員工 `ManagerId`(未設則 fallback 部門主管)、部門主管→部門 ManagerId、財務部→會計/財務部主管。`CreateAsync` 建單時快照每關實際簽核人;`GetAsync`/`DecideAsync` 回填顯示名。
- `CanDecideAsync` 除了本人,新增**代理人**可簽;`DecideAsync` 記錄實際簽核人,與預期不同即為代簽。`PUT /employees/{id}/supervision`(Admin/HR),並在一般員工編輯時保留這兩欄。

**前端**(`fe9b09e`):`ApprovalFlow` 每關標籤下顯示實際簽核人姓名、代簽標「X 代簽」;compact 版「待『部門主管(陳淑芬)』簽核」。新頁 `/hr/approval-org`(簽核組織:設定直屬主管 + 簽核代理人,Admin/HR)。

**端到端驗證**:新假單關卡帶出「陳淑芬」;sales 未授權簽核 403 → 設定 emp2 代理人=emp1 後,sales 代簽成功,紀錄「洪志明 代 陳淑芬 簽」(代簽)。tsc/eslint 0。

**下一階段 P1**:進銷存 ↔ 會計金流閉環(採購鏈→應付、銷售鏈→應收→逾期帳齡),可沿用既有「單據關聯 + 簽核引擎」模式。

## 階段 28 — 萬用申請:可自訂申請單 + 部門簽核人〔2026-08-03〕

**需求(使用者提出)**:`/settings/workflows` 應能**新增自訂申請單**(例:電腦物品領用),不是為單一表單客製而是**萬用**;關卡簽核人不能只有 3 個,要能選任一部門(研發/資訊…)主管;且要帶出實際主管姓名。

**Phase A — 靈活簽核人**(`5954eaa`):關卡角色新增 `Department:{id}`(某部門主管);`ResolveApproverEmployeeIdAsync`/`CanDecideAsync` 解析、`ValidateRolesAsync` 放行;`GetWorkflowsAsync` 回傳全部門選項 + 實際主管姓名。設定頁下拉列出 7 個部門主管(帶姓名),每關顯示「→ 謝美玲」。

**Phase B — 萬用申請範本**(`d0db797`):
- `ApprovalFormTemplate`(名稱/說明/數量·金額欄位開關/啟用)+ `GenericApprovalRequest`(主旨/數量/金額/事由/附件)。範本關卡以 `FormType="Tpl{id}"` 存於既有 workflow 步驟表 → **整套引擎(路由、收件匣、報表、代簽、帶出簽核人)零改動即通用**,只加一支 generic 分支(取申請人、回寫狀態、報表標籤)。migration `AddApprovalFormTemplates`。
- 控制器:範本 CRUD(Admin)+ active 清單;萬用申請單 submit/list/get/delete;`GET /hr/workflows/{formType}` 供範本關卡編輯。
- 前端:`/settings/workflows` 重build —— 內建單據 + 自訂申請單同頁,「**新增自訂表單**」modal、逐範本關卡編輯 + 啟停/刪除;新頁 `/hr/requests`(萬用申請:選範本→填→跑流程),含 stepper、檢視、簽核、附件上傳。Sidebar 加「萬用申請」。

**端到端驗證(API)**:建「電腦物品領用申請單」→ 設流程 直屬主管→資訊部主管 → 員工送「滑鼠 x1」→ 簽核實例解析為 **陳淑芬 → 謝美玲**。tsc/eslint 0。

## 階段 29 — P1 起步:應收/應付帳齡 + 沖銷〔2026-08-03〕

**P1 金流閉環第一塊**(使用者選定起點)。`SalesOrder`/`PurchaseOrder` 加 `DueDate` + `SettledAmount`(migration `AddOrderSettlement`);未沖銷 = 總額 − 已沖銷。
- `ReceivablesController` / `PayablesController`(Admin/Accountant):GET 由「已確認且有未沖銷餘額」的訂單/採購單算帳齡,分 未到期/1-30/31-60/61-90/90+(無到期日以單據日+30);`POST /{id}/settle` 登記收/付款。
- 前端 `/accounting/reports/aging`:應收/應付分頁、帳齡桶摘要卡、逐列 inline 收款/付款。角色限 Admin/會計(側欄與會計選單套用 `canSee` 過濾)。

**驗證**:應收未沖銷 11.67M / 逾期 9.09M(分桶);收款後未沖銷下降;應付 9.6M;sales 403。tsc/eslint 0。

**尚可強化**:到期日目前用預設(單據日+30),可在訂單上設定。**P1 後續**:進貨單→應付、出貨單→應收 的單據鏈。

## 階段 30 — 收/付款拋轉會計傳票〔2026-08-03〕

沖銷時自動拋轉傳票,讓金流真正進帳、與現金流量表對上。
- `IAccountingIntegrationService.CreateSettlementVoucherAsync`(ERP.Shared 介面 + Accounting 實作):收款→借 現金/貸 應收帳款;付款→借 應付帳款/貸 現金。科目以**代碼解析**(1101/1103/2101),產生借貸平衡的**草稿**傳票(比照既有銷貨/採購/薪資拋轉)。
- Receivables/Payables 的 `settle` 端點在記錄收付款後呼叫之(金額 clamp 至未沖銷);回傳 `voucherCreated`。前端 aging 頁註明並於沖銷後提示。

**驗證**:收款 5,000 → 傳票 借 現金 5,000 / 貸 應收 5,000(借貸平衡);付款 → 借 應付/貸 現金。tsc/eslint 0。

## 階段 31 — 進貨/出貨單據鏈:訂單 → 履約 → 應付/應收〔2026-08-03〕

把「確認訂單」拆成**下單承諾**與**進出貨履約**兩段(原本確認一步做完扣庫存+拋傳票)。
- 新實體 `GoodsReceipt`(進貨單)/ `DeliveryNote`(出貨單)+ 明細,關聯採購單/銷售訂單;PO/SO 加 `ReceivedAt`/`DeliveredAt`。migration `AddGoodsReceiptsAndDeliveryNotes`。
- **確認 = 只承諾**(不動庫存/傳票)。**進貨**(`POST /GoodsReceipts/from-order/{id}`)加庫存 + 拋應付(借 存貨/貸 應付);**出貨**(`POST /DeliveryNotes/from-order/{id}`)扣庫存 + 拋應收(借 應收/貸 銷貨 + 借 銷貨成本/貸 存貨),皆 `TransactionScope` 原子。
- 帳齡改看**已履約**單(`ReceivedAt`/`DeliveredAt != null`);`InventoryChainSeeder` 把既有已確認單回填為已進貨/已出貨(僅補單據紀錄,不重複動庫存/傳票),帳齡數字不變。
- 前端:採購/銷售頁確認改為承諾語意,已確認未履約單出現「進貨/出貨」鈕,狀態顯示 待進貨/已進貨、待出貨/已出貨。

**驗證**:確認庫存不變;進貨庫存 +150 並進應付帳齡;出貨庫存 −100 並進應收帳齡;重複履約擋掉;回填保住 應付 11/9.6M、應收 50/11.66M。tsc/eslint 0。

**P1 進度**:應收應付帳齡 ✅、收付款拋傳票 ✅、採購鏈 ✅、銷售鏈 ✅。**尚可強化**:進貨單/出貨單獨立清單頁、部分進出貨、與 CRM 商機串接、常用分錄範本。

## 階段 32 — 常用分錄範本(P1 收尾,4/4)〔2026-08-03〕

- `JournalTemplate` + `JournalTemplateLine` 實體 + migration `AddJournalTemplates`;`JournalTemplatesController`(讀:任何登入者;Admin/會計 CRUD),驗證至少兩行且含借貸雙方。
- `JournalTemplateSeeder` 依科目代碼種入常見範本(支付租金/水電/文具、現金存/提),冪等。
- 前端:傳票新增頁加「套用常用分錄」下拉,選範本即帶入借貸科目/摘要(金額後填);`/accounting/journal-templates` 管理頁(建立/編輯行/刪除),角色限 Admin/會計。
- **驗證**:5 範本種入;會計建立 201、缺借貸 400、sales 403。tsc/eslint 0。

**P1 金流閉環 4/4 全部完成**:應收應付帳齡、收付款拋傳票、採購鏈、銷售鏈、常用分錄。roadmap 已同步。

## 階段 33 — P2 起步:固定資產管理 + 折舊〔2026-08-03〕

- `FixedAsset` 實體(取得成本/殘值/耐用月數/累計折舊/上次提列期間/狀態)+ migration `AddFixedAssets`;計算屬性:月折舊(直線法)、帳面淨值。
- `FixedAssetsController`:CRUD(Admin/會計)+ `POST /depreciate/{year}/{month}` —— 對每個使用中、未折舊完畢、該期未提列的資產提列一個月(上限至可折舊基礎),冪等,並拋轉一張彙總傳票(借 折舊費用/貸 累計折舊)。
- `DepreciationAccountSeeder` 確保 折舊費用(6501)、累計折舊(1501)科目存在。
- 前端 `/accounting/fixed-assets`:資產卡列表 + 成本/淨值摘要、新增/編輯、「本期提列折舊」。角色限 Admin/會計。

**驗證**:資產月折舊 1666.67;提列 2026-08 → 累計 1666.67、帳面 58333.33、傳票借貸平衡;重跑同月為 no-op。tsc/eslint 0。roadmap P2 更新(1/4)。

## 尚待處理 / 建議（後續）

- ~~**CORS 過寬**（`AllowAnyOrigin`）~~ ✅ 已處理（階段 10，`6350917`）：改為 `Cors:AllowedOrigins` 白名單,預設本機開發來源,policy 更名 "AppCors"。正式環境請於設定填入真實網域。
- **舊金鑰與舊密碼仍存在於 git 歷史**：DB 密碼已於階段 1.4 清除；JWT 舊金鑰（`377be07` 之前）尚在歷史中，但換金鑰後已失效，風險低。若要徹底清除可再跑一次 `git filter-repo --replace-text`。
- **啟動時自動 migrate**（`Program.cs` 對六個 DbContext 呼叫 `Database.Migrate()`）：正式多實例環境建議改由部署流程執行 migration，避免併發衝突。
- 選配：再對傳票 / 庫存 / HR 等頁面做執行期點測（已完成主要流程）。
