# CommerceOS V2 Cloudflare MVP 實作計畫

## 1. 目標

V2 將目前以 Vue 3、Vite、TypeScript、Dexie／IndexedDB 實作的前端展示系統，擴充為可部署至 Cloudflare 免費方案的真實全端 MVP。

```text
管理員登入
→ 建立商品與 SKU
→ 建立初始庫存
→ 商品上架
→ 顧客註冊、登入及下單
→ 預留庫存 15 分鐘
→ 模擬付款
→ 揀貨及出貨
→ 實扣庫存
→ 模擬物流更新
→ 訂單完成
→ Dashboard 與營運分析更新
→ 依低庫存資訊補貨
→ 回到庫存管理
```

### MVP 包含

- 顧客與管理員兩種角色。
- 顧客註冊、登入、商品瀏覽、下單及訂單查詢。
- 商品、SKU、上下架及內建商品圖片選擇。
- 初始入庫、預留、釋放、出貨、補貨及庫存流水。
- 15 分鐘待付款庫存預留。
- 模擬付款與模擬物流 webhook。
- 揀貨、出貨、配送、完成及出貨前取消。
- 會員查詢、Dashboard 及近 7／30 日營運分析。

### MVP 不包含

- 正式金流、正式物流、Email、簡訊及信箱驗證。
- R2、Cloudflare Images 或其他可能產生用量費用的服務。
- 忘記密碼、多因素驗證、優惠券、發票、稅務及多幣別。
- 多倉、批號、效期、部分出貨、退貨及正式退款。
- 購物車跨裝置同步與即時 WebSocket Dashboard。

## 2. 開發與版本規則

### 分支

- V2 文件、程式、測試及部署設定只在 `v2/cloudflare-mvp` 分支進行。
- `master` 保持 V1 穩定版本，不直接修改或提交 V2 內容。
- V2 完成前不得合併回 `master`；是否合併由使用者在最終驗收後決定。

### 文件同步

- 本文件是 V2 需求與實作範圍的主要依據。
- 新增需求、刪除範圍、狀態規則或架構決策時，在同一階段同步更新本文件。
- API、資料表或流程重大調整時，同步更新相關技術文件與 README。
- 不允許程式行為已改變但需求文件仍保留舊規格。

### Commit

- 延續既有中文 commit message 風格，依功能與階段拆分提交。
- 每個 commit 說明一個明確成果，不把所有 V2 內容壓成單一 commit。
- 預定紀錄：

```text
建立 V2 Cloudflare MVP 規劃文件
建立 Cloudflare Worker 與 D1 基礎架構
建立會員驗證與角色權限
建立商品、SKU 與庫存資料流程
建立訂單與庫存預留流程
建立模擬付款與物流流程
串接管理後台與顧客操作流程
建立 Dashboard 與營運分析
補充單元測試與瀏覽器流程驗證
完成 Cloudflare 免費方案部署
```

實際 commit 可依成果再細分，但不得混合無關模組。

### 影片

- 開發期間不執行或覆寫正式展示影片。
- V2 功能、測試、文件及部署全部完成後，先提供驗收結果給使用者。
- 只有使用者明確確認功能沒有問題並同意更新影片後，才能錄影或更新 `public/media` 展示資產。
- 影片更新使用獨立 commit，不混入功能實作 commit。

## 3. 零額外費用架構

```text
瀏覽器
  ├─ Vue 3 SPA 與內建商品圖片 → Workers Static Assets
  └─ /api/* → TypeScript Cloudflare Worker
                  ├─ D1 Free：關聯式交易資料
                  ├─ Turnstile Free：登入／註冊防濫用
                  └─ Cron Trigger：釋放逾時預留庫存
```

