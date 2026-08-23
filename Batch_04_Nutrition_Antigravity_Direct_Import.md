# 孕育之美 Medical KB｜Batch 04 Antigravity Direct Import

> **Batch 04 主題：孕期營養、飲食安全與飲食生活管理**
>
> 本檔內容依專案現有官方資料庫整理：
> - 《孕媽咪衛教手冊（115年6月出版）》
> - 《孕媽咪健康手冊（115年6月出版）》
> - 《爸爸孕產育兒衛教手冊（114年9月）》
>
> **Antigravity 不需重新研究、不得自行擴充本檔沒有寫的營養數值或醫療宣稱。**
>
> 本輪只建立 Medical KB Candidate Records + Review Dashboard；**不得修改正式網站**。

---

# 0｜治理原則

1. Production 只能使用 `review_status = approved`。
2. 本批全部：
   - `review_status: needs_review`
   - `human_reviewed: false`
3. 禁止自行 approved。
4. 禁止修改 Batch 01、Batch 02、Batch 03、Weekly Fetal Growth 等既有 approved Records。
5. Prototype UI 不是 Evidence。
6. External Web Research = OFF。
7. **不得自行推算營養素需求量、不得自行修改單位、不得用一般常識補值。**
8. 若不同官方手冊數值或說法存在差異，建立 `DISCREPANCY`，不要自行融合。
9. 飲食衛教 ≠ 個人化營養處方；AI 未來不得以本 KB 取代醫師或營養師評估。
10. 多胞胎、特殊疾病、體重異常、素食等情況，如來源要求專業評估，必須保留。

---

# 1｜Evidence Sources

## Primary Source
《孕媽咪衛教手冊（115年6月出版）》— 衛生福利部國民健康署

主要使用：
- 懷孕初／中／後期飲食營養篇
- 熱量與蛋白質
- 葉酸、鐵、碘、維生素 B12
- 鈣、DHA、維生素 D
- 孕吐飲食
- 咖啡因
- 魚類與甲基汞
- 水分、纖維、鈉
- 酒精

## Secondary Source
《孕媽咪健康手冊（115年6月出版）》— 衛生福利部國民健康署

主要使用：
- 李斯特菌症與弓形蟲感染症飲食安全
- 生飲生食、生熟食分開等食品安全
- 特殊妊娠／高風險狀況的飲食提醒

## Supporting Source
《爸爸孕產育兒衛教手冊（114年9月）》— 衛生福利部國民健康署

僅補充：
- 孕初、中、後期營養重點
- 食物來源
- 中期鈣、鎂、維生素 D
- 後期鐵
- 陪伴者飲食支持

---

# 2｜建議 Schema

優先沿用現有 Medical KB Schema。

```yaml
record_id:
category:
title:
pregnancy_stage:
applicable_window:
daily_reference_value:
unit:
purpose:
food_sources: []
recommendations: []
avoid_or_limit: []
special_notes: []
source_refs: []
review_status: needs_review
human_reviewed: false
```

如現有 Schema 無 `daily_reference_value` 等欄位，可 mapping 到既有 `content` / `notes`，不要另建不相容架構。

---

# PART A｜三階段營養總覽（3 筆）

## A01｜懷孕初期營養總覽

```yaml
record_id: MED-NUTRITION-T1-OVERVIEW-001
category: pregnancy_nutrition_stage
title: 懷孕初期飲食營養重點
pregnancy_stage: T1
applicable_window: less_than_13_weeks
```

內容：
- 熱量：**不需特別增加（+0 大卡）**
- 蛋白質：**每日增加 10 公克**
- 葉酸、鐵、碘、維生素 B12：整個孕期都要攝取足量。
- 懷孕初期若孕吐、胃口不佳，不需要因擔心寶寶沒有養分而強迫進食，可依自身狀況調整飲食。
- 飲食以營養均衡為原則，不是「一人吃兩人補」。

Evidence：
《孕媽咪衛教手冊》p.8–10、PART 1 初期營養摘要。

---

## A02｜懷孕中期營養總覽

```yaml
record_id: MED-NUTRITION-T2-OVERVIEW-001
category: pregnancy_nutrition_stage
title: 懷孕中期飲食營養重點
pregnancy_stage: T2
applicable_window: 13_to_less_than_29_weeks
```

內容：
- 每日熱量：相較懷孕前 **+300 大卡**
- 蛋白質：持續 **+10 公克**
- 開始／持續補足：鈣、DHA、維生素 D。
- 葉酸、鐵、碘、維生素 B12 仍須持續補足。
- 胎兒快速成長，纖維與水分攝取也重要。
- 300 大卡應以均衡點心／食物補充，不代表可用高油、高糖食物取代。

