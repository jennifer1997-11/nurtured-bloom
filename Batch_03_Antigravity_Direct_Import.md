# 孕育之美 Medical KB｜Batch 03 Antigravity Direct Import

> **Batch 03 主題：孕期常見不適、危險徵兆、早產警訊與產兆**
>
> 用途：直接交付 Antigravity 建立 Medical KB Candidate Records 與 Review Dashboard 視覺化。
>
> **資料已依專案既有官方手冊整理；Antigravity 不需重新研究、不得自行擴增醫療內容。**
>
> 本輪只建立 Candidate + Review Dashboard；不得修改正式網站。

---

## 0｜治理原則

1. Production 只能使用 `review_status = approved`。
2. 本批全部：
   - `review_status: needs_review`
   - `human_reviewed: false`
3. 禁止自行 approved。
4. 不得修改 Batch 01、Batch 02、Weekly Fetal Growth 等既有 approved Records。
5. Prototype UI 不是 Evidence。
6. External Web Research = OFF。
7. 常見症狀不得被描述成「一定安全」；若有 red flag / escalation condition 必須保留。
8. 「早產徵兆」與「足月產兆」必須分開。
9. 一般陰道分泌物與破水必須分開。

---

## 1｜Evidence Sources

### Primary A
《孕媽咪衛教手冊（115年6月出版）》— 衛生福利部國民健康署  
使用：初／中／後期常見小問題、早產徵兆、產兆、運動異常警訊。

### Primary B
《孕媽咪健康手冊（115年6月出版）》— 衛生福利部國民健康署  
使用：「亮黃燈！注意危險徵兆」、早產與高危險妊娠。

### Supporting
《爸爸孕產育兒衛教手冊（114年9月）》— 衛生福利部國民健康署  
使用：三大產兆與前往醫院時機。

---

## 2｜建議 Schema

優先沿用既有 Medical KB Schema；若欄位不同請 mapping，不要另建不相容格式。

```yaml
record_id:
category:
title:
pregnancy_stage:
applicable_window:
severity:
summary:
common_presentations: []
self_care_or_actions: []
red_flags: []
when_to_seek_care:
source_refs: []
review_status: needs_review
human_reviewed: false
```

建議 severity：
`self_care | monitor | seek_medical_advice | urgent | emergency`

---

# PART A｜一般孕期常見不適（15 筆）

## A01 孕吐／噁心
- `record_id: MED-SYMPTOM-T1-NAUSEA-001`
- category: `common_pregnancy_discomfort`
- stage: T1
- 常見：晨吐常見，但任何時間都可能；多數 3 個月後改善。
- 可做：少量多餐、避免空腹；避免油膩／難消化／調味重食物；乾濕分開；孕吐後漱口並補少量水。
- 就醫：孕吐嚴重且無法改善；持續或嚴重噁心／嘔吐。
- Evidence：《孕媽咪衛教手冊》懷孕初期常見小問題；《孕媽咪健康手冊》危險徵兆。

## A02 頭暈／頭痛
- `record_id: MED-SYMPTOM-T1-DIZZINESS-HEADACHE-001`
- category: `common_pregnancy_discomfort`
- stage: T1 / pregnancy
- 可做：避免同一姿勢太久；適度活動；放鬆、避免過勞；輕柔伸展或按摩。
- Red flag：持續或劇烈頭痛 → urgent。
- Evidence：衛教手冊初期小問題；健康手冊危險徵兆。

## A03 孕期陰道出血
- `record_id: MED-SYMPTOM-T1-VAGINAL-BLEEDING-001`
- category: `pregnancy_symptom_requires_assessment`
- stage: ALL
- 原則：出血原因很多，不一定是流產，但需醫療評估。
- 可觀察血液型態、量、顏色供醫師判斷。
- 若出血量增加、鮮血、或合併腹痛 → 儘速就醫。
- Critical：健康手冊將「陰道出血（不管量多少）」列為應就醫危險徵兆。
- 前台不得標記為「正常現象」。
- Evidence：兩本 115 年手冊。

