# 孕育之美 MVP｜媽咪交流社群 Google Sheet 資料表規格 (Community Schema)

## 模組說明：媽咪交流社群工作表規格（Step 01A）

本文件定義《孕育之美》媽咪交流社群（Community MVP）於 Google Sheet 後端儲存之資料庫結構設計、欄位型別定義、主外鍵關聯、快照原則（Snapshot Strategy）、軟刪除機制（Soft Delete）及隱私防護規範。

---

## 1. Scope (功能範疇與界線)

### 1.1 MVP 支援功能
* **純文字貼文 (Posts)**：發布公開交流心得、育兒孕期生活提問與分享。
* **公開動態牆 (Public Feed)**：依發文時間倒序瀏覽所有有效（未刪除）貼文。
* **按讚互動 (Likes)**：對貼文按讚與收回按讚（支援防重複按讚之單一關係）。
* **留言互動 (Comments)**：對指定貼文發表公開純文字留言。
* **檢舉機制 (Reports)**：對不當貼文或留言進行原因回報（供後台審核）。

### 1.2 MVP 明確不支援（Non-goals）
* ❌ 私訊功能 (Direct Messaging / PM)
* ❌ 追蹤與好友關係 (Follow / Friend / Followers)
* ❌ 圖片與多媒體上傳 (Image / Video / Audio)
* ❌ HTML / Markdown Rich-text 渲染
* ❌ 排行榜與熱門權重演算法 (Leaderboards / Trending)
* ❌ 複雜即時通知系統 (Push / WebSocket Notifications)
* ❌ 社團分群與私密看板 (Sub-groups / Channels)

---

## 2. Posts Schema (貼文資料表)

* **工作表名稱**：`Posts`
* **首列 Header 欄位順序**：
  `post_id` `profile_id` `author_nickname` `pregnancy_week` `content` `created_at` `updated_at` `is_deleted`

| 欄位名稱 (Field) | 資料型別 (Type) | 必填 (Required) | 範例值 (Example) | 欄位說明與設計規範 |
| :--- | :--- | :---: | :--- | :--- |
| `post_id` | String (UUID) | ✓ | `a3b8c9d0-1234-4567-89ab-cdef01234567` | 貼文唯一主鍵識別碼。建立貼文時由後端或前端生成標準 UUID，不可重複。 |
| `profile_id` | String | ✓ | `PRF-9B1DEB4D3B7D` | 發文者唯一識別碼。必須精確對應 `pregnancyAppUser.profileId`。**嚴禁使用 Email 或暱稱當 Primary/Foreign ID**。 |
| `author_nickname` | String | ✓ | `依婷媽咪` | 發文當下顯示的媽咪暱稱（**Snapshot 快照欄位**）。即使日後使用者修改個人 Profile 稱呼，舊貼文仍保留當時快照名稱。 |
| `pregnancy_week` | Integer | ✓ | `20` | 發文當下的孕週（**Snapshot 快照欄位**，預期 1–40 週）。未來由 `dueDate` 與發文當下時間自動計算，**嚴禁由使用者手動輸入**，且不隨日後目前孕週增加而異動。 |
| `content` | String | ✓ | `今天產檢寶寶很活潑，想問大家初期都是幾週開始感覺到胎動呢？` | 純文字貼文內容。MVP 不支援圖片、HTML、Markdown 渲染，僅儲存乾淨純文字。 |
| `created_at` | String (ISO 8601) | ✓ | `2026-08-28T08:30:00.000Z` | 貼文建立時間戳記（UTC 時間 ISO 字串）。 |
| `updated_at` | String (ISO 8601) | ✓ | `2026-08-28T08:30:00.000Z` | 貼文最後更新時間戳記。建立時與 `created_at` 相同，未來支援編輯時更新。 |
| `is_deleted` | Boolean | ✓ | `FALSE` | 軟刪除旗標。預設為 `FALSE`，刪除貼文時設為 `TRUE`，不直接刪除 Sheet 列以維護關聯完整性。 |

---

## 3. Comments Schema (留言資料表)