Evidence：
《孕媽咪衛教手冊》p.22–23、PART 1 中期摘要。

---

## A03｜懷孕後期營養總覽

```yaml
record_id: MED-NUTRITION-T3-OVERVIEW-001
category: pregnancy_nutrition_stage
title: 懷孕後期飲食營養重點
pregnancy_stage: T3
applicable_window: 29_weeks_or_more
```

內容：
- 每日熱量：維持 **+300 大卡**，不因進入後期再額外增加。
- 蛋白質：持續 **+10 公克**
- 鐵：增加至 **每日 45 mg**；手冊說明其中約 15 mg 可由食物攝取、30 mg 額外補充，並應諮詢婦產科醫師。
- 鈣：持續補足。
- 容易胃脹者可少量多餐。
- 高熱量、高糖、精製澱粉與加工食品宜控制。

Evidence：
《孕媽咪衛教手冊》p.38–39、PART 1 後期摘要。

---

# PART B｜核心營養素（9 筆）

## B01｜蛋白質

```yaml
record_id: MED-NUTRIENT-PROTEIN-001
category: pregnancy_nutrient
title: 孕期蛋白質
pregnancy_stage: ALL
daily_reference_value: "+10 g compared with non-pregnant requirement"
```

內容：
- 孕期各階段皆建議較平時增加 **10 公克蛋白質**。
- 手冊示例：一般成人每日蛋白質可用體重（kg）×1.1g，再加孕期 10g；實際需求仍依體重、年齡、活動量調整。
- 優質來源：豆、魚、蛋、肉、奶類及其製品。
- 素食孕婦仍須確保足夠優質蛋白質。

---

## B02｜葉酸

```yaml
record_id: MED-NUTRIENT-FOLATE-001
category: pregnancy_nutrient
title: 葉酸
pregnancy_stage: ALL
daily_reference_value: 600
unit: microgram_per_day
```

內容：
- 重要性：幫助胎兒正常發育成長及神經系統發展。
- 食物來源：深綠色蔬菜、肝臟、蛋黃、豆製品、芭樂等。
- 若日常飲食不足，手冊建議在醫師處方下評估營養補充劑。

Evidence：
《孕媽咪衛教手冊》p.9。

---

## B03｜鐵

```yaml
record_id: MED-NUTRIENT-IRON-001
category: pregnancy_nutrient
title: 鐵
pregnancy_stage: ALL
```

內容：
- 初／中期手冊列示：**15 mg/day**。
- 後期：**45 mg/day**。
- 後期手冊說明：15 mg 可由食物取得、30 mg 額外補充，應諮詢婦產科醫師。
- 重要性：預防孕媽咪貧血與新生兒早產風險。
- 食物來源：蛤蜊、章魚、豬肝、腰子、蛋黃、深色蔬菜、全穀等。
- 後期可於餐後適量吃富含維生素 C 的水果幫助鐵吸收。

Critical：
- 不得把 45 mg/day 套用成整個孕期固定需求。

---

## B04｜碘

```yaml
record_id: MED-NUTRIENT-IODINE-001
category: pregnancy_nutrient
title: 碘
pregnancy_stage: ALL
daily_reference_value: 225
unit: microgram_per_day
```

內容：
- 重要性：幫助胎兒腦部發育，預防生長遲緩。
- 食物來源：含碘鹽、海帶、海藻、魚貝類等。
- 整個孕期持續補足。

Evidence：
《孕媽咪衛教手冊》p.9。

---

## B05｜維生素 B12

```yaml
record_id: MED-NUTRIENT-B12-001
category: pregnancy_nutrient
title: 維生素 B12
pregnancy_stage: ALL
daily_reference_value: 2.6
unit: microgram_per_day
```

內容：
- 重要性：增進胎兒神經系統健康。
- 食物來源：肉類、海鮮、紫菜等。
- 全素食孕媽咪需特別留意富含 B12 的食物／營養來源。
- 若飲食不足，依專業評估補充。

Evidence：
《孕媽咪衛教手冊》p.9；爸爸手冊孕期營養重點。

---

## B06｜鈣

```yaml
record_id: MED-NUTRIENT-CALCIUM-001
category: pregnancy_nutrient
title: 鈣
pregnancy_stage: T2_T3
daily_reference_value: 1000
unit: mg_per_day
```