## A04 頻尿
- `record_id: MED-SYMPTOM-T1-URINARY-FREQUENCY-001`
- category: `common_pregnancy_discomfort`
- stage: T1_T3
- 可做：有尿意就排尿、不憋尿；分散喝水；白天補水、晚餐後適度減量。
- 若嚴重影響日常 → 就醫評估。
- Red flag：尿量明顯減少、排尿疼痛／灼熱 → 就醫。
- Evidence：衛教手冊初期小問題；健康手冊危險徵兆。

## A05 腰痠背痛
- `record_id: MED-SYMPTOM-T2-BACK-PAIN-001`
- stage: T2_T3
- 可做：避免久站久坐與提重物；可依舒適使用托腹帶；適度伸展、熱敷、按摩。
- Critical：「持續腰痠＋腹部變硬」屬危險徵兆。
- Evidence：衛教手冊中期小問題；健康手冊危險徵兆。

## A06 腳抽筋
- `record_id: MED-SYMPTOM-T2-LEG-CRAMPS-001`
- stage: T2_T3
- 抽筋時：伸直腿、腳趾朝小腿方向反折。
- 預防：睡前伸展、熱敷、泡腳、按摩；久坐 40–60 分鐘起身活動。
- 嚴重持續：諮詢醫師／營養師。
- Evidence：衛教手冊中期小問題。

## A07 下肢水腫
- `record_id: MED-SYMPTOM-T2-EDEMA-001`
- stage: T2_T3
- 可做：避免久坐久站；適度活動；休息時可依舒適抬腿。
- Critical：臉部和手部浮腫是危險徵兆，需與一般下肢水腫區分。
- Evidence：衛教手冊中期小問題；健康手冊危險徵兆。

## A08 靜脈曲張
- `record_id: MED-SYMPTOM-T2-VARICOSE-VEINS-001`
- stage: T2_T3
- 可做：避免久坐；適度散步／活動。
- Red flag：小腿疼痛或腫脹不可簡化為一般靜脈曲張；運動中出現應立即停止並評估。
- Evidence：衛教手冊中期小問題與運動注意事項。

## A09 皮膚乾癢
- `record_id: MED-SYMPTOM-T2-ITCHY-SKIN-001`
- stage: T2_T3
- 可做：寬鬆衣物；流汗後擦乾；避免過熱洗澡；溫和沐浴與保濕。
- 持續嚴重異常 → 就醫。
- Evidence：衛教手冊中期小問題。

## A10 陰道分泌物增加
- `record_id: MED-SYMPTOM-T2-VAGINAL-DISCHARGE-001`
- stage: T2_T3
- 一般：蛋清狀、透明稠狀、無明顯味道。
- 黃綠、有臭味、搔癢 → 可能感染，應就醫。
- Critical：羊水清澈、無黏性、可能持續流出；疑似破水應儘快就醫。
- Evidence：衛教手冊中期小問題。

## A11 呼吸急促／輕微心悸
- `record_id: MED-SYMPTOM-T3-BREATHLESSNESS-001`
- stage: T3
- 原因衛教：血流量增加、心臟負荷增加、子宮向上壓迫橫膈膜。
- 輕微且休息後緩解屬常見狀況之一。
- Red flag：明顯呼吸困難或無法因休息緩解 → 就醫；運動中發生應停止運動。
- Evidence：衛教手冊後期小問題、運動注意事項。

## A12 恥骨痛
- `record_id: MED-SYMPTOM-T3-PUBIC-PAIN-001`
- stage: T3
- 可能延伸骨盆／腰背；走路、樓梯、翻身時疼痛。
- 可做：放慢動作、和緩移動、托腹帶。
- 嚴重 → 就醫。
- Evidence：衛教手冊後期小問題。

## A13 便祕
- `record_id: MED-SYMPTOM-T3-CONSTIPATION-001`
- stage: pregnancy / T3
- 可做：足夠水分；手冊可用約 2,000cc/日作一般衛教參考；增加全穀、未精製雜糧、蔬果；規律排便。
- 嚴重／持續 → 諮詢醫療人員。
- Evidence：衛教手冊後期小問題。