* **工作表名稱**：`Comments`
* **首列 Header 欄位順序**：
  `comment_id` `post_id` `profile_id` `author_nickname` `pregnancy_week` `content` `created_at` `is_deleted`

| 欄位名稱 (Field) | 資料型別 (Type) | 必填 (Required) | 範例值 (Example) | 欄位說明與設計規範 |
| :--- | :--- | :---: | :--- | :--- |
| `comment_id` | String (UUID) | ✓ | `f1e2d3c4-5678-90ab-cdef-1234567890ab` | 留言唯一識別碼 (UUID)。 |
| `post_id` | String (UUID) | ✓ | `a3b8c9d0-1234-4567-89ab-cdef01234567` | 所屬貼文的外鍵識別碼，精確對應 `Posts.post_id`。 |
| `profile_id` | String | ✓ | `PRF-3F7A2C91D4E0` | 留言者唯一識別碼，對應 `pregnancyAppUser.profileId`。 |
| `author_nickname` | String | ✓ | `Jennifer` | 留言當下暱稱（**Snapshot 快照欄位**）。 |
| `pregnancy_week` | Integer | ✓ | `28` | 留言當下孕週（**Snapshot 快照欄位**，1–40 週）。由系統依留言者預產期與發布時間自動計算，不允許手動修改。 |
| `content` | String | ✓ | `我第一胎大約是在 19 週感覺到像魚吐泡泡的感覺喔！` | 純文字留言內容。 |
| `created_at` | String (ISO 8601) | ✓ | `2026-08-28T09:15:00.000Z` | 留言建立時間戳記 (ISO 8601)。 |
| `is_deleted` | Boolean | ✓ | `FALSE` | 軟刪除旗標。預設為 `FALSE`。 |

---

## 4. Likes Schema (按讚資料表)

* **工作表名稱**：`Likes`
* **首列 Header 欄位順序**：
  `like_id` `post_id` `profile_id` `created_at`

| 欄位名稱 (Field) | 資料型別 (Type) | 必填 (Required) | 範例值 (Example) | 欄位說明與設計規範 |
| :--- | :--- | :---: | :--- | :--- |
| `like_id` | String (UUID) | ✓ | `e4f5a6b7-8901-2345-6789-abcdef012345` | Like 紀錄唯一識別碼 (UUID)。 |
| `post_id` | String (UUID) | ✓ | `a3b8c9d0-1234-4567-89ab-cdef01234567` | 被按讚的貼文 ID，對應 `Posts.post_id`。 |
| `profile_id` | String | ✓ | `PRF-3F7A2C91D4E0` | 按讚使用者的 `profileId`。 |
| `created_at` | String (ISO 8601) | ✓ | `2026-08-28T09:00:00.000Z` | 按讚時間戳記 (ISO 8601)。 |

### 4.1 按讚唯一性與取消策略 (Uniqueness & Unlike Strategy)
* **複合唯一限制 (Composite Uniqueness)**：`post_id` + `profile_id` 在整個 Likes 表中僅能存在一筆有效記錄（同一位使用者對同一篇貼文最多只能有一個按讚）。
* **取消按讚處理策略**：
  * 在 MVP 階段，Likes 表**不需要** `is_deleted` 欄位。
  * 當使用者執行 `toggleLike` 取消讚時，後端比對到符合 `post_id` + `profile_id` 的列，**直接刪除該 Row (Hard Delete / deleteRow)**。
  * 理由：按讚為高頻率切換之輕量關聯狀態，且不需要歷史留存與稽核復原，直接刪除列可保持 Likes 資料表緊湊、有效降低查詢過濾成本。

---

## 5. Reports Schema (檢舉回報資料表)

* **工作表名稱**：`Reports`
* **首列 Header 欄位順序**：
  `report_id` `target_type` `target_id` `reporter_profile_id` `reason` `created_at` `status`

