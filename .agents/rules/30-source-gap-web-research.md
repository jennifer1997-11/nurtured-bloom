# SOURCE_GAP Controlled Web Research — Always On

只有 approved local records 無法支持內容時啟動。

1. 建立 SOURCE_GAP_LOCAL。
2. 先查 approved Priority 1 網域：hpa.gov.tw、mammy.hpa.gov.tw、mohw.gov.tw。
3. 必須開啟原始官方頁面；搜尋摘要、AI overview 不是來源。
4. 找到資料後建立 web snapshot + candidate record，不得 approved。
5. 若台灣官方不足且不是台灣政策型主題，改 SOURCE_GAP_APPROVED，只可查 who.int、acog.org。
6. 台灣公費產檢、健保/補助、疫苗政策、行政規定、台灣服務資源不得由海外來源補足。
7. 禁止新聞、Blog、商業健康網站、Dcard/PTT/Threads/Facebook/Instagram/論壇及非白名單網域。
8. 來源衝突：不合併、不裁決，填 conflict_note → needs_review。
9. 所有核准來源仍無資料：SOURCE_NOT_FOUND，停止，不得用模型知識推測。
10. 網路研究結果永遠只能 candidate/needs_review，AI 不得自行 approved。
