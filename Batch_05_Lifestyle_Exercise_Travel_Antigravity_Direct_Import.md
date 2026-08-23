# 孕育之美 Medical KB｜Batch 05 Antigravity Direct Import

> **Batch 05 主題：孕期生活保健、規律運動、口腔照護與外出旅行**
>
> Evidence 僅限專案現有官方手冊，尤其《孕媽咪衛教手冊（115年6月出版）》之：
> - 懷孕初期：生活保健 p.11、口腔檢查 p.15、規律運動 p.16–17、外出旅遊 p.18
> - 懷孕中期：生活保健 p.26、口腔檢查 p.31、規律運動 p.32、外出旅行 p.33
> - 懷孕後期：生活保健 p.40、口腔檢查 p.42、外出旅遊 p.43、規律運動 p.44–45
>
> **External Web Research = OFF。**
> 若手冊沒有支持某項生活建議，請建立 SOURCE_GAP_LOCAL 或省略，不得自行補充一般常識。
> 本輪只建立 Candidate Records + Read-only Review Dashboard；不得修改正式網站。

---

# 0｜治理原則

1. Production 只能使用 `review_status = approved`。
2. 本批全部：
   - `review_status: needs_review`
   - `human_reviewed: false`
3. 禁止自行 approved。
4. 不得修改 Batch 01–04、Weekly Fetal Growth 等既有 approved Records。
5. Prototype UI 不是 Evidence。
6. 不得把一般生活建議轉寫成醫療處方。
7. 運動建議只適用於來源所述適用族群；高危險妊娠／合併症需保留「諮詢婦產科醫師」條件。
8. Batch 03 已建立的危險徵兆不得重複建立；Batch 05 運動停止警訊可 reference / cross-link Batch 03。
9. 航空公司搭機週數、證明文件、保險條款等屬外部政策資訊，本批不得自行寫死。
10. 用藥、性生活、職場法規等若本批 Evidence 不足，不得為了湊 Record 自行新增。

---

# 1｜建議 Schema

優先沿用既有 Medical KB Schema：

```yaml
record_id:
category:
title:
pregnancy_stage:
applicable_window:
summary:
recommendations: []
avoid_or_cautions: []
stop_and_seek_help_if: []
special_conditions: []
source_refs: []
cross_refs: []
review_status: needs_review
human_reviewed: false
```

---

# PART A｜孕期生活保健（6 筆）

## A01｜孕期休息與生活節奏
`record_id: MED-LIFESTYLE-REST-001`
- category: pregnancy_lifestyle
- stage: ALL
- 依三階段生活保健篇整理休息、避免過度疲勞及依身體狀況調整活動的官方衛教。
- 不得自行建立固定「每天必睡 X 小時」數值，除非來源明載。

## A02｜孕期衣著與身體舒適
`record_id: MED-LIFESTYLE-CLOTHING-COMFORT-001`
- category: pregnancy_lifestyle
- stage: ALL
- 僅整理手冊實際支持之孕期衣著、鞋子、身體舒適相關建議。
- 不得擴增商業孕婦用品推薦。

## A03｜孕期沐浴與個人清潔
`record_id: MED-LIFESTYLE-HYGIENE-001`
- category: pregnancy_hygiene
- stage: ALL
- 依生活保健篇整理個人清潔、沐浴等官方提醒。
- 若不同孕期內容重複，整合成 ALL，但保留 evidence page。

## A04｜孕期乳房／皮膚日常照護
`record_id: MED-LIFESTYLE-BODY-CARE-001`
- category: pregnancy_body_care
- stage: ALL
- 僅納入手冊明載之日常照護。
- 不得加入美容療程、精油、醫美或保養品成分安全推論。

## A05｜菸品與二手菸暴露
`record_id: MED-LIFESTYLE-TOBACCO-EXPOSURE-001`
- category: pregnancy_exposure_safety
- stage: ALL
- 若手冊明載孕期菸害／二手菸提醒，忠實轉錄其核心原則。
- 不得把電子煙、加熱菸等細節自行擴增，除非 Evidence 明載。
- 如本地手冊內容不足，建立 SOURCE_GAP_LOCAL，不啟動網路研究。

## A06｜孕期心理支持與家人陪伴
`record_id: MED-LIFESTYLE-PSYCHOSOCIAL-SUPPORT-001`
- category: pregnancy_psychosocial_support
- stage: ALL
- 手冊前言指出孕期心理也會有明顯變化，感覺無法負荷時應適時向身邊的人尋求支援並表達需求。
- 家人／伴侶：陪伴產檢、協助減少孕期不適與家事負擔、給予休息、避免過度關心形成壓力。
- 本 Record 為支持性衛教，不做心理疾病診斷。

