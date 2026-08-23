#!/usr/bin/env python3
"""
Prenatal Checkup Map View Model Exporter v3
孕育之美 Production Medical Dataset → Prenatal Map View Model

Reads: data/medical/medical-kb.production.json
Outputs:
  - data/medical/prenatal-map.viewmodel.json
  - data/medical/prenatal-map.viewmodel.js
"""

import os
import json

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROD_DATASET_FILE = os.path.join(WORKSPACE_ROOT, "data", "medical", "medical-kb.production.json")
OUTPUT_JSON_FILE = os.path.join(WORKSPACE_ROOT, "data", "medical", "prenatal-map.viewmodel.json")
OUTPUT_JS_FILE = os.path.join(WORKSPACE_ROOT, "data", "medical", "prenatal-map.viewmodel.js")

def build_viewmodel_v3():
    with open(PROD_DATASET_FILE, "r", encoding="utf-8") as f:
        prod_data = json.load(f)

    records = prod_data["records"]

    routine_records = [r for r in records if r["id"].startswith("MED-PRENATAL-VISIT-")]
    optional_records = [r for r in records if r["id"].startswith("MED-PRENATAL-OPTIONAL-")]
    vaccine_records = [r for r in records if r["id"].startswith("MED-PREG-VACCINE-")]

    routine_records.sort(key=lambda x: int(x["id"].replace("MED-PRENATAL-VISIT-", "")))

    viewmodel_nodes = []

    for r in routine_records:
        rid = r["id"]
        c = r["content"]
        visit_num = int(rid.replace("MED-PRENATAL-VISIT-", ""))
        
        visit_weeks = [8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40]
        recommended_week = visit_weeks[visit_num - 1]

        # 1. Routine Items (Plain-language compressed)
        routine_items = []
        
        if visit_num == 1:
            routine_items = [
                "出血、腹痛、噁心嘔吐、排尿不適等症狀生理問診",
                "基本體理檢查（體重、血壓、乳房、子宮底高度測量）"
            ]
        elif visit_num == 2:
            routine_items = [
                "孕期生理適應與不適症狀問診",
                "例行體重、血壓測量"
            ]
        elif visit_num == 3:
            routine_items = [
                "懷孕中期生理變化與症狀問診",
                "例行體重、血壓、胎心音測量"
            ]
        elif visit_num == 4:
            routine_items = [
                "胎動感受與身體不適問診",
                "例行體重、血壓、胎心音、子宮底高度測量"
            ]
        elif visit_num == 5:
            routine_items = [
                "日常飲食、胎動與體重變化問診",
                "例行體重、血壓、胎心音、水腫與靜脈曲張檢查"
            ]
        elif visit_num == 6:
            routine_items = [
                "每日胎動自我監測紀錄與不適症狀問診",
                "例行體重、血壓、胎心音、水腫與靜脈曲張檢查"
            ]
        elif visit_num == 7:
            routine_items = [
                "胎動狀況與子宮收縮情形問診",
                "例行體重、血壓、胎心音、胎位觸診檢查"
            ]
        elif visit_num == 8:
            routine_items = [
                "胎動、宮縮與體重增加速度問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]
        elif visit_num == 9:
            routine_items = [
                "宮縮頻率、水腫與胎動狀況問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]
        elif visit_num == 10:
            routine_items = [
                "產兆觀察、宮縮頻率與胎動問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]
        elif visit_num == 11:
            routine_items = [
                "宮縮頻率、破水、落紅等三大產兆問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]
        elif visit_num == 12:
            routine_items = [
                "陣痛、破水、落紅狀況與胎動問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]
        elif visit_num == 13:
            routine_items = [
                "產兆發展與胎動紀錄問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]
        elif visit_num == 14:
            routine_items = [
                "預產期當週產兆狀況與胎動問診",
                "例行體重、血壓、胎心音、胎位檢查"
            ]

        # 2. Publicly Funded Items (Structured & Deterministic)
        publicly_funded_items = []

        if visit_num == 1: # 8w
            publicly_funded_items = [
                "第 1 次產前公費超音波檢查（建議執行區間：8~16週，評估胎兒心跳、胚胎數及預產期估算）"
            ]
        elif visit_num == 2: # 12w
            publicly_funded_items = [
                "血液常規檢查（白血球 WBC、紅血球 RBC、血小板 Plt、血球容積比 Hct、血色素 Hb、平均紅血球體積 MCV）",
                "ABO 血型及 Rh 因子檢驗",
                "德國麻疹抗體檢驗 (Rubella IgG)",
                "B 型肝炎血清標誌檢驗 (HBsAg, HBeAg)",
                "梅毒檢查 (VDRL / RPR)",
                "愛滋病毒篩檢 (Anti-HIV)",
                "尿液常規檢查（尿蛋白、尿糖）"
            ]
        elif visit_num == 3: # 16w
            publicly_funded_items = [
                "第 3 次公費產檢例行檢查（若16週前尚未完成第1次公費超音波，可於此時補做）"
            ]
        elif visit_num == 4: # 20w
            publicly_funded_items = [
                "第 2 次產前公費超音波檢查（建議區間：20週前後，詳細評估胎兒器官結構、胎位、羊水量及胎盤位置）"
            ]
        elif visit_num == 5: # 24w
            publicly_funded_items = [
                "妊娠糖尿病篩檢（75g 口服葡萄糖耐量試驗 OGTT，建議執行區間：24~28週，公費全額補助）",
                "貧血檢驗（血色素 Hb、血球容積比 Hct，建議執行區間：24~28週，公費全額補助）"
            ]
        elif visit_num == 6: # 28w
            publicly_funded_items = [
                "妊娠糖尿病篩檢（75g OGTT，若24週已完成無須重複施作）",
                "貧血檢驗（Hb / Hct，若24週已完成無須重複施作）"
            ]
        elif visit_num == 7: # 30w
            publicly_funded_items = [
                "第 7 次公費產檢例行檢查與胎位觸診檢查"
            ]
        elif visit_num == 8: # 32w
            publicly_funded_items = [
                "第 3 次產前公費超音波檢查（建議執行區間：32週後，評估胎兒生長體重、胎位、胎盤位置及羊水量）",
                "第 2 次梅毒血清檢查 (VDRL / RPR)"
            ]
        elif visit_num == 9: # 34w
            publicly_funded_items = [
                "第 9 次公費產檢例行檢查與胎位檢查"
            ]
        elif visit_num == 10: # 36w
            publicly_funded_items = [
                "孕婦乙型鏈球菌篩檢（GBS，採陰道與肛門拭子檢體，建議執行區間：35~37週，公費全額補助）"
            ]
        elif visit_num == 11: # 37w
            publicly_funded_items = [
                "第 11 次公費產檢與足月母胎安危評估"
            ]
        elif visit_num == 12: # 38w
            publicly_funded_items = [
                "第 12 次公費產檢與胎心音/宮縮狀況評估"
            ]
        elif visit_num == 13: # 39w
            publicly_funded_items = [
                "第 13 次公費產檢與胎兒安危評估"
            ]
        elif visit_num == 14: # 40w
            publicly_funded_items = [
                "第 14 次公費產檢與過期妊娠胎兒安危評估（含羊水量與胎盤功能評估）"
            ]

        # 3. Batch 02B Optional / Self-paid Items (Canonical Window Mapping)
        optional_items = []
        for opt in optional_records:
            opt_c = opt["content"]
            opt_id = opt["id"]
            
            is_applicable = False
            rec_win_str = ""

            if opt_id in ["MED-PRENATAL-OPTIONAL-04", "MED-PRENATAL-OPTIONAL-05"]: # SMA & Fragile X
                if recommended_week in [8, 12]:
                    is_applicable = True
                    rec_win_str = "建議時間：8–12週 (或孕前)"
            elif opt_id == "MED-PRENATAL-OPTIONAL-02": # NIPT
                if recommended_week == 12:
                    is_applicable = True
                    rec_win_str = "建議時間：10週以上 (最佳10-14週)"
            elif opt_id == "MED-PRENATAL-OPTIONAL-01": # 初唐
                if recommended_week == 12:
                    is_applicable = True
                    rec_win_str = "建議時間：11–13+6週"
            elif opt_id == "MED-PRENATAL-OPTIONAL-03": # 第一孕期子癲前症
                if recommended_week == 12:
                    is_applicable = True
                    rec_win_str = "建議時間：11–13+6週"
            elif opt_id == "MED-PRENATAL-OPTIONAL-06": # 中唐
                if recommended_week == 16:
                    is_applicable = True
                    rec_win_str = "建議時間：15–20週"
            elif opt_id == "MED-PRENATAL-OPTIONAL-07": # 羊膜穿刺 (Diagnostic)
                if recommended_week == 16:
                    is_applicable = True
                    rec_win_str = "建議時間：16–18週"
            elif opt_id == "MED-PRENATAL-OPTIONAL-08": # 高層次超音波
                if recommended_week == 20:
                    is_applicable = True
                    rec_win_str = "建議時間：約 20–24週"

            if is_applicable:
                optional_items.append({
                    "id": opt_id,
                    "title": opt["topic"],
                    "recommended_window": rec_win_str,
                    "summary": opt_c.get("summary", ""),
                    "cost_info": opt_c.get("cost_range") or "自費選擇性項目 (高齡/特異條件有國健署補助)",
                    "source_record_ids": [opt_id]
                })

        # 4. Batch 02C Vaccine Items (Canonical Window Mapping)
        # Requirement: Tdap vaccine ONLY appears on Week 28 Timeline Node!
        vaccines = []
        for vac in vaccine_records:
            vac_c = vac["content"]
            vac_id = vac["id"]

            if vac_id == "MED-PREG-VACCINE-01": # Tdap (27-36w)
                if recommended_week == 28: # Only on Week 28 node!
                    vaccines.append({
                        "id": vac_id,
                        "title": vac["topic"],
                        "recommended_window": "建議時間：27–36週 (最佳 28–32 週)",
                        "summary": vac_c.get("summary", ""),
                        "funding_type": "自費 / 政策推廣建議項目",
                        "recommendation_status": "台灣婦產科醫學會與衛福部疾管署建議每次懷孕接種 1 劑",
                        "policy_sensitive": True,
                        "source_record_ids": [vac_id]
                    })

        # Notes / Cautions
        notes = []
        if c.get("cta"): notes.append(c["cta"])
        if c.get("warning"): notes.append(c["warning"])

        # Source Traceability
        source_record_ids = [rid]
        for opt in optional_items: source_record_ids.extend(opt["source_record_ids"])
        for vac in vaccines: source_record_ids.extend(vac["source_record_ids"])

        viewmodel_nodes.append({
            "week": recommended_week,
            "visit_number": visit_num,
            "visit_title": f"第 {visit_num} 次公費產檢（第 {recommended_week} 週）",
            "routine_items": routine_items,
            "publicly_funded_items": publicly_funded_items,
            "optional_items": optional_items,
            "vaccines": vaccines,
            "notes": notes,
            "source_record_ids": sorted(list(set(source_record_ids)))
        })

    viewmodel_data = {
        "metadata": {
            "title": "孕育之美 Prenatal Checkup Map View Model v3",
            "version": "3.0.0",
            "source_dataset": "data/medical/medical-kb.production.json",
            "generated_at": prod_data["metadata"]["generated_at"],
            "node_count": len(viewmodel_nodes),
            "seasonal_health_notices": [
                {
                    "id": "MED-PREG-VACCINE-03",
                    "title": "孕期季節性流感疫苗",
                    "timing": "全孕期均可接種 (流感季隨到隨打)",
                    "funding_type": "公費優先對象",
                    "recommendation_status": "衛福部疾管署公費流感疫苗優先接種對象",
                    "summary": "孕婦為流感重症高風險族群。流感季開打時不分孕期皆可接種，安全保護母體與新生兒。",
                    "source_record_ids": ["MED-PREG-VACCINE-03"]
                }
            ]
        },
        "timeline_nodes": viewmodel_nodes
    }

    # Write Output JSON
    with open(OUTPUT_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(viewmodel_data, f, ensure_ascii=False, indent=2)

    # Write Output JS
    js_content = f"// Auto-generated by scripts/build-prenatal-viewmodel.py - DO NOT EDIT MANUALLY\nwindow.PRENATAL_MAP_VIEWMODEL = {json.dumps(viewmodel_data, ensure_ascii=False, indent=2)};\n"
    with open(OUTPUT_JS_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Prenatal Map View Model v3 Built Successfully!")
    print(f"  - JSON File: {OUTPUT_JSON_FILE}")
    print(f"  - JS Adapter File: {OUTPUT_JS_FILE}")

if __name__ == "__main__":
    build_viewmodel_v3()
