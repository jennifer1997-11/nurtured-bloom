# 【孕育之美｜Homepage Mom Dashboard Read-only Audit 審查報告】

> **文件版本**：v1.0.0  
> **稽核日期**：2026-08-25  
> **稽核性質**：Read-only 靜態審查與整合前相容性診斷  
> **操作限制遵循**：無修改 HTML/CSS/JS、無變更 Medical KB、未建立 Git Commit、無網路搜尋、無自行生成醫療內容。

---

## 一、首頁正式定位確認

首頁正式定案為**「當週重點摘要 Dashboard」**（非完整功能頁），僅收攏與呈現 5 大核心區塊：

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TOP GREETING        早安，依婷媽咪 🌸 ｜ 第 24 週 3 天 ｜ 距 EDD 93 天   │
├──────────────────────────────┬──────────────────────────────┤
│ 2. BABY OF THE WEEK          │ 3. TODAY'S CHECK-IN          │
│    - Q版寶寶圖 (PNG)           │    - 心情 Emoji 輕量選取       │
│    - 大小比喻 (如: 玉米)       │    - 一句簡短紀錄             │
│    - 身長 (如: 約 30 cm)       │    - 儲存直通「孕期日記」     │
│    - 1 則寶寶成長摘要          │    - 顯示最近一筆日記摘要     │
│    - [查看寶寶成長 →]          │    - [查看日記 →]             │
├──────────────────────────────┼──────────────────────────────┤
│ 4. THIS WEEK                 │ 5. NEXT CHECKUP              │
│    - 媽咪本週身體變化 (2 項)   │    - 下次產檢週數 (如: 第24週)│
│    - [查看孕期總覽 →]          │    - 例行檢查與公費重點摘要   │
│                              │    - [查看產檢項目 →]         │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 二、首頁現有欄位 Hardcode 稽核

| Homepage Field | Current Value | Hardcoded / Data-driven | Current Source | Should Replace With |
| :--- | :--- | :--- | :--- | :--- |
| **Greeting 稱謂** (`#greetingTitle`) | `早安，依婷媽咪 🌸` | ⚠️ **Hardcoded in HTML** | 靜態 HTML (`line 3170`)，未綁定 JS | `APP.nickname` 動態組合字串 |
| **距離預產期天數** (`#eddDays`) | `93` 天 | ✅ **Data-driven** | `updateWeekUI()` 呼叫 `calcWeekInfo(APP.edd)` | 維持現狀，由中央 EDD 驅動 |
| **目前孕週天數** (`#weekText`) | `妊娠 24 週 3 天` | ✅ **Data-driven** | `updateWeekUI()` 呼叫 `calcWeekInfo(APP.edd)` | 維持現狀，由中央 EDD 驅動 |
| **孕期階段標籤** (`#trimesterText`) | `第二孕期・花苞漸展階段` | ✅ **Data-driven** | `updateWeekUI()` 呼叫 `getTrimester(weeks)` | 維持現狀 |
| **寶寶大小比喻** (`.size-chip`) | `🌱 約一顆玉米筍大小` | 🔴 **Hardcoded in HTML** | 靜態 HTML (`line 3194`) | `BABY_GROWTH_DATA.weeks[w].size_analogy_zh` |
| **寶寶示意圖像** (`.baby-stage svg`) | 靜態向量插圖 (188x188 SVG) | 🔴 **Hardcoded in HTML** | 靜態 SVG (`line 3198-3216`) | `getBabyGrowthImage(currentWeek)` (PNG 資產) |
| **寶寶眼皮/睡與醒說明** (`.baby-caption`) | `寶寶的眼皮已能輕輕閉合...` | 🔴 **Hardcoded in HTML** | 靜態 HTML (`line 3218`) | `BABY_GROWTH_DATA.weeks[w].consumer_body` (取 1 則) |
| **Today's Check-in 儲存行為** | 點擊僅切換 local DOM 顯示 | 🔴 **Prototype Fake Save** | JS 本地事件 (`line 4043`)，未持久化 | 直接寫入 `pregnancyDiaryEntries` (localStorage) |
| **花園開2朵花** (`.garden-card`) | `新開了 2 朵小花...` | 🔴 **Hardcoded Prototype** | 靜態 HTML (`line 3242-3254`) | **依定案完全移除**（由 THIS WEEK 取代） |
| **神隊友任務** (`#partnerTipTxt`) | `陪她散步 10 分鐘...` | 🔴 **Hardcoded in HTML** | 靜態 HTML (`line 3260`) | **依定案完全移除**（首頁不展示） |
| **神隊友週數標籤** (`#partnerTipLabel`) | `本週隊友任務・第 24 週` | 🔴 **Hardcoded in HTML** | 靜態 HTML (`line 3260`) | **依定案完全移除** |
| **神隊友按鈕** | `今日已完成` | 🔴 **Hardcoded Prototype** | 靜態 HTML (`line 3262`) | **依定案完全移除** |
| **本週提醒區塊** (`#weeklyReminderCard`) | 骨架卡片但內容空白 | ⚠️ **Dead HTML Container** | 靜態 HTML (`line 3267-3270`) | **依定案完全移除**（由 NEXT CHECKUP 取代） |
| **神隊友視角 Hero** (`#partnerHeroDesc`) | `第 24 週，她正在面對妊娠糖尿病...` | 🔴 **Hardcoded in HTML** | 靜態 HTML (`line 3278`) | 應自神隊友正式 Mapping 驅動（首頁媽咪視角不載入） |
| **神隊友知識** (`#partnerKnowledge`) | `妊娠糖尿病篩檢前，她需要空腹...` | 🔴 **Hardcoded in HTML** | 靜態 HTML (`line 3283`) | 應自神隊友正式 Mapping 驅動（首頁媽咪視角不載入） |

