# Medical KB Review Dashboard (Developer & Human Review Tool)

專供產品負責人（PO）與醫學審核者視覺化檢閱 Medical Knowledge Base 的內部開發工具。

## 特點
- **100% 唯讀安全模式 (READ ONLY)**：不提供任何在線修改醫療資料按鈕，防止誤更動。
- **直連 Medical KB**：直接以 `knowledge/medical/` 的 JSON 為唯一資料來源。
- **雙模式檢閱**：
  1. **Record Cards 模式**：多維度篩選（孕期階段、主題類別、審核狀態、全文搜尋）與折疊式 JSON。
  2. **Pregnancy Stage 模式**：孕期三階段（初期、中期、後期）流暢閱讀體驗（媽咪變化 → 寶寶發展 Timeline → 建議產檢時程 → Source Gaps）。
- **Source Gap 追蹤**：顯著標記 `SOURCE_GAP_LOCAL`，嚴禁 AI 模型推測補答。
- **官方手冊來源名錄**：對應 `sources.json` 之各項核准手冊與官方網域。

## 如何開啟
1. **直接於瀏覽器開啟**：
   雙擊或以瀏覽器開啟 `tools/medical-kb-review/index.html` 即可直接使用。
2. **透過 Local Server 開啟**：
   ```bash
   python -m http.server 8000
   ```
   瀏覽網址：`http://localhost:8000/tools/medical-kb-review/index.html`

## 當知識庫有新增 Record 時如何同步
當在 `knowledge/medical/records/` 或 `source-gaps/` 新增或修改檔案時，執行：
```bash
python tools/medical-kb-review/sync-data.py
```
即會自動同步更新至 Review Dashboard。