---

# PART B｜規律運動與身體活動（8 筆）

## B01｜孕期每週身體活動目標
`record_id: MED-EXERCISE-ACTIVITY-TARGET-001`
- category: pregnancy_exercise
- stage: ALL
- 對身體健康且沒有孕期合併症的孕媽咪，開始或繼續運動是安全的。
- 每天可累計 30 分鐘。
- 每週累計至少 **150 分鐘身體活動**。
- 不得把此目標套用到已有醫療禁忌或高危險妊娠者。

## B02｜孕期有氧運動
`record_id: MED-EXERCISE-AEROBIC-001`
- category: pregnancy_exercise
- stage: ALL
- 手冊示例：快走、游泳、孕婦瑜珈等。
- 依個人體力循序進行。
- 不得自行把高衝擊／高風險運動列為推薦。

## B03｜孕期肌力訓練
`record_id: MED-EXERCISE-STRENGTH-001`
- category: pregnancy_exercise
- stage: ALL
- 初期：可進行各部位訓練，上肢下肢均活動。
- 後期手冊：每週 2 天肌力訓練；可減輕負重、增加重複次數以提升肌耐力。
- 不得自行提供重量公斤數或最大心率處方。

## B04｜骨盆底肌運動
`record_id: MED-EXERCISE-PELVIC-FLOOR-001`
- category: pregnancy_exercise
- stage: ALL
- 初期即可開始練習，目的包含預防漏尿／尿失禁。
- 依手冊動作示範轉寫，不得自行增加醫療療程宣稱。

## B05｜孕中期運動姿勢調整
`record_id: MED-EXERCISE-T2-POSTURE-001`
- category: pregnancy_exercise_adjustment
- stage: T2
- 運動原則延續初期。
- 留意運動姿勢，避免過度彎曲或過度伸展。
- 每週維持至少 150 分鐘身體活動。
- 找家人陪伴可幫助運動持續。

## B06｜孕後期持續運動與姿勢
`record_id: MED-EXERCISE-T3-CONTINUE-001`
- category: pregnancy_exercise_adjustment
- stage: T3
- 已建立運動習慣者，不需因肚子變大而停止；若沒有不適，可依身體狀況持續。
- 尚未建立運動習慣者仍可依體力開始活動。
- 建議以斜躺或站姿取代平躺，以避免仰臥位低血壓症候群可能造成頭暈、噁心或不舒服。
- 維持有氧、肌力與骨盆底肌活動。

## B07｜運動環境、熱量與補水
`record_id: MED-EXERCISE-ENVIRONMENT-HYDRATION-001`
- category: pregnancy_exercise_safety
- stage: ALL
- 選擇通風涼爽或有空調場所。
- 避免在 **>32°C** 的過熱、悶熱場地運動。
- 不要空腹太久後運動，以避免低血糖症狀。
- 可少量多餐補充熱量。
- 適時補水，避免脫水及體溫遽升。

## B08｜運動禁忌與立即停止警訊
`record_id: MED-EXERCISE-STOP-WARNING-001`
- category: pregnancy_exercise_safety
- stage: ALL
- 高危險妊娠情形，例如早產現象、產前出血、前置胎盤或高血壓等合併症，可能不適合運動，應進一步諮詢婦產科醫師。
- 運動中若出現以下狀況，**立即停止運動**：
  - 陰道出血
  - 腹痛
  - 規律疼痛的子宮收縮
  - 破水
  - 呼吸困難
  - 頭暈頭痛
  - 肌肉無力影響平衡
  - 小腿疼痛或腫脹
- cross_ref：Batch 03 Red Flag Records。
- 不得以「孕期運動通常安全」覆蓋以上停止警訊。

---

# PART C｜孕期口腔照護（4 筆）

> 僅依 p.15 / p.31 / p.42 口腔檢查篇實際內容建立。

## C01｜孕期口腔檢查的重要性
`record_id: MED-ORAL-CARE-CHECKUP-001`
- category: pregnancy_oral_health
- stage: ALL
- 整理手冊對孕期口腔檢查與牙齒健康的核心衛教。
- 不得自行加入固定看診頻率，除非手冊明載。

