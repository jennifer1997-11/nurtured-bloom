# Weekly Fetal Growth Reference v1.0

> 專案：孕育之美 Medical Knowledge Base
>
> 建議狀態：`candidate / needs_review`
>
> 用途：提供 Antigravity 建立孕期逐週胎兒成長資料。**不得由 AI 自行修改、推算或補齊數值。**

## 使用規則

- 孕週以最後一次月經第一天起算的 gestational age 表示。
- **身長與大小比喻：NHS Best Start in Life week-by-week guide。** NHS 從 Week 4 開始提供逐週胚胎／胎兒大小，因此 Week 1–3 保留 `N/A`。
- NHS 在早期主要使用 head-to-bottom；Week 20 明確說明自此改以 head-to-heel 測量，因此不可把 1–40 週全部標記為 CRL。
- **體重：WHO Fetal Growth Charts（sex-neutral estimated fetal weight，第 50 百分位）**。該 WHO 參考表自 Week 14–40 提供 EFW，因此 Week 1–13 保留 `N/A`，不自行推算。
- `estimated_weight_g` 是群體參考值，不代表個別孕婦腹中胎兒的實際體重。
- 水果／蔬菜只是 NHS 的視覺化大小比喻，應標記為 `editorial_visualization`，不可視為診斷或醫療測量。
- Production 前仍應由人工 reviewer 核准；本檔本身不等於 `approved`。

## 1–40 週資料表

| 孕週 | 身長 (cm) | 身長測量方式 | 體重參考值 (g) | 大小比喻 | 英文比喻 | Length/Analogy Source | Weight Source |
|---:|---:|---|---:|---|---|---|---|
| 1 | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 2 | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 3 | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 4 | 0.2 | embryo length | N/A | 罌粟籽 | poppy seed | NHS Week 4 | N/A |
| 5 | 0.2 | embryo length | N/A | 芝麻籽 | sesame seed | NHS Week 5 | N/A |
| 6 | 0.6 | embryo length | N/A | 豌豆 | pea | NHS Week 6 | N/A |
| 7 | 1 | head-to-bottom | N/A | 葡萄 | grape | NHS Week 7 | N/A |
| 8 | 1.6 | early fetal length | N/A | 覆盆莓 | raspberry | NHS Week 8 | N/A |
| 9 | 2.2 | head-to-bottom | N/A | 草莓 | strawberry | NHS Week 9 | N/A |
| 10 | 3 | head-to-bottom | N/A | 小杏桃 | small apricot | NHS Week 10 | N/A |
| 11 | 4.1 | head-to-bottom | N/A | 無花果 | fig | NHS Week 11 | N/A |
| 12 | 5.4 | head-to-bottom | N/A | 李子 | plum | NHS Week 12 | N/A |
| 13 | 7.4 | head-to-bottom | N/A | 桃子 | peach | NHS Week 13 | N/A |
| 14 | 8.5 | head-to-bottom | 90 | 奇異果 | kiwi fruit | NHS Week 14 | WHO EFW 50th percentile |
| 15 | 10.1 | head-to-bottom | 114 | 蘋果 | apple | NHS Week 15 | WHO EFW 50th percentile |
| 16 | 11.6 | head-to-bottom | 144 | 酪梨 | avocado | NHS Week 16 | WHO EFW 50th percentile |
| 17 | 12 | head-to-bottom | 179 | 石榴 | pomegranate | NHS Week 17 | WHO EFW 50th percentile |
| 18 | 14.2 | head-to-bottom | 222 | 甜椒 | bell pepper | NHS Week 18 | WHO EFW 50th percentile |
| 19 | 15.3 | head-to-bottom | 272 | 大型番茄 | beef tomato | NHS Week 19 | WHO EFW 50th percentile |
| 20 | 25.6 | head-to-heel | 330 | 香蕉 | banana | NHS Week 20 | WHO EFW 50th percentile |
| 21 | 26.7 | head-to-toe | 398 | 胡蘿蔔 | carrot | NHS Week 21 | WHO EFW 50th percentile |
| 22 | 27.8 | head-to-toe | 476 | 地瓜 | sweet potato | NHS Week 22 | WHO EFW 50th percentile |
| 23 | 28.9 | head-to-heel | 565 | 大芒果 | large mango | NHS Week 23 | WHO EFW 50th percentile |
| 24 | 30 | head-to-heel | 665 | 玉米 | corn on the cob | NHS Week 24 | WHO EFW 50th percentile |
| 25 | 34.6 | head-to-heel | 778 | 櫛瓜 | courgette | NHS Week 25 | WHO EFW 50th percentile |
| 26 | 35.6 | head-to-heel | 902 | 黃瓜 | cucumber | NHS Week 26 | WHO EFW 50th percentile |
| 27 | 36.6 | head-to-heel | 1039 | 花椰菜 | cauliflower | NHS Week 27 | WHO EFW 50th percentile |
| 28 | 37.6 | head-to-heel | 1189 | 茄子 | aubergine | NHS Week 28 | WHO EFW 50th percentile |
| 29 | 38.6 | head-to-heel | 1350 | 奶油南瓜 | butternut squash | NHS Week 29 | WHO EFW 50th percentile |
| 30 | 39.9 | head-to-heel | 1523 | 高麗菜 | cabbage | NHS Week 30 | WHO EFW 50th percentile |
| 31 | 41.1 | head-to-heel | 1707 | 椰子 | coconut | NHS Week 31 | WHO EFW 50th percentile |
| 32 | 42.4 | head-to-heel | 1901 | 芹菜 | bunch of celery | NHS Week 32 | WHO EFW 50th percentile |
| 33 | 43.7 | head-to-heel | 2103 | 鳳梨 | pineapple | NHS Week 33 | WHO EFW 50th percentile |
| 34 | 45 | head-to-heel | 2312 | 哈密瓜 | cantaloupe melon | NHS Week 34 | WHO EFW 50th percentile |
| 35 | 46.2 | head-to-heel | 2527 | 蜜瓜 | honeydew melon | NHS Week 35 | WHO EFW 50th percentile |
| 36 | 47.4 | head-to-heel | 2745 | 蘿蔓萵苣 | romaine lettuce | NHS Week 36 | WHO EFW 50th percentile |
| 37 | 48.6 | head-to-heel | 2966 | 韭蔥 | leek | NHS Week 37 | WHO EFW 50th percentile |
| 38 | 49.8 | head-to-heel | 3186 | 大黃莖 | rhubarb | NHS Week 38 | WHO EFW 50th percentile |
| 39 | 50.7 | head-to-heel | 3403 | 小西瓜 | small watermelon | NHS Week 39 | WHO EFW 50th percentile |
| 40 | 51.2 | head-to-heel | 3617 | 南瓜 | pumpkin | NHS Week 40 | WHO EFW 50th percentile |