---

## 三、Greeting Data Audit

### 1. 來源與計算 Function 稽核

* **`currentWeek`**：來自 `APP.currentWeek`，由 `calcWeekInfo(APP.edd).weeks` 動態更新（基準：`Math.floor((280 - daysToEdd) / 7)`）。
* **`currentDay`**：來自 `APP.currentDay`，由 `calcWeekInfo(APP.edd).days` 動態更新（基準：`(280 - daysToEdd) % 7`）。
* **`trimester`**：由 `getTrimester(currentWeek)` 回傳（`< 14` 第一孕期、`< 28` 第二孕期、其餘第三孕期）。
* **`eddDays`**：由 `calcWeekInfo(APP.edd).daysToEdd` 動態計算（基準：`Math.round((eddDate - today) / 86400000)`）。
* **使用者稱謂**：由 `APP.nickname`（預設 `'依婷媽咪'`）提供。

### 2. 評估結論

現有 `calcWeekInfo()` 與 `updateWeekUI()` 已具備完整且正確的 EDD 倒數與週數換算機制。
**無需也不得建立第二套孕週計算邏輯**。首頁僅需在 `updateWeekUI()` 中擴充同步 `#greetingTitle` 稱謂即可。

---

## 四、Baby of the Week Data Audit

已核准的正式資料源：`BABY_GROWTH_DATA` (40 週完整 Approved 衛教)、`getBabyGrowthData(week)`、`getBabyGrowthImage(week)`。

| Homepage Baby Field | Existing Baby Growth Source | Reusable | Notes |
| :--- | :--- | :---: | :--- |
| **Baby Image** | `getBabyGrowthImage(currentWeek)` | ✅ **100%** | 回傳 14 階段精緻寶寶 PNG 圖檔路徑 (`assets/images/baby-week/...`) |
| **Size Analogy (大小比喻)** | `getBabyGrowthData(w).size_analogy_zh` | ✅ **100%** | 第 24 週回傳 `"玉米"`（NHS 官方對應），首頁加上 `"約一顆玉米大小"` |
| **Length (身長)** | `getBabyGrowthData(w).length_cm` | ✅ **100%** | 第 24 週回傳 `30`，首頁加上 `"約 30 cm · 身長參考"` |
| **Consumer Body (成長摘要)** | `getBabyGrowthData(w).consumer_body` | ✅ **100%** | 溫馨衛教短文，首頁直接取 1 則摘要，完全替代原 Hardcode 文案 |

