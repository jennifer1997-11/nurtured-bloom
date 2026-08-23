# 孕育之美 Medical KB｜Batch 02B + 02C 整合執行指令

> 用途：直接交付 Antigravity 建立 Batch 02B（產前篩檢／診斷／選擇性檢查）與 Batch 02C（孕期疫苗／免疫）Candidate Records。
>
> 執行原則：本輪只建立 Medical KB Candidate 與 Review Dashboard 視覺化；不得自行核准，不得修改 Batch 02A，不得修改既有 approved Records，不得修改正式網站。

---

## 0｜任務背景與目標

Batch 02A「14 次孕婦產前檢查」Candidate Build 已完成。

現在補充兩類對孕媽咪具有重要決策價值、但不應混入 14 次例行產檢的資料：

1. **Batch 02B｜產前篩檢、遺傳診斷與選擇性檢查**
2. **Batch 02C｜孕期疫苗與免疫建議**

這些 Records 未來主要提供正式網站：

`我的孕期 → 產檢地圖／孕期健康地圖`

但本輪 **禁止修改正式網站**。

資料流程：

```text
Official Evidence
      ↓
Batch 02B / 02C Candidate Records
      ↓
needs_review
      ↓
Medical KB Review Dashboard
      ↓
Human Review
      ↓
approved（後續另行授權）
      ↓
Frontend Data Mapping（後續階段）
```

---

# PART A｜Batch 02B：產前篩檢、診斷與選擇性檢查

## 1｜建立 8 筆 Candidate Records

請建立以下 8 筆獨立 Medical Records，不得塞入 `MED-PRENATAL-VISIT-01 ~ 14`。

### 02B-01｜懷孕初期唐氏症篩檢

```yaml
record_id: MED-PRENATAL-OPTIONAL-01
title: 懷孕初期唐氏症篩檢
recommended_window: 11-14 weeks
category: prenatal_screening
screening_or_diagnostic: screening
invasive: false
funding_type: varies
```

內容：
- 目的：評估胎兒唐氏症染色體異常風險。
- 方法：依國健署手冊，可包含超音波評估胎兒頸部透明帶／鼻樑骨及母體抽血血清標誌分析。
- 重要限制：屬於 **screening，不是 diagnosis**。
- 高風險結果應依醫療專業評估是否接受進一步診斷性檢查。

Primary Evidence：
- 《孕媽咪健康手冊（115年6月出版）》「孕期產檢項目建議指南」。

---

### 02B-02｜非侵入性胎兒染色體檢測（NIPT）

```yaml
record_id: MED-PRENATAL-OPTIONAL-02
title: 非侵入性胎兒染色體檢測（NIPT）
recommended_window: 10 weeks or later
category: genetic_screening
screening_or_diagnostic: screening
invasive: false
funding_type: self_paid_or_varies
```

內容：
- 目的：透過孕婦血液中的游離胎兒 DNA 評估胎兒染色體異常風險。
- NIPT 是 **Screening，不是 Diagnostic Test**。
- 不得描述成確診染色體異常。
- 不得描述成可取代羊膜穿刺／其他診斷性檢查。
- 不得描述成正常結果即可排除所有染色體或遺傳疾病。
- 高風險結果應與婦產科醫師討論後續診斷性檢查。

Primary Evidence：
- 《孕媽咪健康手冊（115年6月出版）》「孕期產檢項目建議指南」。

Supporting Evidence：
- 衛生福利部國民健康署 NIPT 官方衛教資料。

---

### 02B-03｜第一孕期子癲前症篩檢

```yaml
record_id: MED-PRENATAL-OPTIONAL-03
title: 第一孕期子癲前症篩檢
recommended_window: approximately 11-14 weeks
category: maternal_risk_screening
screening_or_diagnostic: screening
invasive: false
funding_type: self_paid_or_local_subsidy
```

內容：
- 目的：評估孕婦後續發生子癲前症的風險。
- 評估方式可能依院所／醫師而異，可包含病史、血壓、子宮動脈血流與母血生物標記等。
- 這是孕婦妊娠併發症風險篩檢，不是胎兒染色體檢查。
- Funding 可能依縣市、院所或政策不同，不得標示為全國統一公費。

