# Antigravity Prompts v2

## 01 規則理解測試
請讀取 @產品規格書.md、@knowledge/medical/README.md、@knowledge/medical/sources.json、@.agents/rules/00-project-governance.md、@.agents/rules/10-medical-content.md、@.agents/rules/20-source-citation.md、@.agents/rules/30-source-gap-web-research.md。
不要修改檔案。
回答：Production 可用哪些狀態？PDF角色？三種 SOURCE_GAP 差異？可搜尋網域與順序？網路結果可否自行 approved？哪些台灣政策不得 WHO/ACOG 補？核准來源仍找不到怎麼辦？

## 02 PDF 匯入
執行 /medical-content-import。
只整理［指定主題］；只允許［指定 source_id］；不修改 HTML；不得自行 approved。

## 03 SOURCE_GAP 研究
執行 /source-gap-research。
主題：［填寫］。
嚴格依 sources.json 白名單；先台灣官方，不足且非台灣政策型才 WHO/ACOG；不得使用搜尋摘要或非白名單；建立 candidate + web snapshot，不得 approved。

## 04 人工核准
我已人工核對：［record 路徑］。
請只把 review_status 改 approved，evidence.human_reviewed 改 true；不得修改 content、source_refs、數值、週數或其他欄位。

## 05 實作
執行 /implement-feature。
本次只實作：［功能］。只能使用 approved records。資料不足回報 SOURCE_GAP，不自行補內容。