## C02｜孕期日常口腔清潔
`record_id: MED-ORAL-CARE-HYGIENE-001`
- category: pregnancy_oral_health
- stage: ALL
- 僅整理手冊明載刷牙、牙間清潔等日常照護。
- 不得自行推薦特定品牌牙膏／漱口水。

## C03｜孕期常見口腔變化與處理
`record_id: MED-ORAL-CARE-PREGNANCY-CHANGES-001`
- category: pregnancy_oral_health
- stage: ALL
- 僅整理官方手冊明載的孕期口腔／牙齦變化與處理。
- 若有出血、疼痛或其他異常需牙科評估的條件，忠實保留。

## C04｜孕期牙科治療安全原則
`record_id: MED-ORAL-CARE-DENTAL-TREATMENT-001`
- category: pregnancy_oral_health
- stage: ALL
- 僅依手冊說明整理孕期牙科治療／檢查原則。
- 不得自行判斷特定藥物、麻醉藥、X 光劑量安全性。
- 若 Evidence 未支持特定療程，標記 SOURCE_GAP_LOCAL。

---

# PART D｜外出旅行與交通（4 筆）

> 依 p.18 / p.33 / p.43「外出旅遊／旅行篇」實際內容建立。

## D01｜孕期外出旅行一般原則
`record_id: MED-TRAVEL-GENERAL-001`
- category: pregnancy_travel
- stage: ALL
- 依孕期階段與身體狀況評估是否適合旅行。
- 僅轉錄手冊明載的準備與注意事項。
- 有孕期異常或醫療風險者，依手冊保留諮詢醫療專業人員條件。

## D02｜長途移動與途中活動
`record_id: MED-TRAVEL-LONG-DISTANCE-001`
- category: pregnancy_travel
- stage: ALL
- 僅整理手冊對長時間搭車／移動、休息、活動等建議。
- 不得自行建立每 X 分鐘一定要走動的數值，除非來源明載。

## D03｜孕期搭乘交通工具／安全帶
`record_id: MED-TRAVEL-TRANSPORT-SAFETY-001`
- category: pregnancy_travel_safety
- stage: ALL
- 僅依手冊實際內容整理乘車與安全相關衛教。
- 若包含安全帶位置等圖文資訊，需忠實保留原意。
- 不得自行擴充車禍醫療處置流程。

## D04｜孕期搭機與海外旅行
`record_id: MED-TRAVEL-AIR-OVERSEAS-001`
- category: pregnancy_travel
- stage: ALL
- 只建立手冊有支持的一般孕期搭機／旅行衛教。
- **航空公司可搭孕週、適航證明、拒載週數、保險資格皆不得寫死**，因屬航空公司／政策變動資訊。
- 若產品未來需要虎航、華航、長榮等規定，另建 `POLICY_GAP_TRAVEL_AIRLINE`，不得混入本 Medical Record。

---

# PART E｜明確不納入本 Batch 的項目

以下主題若官方手冊目前不足，不要自行建立：

- 個別處方藥／成藥／中藥安全清單
- 特定美容保養品／精油／染髮成分
- 各航空公司孕婦搭機政策
- 旅遊保險條款
- 職場勞動法規與產假制度
- 性生活禁忌的自行推論
- 特定運動器材安全等級
- 個人化心率／重量訓練處方

如產品未來確定需要，建立 Source Gap，後續另批處理。

---

# PART F｜Batch 05 預期總數

- Lifestyle / Psychosocial Support：6
- Exercise / Physical Activity：8
- Oral Health：4
- Travel / Transport：4

## TOTAL = 22 Candidate Records

全部：

```json
{
  "review_status": "needs_review",
  "human_reviewed": false
}
```

---

# PART G｜Evidence Extraction Rule

Antigravity 必須先逐頁讀取指定官方手冊內容，再建立 Record。

對 A、C、D 類 Record：
- 若本檔只提供主題骨架，而手冊頁面沒有足夠支持具體內容：
  - 不得自行補值
  - 不得使用 AI 一般知識
  - 建立 `SOURCE_GAP_LOCAL` 或將該 Record 標記 BLOCKED

對 B 類運動 Record：
- 必須嚴格保留來源中的數值與條件。
- `150 minutes/week`
- `30 minutes/day cumulative`
- `>32°C`
等不得自行修改。

---

# PART H｜Safety Rules

