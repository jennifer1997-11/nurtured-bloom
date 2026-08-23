# 孕育之美｜產品規格書
### Pregnancy Beauty — Product Requirement & System Specification

**文件版本：** V1.0  
**產品階段：** Product Prototype → MVP  
**產品型態：** Responsive Web Design（RWD）  
**主要語言：** Traditional Chinese  
**目標市場：** 台灣孕媽咪／神隊友  
**核心定位：** AI × 孕期管理 × 身體關注 × 陪伴社群

---

# 01｜產品概述

## 1.1 產品名稱

**孕育之美**

英文暫名：

> Pregnancy Beauty

## 1.2 一句話定位

> 一個全方位紀錄媽媽與寶寶狀態，結合 AI 即時查詢、孕期管理、產檢工具、神隊友陪伴與孕媽咪社群的專屬孕期陪伴平台。

---

# 02｜產品願景

孕期不應該只是：

> 「寶寶現在幾週？」

而應該同時關注：

> **媽媽現在過得好不好？**

因此「孕育之美」的核心不是單純的胎兒週數工具，而是：

### 「媽媽 × 寶寶 × AI × 陪伴」

形成一個完整的孕期體驗。

---

# 03｜產品核心價值

| Priority | 核心價值 |
|---|---|
| P0 | 關心孕媽咪自己的身體與心理狀態 |
| P0 | 提供個人化孕期資訊 |
| P0 | AI 即時孕期陪伴 |
| P0 | 幫助孕媽咪掌握產檢進度 |
| P0 | 讓神隊友知道這週可以做什麼 |
| P1 | 記錄孕期重要時刻 |
| P1 | 與其他孕媽咪交流 |
| P1 | 整理產檢資訊 |
| P2 | 建立完整孕期回憶 |

---

# 04｜目標使用者

## 4.1 Primary User：孕媽咪

主要需求：

- 知道目前孕週
- 知道寶寶目前發展
- 知道這週要注意什麼
- 關心自己的身體
- 快速詢問孕期問題
- 紀錄心情
- 管理產檢
- 記錄醫師說明
- 與其他孕媽咪交流

# 05｜Secondary User：神隊友

可以是：

- 伴侶
- 丈夫
- 家人
- 主要照顧者

主要需求：

> **「我這週可以為孕媽咪做什麼？」**

而不是單純閱讀孕期知識。

---

# 06｜產品核心原則

## Principle 01｜媽媽優先

任何功能都不能只關注寶寶，而忽略媽媽。

## Principle 02｜低輸入負擔

孕媽咪不應該每天填寫大量資料。

優先採用：

- 點選
- 選擇
- 自動計算
- AI 整理

而不是大量文字輸入。

## Principle 03｜個人化

內容應依：

> EDD → 孕週 → 使用者資料

自動變化。

## Principle 04｜溫暖陪伴

UI 不應該呈現成：

> 醫療管理系統

而應該呈現：

> **溫暖、安心、簡潔、陪伴感。**

## Principle 05｜AI 是核心，而不是裝飾

AI 不只是：

> 「ChatGPT 放在網站裡。」

而應該整合：

- 孕週
- 身體紀錄
- 日記
- 產檢
- 問診問題
- 神隊友
- 孕期內容

形成真正的個人化 AI。

---

# 07｜產品資訊架構

正式版主要 Navigation：

```text
首頁
│
├── 我的孕期
│   ├── 孕期總覽
│   ├── 產檢地圖
│   ├── 問診備忘錄
│   └── 孕期日記
│
├── 寶寶成長
│
├── AI孕期助理
│   ├── AI Chat
│   └── AI 產檢摘要
│
└── 媽咪交流社群
```

另外：

```text
右上角
└── 個人設定
```

以及：

```text
右下角
└── AI 孕期助理 Floating Button
```

---

# 08｜使用者視角

系統提供兩種 Perspective：

## 8.1 孕媽咪視角

預設視角。

主要內容：

> 我的身體  
> 我的寶寶  
> 我的孕期  
> 我的產檢

## 8.2 神隊友視角

主要內容：

> 她這週需要什麼？

包含：

- 本週神隊友建議
- 可以做的事情
- 陪伴提醒
- 產檢提醒
- 情緒支持

---

# 09｜首頁產品規格

## 9.1 首頁目標

首頁不是資訊總覽 Dashboard。

而是：

> **「今天打開網站，我最需要知道什麼？」**

## 9.2 首頁設計原則

### 不允許過長

