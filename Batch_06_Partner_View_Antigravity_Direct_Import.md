# 孕育之美 Medical KB｜Batch 06 Antigravity Direct Import

> **Batch 06 主題：神隊友（Partner View）孕期陪伴知識庫**
>
> 本 Batch 的目的不是再建立一套重複的「孕媽咪 Medical KB」，而是建立一層可由正式網站「神隊友模式」消費的 Partner Support Knowledge Layer。
>
> 未來前台主要輸出：
>
> 1. `PARTNER VIEW｜這週，妳可以這樣陪著她 💕`
> 2. `本週神隊友小知識`
>
> UI Prototype 只代表「欄位與呈現需求」，**不是 Evidence**。
> 本輪只建立 Candidate Records + Read-only Review Dashboard；**禁止修改正式網站**。

---

# 0｜Primary Evidence

## Primary
《爸爸孕產育兒衛教手冊（114年9月）》— 衛生福利部國民健康署

優先使用：
- p.2–3 寶貝成長全紀錄／爸爸大事記
- p.4–5 身分轉變中爸爸可以這麼做
- p.6 起 孕期40週母嬰變化
- 第2章「伴侶懷孕了！最想知道的事」
- 第3章「伴侶要生了！該如何做準備」
- 與產檢、營養、生活習慣、爸媽教室、用品準備、生產／哺乳／育兒計畫、產兆與陪產直接相關內容

## Supporting
《孕媽咪衛教手冊（115年6月出版）》— 國民健康署
- 「給伴侶、家人的小叮嚀」
- 孕初／中／後期母體變化、生活、運動、產兆等

《孕媽咪健康手冊（115年6月出版）》— 國民健康署
- 僅作已核准 Medical KB 的必要 supporting evidence

## Existing Approved KB
Batch 01–05 的 approved Records 可作 `cross_refs`，但：
- 不得複製後改寫成新的醫療事實
- 不得修改既有 approved Records
- Partner Record 若涉及醫療警訊，必須 cross-link Batch 03，而不是重新發明 Safety Rule

**External Web Research = OFF。**

---

# 1｜Batch 06 的產品定位

正式網站目前有：

```text
孕媽咪視角 ↔ 神隊友視角
```

神隊友模式首頁需要由資料庫提供：

```text
PARTNER VIEW
這週，妳可以這樣陪著她 💕

[Action 1]
[Action 2]
[Action 3]

本週神隊友小知識
[1 則簡短、可信、與目前孕週相關的知識]
```

因此 Batch 06 必須同時支援：

### A. 可執行陪伴行動
例如：
- 陪同產檢
- 協助安排休息
- 分擔家務
- 準備合宜飲食
- 一起參加爸媽教室
- 討論生產／哺乳／育兒計畫
- 準備待產包
- 認識產兆
- 陪產時給予正向鼓勵

### B. 神隊友知識
例如：
- 這個階段媽媽可能出現哪些變化
- 寶寶正在經歷什麼階段
- 為什麼這週某個陪伴行動有幫助
- 哪些狀況不是「再休息看看」，而是應優先就醫

---

# 2｜重要設計：不要硬造 40 週醫療內容

官方爸爸手冊提供的是：
- 孕期三階段
- 若干關鍵孕週／里程碑
- 爸爸大事記
- 產檢、生產準備與陪伴原則

它**不是完整的 1–40 週 Partner Advice Table**。

因此：

## Knowledge Layer
建立 Evidence-backed Partner Records。

## Presentation Layer
未來可依 `applicable_window` 將 approved Records 映射到 Week 1–40。

例如：

```text
MED-PARTNER-T1-SUPPORT-001
applicable_window: 1-12 weeks
```

可以在 6、7、8 週等適用週數呈現，
**不需要複製成 12 筆內容完全相同的 Medical Records。**

若同一孕週有多筆適用 Record：
由 Frontend / Consumer Layer 依 priority 輪替或選取。

---

# 3｜建議 Schema

優先沿用既有 Medical KB schema；若需擴充，僅新增 Partner consumer 所需欄位：

```yaml
record_id:
category: partner_support
partner_type:
title:
pregnancy_stage:
applicable_window:
trigger_week:
action_items: []
partner_knowledge:
why_it_matters:
safety_note:
priority:
cross_refs: []
source_refs: []
frontend_targets:
  - partner_weekly_actions
  - partner_weekly_knowledge
review_status: needs_review
human_reviewed: false
```

### partner_type enum 建議

