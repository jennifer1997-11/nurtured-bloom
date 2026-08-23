# Medical KB Production Data Guide
孕育之美 Production Medical Dataset 開發者與運營維護指南

## 1. 醫療知識庫架構與 Source of Truth

- **Medical Source of Truth**:
  `knowledge/medical/records/`
  此目錄為孕育之美所有醫療衛教記錄的權威來源（Medical Knowledge Source of Truth）。包含所有原始評閱記錄、醫療證據鏈與稽核紀錄。
  *注意事項：禁止直接自此目錄進行前台 UI 或 AI Retrieval 讀取。*

- **Production Dataset (衍生資料層)**:
  `data/medical/medical-kb.production.json`
  `data/medical/medical-kb.index.json`
  `data/medical/medical-kb.production-report.json`
  正式前台 UI、靜態頁面、搜尋與 AI 孕期助理只能讀取 `data/medical/` 目錄下的 Production Dataset。

---

## 2. Production 嚴格過濾機制 (Filter Rules)

正式 Production Dataset 僅收錄符合以下雙重條件之醫療記錄：

1. `review_status == "approved"`
2. `evidence.human_reviewed == true`

任何狀態為 `draft`、`candidate`、`needs_review`、`blocked`、`deprecated` 或 `human_reviewed == false` 之記錄，皆被系統強制排除，絕對不得進入 Production Data Layer。

---

## 3. 自動化 Data Export 流程與指令

- **Export Script 位置**:
  `scripts/export-medical-kb.py`

- **如何重新導出 Production Data**:
  當 `knowledge/medical/records/` 新增或修訂 Medical Record 並經過醫師/護理師核可 (`approved` + `human_reviewed=true`) 後，請於專案根目錄執行：

  ```bash
  python scripts/export-medical-kb.py
  ```

  執行後將自動完成：
  1. JSON 語法與格式驗證
  2. Production 過濾器篩選
  3. 生成包含 `metadata` 與 `records` 之 `medical-kb.production.json`
  4. 生成提供快速檢索索引 (`by_record_id`, `by_category`, `by_pregnancy_stage`, `by_week`, `by_frontend_target`) 之 `medical-kb.index.json`
  5. 生成供 Governance / Audit 使用之 `medical-kb.production-report.json`

---

## 4. Frontend Data Consumer 指引

前台（包括首頁、我的孕期、寶寶成長、產檢地圖、神隊友模式、AI 孕期助理等）在進行資料串接時，應遵從以下規範：

1. **不可直接存取 `knowledge/medical/records/`**。
2. **優先存取 `data/medical/medical-kb.index.json`**：進行週數、階段、Category 或 Frontend Target 快速查詢與對應（取得 Record ID 列表）。
3. **根據所需 Record ID 讀取 `data/medical/medical-kb.production.json`**：獲取完整內容、衛教提醒、急診警訊與引用證據。

---

## 5. Review Dashboard 與 Production Dataset 之區別

| 項目 | Review Dashboard (`tools/medical-kb-review`) | Production Dataset (`data/medical/`) |
|---|---|---|
| **用途** | 供醫療專家、編輯與開發團隊審查與管理 Medical KB | 供前台產品 UI、網頁與 AI 模型 Retrieval Layer 讀取 |
| **資料來源** | `sync-data.py` 讀取 `knowledge/medical/` | `export-medical-kb.py` 自動過濾導出 |
| **過濾條件** | 包含 approved、needs_review、source_gaps 等完整狀態 | 僅收錄 `approved` 且 `human_reviewed=true` 之紀錄 |
| **讀取對象** | 人類審查者 / 內部治理系統 | Production Application Users / Frontend Consumers |