- 保留 Vue 3、Vite、TypeScript、Vue Router、Pinia、Element Plus 與 ECharts。
- 後端使用 TypeScript Cloudflare Worker 模組化單體，不建立 Java、Spring Boot 或常駐 Node.js Server。
- D1 使用 SQLite SQL 與 migration 管理資料表。
- 商品圖片隨前端部署，管理員從圖片 manifest 選擇，不提供檔案上傳。
- 使用免費 `workers.dev` 網址；自訂網域不列入零費用保證。
- 不啟用 R2、Cloudflare Images、Workers Paid、Argo 或其他用量計費附加服務。
- Workers／D1 免費額度用完時接受暫停服務，不自動升級付費方案。

## 4. 後端規劃

單一 Worker 內部分為身份驗證、商品、庫存、訂單、模擬付款、揀貨出貨、模擬物流與分析模組。

### 身份與權限

- 密碼使用 Web Crypto PBKDF2-SHA256、個別 salt 與 Worker Secret pepper。
- Session 使用高強度隨機 token；瀏覽器只保存 `HttpOnly`、`Secure`、`SameSite=Lax` Cookie。
- D1 只保存 Session token hash。
- 管理員由部署種子建立，不開放管理員註冊。
- `/api/admin/*` 必須在 Worker 驗證 `ADMIN`，不能只依賴前端路由守衛。

### 資料一致性

```text
available = on_hand - reserved
```

- `on_hand`、`reserved` 與 `available` 不得小於零。
- Checkout 不信任前端售價，由後端重新讀取 SKU 價格及庫存。
- 訂單、明細與全部 SKU 預留在同一 D1 transaction batch 完成。
- 任一 SKU 庫存不足時整筆訂單回滾。
- 訂單明細保存商品名稱、SKU 名稱與單價快照。
- 出貨前只增加 `reserved`；出貨時才同時減少 `on_hand` 與 `reserved`。
- 庫存流水只新增，不修改或刪除。
- webhook 以 HMAC 簽章和唯一事件 ID 保證冪等。
- 狀態更新使用預期狀態條件，避免重複付款、出貨、取消或完成。

## 5. D1 資料庫

| 資料表 | 用途 | 主要欄位 |
| --- | --- | --- |
| `users` | 會員與管理員 | email、password_hash、password_salt、role、status |
| `sessions` | 登入 Session | user_id、token_hash、expires_at |
| `products` | 商品資料 | name、description、status、static_image_id |
| `skus` | 規格與售價 | product_id、sku_code、option_name、price_minor、safety_stock |
| `inventory_balances` | SKU 即時庫存 | sku_id、on_hand、reserved |
| `inventory_movements` | 庫存流水 | type、on_hand_delta、reserved_delta、order_id、reason |
| `orders` | 訂單與收件快照 | order_no、user_id、status、total_minor、收件資料、expires_at |
| `order_items` | 商品快照 | sku_id、商品／SKU 名稱、unit_price_minor、quantity |
| `payments` | 模擬付款 | order_id、provider_event_id、status、amount_minor |
| `shipments` | 模擬物流 | order_id、tracking_number、status、時間欄位 |
| `webhook_events` | webhook 冪等 | provider_event_id、event_type、payload_hash、processed_at |

### 狀態

- 商品：`DRAFT → PUBLISHED → ARCHIVED`
- 訂單：`PENDING_PAYMENT → PENDING_FULFILLMENT → PICKING → SHIPPED → COMPLETED`
- 訂單例外：`CANCELLED`
- 付款：`PENDING → SUCCEEDED | FAILED | VOIDED`
- 物流：`PENDING → LABEL_CREATED → IN_TRANSIT → DELIVERED | EXCEPTION`
- 庫存：`INITIAL | RESERVE | RELEASE | SHIP | RESTOCK | ADJUST`

### 索引與限制

- email、sku_code、order_no、provider_event_id 使用唯一索引。
- 訂單依會員、狀態、日期及預留到期時間建立複合索引。
- 庫存流水依 SKU、訂單及建立時間建立索引。
- 使用 `CHECK`、外鍵與 trigger 防止負庫存、非法數量與不完整關聯。
- 金額使用整數最小貨幣單位，不使用浮點數。

## 6. API