```text
prenatal_participation
maternal_comfort_support
nutrition_support
healthy_lifestyle
learning_preparation
birth_parenting_planning
pregnancy_stage_support
warning_sign_support
birth_preparation
labor_support
partner_self_care
```

---

# PART A｜核心神隊友角色（7 Records）

## A01｜一起參與產檢
`MED-PARTNER-CORE-PRENATAL-001`

- stage: ALL
- action_items:
  - 盡可能陪同產檢。
  - 和伴侶一起了解不同階段胎兒成長與母體變化。
  - 產檢／檢查項目應與伴侶共同了解，並向醫師或助產師諮詢後共同決定。
- partner_knowledge:
  - 爸爸手冊鼓勵伴侶共同參與產檢，而不是把產檢視為孕媽咪一人的事情。
- cross_refs:
  - Batch 02 Prenatal Visit / Optional Screening
- priority: high

## A02｜主動了解懷孕與生產資訊
`MED-PARTNER-CORE-LEARN-001`

- stage: ALL
- action_items:
  - 主動學習孕期、產檢、生產與育兒資訊。
  - 與伴侶一起討論不確定的問題。
- partner_knowledge:
  - 伴侶投入孕產過程、共同學習，是建立父職角色的重要一環。
- 不得把一般網路文章列為 Medical Evidence。

## A03｜關心孕期營養，但不自行開補充品
`MED-PARTNER-CORE-NUTRITION-001`

- stage: ALL
- action_items:
  - 關心伴侶食慾與飲食狀況。
  - 協助準備合宜、均衡的食物。
  - 若考慮營養品／保健食品，應依來源建議諮詢醫師、藥師或營養師。
- cross_refs:
  - Batch 04 Nutrition
- safety:
  - 不得產生「神隊友自行決定補充劑劑量」。

## A04｜一起改善生活習慣
`MED-PARTNER-CORE-HEALTHY-LIFESTYLE-001`

- stage: ALL
- action_items:
  - 提供無菸環境。
  - 若有吸菸習慣，依官方手冊鼓勵戒菸。
  - 陪伴養成健康飲食習慣。
- cross_refs:
  - Batch 04
  - Batch 05 tobacco/lifestyle
- 不得自行新增未有 Evidence 的物質暴露規則。

## A05｜一起參加爸媽教室
`MED-PARTNER-CORE-PARENT-CLASS-001`

- stage: ALL
- action_items:
  - 安排時間和伴侶一起參與孕產／育兒課程。
  - 學習生產、減痛、哺乳、新生兒照顧等內容。
- partner_knowledge:
  - 爸媽教室是伴侶共同建立照顧技能的方式之一。

## A06｜準備孕產與育兒用品
`MED-PARTNER-CORE-SUPPLIES-001`

- stage: T2_T3
- action_items:
  - 一起盤點孕期、產後、育兒用品。
  - 在準備用品的同時理解用途與基本照顧技巧。
- 不得加入商業品牌或購物推薦。

## A07｜討論生產、哺乳、育兒與家務分工
`MED-PARTNER-CORE-PLAN-001`

- stage: T2_T3
- action_items:
  - 討論生產方式與陪產安排。
  - 討論坐月子／產後照顧安排。
  - 討論哺乳方式。
  - 討論寶寶出生後照顧方式。
  - 討論家務與照顧分工。
- partner_knowledge:
  - 爸爸手冊建議中後期提前溝通與準備，建立共識。
- 不得把某一種生產／哺乳方式描述成唯一正確選擇。

---

# PART B｜三階段 Partner View（9 Records）

## B01｜孕初期：理解孕吐、頻尿與疲憊
`MED-PARTNER-T1-COMFORT-001`

- stage: T1
- applicable_window: 1-12 weeks
- action_items:
  - 理解孕初期可能有孕吐、頻尿、疲憊等不適。
  - 協助減少家事與不必要負擔，讓伴侶有休息空間。
  - 關心需求，不以過度關心造成壓力。
- cross_refs: Batch 01 / Batch 05

## B02｜孕初期：8–12週手冊與定期產檢
`MED-PARTNER-T1-CHECKUP-001`

- stage: T1
- trigger_week: 8-12
- action_items:
  - 一起閱讀孕媽咪／爸爸手冊。
  - 記得定期產檢。
  - 若能陪同，可一起向醫療人員詢問問題。
- frontend: partner_weekly_actions

## B03｜孕初期：認識流產警訊
`MED-PARTNER-T1-WARNING-001`