首頁第一螢幕必須能看見：

1. 目前孕週
2. 寶寶
3. 媽媽今日狀態
4. AI入口

---

# 10｜首頁 Layout

```text
┌─────────────────────────────────────┐
│ Logo              🔔  👤 媽媽       │
├──────┬──────────────────────────────┤
│      │                              │
│ 首頁 │      Baby Hero               │
│      │                              │
│ 我的 │    「現在是 XX 週」           │
│ 孕期 │                              │
│      │      👶 Q版寶寶               │
│ 寶寶 │                              │
│      │──────────────────────────────│
│ AI   │                              │
│      │   今日的妳        本週提醒     │
│ 社群 │                              │
│      │                              │
└──────┴──────────────────────────────┘
                              💗 AI
```

---

# 11｜首頁 Baby Hero

核心視覺：

> **寶寶在媽媽肚子裡成長的 Q 版 3D 示意圖**

需求：

- 動態
- Q版
- 溫暖
- 非醫療寫實
- 不造成焦慮
- 隨孕週變化

---

# 12｜首頁必備資訊

### A. 孕週

例如：

> 目前 18週3天

### B. 預產期

例如：

> 距離預產期 151 天

### C. 寶寶本週成長

例如：

> 本週寶寶正在快速成長……

### D. 今日媽媽

例如：

> 今天的妳感覺如何？

### E. 本週提醒

例如：

> 本週可以留意……

---

# 13｜Today Check-in

第一版只需要低負擔選擇：

```text
今天的妳感覺如何？

😊 很好
🙂 不錯
😐 普通
😮‍💨 有點累
😣 不舒服
```

可選擇：

> 補充文字

但不是必填。

---

# 14｜身體狀況模組

未來應逐步增加：

- 心情
- 睡眠
- 活動
- 水分
- 身體感受
- 症狀
- 體重
- 血壓

但第一版：

> **不要全部要求使用者填寫。**

---

# 15｜我的孕期

主要目的：

> **讓孕媽咪知道「我現在在哪裡」。**

包含：

### 孕期總覽

- 孕週
- 預產期
- 孕期階段
- 寶寶成長

### 產檢地圖

- 已完成
- 目前
- 下一站
- 未來項目

### 問診備忘錄

- 下一次要問醫生什麼

### 孕期日記

- 心情
- 文字
- 回憶

---

# 16｜產檢地圖

這是「孕育之美」的重要差異化功能。

## UX Concept

> **趣味地圖闖關**

而不是傳統醫療表格。

```text
🏁 開始
 │
 🟢 12週
 │
 🟢 16週
 │
 ⭐ 20週 ← 目前
 │
 🔒 24週
 │
 🔒 28週
 │
 🏁 生產
```

---

# 17｜產檢地圖資料

每個 milestone：

- 孕週
- 檢查名稱
- 檢查目的
- 公費項目
- 建議自費項目
- 注意事項
- 是否完成
- 資料來源
- 最後更新日期

---

# 18｜重要醫療資訊原則

「公費／自費」等資訊：

> 不可由 AI 自行推論。

應由：

> **平台維護的結構化資料**

提供。

並顯示：

> 資料來源／更新日期。

---

# 19｜問診備忘錄

功能目標：

> **避免到了診間突然忘記想問什麼。**

使用者可以：

### 手動新增

> 「最近晚上常常睡不好」

### 從產檢地圖加入

例如：

> 20週檢查

↓

> 「這次有哪些問題想詢問醫師？」

### AI 產生

例如：

> 「根據我目前孕週，有哪些問題適合問醫生？」

---

# 20｜一鍵複製

提供：

> **一鍵複製全部問診內容**

方便貼到：

- iPhone 備忘錄
- LINE
- Google Keep
- 其他常用工具

---

# 21｜產檢紀錄

每次產檢可以紀錄：

- 日期
- 醫院
- 醫師
- 孕週
- 醫師說明
- 檢查結果
- 下次產檢日期

---

# 22｜AI 產檢摘要

使用者輸入：

> 醫師說明

AI 協助整理成：

```text
📌 本次產檢重點

1. 寶寶狀態
2. 媽媽狀態
3. 醫師提醒
4. 下次產檢
5. 可以再詢問醫師的問題
```

---

# 23｜孕期日記

核心原則：

> **不強迫每日紀錄。**

使用者可以：

```text
今天想留下什麼？

[文字]

😊 今天的心情

[儲存]
```

未來可以支援：

- 照片
- 心情
- 孕週自動標記
- 回顧時間軸