---

## 五、Today's Check-in / Diary Audit

### 1. 核心結構比對

* **現有 Diary Storage Key**：`'pregnancyDiaryEntries'`
* **Diary Record 正式資料規格**：
  ```javascript
  {
    id: "diary_1724578900000_abc12",
    date: "2026-08-25",         // getDiaryTodayISO() -> YYYY-MM-DD
    pregnancyWeek: 24,           // 數字
    pregnancyDay: 3,             // 數字
    mood: "🌸",                  // Emoji 符號字串
    content: "今天散步心情很放鬆", // 文字
    createdAt: "2026-08-25T06:41:40.000Z",
    updatedAt: "2026-08-25T06:41:40.000Z"
  }
  ```
* **Save Function**：`saveDiaryEntriesToStorage(entries)`（直接存入 `localStorage`）。
* **Latest Diary 取得方式**：
  ```javascript
  var entries = getDiaryEntriesFromStorage();
  // 依 date 降冪與 createdAt 降冪排列後取 entries[0]
  ```

### 2. 評估判定：`DIARY_ADAPTER_REQUIRED`

**原因**：
目前首頁 Check-in 的 DOM 事件（`checkinDoneBtn`）僅做 Prototype 本地假儲存，且既有 `handleSaveDiaryEntry()` 與 `#tab-diary` 的特定表單 DOM ID 強耦合。
首頁需要一個輕量 Adapter（例如 `saveDiaryEntryFromHome({ mood, content })`），將首頁輸入包裝成標準 Diary 格式後調用 `saveDiaryEntriesToStorage()`，達成**單一 Storage、雙向即時同步**。

---

## 六、THIS WEEK Data Audit

### 1. 資料源路徑與提取鏈路

```
APP.currentWeek (例: 24)
  │
  ▼
PREGNANCY_WEEKLY_MAPPING_DATA.weeks.find(w => w.week === currentWeek)
  │
  ▼
weekData.mom_changes (陣列，已保證每週有 2 則審查核准之溫和生理適應衛教)
  │
  ▼
首頁取前 2 項：
  - Item 1: { title: weekData.mom_changes[0].title, summary: weekData.mom_changes[0].summary }
  - Item 2: { title: weekData.mom_changes[1].title, summary: weekData.mom_changes[1].summary }
```

### 2. 首頁呈現原則
首頁僅需渲染 `title` 與 `summary`，**不展開內部 bullet list**（維持卡片精簡），點擊「查看孕期總覽 →」直接切換至完整總覽分頁。

---

## 七、NEXT CHECKUP Data Audit

### 1. 產檢資料源稽核

| Data | Existing Source | Reusable | Notes |
| :--- | :--- | :---: | :--- |
| **Next Visit Week** | `PRENATAL_MAP_NODES` (`node.week`) | ✅ | 目前由 14 個產檢節點組成（8, 12, 16, 20, 24, 28...） |
| **Visit Title** | `PRENATAL_MAP_NODES` (`node.visit_title`) | ✅ | 例：`"第 5 次公費產檢（第 24 週）"` |
| **Routine / Public Summary** | `node.routine_items` & `node.publicly_funded_items` | ✅ | 例行檢查 2 項 + 公費超音波/糖水篩檢重點摘要 |

### 2. 評估判定：`PRENATAL_NEXT_VISIT_ADAPTER_REQUIRED`

**原因**：
目前產檢地圖模組僅有 `renderMapNodes()` 用於渲染全覽軌道，尚無公開 helper 可依 `currentWeek` 取得下一次產檢節點。
建議未來擴充輕量 Adapter：`getNextPrenatalVisit(currentWeek)`，邏輯為：尋找 `node.week >= currentWeek` 的第一個節點（若已達 40 週則取最後一個節點），提供給首頁 NEXT CHECKUP 卡片。

---

## 八、首頁 Navigation & Deep Linking Audit

