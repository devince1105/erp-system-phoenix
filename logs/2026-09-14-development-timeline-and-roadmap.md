# ERP Phoenix 開發時程統整與後續階段排程規劃

**記錄日期**：2026-09-14  
**目前狀態**：階段 38.1 已完成（Commit `5ea4da1`），分支 `main` 乾淨且與遠端同步  
**前版紀錄**：參閱 [`logs/2026-07-30-security-and-lint-cleanup.md`](file:///Users/vincelo/Dev/2026/erp-system-phoenix/logs/2026-07-30-security-and-lint-cleanup.md)

---

## 一、 專案開發時程歷史紀錄統整（階段 1 ～ 38.1）

本專案自 2026-07-30 起進行全面盤點、資安重構與功能深化，歷經四個主要時期、共 38 個階段的研發推進：

### 📅 第一期：專案體質健檢、資安加固與規範清零（2026-07-30）
- **階段 1（機密外洩清除）**：清除 `appsettings.Development.json` 中明文 Azure SQL 密碼，以 `git filter-repo` 改寫歷史，全面移轉至 .NET user-secrets。
- **階段 2～3（相依套件與殘留清理）**：移除老舊套件 `Newtonsoft.Json 9.0.1`（高風險漏洞 NU1903），清理臨時雜湊腳本與多餘專案。
- **階段 4（前端 Lint 徹底清理）**：React 19 / Next.js 16 下 164 個 ESLint 問題降至 0（修正 Hooks 依賴、移除 unused-vars、封裝型別保護）。
- **階段 5～7（JWT 與環境安全）**：消除 JWT 弱金鑰與 Fallback 繞過漏洞，建立非對稱強隨機密鑰與 Fail-fast 機制；後端 nullable 編譯警告清零。
- **階段 8～10（三個月示範資料與連線收斂）**：
  - 開發 `backend/tools/ERP.Seeder`，向 Azure MS-SQL 灌入 2026-05～07 三個月份各模組示範資料（30 員工、1,820 出勤、90 薪資、45 傳票、53 銷售單等）。
  - 修復 CRM API 連線與 JWT Interceptor。
  - CORS 從 `AllowAnyOrigin` 收縮為白名單設定。

---

### 📅 第二期：通用簽核引擎、差旅報銷與假勤/薪資深度整合（2026-07-31 ～ 2026-08-01）
- **階段 11～12（出差申請、差旅報支與簽核引擎誕生）**：
  - 建立出差申請單 ↔ 差旅報支關聯（支援預先授權）。
  - 開發通用簽核實例引擎（`ApprovalInstance`、`ApprovalStep`、`ApprovalService`），由列表行核准升級為「點進明細 + Stepper 視覺化進度條 + 逐級審核」。
- **階段 13～15（影像附件與費用拆分）**：
  - 打造可插拔收據儲存架構（`IReceiptStorage`：本地開發 `LocalReceiptStorage` 與正式 `Cloudflare R2`）。
  - 費用拆分：區隔「差旅報支（掛出差單）」與「日常費用報銷（辦公室雜支、慶生、聚餐）」。
  - 簽核中心抽離，頁面重塑為專注請假/加班的「假勤簽核」。
- **階段 16～18（假勤串接簽核、歷史回填與嚴格角色控管）**：
  - 請假申請與加班申請獨立頁面，全面介接通用簽核引擎；回填歷史舊單據簽核實例。
  - 簽核收件匣落實「輪到我才看得到」的角色控管（主管、財務、Admin 權限分立，非授權回傳 403）。
- **階段 19～21（薪資溯源對帳、機密防護與示範角色）**：
  - 薪資結算抽出 `PayrollCalculator`，點進明細可完整溯源假勤加扣項（加班勞基法倍率 1.34/1.67、請假扣薪對帳）。
  - 員工本薪機密端點保護，一般員工 API 遮罩本薪為 0，新增獨立端點限 Admin/HR/會計存取。
  - 啟動 `IdentityDemoSeeder`（僅限 Development），提供 `admin`, `hr`, `accountant`, `sales` 示範帳號（密碼皆為 `Admin123!`）。

---

### 📅 第三期：P0 核心藍圖收斂、自訂表單與 P1 金流閉環（2026-08-02 ～ 2026-08-03）
- **階段 22（採購請購單 ↔ 費用報銷）**：新增採購申請單（請購單），費用報銷可關聯核准請購單作預先授權。
- **階段 23～25（P0 報表與憑證補齊）**：
  - 簽核效能報表（吞吐量、平均耗時、卡關 TOP 排行）。
  - 現金流量表（三本表補齊，直接法/間接法分類與對帳徽章）。
  - 傳票憑證附件上傳（會計端重用收據可插拔儲存）。
- **階段 26～28（簽核流程設定真 DB 持久化、實際簽核人與萬用申請）**：
  - 簽核流程設定改為 DB 持久化，`/settings/workflows` 可動態增刪調整關卡。
  - 關卡解析實際主管姓名（如：部門主管（陳淑芬）），支援主管休假出國之「代理簽核」機制。
  - 萬用申請範本（自訂表單引擎）：管理者可自行新增「電腦物品領用」等自訂單據，全自動套用簽核引擎與收件匣。
- **階段 29～32（P1 進銷存金流閉環完成，4/4）**：
  - 應收 / 應付帳齡分析與分桶（未到期、1-30、31-60、61-90、90+ 天）。
  - 沖銷登記自動拋轉傳票（收款拋借現金/貸應收，付款拋借應付/貸現金）。
  - 履約單據鏈：將訂單確認改為「承諾」，新增「進貨單（Goods Receipt）」與「出貨單（Delivery Note）」做為實體履約，履約當下才動庫存與拋轉會計傳票。
  - 常用分錄範本（租金、水電、存提款範本管理與傳票一鍵套用）。

---

### 📅 第四期：P2 模組推進、安全漏洞收斂與全站 UI/UX 齊一（2026-08-03 ～ 2026-08-13）
- **階段 33～34（P2 資產與票據管理）**：
  - 固定資產管理：直線法月折舊計算，支援「本期提列折舊」自動拋轉折舊費用與累計折舊傳票。
  - 票據管理：應收/應付支票管理、兌現/退票處理，兌現自動拋轉銀行傳票。
- **階段 35～36（授權漏洞補齊與職級薪資帶防呆）**：
  - 全站 39 個控制器盤點，修補 4 個遺漏授權的 HR 端點。
  - 建立 L1～C1 職級薪資帶，後端調薪超出範圍自動回 400 擋單。
- **階段 37（全域分頁共用化與超帶警示）**：
  - 員工薪資列表顯示超帶紅字警示。
  - 全站所有列表（HR、會計、庫存、資產等）全面套用共用 `Pagination` 組件（10/20/50/100 筆切換與篩選歸零）。
- **階段 38～38.1（主檔檢視 Modal 與按鈕樣式標準化）**：
  - 主檔資料（員工、部門、科目、產品、夥伴、客戶、固定資產）新增唯讀「檢視」Modal。
  - 檢視按鈕樣式收斂為無邊框純圖示 + Tooltip，與刪除按鈕視覺語言對齊。

---

### 📅 第五期：P2 核心 — 多倉庫與庫存調撥系統（2026-09-14，階段 39～41）
- **階段 39（資料模型與後端架構）**：
  - 新增 `Warehouse`（唯一代碼、名稱、地址、聯絡人、預設倉、啟用狀態）。
  - 新增 `WarehouseStock`（倉庫庫存映射表：WarehouseId, ProductId, Quantity, SafetyStock）。
  - 新增 `StockTransfer` 與 `StockTransferItem`（調撥主檔與明細，狀態 Draft / Completed / Cancelled）。
  - 擴充 `StockMovement` 增加 `WarehouseId` 與 `TransferOut = 6`, `TransferIn = 7` 調撥出入庫類型。
  - 擴充 `GoodsReceipt` 與 `DeliveryNote` 增加 `WarehouseId`（支援指定入庫/出庫倉庫）。
  - 建立 EF Core Migration `AddMultiWarehouseAndTransfers`。
  - 實作 `MultiWarehouseSeeder`：自動建立 3 座示範倉庫（台北總倉 WH-TPE、台中物流中心 WH-TXG、高雄營業所 WH-KHH），並將既有全部商品庫存自動映射歸屬至「台北總倉」，歷史資料零遺失。
- **階段 40（進銷存鏈聯動與業務邏輯）**：
  - `WarehousesController`：CRUD + 刪除防呆（預設倉、在庫庫存、交易歷史保護）+ 倉庫商品庫存查詢。
  - `WarehouseStocksController`：跨倉庫庫存分佈透視矩陣查詢 + 安全庫存警戒值 inline 調整。
  - `StockTransfersController`：調撥單草稿建立、取消與原子交易執行（TransactionScope 扣減來源倉、增加目的倉、寫入兩筆出入庫審計紀錄）。
  - `GoodsReceiptsController` 與 `DeliveryNotesController`：支援進出貨指定倉庫並同步維護倉庫庫存映射與安全庫存檢查。
- **階段 41（前端介面實作）**：
  - `WarehouseModal`（支援新增/編輯與 `readOnly` 唯讀檢視模式）。
  - `StockTransferModal`（調撥品項動態新增/刪除、來源倉在庫量即時檢查、確認並執行調撥）。
  - 倉庫管理頁 `/inventory/warehouses`（卡片列表、預設倉徽章、共用 Pagination）。
  - 各倉庫存分佈看板 `/inventory/stocks`（全商品跨倉庫透視矩陣、安全庫存缺貨告警篩選、安全庫存 inline 點擊修改）。
  - 庫存調撥作業頁 `/inventory/transfers`（單據狀態標籤篩選、調撥路徑摘要、一鍵取消與檢視執行）。
  - `Sidebar.tsx` 進銷存選單擴充「倉庫主檔」、「庫存分佈」、「庫存調撥」導航項。
  - **驗證**：後端 `ERP.slnx` 0 errors / 0 warnings；前端 `next build` 49 頁靜態建置全部通過，`tsc` 0 錯誤，`eslint` 0 警告 / 0 錯誤。

---

### 📅 第六期：P2 核心收官 — 自訂財務與經營報表系統（2026-09-14，階段 42～43，P2 100% 完成）
- **階段 42（領域架構與報表運算引擎）**：
  - 新增 `CustomReportTemplate`（範本名稱、說明、損益/資產型態、啟用狀態）與 `CustomReportSection`（段落標題、顯示順序、包含之科目代碼前綴、借貸正負向、小計公式）。
  - 建立 EF Core Migration `AddCustomReports`。
  - `CustomReportSeeder`：冪等初始化預置兩組經典管理報表：
    1. **「營業費用明細與佔比分析表」**（細拆薪資人事 61、租金水電 62/63、辦公文具 64、折舊其他 65/69，並公式小計營業費用總額）。
    2. **「營運毛利與營業損益分析表」**（銷貨營收 41/42 扣減成本 51 推導營業毛利，再扣減營運費用計算營業淨利）。
  - `CustomReportsController`：
    - 範本 CRUD API（`[Authorize(Roles = "Admin,Accountant")]`）。
    - 核心運算端點 `GET /api/CustomReports/{id}/run`：動態匹配傳票分錄科目前綴、依正負借貸向聚合金額、支援同期/前期對比（變動額與變動率 %）、小計公式解析計算。
- **階段 43（前端自訂報表分析中心與範本配置器）**：
  - `CustomReportTemplateModal`：視覺化新增/編輯段落、拖拉排序、科目代碼前綴設定、借貸向與小計公式配置。
  - 自訂報表瀏覽分析中心 `/accounting/reports/custom`：
    - 範本下拉切換與即時運算。
    - 快速日期區間（本月、上月、本季、今年、自訂）與「期間對比」開關。
    - 樹狀折疊/展開科目明細、會計括號負數格式、變動率漲跌色標。
    - 一鍵 Excel (XLSX) 報表匯出。
    - 角色防護（非 Admin/會計顯示未授權提示）。
  - `Sidebar.tsx` 會計財務選單加入「自訂報表 (Custom Reports)」導航項。
  - **驗證**：後端 `ERP.slnx` 0 errors / 0 warnings；前端 `pnpm tsc` 0 錯誤、`pnpm lint` 0 警告 / 0 錯誤；`next build` 全站 **50 個頁面全部編譯成功**。

---

### 📅 第七期：P3 企業進階 — CRM 商機轉訂單與進出貨履約追蹤系統（2026-09-15，階段 44～45，P3 100% 完成）
- **階段 44（CRM 商機結案轉銷售訂單）**：
  - 前端 CRM Kanban 卡片新增快速「轉訂單」動作按鈕，並支援拖曳結案自動觸發。
  - 重構升級 `ConvertToOrderModal`：支援動態多品項商品明細新增/刪除、數量/單價與小計即時試算、自動關聯或建立客戶 Partner 主檔、自動帶入商機預估金額與備註。
  - 結案後自動建立進銷存草稿銷售訂單（Draft `SalesOrder`）並同步更新商機階段為 Closed。
- **階段 45（進出貨獨立履約作業與追蹤頁）**：
  - 後端 `GoodsReceiptsController` 與 `DeliveryNotesController`：
    - `GetAll()` 查詢補充 `.Include(r => r.Warehouse)` 支援跨倉庫顯示。
    - 新增 `GetById(id)` 端點，支援完整明細查詢（含訂單、客戶/廠商、倉庫、品項商品）。
  - 前端型別與 API：
    - `inventory.ts` 補充 `GoodsReceipt`, `GoodsReceiptItem`, `DeliveryNote`, `DeliveryNoteItem` 完整型別。
    - `inventoryApi.ts` 新增 `getGoodsReceipts()`, `getGoodsReceipt(id)`, `getDeliveryNotes()`, `getDeliveryNote(id)` 端點。
  - 獨立進貨驗收中心 `/inventory/goods-receipts`：
    - KPI 指標（累計驗收單數、累計進貨總金額、待驗收採購單數）。
    - 快速驗收入庫作業 Modal（`GoodsReceiptModal`）：選擇待進貨採購單、指定入庫倉庫、即時明細預覽與提交。
    - 進貨驗收單明細檢視 Modal（`GoodsReceiptDetailModal`）：品項數量進價、存貨與應付帳款會計連動提示。
    - 倉庫篩選、即時搜尋、共用分頁組件 (`Pagination.tsx`)。
  - 獨立出貨裝箱中心 `/inventory/delivery-notes`：
    - KPI 指標（累計出貨單數、累計出貨總金額、待出貨銷售單數）。
    - 快速出貨裝箱作業 Modal（`DeliveryNoteModal`）：選擇待出貨銷售單、指定出貨扣庫倉庫、即時明細預覽與提交。
    - 出貨裝箱單明細檢視 Modal（`DeliveryNoteDetailModal`）：品項數量售價、應收與銷貨成本會計連動提示。
    - 倉庫篩選、即時搜尋、共用分頁組件 (`Pagination.tsx`)。
  - `Sidebar.tsx` 進銷存選單加入「進貨驗收 (Goods Receipts)」與「出貨裝箱 (Delivery Notes)」。
  - **驗證**：後端 `ERP.slnx` 0 errors / 0 warnings；前端 `pnpm tsc` 0 錯誤、`pnpm lint` 0 警告 / 0 錯誤；`next build` 全站 **52 個頁面全部編譯成功**。

---

### 📅 第八期：系統架構維運整備 — 資料庫 Migration 抽離與 CI/CD 流程（2026-09-15，階段 46，維運整備完成）
- **階段 46（資料庫 Migration 抽離與 CI/CD 流程）**：
  - 建立專用 `DatabaseMigrationRunner.cs`，將分散於 `Program.cs` 的 6 大模組 Migration（Identity / Accounting / Inventory / HR / CRM / MDM）與各項基礎 Seeder 全面非同步化與結構化封裝。
  - 支援命令列參數（CLI Arguments）：
    - `--migrate-only`：獨立執行遷移與種子資料，完成後以 Exit Code 0 退出，不掛起 HTTP 伺服器（專供 CI/CD 流水線與 Docker/K8s Init-Container 使用）。
    - `--skip-migration`：供多節點/水平擴展部署時跳過重複遷移。
    - `--seed-demo`：強制執行示範帳號與資料初始化。
  - 建立標準獨立遷移腳本 `scripts/migrate-db.sh`。
  - **驗證**：`dotnet build` 0 errors；`--migrate-only` 正常以 Exit Code 0 完成；`--skip-migration` 正常跳過；預設無參數模式維持本機無痛體驗；Swagger UI 與登入驗證均正常回傳 200 OK。

---

## 二、 目前藍圖達成狀況總覽

| 階段目標 | 模組項目 | 狀態 | 完成率 | 備註 |
| :--- | :--- | :---: | :---: | :--- |
| **基礎體質** | 資安加固、JWT、ESLint、相依漏洞 | ✅ 完成 | 100% | 後端 0 warn/0 err，前端 0 lint/0 tsc |
| **P0 核心** | 通用簽核引擎、三本財務報表、示範資料 | ✅ 完成 | 100% | 現金流量表對帳、簽核報表與持久化 |
| **P1 金流閉環** | 帳齡分析、沖銷拋傳票、進出貨履約鏈、常用分錄 | ✅ 完成 | 100% | 採購進貨/銷售出貨履約鏈閉環完成 |
| **P2 進階擴充** | 固定資產折舊、票據管理、多倉庫調撥、自訂報表 | ✅ 完成 | **100%** | **P2 四大模組全數 100% 達成！** |
| **P3 企業進階** | CRM 商機轉訂單、進貨驗收單、出貨裝箱單 | ✅ 完成 | **100%** | **業務至倉儲履約鏈閉環作業全數具備獨立作業視角！** |
| **架構維運** | Migration 獨立執行器、CI/CD 腳本、Swagger UI | ✅ 完成 | **100%** | **支援水平擴展與自動化部署管線！** |
| **全站體驗** | 分頁共用組件、主檔唯讀檢視、按鈕樣式標準化 | ✅ 完成 | 100% | 全站 52 頁體驗完全一致 |

---

## 三、 後續開發步驟與推進時程排程（Next Milestones）

### 🚩 步驟一：P2 核心 — 多倉庫與庫存調撥系統 ✅（階段 39～41 已完成）
### 🚩 步驟二：P2 核心 — 自訂財務與經營報表系統 ✅（階段 42～43 已完成）
### 🚩 步驟三：P3 企業進階 — CRM 商機轉訂單與履約追蹤頁深化 ✅（階段 44～45 已完成）
### 🚩 步驟四：系統與架構整備 — 資料庫 Migration 抽離與 CI/CD 整備 ✅（階段 46 已完成）

---

### 🚩 步驟五：端到端（E2E）自動化驗收測試健全化（階段 47，優先度：中）
*目標：建立關鍵閉環流程（商機 → 訂單 → 進出貨 → 沖銷 → 傳票；請假/差旅 → 簽核 → 薪資結算）的端到端自動化驗收測試。*

---

## 四、 開發規範與執行準則（提醒事項）

1. **安全 UI 變更（Safe UI & Styling）**：
   - 修改 UI 樣式時，嚴格採用精確的單檔修改工具，禁止全專案批次盲目替換指令。
2. **危險操作前建立 Checkpoint**：
   - 進行跨模組重構或核心邏輯變更前，先以 `git commit` 保存狀態。
3. **保留既有業務邏輯（Anti-Overengineering）**：
   - 美化頁面或重構時，務必保留既有之事件處理器、資料 Hook、認證 Claim 依賴及後端既定邏輯。