Evidence：
- 使用已登記之台灣官方／公立醫療機構來源；若目前專案無足夠可追溯 Evidence，建立 `SOURCE_GAP_LOCAL`，不得自行補寫未有來源支持的細節。

---

### 02B-04｜脊髓性肌肉萎縮症（SMA）帶因者基因篩檢

```yaml
record_id: MED-PRENATAL-OPTIONAL-04
title: 脊髓性肌肉萎縮症（SMA）帶因者基因篩檢
recommended_window: preconception_or_pregnancy
category: carrier_screening
screening_or_diagnostic: screening
invasive: false
funding_type: self_paid_or_varies
```

內容：
- 目的：了解準父母／孕婦是否為 SMA 相關基因帶因者，以協助評估胎兒遺傳風險。
- 這是 **carrier screening**。
- 不得與「新生兒 SMA 篩檢」混為同一檢查。

Evidence：
- 使用已登記之台灣官方／公立大型醫學中心遺傳醫學來源；若不足，建立 `SOURCE_GAP_LOCAL`。

---

### 02B-05｜X 染色體脆折症（Fragile X Syndrome）基因篩檢

```yaml
record_id: MED-PRENATAL-OPTIONAL-05
title: X染色體脆折症基因篩檢
recommended_window: preconception_or_pregnancy
category: carrier_screening
screening_or_diagnostic: screening
invasive: false
funding_type: self_paid_or_varies
```

內容：
- 目的：評估孕婦是否具有 FMR1 相關基因變異／帶因風險。
- 適用族群與是否檢測應依專業醫療評估及 Evidence 表達。
- 不得自行擴大為所有孕婦「必須做」。

Evidence：
- 使用已登記之台灣官方／公立大型醫學中心基因醫學來源；若不足，建立 `SOURCE_GAP_LOCAL`。

---

### 02B-06｜懷孕中期唐氏症篩檢

```yaml
record_id: MED-PRENATAL-OPTIONAL-06
title: 懷孕中期唐氏症篩檢
recommended_window: 15-20 weeks
category: prenatal_screening
screening_or_diagnostic: screening
invasive: false
funding_type: varies
```

內容：
- 目的：評估胎兒唐氏症染色體異常風險。
- 國健署手冊說明，未能及時於懷孕初期接受篩檢者，可考慮中期母血唐氏症篩檢。
- 屬於 **screening，不是確診**。

Primary Evidence：
- 《孕媽咪健康手冊（115年6月出版）》「孕期產檢項目建議指南」。

---

### 02B-07｜羊膜穿刺／產前遺傳診斷

```yaml
record_id: MED-PRENATAL-OPTIONAL-07
title: 羊膜穿刺／產前遺傳診斷
recommended_window: 16-18 weeks
category: genetic_diagnostic
screening_or_diagnostic: diagnostic
invasive: true
funding_type: conditionally_subsidized
policy_sensitive: true
```

內容：
- 透過超音波引導抽取羊水，進行產前遺傳診斷相關檢驗。
- 可用於胎兒染色體相關異常之進一步診斷。
- 必須清楚區分：
  - `NIPT = screening`
  - `羊膜穿刺相關產前遺傳診斷 = diagnostic`
- 不得將羊膜穿刺描述成一般例行篩檢。

補助資訊：
- 依台灣國民健康署現行產前遺傳診斷補助政策記錄。
- 目前整理基準：自 2026-07-01 起，符合資格者每胎 1 次，檢驗費最高減免 NT$7,000；實際資格與補助額應以國健署當期規定為準。
- 不得寫成「所有孕婦羊膜穿刺都有政府補助」。

Primary Evidence：
- 《孕媽咪健康手冊（115年6月出版）》。

Supporting Evidence：
- 衛生福利部國民健康署「產前遺傳診斷」現行政策頁。

---

### 02B-08｜高層次超音波

```yaml
record_id: MED-PRENATAL-OPTIONAL-08
title: 高層次超音波
recommended_window: approximately 20-24 weeks
category: optional_imaging
screening_or_diagnostic: screening_imaging
invasive: false
funding_type: generally_self_paid_or_varies
```