- stage: T1
- action_items:
  - 知道陰道出血、小腹持續悶痛、持續子宮收縮等來源列出的警訊不可只當一般不適。
  - 發生警訊時優先依 Batch 03 就醫規則處理。
- cross_refs:
  - Batch 03 Red Flags
- priority: critical
- **不得把 Partner Advice 寫成自行診斷。**

## B04｜孕中期：開始準備寶寶用品與生產規劃
`MED-PARTNER-T2-PREPARE-001`

- stage: T2
- applicable_window: 13-28 weeks
- action_items:
  - 開始準備寶寶用品。
  - 及早討論生產、坐月子／產後照顧、哺乳計畫。
  - 可一起參加爸媽教室。
- evidence: 爸爸大事記

## B05｜孕中期：陪伴面對身體變化
`MED-PARTNER-T2-COMFORT-001`

- stage: T2
- action_items:
  - 理解腹部逐漸隆起、體重與乳房等身體變化。
  - 若伴侶有腰痠背痛、水腫、胸悶等不適，提供實際生活支持。
  - 不以「孕期正常」否定她的不舒服。
- 若症狀符合 Batch 03 Red Flag，Safety Record 優先。

## B06｜孕中期：一起感受胎動與寶寶成長
`MED-PARTNER-T2-BABY-CONNECTION-001`

- stage: T2
- trigger_week: 20-24
- partner_knowledge:
  - 爸爸手冊指出第一胎多在約 20–24 週感受到胎動，第二胎可能更早。
- action_items:
  - 可和伴侶一起關注胎動與寶寶成長，增加共同參與感。
- **此為一般里程碑，不得用來判斷個別胎兒健康。**

## B07｜孕後期：備好待產包與認識產兆
`MED-PARTNER-T3-BIRTH-READY-001`

- stage: T3
- applicable_window: 29+ weeks
- action_items:
  - 一起準備待產包。
  - 了解產兆與就醫準備。
  - 和伴侶確認生產／陪產安排。
- cross_refs:
  - Batch 03 Labor Signs

## B08｜孕後期：34–36週胎位與生產準備
`MED-PARTNER-T3-34-36-001`

- stage: T3
- trigger_week: 34-36
- partner_knowledge:
  - 爸爸手冊「爸爸大事記」指出胎位約在此階段趨於固定。
- action_items:
  - 陪伴產檢並和醫療人員確認個別狀況。
  - 完成重要待產準備。
- 不得將「胎位固定」寫成所有個案必然如此。

## B09｜足月附近：把產兆放在一般陪伴提醒之前
`MED-PARTNER-T3-LABOR-SIGN-001`

- stage: T3
- applicable_window: term_near_delivery
- priority: critical
- action_items:
  - 神隊友應熟悉規則陣痛、破水、出血等既有 Batch 03 產兆／警訊。
  - 若命中 Red Flag，立即切換 Safety Guidance。
- cross_refs:
  - Batch 03 Preterm/Labor Sign Records
- Partner View 不得以「陪她休息」取代應就醫的警訊。

---

# PART C｜陪伴與情緒支持（4 Records）

## C01｜分擔家事、給她休息
`MED-PARTNER-SUPPORT-HOUSEWORK-001`

- stage: ALL
- action_items:
  - 減少孕媽咪家事負擔。
  - 讓她有足夠休息。
- Evidence: 《孕媽咪衛教手冊》給伴侶、家人的小叮嚀。

## C02｜給剛剛好的關心
`MED-PARTNER-SUPPORT-COMMUNICATION-001`

- stage: ALL
- action_items:
  - 主動詢問她需要什麼。
  - 給予體諒與支持。
  - 避免過度關心變成壓力。
- UI tone:
  - 溫暖、具體、不說教。

## C03｜待產時耐心陪伴
`MED-PARTNER-SUPPORT-LABOR-COMPANION-001`

- stage: T3
- applicable_window: labor_preparation_and_labor
- action_items:
  - 待產時耐心陪伴。
  - 回應產婦需求。
  - 使用正向話語鼓勵。
  - 協助放鬆。
- 若涉及下床、按摩或減痛動作，依爸爸手冊保留「先詢問醫護人員是否適宜」條件。

## C04｜神隊友也要照顧自己
`MED-PARTNER-SUPPORT-SELFCARE-001`

- stage: ALL
- action_items:
  - 理解父職轉變也可能帶來壓力。
  - 適度休息、運動、與伴侶或親友溝通。
  - 壓力或情緒困擾嚴重時尋求專業協助。