內容：
- 中期起手冊明確列示 **1,000 mg/day**。
- 重要性：滿足胎兒成長與母體需要。
- 食物來源：牛／羊乳與乳製品、豆干或傳統豆腐、深綠色蔬菜、黑芝麻等。
- 後期持續補足。

Evidence：
《孕媽咪衛教手冊》p.23、p.38。

---

## B07｜DHA

```yaml
record_id: MED-NUTRIENT-DHA-001
category: pregnancy_nutrient
title: DHA
pregnancy_stage: T2_T3
daily_reference_value: 200
unit: mg_per_day
```

內容：
- 中期起手冊列示 **200 mg/day**。
- 重要性：維持神經系統及構成大腦、視網膜的重要成分。
- 食物來源：鯖魚、秋刀魚、午仔魚、鮭魚等。
- 魚類應多樣輪替，不固定只吃單一魚種。

Evidence：
《孕媽咪衛教手冊》p.23、p.25。

---

## B08｜維生素 D

```yaml
record_id: MED-NUTRIENT-VITAMIN-D-001
category: pregnancy_nutrient
title: 維生素 D
pregnancy_stage: T2_T3
daily_reference_value: 10
unit: microgram_per_day
equivalent: 400 IU
```

內容：
- 中期手冊列示 **10 μg/day（400 IU）**。
- 重要性：增進鈣吸收、幫助生長發育。
- 食物來源：富含油脂魚類、蛋黃、強化維生素 D 乳品與豆漿。
- 手冊亦提及日曬可幫助產生維生素 D。
- 不得自行把手冊日曬描述轉成保證足夠或治療處方。

Evidence：
《孕媽咪衛教手冊》p.23。

---

## B09｜膳食纖維與水分

```yaml
record_id: MED-NUTRITION-FIBER-WATER-001
category: pregnancy_dietary_pattern
title: 膳食纖維與水分
pregnancy_stage: T2_T3
```

內容：
- 後期手冊建議每日補足約 **2,000 cc 水分**。
- 每日攝取 **3 蔬 2 果**（合計約 5 個拳頭大小）。
- 可用糙米、南瓜等全穀與未精製雜糧取代精製澱粉。
- 搭配適量水分有助腸道蠕動與預防便祕。
- 如因個人疾病／醫囑需限制液體，不得以本一般建議覆蓋醫療指示。

Evidence：
《孕媽咪衛教手冊》p.39。

---

# PART C｜飲食行為與安全（6 筆）

## C01｜孕吐時的飲食調整

```yaml
record_id: MED-NUTRITION-NAUSEA-DIET-001
category: pregnancy_diet_management
title: 孕吐／胃口不佳時怎麼吃
pregnancy_stage: T1
```

內容：
- 口味清淡，避免油膩食物。
- 少量多餐，減少單次份量、增加用餐次數。
- 水分小口補充，避免一次大量飲用造成反胃。
- 液體與固體可分開吃，例如吃完飯不要立刻大量喝湯。
- 食物來源可補充維生素 B6，如糙米、小麥、肝臟、瘦肉、蛋、豆類。
- 若真的吃不下，不要因擔心胎兒沒營養而強迫進食；依狀況調整。
- 孕吐症狀若已影響日常生活或出現持續嚴重嘔吐，應就醫。

Evidence：
《孕媽咪衛教手冊》p.10。

---

## C02｜孕期咖啡因

```yaml
record_id: MED-NUTRITION-CAFFEINE-001
category: pregnancy_food_limit
title: 孕期咖啡因
pregnancy_stage: ALL
```

內容：
- 手冊表示目前相關研究未能明確證實咖啡因是否增加孕期風險，但專家仍建議孕婦每日咖啡因攝取 **不超過 200–300 mg**。
- 咖啡因不只存在咖啡，也存在茶、可樂、巧克力及部分提神飲料。
- 前台不得把「一天一杯」當成固定安全劑量，因不同飲品咖啡因濃度不同；應以每日總咖啡因量表達。

Evidence：
《孕媽咪衛教手冊》p.10。

---

## C03｜孕期酒精

```yaml
record_id: MED-NUTRITION-ALCOHOL-001
category: pregnancy_food_avoidance
title: 懷孕期間避免飲酒
pregnancy_stage: ALL
severity: avoid
```

內容：
- 葡萄酒、啤酒、調酒等只要含酒精皆有風險。
- 孕婦飲酒會增加胎兒酒精症候群風險，可能造成生長遲緩、智能障礙等。
- **懷孕期間應避免飲酒。**
- 不得提供「安全酒量」或「少量可飲」建議。