內容：
- 由專業醫師較詳細、系統性評估胎兒器官與身體構造。
- 可依 Evidence 表達檢查範圍，例如腦部、頭頸、心臟、胸腹部、脊椎、四肢、臍帶與胎盤等。
- 必須清楚區分：`一般產檢超音波 ≠ 高層次超音波`。
- 主要目的為較詳細評估胎兒構造與偵測可能的先天構造異常。
- 不得描述成每位孕婦都一定需要。
- 不得描述成可以發現所有胎兒異常、保證胎兒正常或確診所有染色體疾病。

Primary Evidence：
- 《孕媽咪健康手冊（115年6月出版）》
- 《孕媽咪衛教手冊（115年6月出版）》

---

## 2｜02B 資料治理規則

- Screening ≠ Diagnosis。
- 醫療檢查性質與付款方式分開記錄。
- `funding_type` 可使用：`publicly_funded`、`conditionally_subsidized`、`self_paid`、`self_paid_or_varies`、`varies`、`unclear`。
- 週數必須保留原始 Evidence 的區間，不得縮成單一孕週。
- 不得因 Prototype UI 已出現某項目，就把 UI 當 Evidence。
- 若 Evidence 不足，建立 `SOURCE_GAP_LOCAL`，不要自行猜測。

---

# PART B｜Batch 02C：孕期疫苗與免疫建議

## 3｜建立 5 筆 Candidate Records

疫苗必須使用獨立類別，不得混入 prenatal screening 或 14 次 prenatal visit Records。

### 02C-01｜Tdap（減量破傷風白喉非細胞性百日咳混合疫苗）

```yaml
record_id: MED-PREG-VACCINE-01
title: Tdap 孕期接種
category: pregnancy_vaccination
preferred_window: 27-36 weeks
recommendation: one dose during each pregnancy
funding_type: self_paid_or_current_policy
policy_sensitive: true
```

內容：
- 依台灣疾管署現行建議，每次懷孕接種 1 劑。
- 27–36 週為使母體抗體傳遞給嬰兒效益較佳的接種期間。
- 目的包含降低新生兒／小嬰兒百日咳相關風險。
- Funding 必須依當期台灣政策記錄，不得自行假定公費。

Primary Evidence：Taiwan CDC 官方資料。

---

### 02C-02｜孕婦 RSV 疫苗

```yaml
record_id: MED-PREG-VACCINE-02
title: 孕婦 RSV 疫苗
category: pregnancy_vaccination
recommended_window: 28-36 weeks
recommendation: assess_with_clinician
funding_type: self_paid_or_current_policy
policy_sensitive: true
```

內容：
- 依台灣疾管署現行資訊，孕婦可於適用孕週經醫師評估後接種。
- 目的之一為透過母體抗體提供嬰兒出生後早期 RSV 被動免疫保護。
- 不得將接種描述為所有孕婦強制必須接受。
- Funding 與適應症屬可能更新資訊，必須標記 `policy_sensitive: true`。

Primary Evidence：Taiwan CDC 官方 RSV 疫苗資料。

---

### 02C-03｜季節性流感疫苗

```yaml
record_id: MED-PREG-VACCINE-03
title: 孕期季節性流感疫苗
category: pregnancy_vaccination
timing: seasonal_and_current_policy
funding_type: current_policy
policy_sensitive: true
```

內容：
- 孕婦為流感疫苗重要建議接種族群之一。
- 不應硬綁固定孕週。
- 前台未來應依「當年度流感疫苗政策＋季節」呈現，而不是固定顯示在單一 Week Node。
- Funding 與疫苗株／接種政策以台灣疾管署當年度公告為準。

Primary Evidence：Taiwan CDC 當年度流感疫苗官方資料。

---

### 02C-04｜COVID-19 疫苗

```yaml
record_id: MED-PREG-VACCINE-04
title: 孕期 COVID-19 疫苗
category: pregnancy_vaccination
timing: any_trimester_based_on_current_guidance
funding_type: current_policy
policy_sensitive: true
```

內容：
- 依台灣疾管署現行指引，孕婦可依個人狀況、風險效益及醫療專業建議評估接種。
- 不得硬綁固定孕週。
- 疫苗種類、劑次與公費資格等易隨政策更新，必須依當期官方資訊，不得寫死為永久規則。

Primary Evidence：Taiwan CDC 官方 COVID-19 疫苗資料。

---

### 02C-05｜MMR／德國麻疹免疫提醒