- 不在此 Record 診斷精神疾病。
- 動態專線／服務資訊若要進正式產品，應另作 Policy/Resource Layer，不硬編進 Medical Content。

---

# PART D｜神隊友「本週小知識」候選（6 Records）

這些 Record 的主要 frontend target 是：
`partner_weekly_knowledge`

## D01｜孕育不是孕媽咪一個人的事
`MED-PARTNER-KNOWLEDGE-SHARED-JOURNEY-001`
- stage: ALL
- knowledge:
  - 孕育孩子是伴侶共同的事情；共同學習與支持是神隊友角色的核心。

## D02｜孕初期寶寶約6–8週可出現心跳
`MED-PARTNER-KNOWLEDGE-T1-HEARTBEAT-001`
- trigger_week: 6-8
- knowledge:
  - 爸爸手冊以 6–8 週作為寶寶出現心跳的重要里程碑。
- 不得作為個別超音波診斷標準。

## D03｜孕中期是胎兒快速成長期
`MED-PARTNER-KNOWLEDGE-T2-GROWTH-001`
- stage: T2
- knowledge:
  - 爸爸手冊將孕中期描述為胎兒快速成長階段。
- 可搭配「一起參與產檢、感受胎動」類 Action。

## D04｜第一胎約20–24週可能開始感受到胎動
`MED-PARTNER-KNOWLEDGE-FETAL-MOVEMENT-001`
- trigger_week: 20-24
- knowledge:
  - 第一胎多在約20–24週感受到胎動，第二胎可能更早。
- 不得用此區間判定異常。

## D05｜中後期適合開始把生產與育兒計畫談清楚
`MED-PARTNER-KNOWLEDGE-PLANNING-001`
- stage: T2_T3
- knowledge:
  - 官方爸爸手冊建議中後期夫妻提前討論生產、哺乳、育兒與家務分工。

## D06｜陪產不是站在旁邊，而是事先準備
`MED-PARTNER-KNOWLEDGE-LABOR-SUPPORT-001`
- stage: T3
- knowledge:
  - 陪產者除了參與產檢，也應事先理解生產過程、減痛與放鬆技巧，並照顧好自身體力。
- action linkage:
  - MED-PARTNER-SUPPORT-LABOR-COMPANION-001

---

# 4｜預期 Candidate Records

```text
Core Partner Role             7
Pregnancy Stage Partner View  9
Support / Communication       4
Weekly Knowledge              6
--------------------------------
TOTAL                         26
```

全部：

```json
{
  "review_status": "needs_review",
  "human_reviewed": false
}
```

**26 是預期最大值，不是強制 KPI。**
若官方 Evidence 不足：
- BLOCKED
- SOURCE_GAP_LOCAL
- 不得為了湊 26 筆自行補寫。

---

# 5｜Frontend Mapping Rule

每筆 Record 需標記：

```yaml
frontend_targets:
  - partner_weekly_actions
  - partner_weekly_knowledge
```

至少其中一個。

## Partner View Action 選取邏輯（僅建立 mapping metadata，不改正式網站）

未來前端可依：

1. gestational_week / stage match
2. safety priority
3. trigger_week
4. action priority
5. rotation

選出最多 3 則：

```text
這週，妳可以這樣陪著她 💕

○ Action 1
○ Action 2
○ Action 3
```

## 本週神隊友小知識

每週最多顯示 1 則：
- 與當週／階段高度相關
- Evidence-backed
- 短句化但不改變醫療意義
- 不得由 LLM 現場自由生成新的醫療事實

---

# 6｜Safety Priority

Partner View 的 priority 必須：

```text
Batch 03 RED FLAG
>
Partner Warning / Labor Sign
>
Batch 02 Time-sensitive Prenatal Care
>
Partner Action
>
Partner Knowledge / Encouragement
```

例如：

使用者 24 週 + 陰道出血

不得顯示：
「陪她散步、安排休息」

應優先：
「停止一般活動建議 → 依 Red Flag Guidance 儘速就醫評估」

---

# 7｜語氣規範

前台 Partner View 可溫暖，但不能失真。

### 可以
- 「陪她去產檢，等候時給她一點實際幫忙。」
- 「這週可以一起把待產用品慢慢準備起來。」
- 「先問她現在最需要什麼，比替她決定更有幫助。」

### 不可以
- 「你一定要……」
- 「好爸爸就應該……」
- 「她現在情緒化是荷爾蒙造成的。」
- 「這是正常的，不用擔心。」（尤其涉及 Red Flag）
- 沒有 Evidence 的週週醫療斷言