1. 「健康且無孕期合併症者可運動」不得轉成「所有孕婦都可運動」。
2. 運動停止警訊優先權高於一般運動建議。
3. 高危險妊娠不得由 AI 自行判斷可以運動。
4. 後期避免平躺運動的內容應保留來源脈絡，不得擴大成「孕婦完全不能仰躺」的一般生活禁令。
5. 旅行建議不得取代產科醫師針對個案的適航／旅行評估。
6. 航空公司政策屬動態資訊，不得硬編入永久 Medical KB。
7. 口腔衛教不得自行產生藥物／麻醉／放射線劑量判斷。
8. 心理支持 Record 不得診斷焦慮症、憂鬱症或其他心理疾病。
9. 若生活建議與 Batch 03 Red Flag 同時命中，**Red Flag 優先**。

---

# PART I｜Review Dashboard

新增 Read-only 頁：

# 「孕期生活・運動・外出安全」

分區：

### 🌿 生活保健
6 Records

### 🏃 規律運動
8 Records

### 🦷 口腔照護
4 Records

### ✈️ 外出旅行
4 Records

每張卡至少顯示：
- Title
- Category
- Pregnancy Stage
- Recommendations
- Avoid / Cautions
- Stop & Seek Help If
- Special Conditions
- Evidence
- Review Status
- Human Reviewed
- Source Gap（若有）

運動卡應特別視覺化：
- 綠色：一般建議
- 橘色：注意事項
- 紅色：立即停止警訊

Dashboard 僅供 Review，不得修改 Production UI。

---

# PART J｜Frontend Consumer Context

未來主要支援：

1. `我的孕期 → 本週生活提醒`
2. `我的孕期 → 本週運動建議`
3. `AI孕期助理 → 可以運動嗎／可以旅行嗎等一般衛教`
4. `神隊友視角 → 陪伴運動、分擔家務、旅行支持`
5. `每日提醒 → 生活／活動小建議`

本輪禁止修改正式網站。

---

# PART K｜Integrity Guardrails

禁止修改：
- Batch 01 approved Records
- Batch 02 approved Records
- Batch 03 approved Records
- Batch 04 approved Records
- Weekly Fetal Growth approved Records
- Existing Source Gap history
- Production Website

允許：
- 新增 Batch 05 Candidate Records
- 必要 Source Gap
- Dashboard Read-only UI
- data.js / Dashboard sync
- source_refs mapping

---

# PART L｜Candidate Build Final Integrity Check

完成後自動確認：

```text
Lifestyle: X/6
Exercise: 8/8
Oral Health: X/4
Travel: X/4
Total Expected Maximum: 22
```

注意：
- A/C/D 若因手冊證據不足 BLOCKED，不得為了達成 22/22 自行補內容。
- Final Report 必須明確列出 BLOCKED / SOURCE GAP。

必驗證：

```text
Weekly physical activity = at least 150 minutes
Daily activity example = cumulative 30 minutes
Exercise environment >32°C = avoid
High-risk pregnancy = clinician assessment
Exercise red flags = immediate stop
T2 = avoid excessive bending / stretching
T3 = continue activity according to condition
T3 exercise = prefer reclined or standing rather than flat supine when applicable
Airline-specific gestational limits = NOT hardcoded
External Web = NO
```

---

# PART M｜Final Report

只回報：

```text
BATCH 05

Lifestyle Records: X / 6
Exercise Records: X / 8
Oral Health Records: X / 4
Travel Records: X / 4

Total Candidate Records: X
Needs Review: X
Human Reviewed False: X
Blocked Records: X

Source Gaps: X
Discrepancies: X

EVIDENCE
Pregnancy Education Handbook 2026: USED / NOT USED
Pregnancy Health Handbook 2026: USED / NOT USED
Father Handbook 2025: USED / NOT USED
External Web: YES / NO

SAFETY
Exercise Numeric Validation: PASS / FAIL
Exercise Stop-Warning Validation: PASS / FAIL
High-Risk Pregnancy Guardrail: PASS / FAIL
Travel Policy Guardrail: PASS / FAIL
Oral Health Guardrail: PASS / FAIL
Red Flag Priority: PASS / FAIL

INTEGRITY
Previous Approved Records Modified: YES / NO
Batch 04 Modified: YES / NO
Production Website Modified: YES / NO

DASHBOARD
孕期生活・運動・外出安全 Review Mode: READY / NOT READY

FINAL
BATCH 05 CANDIDATE BUILD: COMPLETED / BLOCKED
READY FOR HUMAN REVIEW: YES / NO
```

完成後停止：
- 不得自行 approved
- 不得開始 Batch 06
- 不得修改正式網站