```yaml
record_id: MED-PREG-VACCINE-05
title: MMR／德國麻疹免疫提醒
category: pregnancy_vaccine_contraindication
during_pregnancy: do_not_vaccinate
policy_sensitive: true
```

內容：
- MMR 為活性減毒疫苗，**懷孕期間不可接種**。
- 若德國麻疹抗體陰性，依官方指引於孕前或產後評估接種。
- 接種 MMR 後之避孕／避免懷孕期間，依台灣疾管署現行官方指引記錄。
- 不得在前台將 MMR 顯示為「孕期建議接種疫苗」。

Primary Evidence：Taiwan CDC 官方 MMR／德國麻疹資料。

---

## 4｜02C 資料治理規則

- 疫苗 Records 與產檢／產前篩檢分開。
- Tdap、RSV、流感、COVID-19 等政策可能變動者標記 `policy_sensitive: true`。
- 不得把自費或政策依條件提供的疫苗自行標成公費。
- 不得自行增加本清單以外的疫苗。
- MMR 必須呈現為孕期禁忌／免疫提醒，不是孕期接種建議。

---

# PART C｜Evidence 與 Source Registry

## 5｜來源使用原則

優先使用／登記：

### Local handbook sources
1. 《孕媽咪健康手冊（115年6月出版）》— 衛生福利部國民健康署
2. 《孕媽咪衛教手冊（115年6月出版）》— 衛生福利部國民健康署
3. 《爸爸孕產育兒衛教手冊（114年9月）》— 僅作輔助佐證

### Taiwan official web sources
4. 衛生福利部國民健康署（HPA）官方網站
5. 衛生福利部疾病管制署（Taiwan CDC）官方網站
6. 必要時之台灣公立／大型醫學中心官方衛教資料，只能用於官方手冊未完整涵蓋的 02B-03／04／05 等項目。

若使用外部官方網頁：
- 必須建立可追溯 `source_ref`。
- 記錄 source_id、publisher、title、URL、accessed_at。
- 不得使用一般商業孕婦網站、Blog、論壇或搜尋摘要作 Medical Evidence。

若現有專案沒有足夠來源支持某欄位：
- 建立 `SOURCE_GAP_LOCAL`。
- 不得自行推論補值。

---

# PART D｜Review Status 與 Integrity

## 6｜所有新 Records 狀態

Batch 02B 共 8 筆 + Batch 02C 共 5 筆 = **13 筆 Candidate Records**。

全部設定：

```json
{
  "review_status": "needs_review",
  "human_reviewed": false
}
```

本輪禁止自行 approved。

---

## 7｜禁止修改範圍

禁止修改：

- 既有 49 筆 approved Medical Records
- Batch 02A 的 14 筆 `MED-PRENATAL-VISIT-01 ~ 14`
- Weekly Fetal Growth approved Records
- 已 resolved SOURCE GAP 歷史資料
- 正式網站 HTML / CSS / JS / Components
- 正式「我的孕期 → 產檢地圖」Prototype
- Batch 03

本輪允許修改：

- 新增 Batch 02B / 02C Candidate Records
- 必要的官方 Source Registry
- Medical KB Review Dashboard 的 Read-only Review UI
- Dashboard 同步資料

---

# PART E｜Medical KB Review Dashboard

## 8｜新增視覺化 Review Mode

在現有 Medical KB Review Dashboard 新增一個整合頁：

# 「產前篩檢・選擇性檢查・孕期疫苗」

請以孕期時間軸＋分類標籤呈現。

分類：

- 🧬 產前篩檢／遺傳檢查
- 🔎 選擇性影像／其他檢查
- 💉 疫苗／免疫
- ⚠️ 孕期禁忌／重要提醒

時間軸可視覺化例如：

```text
孕前／孕期
  ├─ SMA 帶因者篩檢
  └─ Fragile X 篩檢

10週+
  └─ NIPT

11–14週
  ├─ 初期唐氏症篩檢
  └─ 第一孕期子癲前症篩檢

15–20週
  └─ 中期唐氏症篩檢

16–18週
  └─ 羊膜穿刺／產前遺傳診斷

約20–24週
  └─ 高層次超音波

27–36週
  └─ Tdap

28–36週
  └─ RSV

依季節／政策
  ├─ 流感疫苗
  └─ COVID-19 疫苗

孕期禁忌
  └─ MMR 不可於懷孕期間接種
```