Evidence：
《孕媽咪衛教手冊》p.13。

---

## C04｜魚類、DHA 與甲基汞

```yaml
record_id: MED-NUTRITION-FISH-MERCURY-001
category: pregnancy_food_safety
title: 孕期魚類怎麼吃
pregnancy_stage: ALL
```

內容：
- 魚類富含 ω-3 與優質蛋白質，建議不同種類輪替。
- 每週食用 1–2 份富含油脂的海魚，有助達到每日平均至少 200 mg DHA。
- 手冊另列每週宜均衡攝取 **7–9 份（245–315 g）各種魚類**。
- 避免大型深海魚：**豆腐鯊、旗魚、大型鮪魚、油魚**，以降低汞暴露。
- 不得將「魚類有汞」簡化成孕婦不吃魚。

Evidence：
《孕媽咪衛教手冊》p.25。

---

## C05｜生食、生飲與食品交叉污染

```yaml
record_id: MED-NUTRITION-FOODBORNE-INFECTION-001
category: pregnancy_food_safety
title: 避免生飲生食與食品交叉污染
pregnancy_stage: ALL
```

內容：
- 避免生飲生食。
- 生熟食分開處理及保存，避免共用砧板。
- 蔬果洗淨、食物充分煮熟。
- 手冊針對李斯特菌與弓形蟲感染提出孕期食品安全提醒。
- 生食肉品、蔬菜、海鮮習慣者，或處理生鮮肉品／養寵物者，建議諮詢婦產科醫師並注意感染預防。
- 不得自行擴充手冊未列出的禁食清單。

Evidence：
《孕媽咪健康手冊》p.46–49 李斯特菌症＆弓形蟲感染症。

---

## C06｜鈉、加工食品與水腫

```yaml
record_id: MED-NUTRITION-SODIUM-PROCESSED-FOOD-001
category: pregnancy_diet_management
title: 鈉與加工食品攝取
pregnancy_stage: T2_T3
```

內容：
- 孕期水分較容易滯留，鹽分不要過量。
- 可減少沾醬、少喝湯。
- 減少火腿、貢丸、香腸、牛肉乾等加工食品。
- 水腫若持續惡化，可能有其他妊娠併發症，應就醫診療。
- 不得把限制鹽分描述成治療妊娠高血壓的方法。

Evidence：
《孕媽咪衛教手冊》p.39；《孕媽咪健康手冊》高血壓衛教作補充。

---

# PART D｜特殊情境（1 筆）

## D01｜雙胞胎／多胞胎營養

```yaml
record_id: MED-NUTRITION-MULTIFETAL-001
category: special_pregnancy_nutrition
title: 雙胞胎／多胞胎的營養需求
pregnancy_stage: ALL
```

內容：
- 多胞胎孕期的熱量與營養需求較複雜。
- **不能把單胞胎建議直接乘 2 或乘 3。**
- 具體熱量與營養素需求應與專業人員及醫師討論。
- 本 KB 不自行提供多胞胎個人化熱量公式。

Evidence：
《孕媽咪衛教手冊》p.22。

---

# PART E｜Batch 04 預期總數

- Stage Nutrition Overview：3
- Core Nutrients / Dietary Basics：9
- Diet Behaviour & Food Safety：6
- Special Nutrition Situation：1

## Total = 19 Candidate Records

全部：
```json
{
  "review_status": "needs_review",
  "human_reviewed": false
}
```

---

# PART F｜重要 Safety / AI Rules

1. `supplement` 不等於「所有孕婦自行購買補充品」。
2. 手冊提到需補充／飲食不足時，若同時寫有「依醫師處方／諮詢醫師」，必須保留。
3. 鐵：
   - 初／中期 15 mg/day
   - 後期 45 mg/day
   - 不得混成一個全孕期固定值。
4. 咖啡因：
   - 手冊值 = 200–300 mg/day 上限建議。
   - 不得用「杯數」取代總毫克。
5. 酒精：
   - 不得提供安全量。
   - 孕期避免飲酒。
6. 魚：
   - 不得一概標記孕婦禁吃魚。
   - 必須保留「多樣輪替」與特定大型深海魚避免資訊。
7. 水分 2,000 cc/day 為一般衛教，不得覆蓋個人疾病或醫囑的液體限制。
8. 多胞胎不得直接按倍數推算營養需求。
9. 素食孕婦的 B12、蛋白質等需保留飲食型態提醒，不得自行產生個人化處方。
10. Batch 04 未來給 AI 使用時，只能做一般營養衛教，不能診斷營養缺乏或自行開補充劑劑量。