| 欄位名稱 (Field) | 資料型別 (Type) | 必填 (Required) | 範例值 (Example) | 欄位說明與設計規範 |
| :--- | :--- | :---: | :--- | :--- |
| `report_id` | String (UUID) | ✓ | `r7d8c9e0-1122-3344-5566-778899aabbcc` | 檢舉記錄唯一識別碼 (UUID)。 |
| `target_type` | Enum (`post` \| `comment`) | ✓ | `post` | 檢舉目標類型。MVP 支援：`post`（貼文）或 `comment`（留言）。 |
| `target_id` | String (UUID) | ✓ | `a3b8c9d0-1234-4567-89ab-cdef01234567` | 目標識別碼：當 `target_type='post'` 時為 `Posts.post_id`；當 `target_type='comment'` 時為 `Comments.comment_id`。 |
| `reporter_profile_id` | String | ✓ | `PRF-9B1DEB4D3B7D` | 提交檢舉的使用者 `pregnancyAppUser.profileId`。 |
| `reason` | Enum (String) | ✓ | `medical_misinformation` | 檢舉原因列舉值（嚴禁直接使用前端展示中文作為儲存值）。 |
| `created_at` | String (ISO 8601) | ✓ | `2026-08-28T10:00:00.000Z` | 檢舉建立時間 (ISO 8601)。 |
| `status` | Enum (String) | ✓ | `pending` | 案件處理狀態。預設為 `pending`。 |

### 5.1 檢舉原因代碼表 (Reason Code Mapping)
| 代碼 (DB Value) | 前端顯示名稱 (UI Label) | 適用說明 |
| :--- | :--- | :--- |
| `spam` | 垃圾訊息或廣告 | 商業推銷、重複洗版、無關導流連結 |
| `harassment` | 不友善或騷擾內容 | 人身攻擊、謾罵挑釁、恐嚇歧視 |
| `medical_misinformation` | 疑似錯誤醫療資訊 | 宣稱偏方療效、未經證實之危險孕產行為 |
| `privacy` | 個人隱私資訊 | 洩漏他人聯絡資訊、真實住址、個資 |
| `other` | 其他原因 | 其他需要管理員介入檢視之情形 |

### 5.2 案件狀態列舉 (Status Enum)
* `pending`（預設，待審核）
* `reviewed`（已審核）
* `dismissed`（不成立/駁回）
* `actioned`（已處置/已下架內容）

---

## 6. Entity Relationships (資料實體關聯架構)

```text
       ┌──────────────┐
       │   Profiles   │
       └──────┬───────┘
              │ profile_id (1:N)
       ┌──────┴───────┐
       │    Posts     │─────────────┐
       └──────┬───────┘             │
              │ post_id (1:N)       │ post_id (1:N)
       ┌──────┴───────┐             │
       │   Comments   │             ▼
       └──────────────┘      ┌─────────────┐
              │              │    Likes    │
              │              │ (post_id +  │
              │              │  profile_id │
              │              │  is unique) │
              │              └─────────────┘
              ▼
       ┌──────────────┐
       │   Reports    │  target_id -> Posts.post_id OR Comments.comment_id
       └──────────────┘  reporter_profile_id -> Profiles.profile_id
```

### 6.1 關聯規則說明
1. **Profiles ➔ Posts**：一對多關聯（一位 Profile 可發布多篇貼文）。外鍵為 `Posts.profile_id`。
2. **Profiles ➔ Comments**：一對多關聯（一位 Profile 可發表多則留言）。外鍵為 `Comments.profile_id`。
3. **Posts ➔ Comments**：一對多關聯（一篇貼文可包含多則留言）。外鍵為 `Comments.post_id`。
4. **Profiles & Posts ➔ Likes**：多對多關聯實體化。一組 `(post_id, profile_id)` 僅允許一筆記錄。
5. **Posts / Comments ➔ Reports**：多型關聯（Polymorphic）。透過 `(target_type, target_id)` 連結至貼文或留言，並透過 `reporter_profile_id` 紀錄檢舉人。

---

## 7. Snapshot Strategy (快照設計原則)

社群交流貼文與留言之 `author_nickname` 與 `pregnancy_week` 採取**建立當下不可變快照（Snapshot）設計**。

### 7.1 為什麼需要快照？
* **孕週時效性**：孕媽咪在懷孕 18 週時提問「初唐檢查與胎動」，10 週後當媽咪已達 28 週時，若畫面隨即更新成 28 週，會造成讀者誤解「28 週才在問初唐與最初胎動」，失去交流情境的真實性與參考價值。
* **歷史稱呼留存**：即使使用者日後在個人設定中修改了暱稱，過去已發表的歷史貼文仍應維持當時發表時的稱呼快照，確保對話上下文語境一致。