### 1. 目標跳轉路徑

* **BABY OF THE WEEK** → `view-baby`
* **TODAY'S CHECK-IN** → `view-journey` + `tab-diary`
* **THIS WEEK** → `view-journey` + `tab-overview`
* **NEXT CHECKUP** → `view-journey` + `tab-map`

### 2. 評估判定：`TAB_DEEP_LINK_ADAPTER_REQUIRED`

**原因**：
目前的 `goToView(name)`（`line 3949`）僅支援切換至指定一級頁面（如 `journey`），無法接收指定子分頁（如 `diary`、`map`、`overview`），亦無自動觸發該分頁之專屬初始化函式（如 `renderDiaryHome()`、`renderMapNodes()`）。
未來需將跳轉升級為支援 `goToView('journey', 'diary')` 或透過 `data-view="journey" data-tab="diary"` 達成 Deep Link。

---

## 九、單一 Homepage Adapter 評估

### 結論：`RECOMMENDED`

建議在未來整合階段建立單一純聚合物件函式 `getHomeDashboardData()`：

```javascript
function getHomeDashboardData() {
  var weekInfo = calcWeekInfo(APP.edd);
  var currentWeek = weekInfo.weeks;
  var currentDay = weekInfo.days;

  return {
    greeting: {
      nickname: APP.nickname || '依婷媽咪',
      week: currentWeek,
      day: currentDay,
      trimester: getTrimester(currentWeek),
      daysToEdd: weekInfo.daysToEdd
    },
    babySummary: (function(){
      var data = getBabyGrowthData(currentWeek) || {};
      return {
        image: getBabyGrowthImage(currentWeek),
        analogy: data.size_analogy_zh || '成長中',
        length: data.length_cm != null ? ('約 ' + data.length_cm + ' cm') : null,
        summary: data.consumer_body || ''
      };
    })(),
    latestDiary: (function(){
      var entries = getDiaryEntriesFromStorage();
      return entries.length > 0 ? entries[0] : null;
    })(),
    momChanges: (function(){
      var weeks = (PREGNANCY_WEEKLY_MAPPING_DATA && PREGNANCY_WEEKLY_MAPPING_DATA.weeks) || [];
      var wData = weeks.find(function(w){ return w.week === currentWeek; }) || {};
      return (wData.mom_changes || []).slice(0, 2);
    })(),
    nextCheckup: getNextPrenatalVisit(currentWeek)
  };
}
```

**效益**：零重複儲存、零新增醫療內容、完全解耦 UI 渲染與資料流。

---

## 十、首頁明確排除項目

未來首頁嚴格**不收錄**以下內容，維持純 Dashboard 定位：
* ❌ 完整 40 週孕期總覽切換滑桿
* ❌ 本週提醒（`mom_reminders`）3 則條列清單
* ❌ 完整 Baby 6 大里程碑時間軸
* ❌ 完整產檢 14 節點地圖與自費/疫苗學習卡片
* ❌ 問診備忘錄題目清單與 AI 建議功能
* ❌ 完整孕期日記歷史捲軸與刪除/編輯 Modal
* ❌ 神隊友 3 項行動任務卡片與準爸爸社群按鈕
* ❌ 內部 Medical KB ID（如 `MED-GROWTH-WEEK-24`）

---

## 十一、Prototype 項目處置清單

| 項目 | 處置方式 | 說明 |
| :--- | :---: | :--- |
| 首頁固定 SVG Baby 插圖 | **REPLACE_WITH_DATA** | 替換為 `getBabyGrowthImage(currentWeek)` 精緻 PNG |
| 固定「約一顆玉米筍大小」 | **REPLACE_WITH_DATA** | 替換為 `BABY_GROWTH_DATA[w].size_analogy_zh` |
| 固定 Baby Caption (眼皮/睡與醒) | **REPLACE_WITH_DATA** | 替換為 `BABY_GROWTH_DATA[w].consumer_body` |
| 花園「開 2 朵小花」卡片 | **REMOVE** | 完全自 DOM 移除（避免原型遊戲化雜訊） |
| Prototype 「今日已完成」按鈕 | **REMOVE** | 完全自 DOM 移除 |
| Prototype 神隊友任務卡片 | **REMOVE** | 自首頁媽咪視角移除（回歸神隊友專屬模式） |
| Prototype 本週提醒卡片 (`#weeklyReminderCard`) | **REMOVE** | 自 DOM 移除（由 NEXT CHECKUP 卡片取代） |
| 首頁 5 大定案卡片結構 | **KEEP** | 依新定案 Layout 精準重構渲染層 |