### 顧客與公開 API

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/products
GET  /api/products/:id
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
POST /api/orders/:id/cancel
POST /api/demo/payments/:orderId/succeed
POST /api/demo/payments/:orderId/fail
```

### 管理 API

```text
GET   /api/admin/dashboard
GET   /api/admin/analytics
GET   /api/admin/members
POST  /api/admin/products
PATCH /api/admin/products/:id
POST  /api/admin/products/:id/publish
POST  /api/admin/products/:id/archive
POST  /api/admin/skus
PATCH /api/admin/skus/:id
GET   /api/admin/inventory
GET   /api/admin/inventory/:skuId/movements
POST  /api/admin/inventory/:skuId/initial
POST  /api/admin/inventory/:skuId/restock
POST  /api/admin/inventory/:skuId/adjust
GET   /api/admin/orders
POST  /api/admin/orders/:id/pick
POST  /api/admin/orders/:id/ship
POST  /api/demo/shipments/:orderId/in-transit
POST  /api/demo/shipments/:orderId/delivered
POST  /api/demo/shipments/:orderId/exception
```

## 7. Dashboard

開啟或重新整理時從 D1 查詢，不使用即時推播。最低指標：

- 訂單總數、付款成功金額與完成營收。
- 待付款、待出貨、配送中及完成訂單數。
- 低於安全庫存的 SKU 數量及清單。
- 最近訂單。
- 近 7 日／30 日每日訂單數與營收。
- 銷量前五名 SKU。

查詢使用日期與狀態索引，避免全表掃描消耗 D1 rows-read 額度。

## 8. 實作階段

1. 建立 V2 分支、規劃文件及 Cloudflare 本機設定。
2. 建立 D1 migrations、seed、repository 與 Worker API 骨架。
3. 建立顧客註冊、登入、Session 及管理員權限。
4. 將商品、SKU 與庫存由 IndexedDB 轉接 Worker API。
5. 建立顧客商品頁、購物車、Checkout、訂單與 15 分鐘預留。
6. 建立模擬付款、Cron 逾時釋放與出貨前取消。
7. 建立揀貨、出貨、實扣庫存與模擬物流 webhook。
8. 將會員、Dashboard 及營運分析改接 D1。
9. 補齊 migration、單元、API integration、瀏覽器 E2E 與異常測試。
10. 部署至 Cloudflare 免費方案並執行 production smoke test。
11. 彙整功能、測試、文件、部署網址與限制，交由使用者確認。
12. 只有取得使用者明確同意後，才建立或更新 V2 展示影片。

## 9. 驗收條件

- 顧客可完成註冊、登入、下單、模擬付款及訂單查詢。
- 管理員可完成商品、SKU、初始庫存、上架、揀貨、出貨及補貨。
- 兩位顧客同時購買最後一件 SKU 時，只能有一筆成功預留。
- 建立訂單只降低可售庫存，出貨時才降低實際庫存。
- 待付款超過 15 分鐘後，在下一次 Cron 執行時釋放庫存。
- 付款與逾時清理同時發生時，只有一個合法狀態轉換成功。
- 重複付款及物流 webhook 不建立重複流水。
- 出貨前取消會釋放庫存，出貨後不可取消。
- 顧客不可讀取其他會員訂單或呼叫管理 API。
- 商品修改不影響歷史訂單快照。
- Dashboard 數字與訂單、付款及庫存流水一致。
- lint、typecheck、unit、API integration、build、desktop E2E 與 tablet E2E 全部通過。
- `workers.dev` 正式部署可完成端到端 smoke test。
- 驗收前不得更新正式展示影片。

## 10. 完成定義

- 主流程與例外流程均已實作。
- migration、seed 與部署流程可重現。
- 所有必要測試通過且沒有未說明的阻斷問題。
- README、需求計畫與實際行為同步。
- 免費方案部署正常，且未啟用可能產生額外費用的服務。
- 已向使用者提交驗收摘要並取得功能確認。

功能確認不等於同意更新影片；影片必須再取得一次明確授權後才能處理。