### 7.2 快照範例
* **情境**：
  * 使用者 `PRF-9B1DEB4D3B7D`，預產期為 `2026-12-25`。
  * 於 `2026-08-01`（當時為孕 19 週，暱稱 `小花媽咪`）發表貼文 A。
  * 於 `2026-09-15`（使用者已達孕 25 週，且在設定頁將暱稱改為 `小花 & 寶貝`）。
* **呈現結果**：
  * 貼文 A 的畫面與資料庫中，作者與週數依然固定為：「小花媽咪｜孕 19 週」。
  * 貼文 A 不會被改為「小花 & 寶貝｜孕 25 週」。

---

## 8. Soft Delete Strategy (軟刪除策略)

### 8.1 適用範圍
* `Posts.is_deleted`（預設 `FALSE`，刪除時設為 `TRUE`）
* `Comments.is_deleted`（預設 `FALSE`，刪除時設為 `TRUE`）

### 8.2 軟刪除優點與規則
1. **關聯完整性**：若直接刪除 Sheet 列，可能導致其所屬的 Comments 或 Likes 成為孤兒資料（Orphan records），或引發檢舉調查時證據丟失。
2. **審核與風控**：遭檢舉或作者自刪之違規內容，後台仍需保留歷史文字以進行資安與內容稽核。
3. **Google Sheet 列穩定性**：避免頻繁刪除列造成 Row Index 劇烈位移或並行寫入衝突。
4. **Feed API 過濾規範**：未來所有公開列表 API（如 `getPosts`、`getComments`）**一律只回傳 `is_deleted !== true`** 之資料列。

---

## 9. Privacy Rules (隱私與個資保護規範)

Community 社群所有 Sheet 必須嚴格遵循最小揭露與去識別化原則：

1. **嚴禁儲存敏感個人資料**：
   * ❌ 使用者電子信箱 (Email)
   * ❌ 聯絡電話 / 手機號碼
   * ❌ 完整精確預產期日期 (EDD Exact Date)
   * ❌ 真實姓名 / 身分證字號 / 住址
   * ❌ IP 位址 / 瀏覽器 Fingerprint
   * ❌ 帳號密碼 / 憑證 Token
   * ❌ 個人病歷、產檢超音波數據等私密醫療健康紀錄
2. **公開識別機制**：
   * 社群資料僅能透過不具直接可識別性的 `profile_id`（如 `PRF-XXXXXXXXXXXX`）與 Profiles 表產生間接關聯。
   * 社群公開呈現僅使用使用者自訂的公開稱呼（`author_nickname`）與相對孕週（`pregnancy_week`），確保個人隱私完全受到保護。

---

## 10. Future API Mapping (未來 API 規劃藍圖)

> 註：本階段（Step 01A）僅定義資料庫結構，下列 API 預計於後續步驟實作，此處僅作為介面規格對應之參考。

* **貼文模組 (Posts API)**：
  * `createPost(profileId, content)`：建立新貼文（自動計算當前週數快照並寫入 `Posts`）。
  * `getPosts(page, limit)`：取得公開貼文動態列表（自動過濾 `is_deleted=TRUE`，並整合按讚數與留言數）。
  * `deletePost(postId, profileId)`：刪除貼文（驗證作者權限後執行軟刪除 `is_deleted=TRUE`）。
* **留言模組 (Comments API)**：
  * `createComment(postId, profileId, content)`：於指定貼文發表留言。
  * `getComments(postId)`：取得指定貼文之有效留言清單。
  * `deleteComment(commentId, profileId)`：刪除指定留言（軟刪除 `is_deleted=TRUE`）。
* **互動模組 (Likes API)**：
  * `toggleLike(postId, profileId)`：切換貼文按讚狀態（已讚則取消，未讚則新增）。
* **檢舉模組 (Reports API)**：
  * `createReport(targetType, targetId, reporterProfileId, reason)`：提交檢舉案件。
