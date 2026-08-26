# 孕育之美 MVP｜Google Sheet 資料表規格 (Schema Specification)

## 模組說明：Profiles 資料表（Step 01A）

本文件定義《孕育之美》與 Google Sheet 串接時的第一張核心工作表 `profiles` 之欄位結構、型別定義、前後端欄位對應關係及設計規範。

---

## 1｜工作表名稱 (Sheet Name)

* **工作表名稱**：`profiles`
* **首列 Header 欄位順序**（以空格分隔）：
  `profile_id` `mom_nickname` `email` `due_date` `pregnancy_number` `baby_nickname` `baby_gender` `created_at` `updated_at`

---

## 2｜前後端欄位對應表 (Field Mapping)

| Google Sheet Header (Snake Case) | Frontend Object Property (Camel Case) | 型別 (Type) | 必填 (Required) | 不可變動 (Immutable) | 欄位說明與格式範例 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `profile_id` | `profileId` | String | ✓ | ✓ | 孕期個人檔案永久唯一識別碼，格式 `PRF-XXXXXXXXXXXX` |
| `mom_nickname` | `momNickname` | String | ✓ | ✗ | 媽咪稱呼，例如：`依婷媽咪`、`Jennifer` |
| `email` | `email` | String | ✓ | ✗ | 使用者電子信箱，例如：`example@email.com` |
| `due_date` | `dueDate` | String | ✓ | ✗ | 預產期 (EDD)，格式 `YYYY-MM-DD`，例如：`2026-11-20` |
| `pregnancy_number` | `pregnancyNumber` | String | ✓ | ✗ | 懷孕胎數，沿用前端既有值：`第一胎` / `第二胎` / `第三胎以上` |
| `baby_nickname` | `babyNickname` | String | ✓ | ✗ | 寶寶暱稱，例如：`小茉莉` |
| `baby_gender` | `babyGender` | String | ✓ | ✗ | 寶寶性別，沿用前端既有值：`尚未揭曉 🤍` / `女寶寶 👧` / `男寶寶 👦` |
| `created_at` | `createdAt` | String (ISO 8601) | ✓ | ✓ | 建立時間戳記，例如：`2026-08-26T10:30:00.000Z` |
| `updated_at` | `updatedAt` | String (ISO 8601) | ✓ | ✗ | 最後更新時間戳記，例如：`2026-08-26T10:45:00.000Z` |

---

## 3｜前端專屬欄位（不進入 Google Sheet）

* `initialized`：布林值 (`true` / `false`)，為純前端狀態旗標，用以判斷當前瀏覽器是否已完成 Welcome / Initial Profile 流程。**不需同步至 Google Sheet**。

---

## 4｜資料範例示意 (Example Records)

| profile_id | mom_nickname | email | due_date | pregnancy_number | baby_nickname | baby_gender | created_at | updated_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PRF-9B1DEB4D3B7D` | 依婷媽咪 | yiting@example.com | 2026-11-20 | 第一胎 | 小茉莉 | 女寶寶 👧 | 2026-08-26T08:00:00.000Z | 2026-08-26T08:00:00.000Z |
| `PRF-3F7A2C91D4E0` | Jennifer | jennifer@example.com | 2027-01-12 | 第二胎 | 波波 | 男寶寶 👦 | 2026-08-26T09:15:22.000Z | 2026-08-26T09:30:00.000Z |

---

## 5｜設計與安全準則

1. **唯一性與關聯主鍵**：
   * `profile_id` 為全系統所有業務資料（孕期日記、問診備忘錄、個人產檢紀錄等）的核心外鍵 (Foreign Key)。
   * **禁止使用 `email` 作為 Primary Key**，以避免使用者更換 Email 或使用第三方登入時發生資料斷鏈。
2. **不可變性 (Immutability)**：
   * `profile_id` 一旦在前端由 `generateProfileId()` 或由 Migration 生成後，不得因頁面重新整理、重啟瀏覽器、修改任何 Settings/Profile 欄位而重置或變更。
3. **神隊友訪客模式 (Partner Guest)**：
   * 神隊友訪客僅供檢視，不建立新的 `profile_id`，亦不修改媽咪本人的 `profile_id`。
