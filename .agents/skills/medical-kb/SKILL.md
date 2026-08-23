---
name: medical-kb
description: Controlled medical knowledge workflow for 孕育之美 pregnancy, fetal growth, prenatal care, nutrition, exercise, symptoms, warning signs, labor, postpartum, mental health, partner support, and Taiwan maternal-health policy.
---
# Medical KB
先讀 knowledge/medical/README.md 與 sources.json；先找 approved records。
不得用模型記憶當醫療證據。
缺資料建立 SOURCE_GAP；只有依 30-source-gap-web-research.md 才可受控網路研究。
網路結果是 candidate，不得自動 approved。
Production 只吃 approved records，並保留引用 metadata。