## 欄位建議

```yaml
gestational_week: integer
length_cm: number | null
length_measurement_type: string | null
estimated_weight_g: integer | null
estimated_weight_reference: WHO_50TH_PERCENTILE | null
size_analogy_zh: string | null
size_analogy_en: string | null
analogy_type: editorial_visualization
medical_claim: false  # 僅指 analogy，不代表 length/weight
review_status: needs_review
human_reviewed: false
```

## Evidence / Provenance

### SRC-HPA-001｜台灣衛生福利部國民健康署

- 國健署孕產兒關懷服務指出「孕產兒關懷網站」提供孕產婦懷孕週期等專業知識與資訊。
- 專案既有《爸爸孕產育兒衛教手冊》也以孕初、中、後期與關鍵週數呈現胎兒變化，而非完整逐週身長／體重表。
- 用途：作為台灣官方來源脈絡與本 SOURCE GAP 的本地來源查核紀錄。

### SRC-NHS-001｜NHS Best Start in Life – Week-by-week guide to pregnancy

- Organization: UK National Health Service (NHS)
- Coverage used here: Week 4–40
- Data used: weekly embryo/fetal length and fruit/vegetable/object size analogy
- Important methodology note: Week 20 NHS explicitly changes measurement from head-to-bottom to head-to-heel.
- Main URL: https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/
- Individual week pattern: `.../1st-trimester/week-X/`, `.../2nd-trimester/week-X/`, `.../3rd-trimester/week-X/`
- Retrieved: 2026-08-20

### SRC-WHO-001｜WHO Fetal Growth Charts

- Publication: *The World Health Organization Fetal Growth Charts: A Multinational Longitudinal Study of Ultrasound Biometric Measurements and Estimated Fetal Weight*
- Journal: PLOS Medicine (2017)
- Data used here: sex-neutral Estimated Fetal Weight (EFW), 50th percentile, gestational weeks 14–40.
- Important: EFW is an ultrasound-derived population reference, not an actual measured fetal body weight.
- Article: https://pmc.ncbi.nlm.nih.gov/articles/PMC5261648/
- DOI: 10.1371/journal.pmed.1002220
- Retrieved: 2026-08-20

### SRC-ACOG-001｜ACOG – How Your Fetus Grows During Pregnancy

- Organization: American College of Obstetricians and Gynecologists (ACOG)
- Used as methodology cross-check.
- ACOG explains that crown–rump length is used during first-trimester ultrasound dating; before 7 weeks, crown and rump may not be separately visible and the greatest embryo length is measured.
- URL: https://www.acog.org/womens-health/faqs/how-your-fetus-grows-during-pregnancy
- Retrieved: 2026-08-20

## Antigravity Import Guardrails

Antigravity 應遵守：

1. 僅照本檔資料建立 Candidate Records。
2. `N/A` 必須轉為 `null`，不得自行估算。
3. 不得把所有 length 欄位重新命名為 CRL。
4. 不得把 WHO EFW 50th percentile 寫成「你的寶寶實際體重」。
5. analogy 必須保持 `medical_claim: false`。
6. 匯入後全部維持 `review_status: needs_review`、`human_reviewed: false`。
7. 不得因此修改既有 approved Records。
8. 不得自行關閉 SOURCE GAP；完成匯入與人工驗收後再決定是否 resolved。

## 前台建議文案

建議：`本週寶寶身長約 XX cm；一般胎兒發育體重參考約 XXX g，大小約像一顆／一根 XXX。`

免責短句：`身長與體重為一般孕週發育參考值，每個寶寶成長速度不同，實際生長情形請以產檢超音波及醫療人員評估為準。`

---

Version: 1.0
Prepared: 2026-08-20
Status: Candidate evidence package for human review