---

# 24｜寶寶成長

顯示：

- 本週寶寶大小
- 發育變化
- 本週里程碑
- Q版寶寶動畫

核心目標：

> **讓孕媽咪感受到「寶寶正在長大」。**

---

# 25｜AI孕期助理

AI 是產品核心功能。

入口：

> 右下角固定 Floating Button

視覺：

- 圓形
- 動態
- 微閃爍
- 不干擾主要操作

---

# 26｜AI 基本需求

使用者可以詢問：

> 「孕期可以喝咖啡嗎？」

> 「最近肚子有點不舒服怎麼辦？」

> 「這週寶寶會有什麼變化？」

> 「下次產檢可以問醫生什麼？」

---

# 27｜AI 不應只是一般 Chatbot

AI Context 應包含：

```text
User
+
Pregnancy
+
Current Week
+
Check-ins
+
Diary
+
Consultation
+
Questions
```

形成：

> **Personal Pregnancy AI**

---

# 28｜AI Safety

AI 必須明確標示：

> **「AI 回覆僅供孕期資訊參考，不能取代醫師診斷或醫療建議。如有疑慮，請向專業醫療人員諮詢。」**

高風險問題：

AI 必須具備：

> Risk Detection

不能單純提供一般知識。

---

# 29｜AI Backend 原則

API Key：

> ❌ 不可放在 Frontend

架構：

```text
Frontend
 ↓
Backend / Edge Function
 ↓
AI Provider
 ↓
Safety Layer
 ↓
Frontend
```

---

# 30｜神隊友功能

神隊友的核心不是：

> 閱讀孕期知識

而是：

> **「這週我可以做什麼？」**

---

# 31｜神隊友每週內容

必須依孕週變化。

例如：

### 18週

> 主動關心媽媽最近睡眠。

### 20週

> 陪媽媽準備產檢問題。

### 24週

> 協助安排產檢時間。

而不是每週重複相同內容。

---

# 32｜社群定位

不是 Instagram。

比較接近：

> **孕媽咪版 Threads／孕媽咪社團**

核心：

> 分享、留言、交流、鼓勵。

---

# 33｜社群功能 MVP

### Post

- 發文
- 圖片
- 孕週

### Comment

- 留言

### Reaction

例如：

> 🤍

### Report

> 檢舉

### Block

> 封鎖

---

# 34｜社群內容安全

必須建立：

- Content Moderation
- Report
- Block
- Admin Review

尤其孕期相關：

> 醫療錯誤資訊

需要特別注意。

---

# 35｜個人化設定

使用者可以設定：

- 媽媽暱稱
- 寶寶暱稱
- 預產期
- 孕次
- 視角
- 通知
- AI 對話保存

---

# 36｜登入設計

產品原則：

> **不使用傳統密碼。**

建議：

### Email OTP

或

### Phone OTP

---

# 37｜使用者資料模型

```text
User
 │
 ├── Profile
 │
 ├── Pregnancy
 │
 ├── Check-ins
 │
 ├── Diaries
 │
 ├── Consultations
 │
 ├── Questions
 │
 ├── AI Conversations
 │
 └── Community
```

---

# 38｜Database Architecture

第一階段核心 Table：

```text
profiles
pregnancies
daily_checkins
diaries
pregnancy_checkups
consultation_questions
consultation_notes
partner_tasks
posts
comments
reactions
ai_conversations
ai_messages
```

---

# 39｜建議技術架構

```text
Frontend
React + Vite

        ↓

Supabase

├── Auth
├── PostgreSQL
├── Storage
├── Realtime
└── Edge Functions

        ↓

AI Provider
```

---

# 40｜Frontend Architecture

不要維持單一 HTML。

改為：

```text
src/
├── components/
├── pages/
├── services/
├── hooks/
├── data/
├── utils/
└── styles/
```

---

# 41｜Component 原則

每個 Component：

> 單一職責。

例如：

```text
BabyHero
DailyCheckin
PregnancyProgress
CheckupMap
ConsultationMemo
AIChat
PostCard
```

不能所有功能全部塞進 `App.jsx`。

---

# 42｜資料安全

使用：

> Row Level Security（RLS）

原則：

```text
User A
 ↓
只能取得 User A data

User B
 ↓
只能取得 User B data
```

---

# 43｜資料分類

## Private

```text
Check-in
Diary
Pregnancy
Consultation
AI Conversation
```

## Community

```text
Posts
Comments
Reactions
```

## Public / System