Partner View 是陪伴工具，不是伴侶績效評分。

---

# 8｜禁止事項

禁止：
- 修改正式網站 Partner View
- 修改 UI Prototype
- 建立 1–40 週 40 筆重複內容只為填滿週數
- 自行創作醫療事實
- 使用外部網路
- 將爸爸手冊的男性稱謂硬性限制成只有男性可用；資料模型建議使用 `partner`，前台可稱「神隊友」
- 將「陪同」寫成控制孕媽咪醫療決策
- 把 NIPT、羊穿、疫苗等決策改成 Partner 單方面決定
- 將警訊弱化為一般提醒
- 修改 Batch 01–05 Approved Records

---

# 9｜Medical KB Review Dashboard

新增 Read-only Review Mode：

# 「Batch 06｜神隊友陪伴知識庫」

分區：

### 💕 這週可以這樣陪著她
Action Records

### 💡 本週神隊友小知識
Knowledge Records

### 🗓️ 三階段陪伴地圖
T1 / T2 / T3

### ⚠️ Safety Cross-reference
Batch 03 / Batch 02 time-sensitive records

每張卡至少顯示：
- Record ID
- Title
- Partner Type
- Stage
- Applicable Window / Trigger Week
- Action Items
- Partner Knowledge
- Why It Matters
- Safety Note
- Priority
- Cross References
- Frontend Targets
- Evidence
- Review Status
- Human Reviewed

本輪 Dashboard 只是審核工具，不是正式 Partner View。

---

# 10｜Integrity Guardrails

禁止修改：
- Batch 01 approved
- Weekly Fetal Growth approved
- Batch 02 approved
- Batch 03 approved
- Batch 04 approved
- Batch 05 approved
- Existing Source Gap history
- Production HTML / CSS / JS / Components

允許：
- Batch 06 Candidate Records
- source_refs / cross_refs
- 必要 Source Gap
- Review Dashboard read-only view
- Dashboard sync data

---

# 11｜Final Candidate Build Validation

完成後 READ-ONLY 驗證：

```text
Core Partner Role: X/7
Pregnancy Stage Partner View: X/9
Support / Communication: X/4
Weekly Knowledge: X/6
Total Maximum: 26
```

必驗：

1. 所有 Candidate = needs_review / human_reviewed false
2. External Web = NO
3. Primary Evidence = 爸爸孕產育兒衛教手冊
4. Partner Actions 不得取代醫療決策
5. Red Flag Priority preserved
6. Batch 02 prenatal decisions remain shared + clinician informed
7. Supplement advice does not invent dosage
8. No 40-week fabricated partner medical table
9. Every Record has frontend_targets
10. Every knowledge statement has traceable evidence
11. Existing approved records unchanged
12. Production website unchanged

---

# 12｜Final Report

只輸出：

```text
BATCH 06 CANDIDATE BUILD REPORT

RECORDS
Core Partner Role: X / 7
Pregnancy Stage Partner View: X / 9
Support / Communication: X / 4
Weekly Knowledge: X / 6

Total Candidate Records: X
Needs Review: X
Human Reviewed False: X
Blocked: X
Source Gaps: X
Discrepancies: X

EVIDENCE
Father Handbook 2025: USED / NOT USED
Pregnancy Education Handbook 2026: USED / NOT USED
Pregnancy Health Handbook 2026: USED / NOT USED
External Web: YES / NO

FRONTEND READINESS
partner_weekly_actions mappings: X
partner_weekly_knowledge mappings: X
Stage / Week Metadata: PASS / FAIL
No Fabricated 40-Week Table: PASS / FAIL

SAFETY
Red Flag Priority: PASS / FAIL
Prenatal Decision Guardrail: PASS / FAIL
Supplement Guardrail: PASS / FAIL
Partner Tone Guardrail: PASS / FAIL

INTEGRITY
Previous Approved Records Modified: YES / NO
Batch 05 Modified: YES / NO
Production Website Modified: YES / NO

DASHBOARD
Batch 06 Partner Review Mode: READY / NOT READY

FINAL
BATCH 06 CANDIDATE BUILD: COMPLETED / BLOCKED
READY FOR HUMAN REVIEW: YES / NO
```

另外列出：
1. 實際新增 Record IDs
2. BLOCKED / SOURCE_GAP / DISCREPANCY
3. Human Reviewer 最值得先看的 5 筆代表性 Records

完成後停止。
不得自行 approved。
不得開始 Batch 07。
不得修改正式網站。