---

# PART G｜Discrepancy Rules

若專案三本官方手冊出現數值差異：

- 不要自行選擇平均值。
- 不要自行判斷新版一定覆蓋所有舊版內容。
- 以 115 年手冊為主要來源，但如相同欄位文字明顯衝突，建立 `DISCREPANCY`。

特別檢查：
- 鐵
- 維生素 D
- 鈣
- 咖啡因
- 蛋白質
- 魚類份量

---

# PART H｜Medical KB Review Dashboard

新增 Read-only Review Mode：

# 「孕期營養・飲食安全」

建議分成：

### 🍚 三階段營養
T1 / T2 / T3

### 🧬 關鍵營養素
蛋白質、葉酸、鐵、碘、B12、鈣、DHA、維生素 D、纖維／水分

### ☕ 飲食限制與生活
孕吐飲食、咖啡因、酒精、鈉／加工食品

### 🐟 食品安全
魚類／甲基汞、生食／感染預防

### 👶 特殊情境
雙／多胞胎

每張卡至少顯示：
- Title
- Pregnancy Stage
- Daily Reference Value（若有）
- Purpose
- Food Sources
- Recommendations
- Avoid / Limit
- Special Notes
- Evidence
- Review Status
- Human Reviewed

Dashboard 本輪維持 Read Only。

---

# PART I｜Frontend Consumer Context

Batch 04 未來主要服務：

1. `我的孕期 → 本週營養提醒`
2. `AI孕期助理 → 飲食／營養問答`
3. `神隊友視角 → 飲食支持建議`
4. `每日提醒 → 今日營養小建議`
5. `孕期健康地圖 → 特定階段營養提醒`

本輪：
**禁止修改正式網站 HTML / CSS / JS / Components。**

---

# PART J｜Integrity Guardrails

禁止修改：
- Batch 01 approved Records
- Batch 02 approved Records
- Batch 03 approved Records
- Weekly Fetal Growth approved Records
- Existing SOURCE GAP history
- Production Website

允許：
- 新增 19 筆 Batch 04 Candidate Records
- Dashboard Read-only Review UI
- data.js / Dashboard 同步
- 必要 source_refs mapping（優先重用既有官方手冊 Source Registry）

---

# PART K｜Final Integrity Check（Candidate Build 完成後自動執行）

請自動確認：

```text
Stage Overview: 3/3
Core Nutrients: 9/9
Diet Behaviour & Food Safety: 6/6
Special Situation: 1/1
Total: 19/19
```

並驗證：

- T1 calorie = +0 kcal
- T2 calorie = +300 kcal
- T3 calorie = +300 kcal
- protein increment = +10 g
- folate = 600 μg/day
- iodine = 225 μg/day
- B12 = 2.6 μg/day
- calcium = 1000 mg/day
- DHA = 200 mg/day
- vitamin D = 10 μg/day / 400 IU
- iron early/mid = 15 mg/day
- iron late = 45 mg/day
- caffeine = max 200–300 mg/day according to source wording
- alcohol = avoid during pregnancy
- raw/undercooked food safety warning exists
- fish/mercury guidance exists
- multifetal nutrition is NOT simple multiplication

如任何一項與本檔不一致：

`FAIL`

不要自行修正，列出 Record ID。

---

# PART L｜Final Report

完成後只回報：

```text
BATCH 04

Stage Nutrition Records: X / 3
Core Nutrient Records: X / 9
Diet Behaviour & Food Safety Records: X / 6
Special Nutrition Records: X / 1

Total Records: X / 19
Needs Review: X
Human Reviewed False: X

Discrepancies: X
Source Gaps: X

EVIDENCE
Pregnancy Education Handbook 2026: USED / NOT USED
Pregnancy Health Handbook 2026: USED / NOT USED
Father Handbook 2025: USED / NOT USED
External Web: YES / NO

INTEGRITY
Nutrient Value Validation: PASS / FAIL
Food Safety Validation: PASS / FAIL
Previous Approved Records Modified: YES / NO
Batch 03 Modified: YES / NO
Production Website Modified: YES / NO

DASHBOARD
孕期營養・飲食安全 Review Mode: READY / NOT READY

FINAL
BATCH 04 CANDIDATE BUILD: COMPLETED / BLOCKED
READY FOR HUMAN REVIEW: YES / NO
```

完成後停止：
- 不得自行 approved
- 不得開始 Batch 05
- 不得修改正式網站
