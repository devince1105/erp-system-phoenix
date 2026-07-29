# ERP System Phoenix - MS-SQL Server on macOS (Arm64) Setup

本專案使用 **Microsoft SQL Server (MS-SQL)** 作為資料庫系統。由於 macOS (Arm64 / Apple Silicon) 沒有原生 MS-SQL Server 服務安裝包，因此本專案採用 **Docker 容器化** 方式運行 MS-SQL。

---

## 🛠️ 環境需求 (Prerequisites)

1. **Docker 容器執行環境**（二選一）：
   - **OrbStack**（推薦：對 Mac 效能與省電優化極佳，支援原生 ARM/x86 模擬）
   - **Docker Desktop for Mac (Apple Silicon)**
2. **GUI / IDE 管理工具**（推薦）：
   - **VS Code + MSSQL 擴充功能**（微軟官方推薦取代方案，直接在 VS Code 進行 SQL 開發與 schema 管理）
   - **DBeaver**（強大通用資料庫管理工具）

---

## 🚀 快速啟動 (Quick Start)

### 1. 設定環境變數
預設使用 `.env` 檔案中的設定（請參考 `.env.example` 建立）：
- **SA Password**: `<您的強密碼>`
- **Port**: `1433`
- **Default Database**: `<您的資料庫名稱>`

### 2. 啟動 MS-SQL Container
執行以下指令啟動資料庫：

```bash
docker compose up -d
```

檢視容器狀態與日誌：

```bash
# 查看容器是否正常運作
docker compose ps

# 查看 SQL Server 實時日誌
docker compose logs -f mssql
```

### 3. 停止與關閉容器

```bash
# 停止容器 (保留資料)
docker compose down

# 停止容器並清除 Volume 資料
docker compose down -v
```

---

## 🔌 連線設定 (Database Connection Settings)

> ℹ️ **注意**：微軟官方已於 **2026 年 2 月 28 日正式停用 Azure Data Studio**，並全面轉移至 **VS Code + MSSQL 擴充功能**。

在 **VS Code (MSSQL 擴充功能)** 或 **DBeaver** 設定連線時請使用以下資訊：

| 欄位 (Field) | 設定值 (Value) | 說明 |
| :--- | :--- | :--- |
| **Server / Host** | `localhost` 或 `127.0.0.1` | 本地端位址 |
| **Port** | `1433` | 預設 SQL Server 通訊埠 |
| **Authentication Type** | SQL Login | 使用 SQL 帳號密碼登入 |
| **User / Login** | `<您的登入帳號>` | 系統管理員帳號 |
| **Password** | `<您的強密碼>` | 設定於 `.env` 中的密碼 |
| **Database** | `<您的資料庫名稱>` | 預設資料庫 |
| **Trust Server Certificate** | `True` / 勾選 | ⚠️ 必填/必勾：Docker 環境需要信任自簽憑證 |
| **Encrypt / Encryption** | `Optional` 或 `False` | 依用戶端工具預設設定 |

---

## 💡 macOS Apple Silicon (Arm64) 最佳化說明

### 方案 A：MS SQL Server 2022 (`mssql/server:2022-latest`) [預設]
* **優勢**：100% 完整 MS-SQL 2022 功能（包含所有企業級功能、CLRs、Full-Text等）。
* **機制**：透過 OrbStack / Docker Desktop 的 Rosetta 2 (x86_64 模擬) 執行 `linux/amd64` 映像檔。

### 方案 B：Azure SQL Edge (`azure-sql-edge`) [可選架構]
如果需要極致效能與極低 CPU/記憶體佔用，可替換為微軟官方提供的 `mcr.microsoft.com/azure-sql-edge`（原生 Arm64 架構映像檔）。

---

## 📁 專案架構 (Project Structure)

```
erp-system-phoenix/                # 專案總根目錄
├── backend/                       # 👈 .NET 10 Web API 後端專案 (C# / EF Core)
│   ├── Controllers/               # API 控制器 (AccountTitlesController, VouchersController)
│   ├── Data/                      # EF Core DbContext & Seed Data
│   ├── Models/                    # 會計領域 Entity 模型
│   ├── Migrations/                # EF Core 寫入 MS-SQL 之 Migration 腳本
│   ├── ERP.Host.csproj            # .NET 專案檔
│   └── Program.cs                 # API 入口與 Swagger 配置
│
├── frontend/                      # 👈 前端 Web 應用 (Next.js 16 / React 19 / Tailwind CSS v4)
│   ├── src/
│   │   ├── app/                   # App Router 頁面
│   │   └── components/            # UI 元件
│   ├── package.json
│   └── next.config.ts
│
├── docker-compose.yml             # MS-SQL Docker 容器設定檔
├── .env                           # 本地環境變數 (SA密碼/Port)
├── .env.example                   # 環境變數範本
├── init-scripts/                  # 資料庫初始化 SQL 腳本目錄
│   └── 01-init-db.sql             # 自動建立資料庫與 Schema
└── README.md                      # 設定與連線說明文件
```

---

## ▶️ 本地開發啟動指南 (Local Development)

> 建議開三個終端視窗分別執行下方步驟。

### 終端 1 — 啟動資料庫（MS-SQL Docker）

```bash
# 從專案根目錄執行
docker compose up -d

# 確認容器正常運作（Status 應為 running）
docker compose ps
```

### 終端 2 — 啟動後端 API（.NET 10）

```bash
cd backend/src/ERP.Host

# 首次執行：還原套件
dotnet restore

# 啟動開發伺服器（自動套用 Migration 並 Seed 資料）
dotnet run
```

後端啟動後可存取：
- **Swagger UI**：`http://localhost:5268/openapi`（或終端顯示的 Port）
- **API Base URL**：`http://localhost:5268/api`

### 終端 3 — 啟動前端（Next.js）

```bash
cd frontend

# 首次執行：安裝套件
pnpm install

# 啟動開發伺服器（Hot Reload）
pnpm dev
```

前端啟動後可存取：
- **Web 應用**：`http://localhost:3000`

---

### 一鍵停止所有服務

```bash
# 停止 Docker 資料庫（在專案根目錄）
docker compose down

# 後端與前端按 Ctrl + C 結束
```

---

### 常見問題排查

| 問題 | 解法 |
|------|------|
| `dotnet run` 後出現 Migration 錯誤 | 確認 Docker MS-SQL 容器已啟動：`docker compose ps` |
| 前端 API 請求失敗（CORS / 401） | 確認後端已啟動，檢查 `frontend/src/` 中的 `NEXT_PUBLIC_API_URL` 設定 |
| SQL Server 連線逾時 | 容器首次啟動需約 10-15 秒初始化，稍等後再試 |
| Port `5268` 被佔用 | 修改 `backend/src/ERP.Host/Properties/launchSettings.json` 中的 `applicationUrl` |
| `pnpm` 指令找不到 | 確認使用 Node.js v22：`nvm use v22.22.0`，再執行 `npm install -g pnpm` |
| `pnpm install` 失敗 | 確認 Node.js 版本 ≥ 18，執行 `node -v` 確認 |
