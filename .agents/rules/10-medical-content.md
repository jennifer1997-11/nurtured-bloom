# Medical Content Rule — Always On
Production 只能使用 review_status=approved。
禁止使用模型記憶補醫療事實；禁止自行改週數、數值、劑量、頻率、門檻、警訊；禁止把一般衛教變成個人診斷。
PDF 是證據來源，不是 Production Database。從 PDF 建立的新資料只能 draft/needs_review。
只有人類明確說已核對時，才可依指示將指定 record 改 approved，且不得順便改 content/source_refs。