SMA、Fragile X、流感、COVID-19 等沒有單一固定週數者，不得為了 UI 硬塞到某個 Week Node。

---

## 9｜點擊卡片顯示資訊

每張 Review Card 至少顯示：

- 檢查／疫苗名稱
- Category
- Recommended Window / Timing
- Purpose
- Screening / Diagnostic
- Invasive / Non-invasive（適用時）
- Funding Type
- Suitable Population（Evidence 有支持時）
- Important Limitations
- Policy Sensitive（適用時）
- Evidence / Source
- Review Status
- Human Reviewed

`null` 或無 Evidence 的欄位顯示「無資料／待確認」，不要自行隱藏或補值。

Review Dashboard 本輪維持 **Read Only**，不要新增一鍵 Approved 按鈕。

---

# PART F｜Frontend Consumer Context

## 10｜未來「我的孕期」資料模型

未來正式網站可將以下 Medical KB 資料疊加：

```text
Routine Prenatal Visit (Batch 02A)
+
Screening / Diagnostic / Optional Test (Batch 02B)
+
Pregnancy Vaccination / Immunity (Batch 02C)
```

例如 Week 28 未來可呈現：

```text
🏥 例行產檢
第6次產檢

🧪 本階段檢查
妊娠糖尿病篩檢
貧血檢驗

💉 疫苗提醒
Tdap：27–36週
RSV：28–36週
```

但本輪不得執行正式網站 Data Mapping。

Prototype UI 不是 Evidence Source；若 Prototype 與 Medical KB 不一致，未來應以 approved Medical KB 為準。

---

# PART G｜完成條件

## 11｜完成後執行 Dashboard 同步

執行既有 `sync-data.py` 或專案現行同步流程。

預期：

- Batch 02B Candidate Records = 8
- Batch 02C Candidate Records = 5
- New Candidate Records Total = 13
- New needs_review = 13
- New human_reviewed=false = 13
- Existing approved Records = 維持 49
- Batch 02A = 維持 14 needs_review，不修改

若因 Evidence 不足建立 Source Gap，請另外回報，不得阻止其餘有充分 Evidence 的 Records 建立。

---

## 12｜Final Integrity Check

確認：

1. 02B Records = 8
2. 02C Records = 5
3. New Candidate Records = 13
4. New Records `needs_review` = 13
5. New Records `human_reviewed=false` = 13
6. Existing 49 approved Records 未修改
7. Batch 02A 14 Records 未修改
8. Screening 與 Diagnostic 分類未混淆
9. 一般超音波與高層次超音波未混淆
10. 疫苗與產前檢查未混為同一 category
11. MMR 正確標示為孕期不可接種
12. Policy-sensitive 項目已標記
13. Production Website 未修改
14. Batch 03 未開始

---

# PART H｜完成後回報格式

請只提供簡潔結案報告：

## Batch 02B
- Records created:
- Needs review:
- Source gaps:
- Discrepancies:

### Coverage
- 初期唐氏症：READY / GAP
- NIPT：READY / GAP
- 第一孕期子癲前症：READY / GAP
- SMA：READY / GAP
- Fragile X：READY / GAP
- 中期唐氏症：READY / GAP
- 羊膜穿刺：READY / GAP
- 高層次超音波：READY / GAP

## Batch 02C
- Records created:
- Needs review:
- Source gaps:
- Discrepancies:

### Coverage
- Tdap：READY / GAP
- RSV：READY / GAP
- 流感疫苗：READY / GAP
- COVID-19 疫苗：READY / GAP
- MMR／德國麻疹免疫提醒：READY / GAP

## Dashboard
- Integrated Review Mode：READY / NOT READY
- 13 Records visible：YES / NO

## Integrity
- Existing Approved Records Modified：YES / NO
- Batch 02A Modified：YES / NO
- Production Website Modified：YES / NO
- Batch 03 Started：YES / NO

## Final Status

`BATCH 02B + 02C CANDIDATE BUILD: COMPLETED / PARTIALLY BLOCKED / BLOCKED`

`READY FOR HUMAN REVIEW: YES / NO`

完成後停止。

**不得自行 Approved。不得開始正式網站 Mapping。不得開始 Batch 03。**