```text
Pregnancy Week
Baby Growth
Checkup Information
Partner Tasks
```

---

# 44｜隱私原則

使用者應可以：

- 查看資料
- 修改資料
- 刪除資料
- 管理 AI 對話保存
- 管理個人設定

---

# 45｜AI 對話保存

提供：

```text
□ 保留 AI 對話紀錄
```

如果關閉：

> 對話不永久保存。

---

# 46｜首頁與資料的關係

首頁內容不是固定文字。

應由：

```text
EDD
 ↓
Current Pregnancy Week
 ↓
Baby Growth
 ↓
Checkup
 ↓
Check-in
 ↓
Partner Task
 ↓
AI Recommendation
```

動態產生。

---

# 47｜核心資料流

```text
使用者設定 EDD
       ↓
系統計算孕週
       ↓
更新首頁
       ↓
更新寶寶成長
       ↓
更新產檢地圖
       ↓
更新神隊友任務
       ↓
更新 AI Context
```

這是整個產品最重要的資料流。

---

# 48｜MVP 功能優先級

## 🔴 P0

必須完成：

1. Auth
2. Pregnancy Profile
3. EDD / 孕週計算
4. Daily Check-in
5. Database
6. RLS
7. AI Backend
8. AI Safety
9. 產檢地圖
10. 問診備忘錄

## 🟠 P1

第二階段：

1. 孕期日記
2. 產檢紀錄
3. AI 產檢摘要
4. 神隊友個人化
5. 寶寶成長動畫
6. AI Conversation History

## 🟡 P2

第三階段：

1. 社群
2. Comment
3. Reaction
4. Report
5. Block
6. Realtime
7. Notification

---

# 49｜暫不開發

目前不列入 MVP：

- 原生 App
- 私訊
- 好友系統
- 粉絲／追蹤
- 直播
- 複雜社群推薦演算法
- 過度複雜的健康圖表

---

# 50｜產品開發順序

正式開發順序固定為：

```text
01
Prototype 重構
        ↓
02
React + Vite
        ↓
03
Design System
        ↓
04
Supabase
        ↓
05
Database + ERD
        ↓
06
Auth
        ↓
07
Pregnancy Profile
        ↓
08
Check-in
        ↓
09
Diary / Consultation
        ↓
10
Pregnancy Map
        ↓
11
AI Backend
        ↓
12
AI Safety
        ↓
13
Partner
        ↓
14
Community
        ↓
15
Notification
        ↓
16
Testing
        ↓
17
Production
```

---

# 51｜版本規劃

## V0.1 — Prototype

目前階段：

> UI / UX / Interaction

## V0.2 — Frontend MVP

完成：

- React
- Component
- RWD
- Routing
- Design System

## V0.3 — Data MVP

完成：

- Supabase
- Auth
- Pregnancy
- Check-in
- Diary
- Consultation

## V0.4 — AI MVP

完成：

- AI Chat
- AI Context
- AI Safety
- AI Summary

## V0.5 — Companion

完成：

- Partner
- Weekly Tasks
- Personalized Content

## V0.6 — Community

完成：

- Posts
- Comments
- Reactions
- Moderation

## V1.0 — Public MVP

完成：

> **孕育之美正式版**

---

# 52｜成功指標 KPI

## Engagement

- DAU
- WAU
- 月活躍使用者
- 每週登入次數

## Pregnancy

- Check-in 使用率
- 孕期日記使用率
- 產檢地圖完成率
- 問診備忘錄使用率

## AI

- AI 使用率
- 每位使用者平均提問數
- AI 回訪率
- AI 回答滿意度

## Community

- 發文數
- 留言數
- 回應率
- 社群留存率

---

# 53｜最重要的產品成功指標

第一階段不只追蹤：

> 「註冊多少人」

更重要的是：

# **孕媽咪是否願意持續回來。**

第一階段 North Star Metric 可以考慮：

> **每週至少完成一次「孕期 Check-in」的活躍孕媽咪比例。**

因為這直接對應核心產品價值：

> **幫助媽媽更關心自己的身體狀況。**

---

# 54｜UI/UX Design System 原則

所有未來介面都必須：

## Visual

- 溫暖
- 柔和
- 簡潔
- 高質感
- 不過度卡通

## Interaction

- 少輸入
- 多選擇
- 微動畫
- 清楚 CTA
- 不製造焦慮

## Layout

- Desktop Sidebar
- Mobile Bottom Navigation
- Floating AI Button
- RWD

---