## A14 痔瘡
- `record_id: MED-SYMPTOM-T3-HEMORRHOIDS-001`
- stage: T3
- 可能：肛門腫痛、排便出血、腫脹突出。
- 可做：水分＋纖維；規律排便；溫水坐浴 5–10 分鐘，每日 3–4 次。
- 腫痛明顯／排便困難 → 就醫，由醫師評估軟便劑或止痛軟膏。
- Evidence：衛教手冊後期小問題。

## A15 失眠／淺眠
- `record_id: MED-SYMPTOM-T3-INSOMNIA-001`
- stage: T3
- 可能受抽筋、頻尿、胎動、生產擔心影響。
- 可做：睡前減少 3C；建立睡眠習慣；音樂、伸展、放鬆；規律運動；白天短暫休息。
- 嚴重 → 諮詢醫師；不得自行提供孕期安眠藥建議。
- Evidence：衛教手冊後期小問題。

---

# PART B｜孕期危險徵兆（11 筆）

核心 Evidence：《孕媽咪健康手冊》p.13「亮黃燈！注意危險徵兆」。

1. `MED-RED-FLAG-VAGINAL-BLEEDING-001`｜陰道出血｜severity: urgent
2. `MED-RED-FLAG-SEVERE-HEADACHE-001`｜持續或劇烈頭痛｜urgent
3. `MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001`｜持續或劇烈腹痛｜urgent
4. `MED-RED-FLAG-SEVERE-VOMITING-001`｜持續或嚴重噁心／嘔吐｜urgent
5. `MED-RED-FLAG-FEVER-CHILLS-001`｜突然發冷發熱｜urgent
6. `MED-RED-FLAG-BLURRED-VISION-001`｜視力模糊｜urgent
7. `MED-RED-FLAG-FACE-HAND-SWELLING-001`｜臉部與手部浮腫｜urgent
8. `MED-RED-FLAG-URINARY-CHANGE-001`｜尿量明顯減少或排尿疼痛／灼熱｜urgent
9. `MED-RED-FLAG-DECREASED-FETAL-MOVEMENT-001`｜胎動停止或比平常活動量少一半｜urgent
10. `MED-RED-FLAG-RUPTURE-MEMBRANES-001`｜陰道持續流出水樣液體／疑似破水｜urgent
11. `MED-RED-FLAG-BACKACHE-HARDENING-001`｜持續腰痠與腹部變硬｜urgent

Critical：
- 前台語氣必須是「應就醫／儘速就醫評估」。
- 不得弱化成一般生活提醒。
- 第 9 項不得因「後期空間變小胎動稍減」就取消警訊。

---

# PART C｜早產警訊（3 筆）

適用：**滿 20 週、未滿 37 週**。

## C01 頻繁子宮收縮
- `record_id: MED-PRETERM-SIGN-CONTRACTIONS-001`
- category: `preterm_labor_warning`
- applicable_window: `20_to_less_than_37_weeks`
- severity: urgent
- 定義：一小時內 6 次以上子宮收縮，類似月經悶痛／脹痛，達不舒服程度，且休息 1 小時仍無改善 → 儘快就醫。

## C02 陰道出血
- `record_id: MED-PRETERM-SIGN-BLEEDING-001`
- 大量出血或少量持續性出血 → 儘快就醫。

## C03 破水
- `record_id: MED-PRETERM-SIGN-ROM-001`
- 陰道流出大量水樣液體 → 儘快就醫。

Evidence：《孕媽咪衛教手冊》認識早產徵兆；《孕媽咪健康手冊》早產。

---

# PART D｜足月附近三大產兆（3 筆）

> 不可與未滿 37 週的早產警訊合併。

## D01 規則陣痛
- `record_id: MED-LABOR-SIGN-CONTRACTIONS-001`
- category: `labor_sign`
- 爸爸手冊：第一胎約 7–8 分鐘一次規則性陣痛時可準備去醫院；第二胎以上產程可能較快，規則收縮時需提早準備。
- 若不確定，可聯絡待產醫院產房。
- 此時間僅作官方手冊衛教，不得寫成所有醫院一致規則。