---

## 十二、整合架構與回歸風險評估

### A. Homepage Current vs Target Data Flow

```
[Current Prototype Flow]
  HTML Hardcode Text ────► #view-home (玉米筍 / 靜態 SVG / 開2朵花 / 假 Check-in)
  (僅週數與 EDD 倒數有由 updateWeekUI 綁定)

[Target Integrated Flow]
  APP.edd ────────► calcWeekInfo() ───► Greeting (稱謂/週數/倒數)
  BABY_GROWTH_DATA ──► getBabyGrowthData() ──► Baby of the Week (PNG/比喻/身長/摘要)
  DIARY_STORAGE ────► getDiaryEntries() ─────► Today's Check-in (最新紀錄/輕量儲存)
  WEEKLY_MAPPING ───► mom_changes[0..1] ────► This Week (2 項變化)
  PRENATAL_NODES ───► getNextVisit() ───────► Next Checkup (產檢週數與重點)
```

### B. 回歸風險矩陣（Regression Risk Analysis）

| 模組 | 回歸風險等級 | 潛在風險點 | 防護建議 |
| :--- | :---: | :--- | :--- |
| **我的孕期 → 孕期總覽** | 🟢 **LOW** | 總覽共用 `PREGNANCY_WEEKLY_MAPPING_DATA` | 首頁僅為 Reader，不修改物件內容 |
| **寶寶成長** | 🟢 **LOW** | 寶寶頁面共用 `BABY_GROWTH_DATA` 與圖片資產 | 僅調用 `getBabyGrowthData` 與 `getBabyGrowthImage` |
| **產檢地圖** | 🟢 **LOW** | 產檢地圖共用 `PRENATAL_MAP_NODES` | 僅讀取節點資訊，不干涉產檢個人紀錄 LocalStorage |
| **孕期日記** | 🟡 **MEDIUM** | 首頁寫入日記儲存池 | 必須嚴格遵循既有 `DIARY_STORAGE_KEY` 與 Record JSON 格式，避免 schema 不一致導致日記頁崩潰 |

---

## 十三、Production Gate 結論

### **HOMEPAGE MOM DASHBOARD AUDIT — PASS WITH FIXES**
**FIXES REQUIRED BEFORE INTEGRATION**

---

### 1. Blocking Issues（整合實作前需先確立 Adapter 規格）
1. **`DIARY_ADAPTER_REQUIRED`**：首頁 Check-in 表單需具備獨立的寫入/讀取 Adapter，能將輸入正規化存入 `pregnancyDiaryEntries`，並即時更新首頁「最近一筆日記」預覽。
2. **`TAB_DEEP_LINK_ADAPTER_REQUIRED`**：`goToView()` 需擴充支援第二參數 `subTabId`（或支援 `data-view="..." data-tab="..."`），以滿足點擊各卡片直接進入對應分頁之需求。
3. **`PRENATAL_NEXT_VISIT_ADAPTER_REQUIRED`**：需新增 `getNextPrenatalVisit(currentWeek)` helper 提取下次產檢資訊。

### 2. Non-blocking Issues（UI 整理與 DOM 替換）
1. 移除 `#view-home` 內殘留之花園卡片（`.garden-card`）、神隊友卡片（`.partner-card`）與空白提醒容器（`#weeklyReminderCard`）。
2. 在 `#view-home` 替換靜態 SVG 寶寶為 `getBabyGrowthVisual()` 或標準 `<img>`。
3. 擴充 `updateWeekUI()` 同步更新 `#greetingTitle` 使用者稱謂。