# 55｜AI Floating Button

固定：

> 右下角

規格：

```text
Circular
Animated
Persistent
Accessible
```

但不得遮擋：

- CTA
- 表單
- Mobile Bottom Navigation

---

# 56｜Mobile UX

Mobile 版本：

```text
Home
Pregnancy
Baby
AI
Community
```

底部 Navigation。

AI Floating Button 必須避開 Bottom Navigation Safe Area。

---

# 57｜目前 Prototype 的技術債

目前檔案已經有完整的視覺與互動 Prototype，但部分內容仍屬 Demo，例如：

- 登入
- OTP
- AI
- 社群資料
- Check-in
- 產檢資料
- 使用者資料

因此：

> **不得將目前 Prototype 的 Static Data 視為正式資料架構。**

正式開發時應逐步移至 Database / API。

---

# 58｜規格變更管理

未來任何新增功能都必須先回答：

### Q1
這個功能解決什麼使用者問題？

### Q2
它屬於：

- 媽媽
- 寶寶
- AI
- 神隊友
- 社群

哪個核心模組？

### Q3
是否需要新的 Database？

### Q4
是否涉及個資？

### Q5
是否涉及醫療資訊？

### Q6
是否需要 AI？

### Q7
是否會增加使用者輸入負擔？

### Q8
是否會讓首頁變得更複雜？

---

# 59｜Feature Definition Template

未來新增功能，一律使用：

```text
Feature Name：
功能名稱

User Problem：
使用者遇到什麼問題？

Goal：
希望達成什麼？

Target User：
孕媽咪 / 神隊友 / 兩者

User Flow：
使用者如何操作？

UI：
需要哪些畫面？

Data：
需要哪些資料？

API：
需要哪些 API？

Database：
需要哪些 Table？

AI：
是否需要 AI？

Privacy：
是否涉及個資？

Priority：
P0 / P1 / P2

Acceptance Criteria：
完成的判定標準
```

---

# 60｜最終產品藍圖

```text
                         孕育之美
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
        媽媽               寶寶              陪伴
          │                 │                 │
       身體狀態           成長紀錄          神隊友
       Check-in           週數              每週建議
       日記               里程碑            陪伴任務
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                           AI
                            │
              ┌─────────────┼─────────────┐
              │             │             │
            即時問答       產檢摘要       個人化
              │             │             │
              └─────────────┼─────────────┘
                            │
                         孕期管理
                            │
                  ┌─────────┴─────────┐
                  │                   │
                產檢地圖            問診備忘錄
                  │                   │
                  └─────────┬─────────┘
                            │
                           社群
                            │
                     分享・留言・打氣
```

---

# 附錄 A｜文件與開發規範

建議專案文件結構：

```text
pregnancy-beauty/
│
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── DESIGN_SYSTEM.md
│   ├── DATABASE_SPEC.md
│   ├── API_SPEC.md
│   └── AI_SAFETY_SPEC.md
│
├── src/
├── public/
├── package.json
└── README.md
```

其中：

- `PRODUCT_SPEC.md`：產品需求與功能範圍
- `DESIGN_SYSTEM.md`：UI/UX 與視覺規範
- `DATABASE_SPEC.md`：資料表、欄位、ERD、RLS
- `API_SPEC.md`：前後端 API
- `AI_SAFETY_SPEC.md`：AI 醫療安全與回答規則

---

# 附錄 B｜產品規格書使用原則

這份文件作為「孕育之美」的：

> **Single Source of Truth（產品規格唯一來源）**

未來任何 Claude、Copilot、工程師或設計師在進行開發前，都應優先參考本文件。

例如：

### Claude

> 請依照 `PRODUCT_SPEC.md` 與 `DESIGN_SYSTEM.md` 設計問診備忘錄 UX。

### GitHub Copilot

> 請依照 `PRODUCT_SPEC.md`、`DATABASE_SPEC.md` 建立 ConsultationMemo Component。

### Backend

> 請依照 `DATABASE_SPEC.md` 建立 Supabase Schema 與 RLS。

---

# 文件版本紀錄

| Version | Date | Description |
|---|---|---|
| V1.0 | 2026-08-18 | 建立孕育之美完整產品規格書 |

---

> **Product Vision**
>
> 「希望向孕媽咪推薦一個可以全方位紀錄媽媽和寶寶狀態，也有 AI 即時查詢功能及孕媽咪社群可以交流分享的網站；介面清晰、溫馨，陪伴我在孕期的每個時刻不孤單。」