## D02 破水
- `record_id: MED-LABOR-SIGN-ROM-001`
- 大量接近透明液體、不自主流出 → 儘快前往醫院。

## D03 落紅／見紅
- `record_id: MED-LABOR-SIGN-BLOODY-SHOW-001`
- 少量落紅不一定代表立即生產，可觀察規則陣痛或破水。
- 出血量多 → 立即至醫院檢查。
- 不得把「落紅」與所有孕期陰道出血視為完全相同。

Evidence：《爸爸孕產育兒衛教手冊》三大產兆；《孕媽咪衛教手冊》產兆。

---

# PART E｜總筆數

- Common discomfort：15
- Pregnancy red flags：11
- Preterm warning signs：3
- Labor signs：3

## Total = 32 Candidate Records

全部：
```json
{
  "review_status": "needs_review",
  "human_reviewed": false
}
```

---

# PART F｜AI Safety Routing

Batch 03 未來會提供 AI 孕期助理使用，因此必須支援 safety routing。

建議欄位：
```yaml
ai_safety:
  can_self_manage:
  seek_care_if:
  urgent_if:
  do_not_reassure_if:
```

規則：
1. AI 不得因症狀「孕期常見」就排除危險疾病。
2. 出血、劇烈頭痛、劇烈腹痛、視力模糊、破水、胎動明顯減少等優先觸發就醫建議。
3. 同一症狀可同時有 common-discomfort Record 與 red-flag Record，必須依嚴重程度／伴隨症狀 routing。
4. 不得用 KB 自行確診妊娠高血壓、子癲前症、感染、早產等。
5. `urgent` = 需要儘速醫療評估，不代表 AI 已確診疾病。

---

# PART G｜Review Dashboard

新增 Read-only 頁：

## 「孕期不適・危險警訊」

四區：
- 🌿 常見不適（依 T1/T2/T3）
- ⚠️ 危險徵兆（11）
- 🚨 早產警訊（未滿37週條件）
- 🏥 生產產兆

每張卡至少顯示：
- Title
- Category
- Pregnancy Stage / Applicable Window
- Severity
- Common Presentations
- Self-care / Actions
- When to seek care
- Red Flags
- Evidence
- Review Status
- Human Reviewed

Dashboard 維持 Read Only。

---

# PART H｜Frontend Consumer Context

未來服務：
1. `我的孕期 → 本週身體變化／注意事項`
2. `AI孕期助理 → 症狀問答 Safety Routing`
3. `孕期健康地圖 → 危險徵兆提醒`
4. `神隊友視角 → 何時應陪同就醫`
5. `每日提醒 → 非診斷型生活衛教`

**本輪不得修改正式網站。**

---

# PART I｜Integrity Guardrails

禁止修改：
- Batch 01 approved Records
- Batch 02 approved Records
- Weekly Fetal Growth approved Records
- Existing Source Gap history
- Production Website
- Existing frontend Prototype

允許：
- 新增 Batch 03 Candidate Records
- Dashboard Read-only UI
- data.js / Dashboard 同步資料
- 必要的 source_refs mapping（優先重用既有 registry）

---

# PART J｜Final Report

完成後只回報：

```text
BATCH 03

Common Discomfort Records: X / 15
Red Flag Records: X / 11
Preterm Warning Records: X / 3
Labor Sign Records: X / 3

Total Records: X / 32
Needs Review: X
Human Reviewed False: X

Source Gaps: X
Discrepancies: X

Evidence
HPA Pregnancy Education Handbook 2026: USED / NOT USED
HPA Pregnancy Health Handbook 2026: USED / NOT USED
Father Handbook 2025: USED / NOT USED
External Web: YES / NO

Integrity
Existing Approved Records Modified: YES / NO
Batch 02 Modified: YES / NO
Production Website Modified: YES / NO

Dashboard
孕期不適・危險警訊 Review Mode: READY / NOT READY

FINAL
BATCH 03 CANDIDATE BUILD: COMPLETED / BLOCKED
READY FOR HUMAN REVIEW: YES / NO
```

完成後停止：
- 不得自行 approved
- 不得開始 Batch 04
- 不得修改正式網站
