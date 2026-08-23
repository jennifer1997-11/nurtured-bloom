# Medical Knowledge Base Policy v2

## Production
正式網站與 AI 助理只能使用 `records/` 中 `review_status=approved` 的資料。
PDF、網頁快照、draft、candidate、needs_review 都不是 Production Database。

## 來源優先級
Priority 1 台灣官方：國健署手冊、hpa.gov.tw、mammy.hpa.gov.tw、mohw.gov.tw。
Priority 2 國際核准來源：who.int、acog.org；僅在台灣官方不足且不是台灣政策型主題時使用。

## 台灣政策型資料
公費產檢、健保/補助、台灣疫苗政策、台灣行政規定、台灣醫療服務資源，只能使用台灣官方來源。

## SOURCE_GAP
- SOURCE_GAP_LOCAL：本地 approved records 不足，先查本地核准 PDF / 台灣官方網站。
- SOURCE_GAP_APPROVED：台灣官方仍不足；非台灣政策型主題才可查 WHO/ACOG。
- SOURCE_NOT_FOUND：所有核准來源仍無法支持。停止，不得用模型知識補答。

## 狀態
draft → candidate → needs_review → approved → deprecated。
AI 不得自行 approved；只有人類明確表示已核對時才可變更狀態。

## PDF
PDF 是 Source of Evidence，不是 Production Database。抽取時保留 source_id、page、section；表格、週數、數字、門檻、警訊需人工核對。

## 網路研究
必須保存 page_title、URL、publisher、accessed_at、jurisdiction、source_priority，並建立 web snapshot。網路找到的內容一律 candidate/needs_review。

## 衝突
不自行合併或裁決；填 conflict_note，設 needs_review，交人工判斷。

## 引用
正式 UI 至少顯示來源機關、文件/網站名稱、版本或更新日期、原始來源入口（適用時）。
不得暗示孕育之美受到來源機關背書或認證。
