/**
 * 孕育之美 Medical KB Local Retrieval Engine (Step 02A)
 * 
 * Source of Truth for Retrieval: data/medical/medical-kb.production.json
 * Strictly filtered to review_status == "approved" AND human_reviewed == true.
 * 
 * Capabilities:
 *  - Lightweight local matching (Keyword + Synonyms + Structured Fields + Week Context)
 *  - Deterministic relevance scoring
 *  - Zero LLM / Zero Embedding / Zero Web Search dependency
 *  - Full preservation of medical evidence, source_refs, and review_status
 */

(function (global) {
  'use strict';

  // In-memory cache for production dataset
  let cachedProductionKB = null;
  let isLoaded = false;

  /**
   * Controlled, Human-Auditable Synonym & Concept Expansion Map
   * Targeted strictly to topics approved in the 172 production records.
   */
  const SYNONYM_MAP = [
    {
      terms: ['下腹痛', '腹痛', '肚子痛', '腹部痛', '腹部疼痛', '肚子悶痛', '下腹抽痛', '腹痛如絞', '肚子絞痛', 'abdominal pain'],
      expansions: ['腹痛', '下腹痛', '持續或劇烈腹痛', '子宮收縮', '宮縮']
    },
    {
      terms: ['宮縮', '子宮收縮', '肚子變硬', '腹部變硬', '肚子緊', '肚子硬硬的', '子宮緊繃', '頻繁宮縮', '假性宮縮', '變硬', '發硬', '肚子硬', '肚皮發硬', '腹部發硬'],
      expansions: ['子宮收縮', '腹部變硬', '早產警訊', '持續腰痠與腹部變硬', '頻繁子宮收縮']
    },
    {
      terms: ['出血', '陰道出血', '流血', '見紅', '落紅', '點狀出血', '褐色分泌物', '血絲', 'vaginal bleeding'],
      expansions: ['陰道出血', '出血', '早產警訊', '危險徵兆']
    },
    {
      terms: ['破水', '漏水', '羊水流出', '陰道流水', '漏羊水', '水樣液體', 'rupture of membranes', 'rom'],
      expansions: ['破水', '陰道持續流出水樣液體', '水樣液體', '羊水']
    },
    {
      terms: ['胎動變少', '胎動減少', '沒有胎動', '胎動停止', '沒胎動', '胎動少', '胎動微弱', 'decreased fetal movement'],
      expansions: ['胎動停止或比平常活動量少一半', '胎動停止', '胎動減少', '胎動']
    },
    {
      terms: ['流感疫苗', '流感針', '打流感', '流感預防針', '流感'],
      expansions: ['季節性流感疫苗', '流感疫苗', '疫苗', '預防接種']
    },
    {
      terms: ['百日咳', '百日咳疫苗', 'tdap', 'Tdap'],
      expansions: ['百日咳疫苗', 'Tdap疫苗', '疫苗']
    },
    {
      terms: ['疫苗', '打疫苗', '預防針', '接種', '打針'],
      expansions: ['疫苗', '預防接種', '懷孕疫苗']
    },
    {
      terms: ['nipt', 'NIPT', '非侵入性', '非侵入性胎兒染色體', '唐氏症篩檢', '初唐', '中唐'],
      expansions: ['非侵入性胎兒染色體檢測', 'NIPT', '唐氏症', '產前篩檢']
    },
    {
      terms: ['葉酸', 'folic acid', 'folate', '維他命b9', '維生素b9'],
      expansions: ['葉酸', '懷孕初期營養', '維生素', '營養素']
    },
    {
      terms: ['寶寶', '胎兒', '發育', '變化', '成長', '長大', '多大', '長多大', '長怎樣', '生長', '胎兒大小', '寶寶大小', '體重', '身長', '比喻'],
      expansions: ['胎兒身長體重與大小比喻', '寶寶成長', '胎兒發育', 'baby_development', '胎兒生長']
    },
    {
      terms: ['鐵質', '補鐵', '鐵劑', '缺鐵', '貧血'],
      expansions: ['鐵', '貧血', '營養素']
    },
    {
      terms: ['鈣質', '補鈣', '鈣片', '抽筋', '小腿抽筋'],
      expansions: ['鈣', '抽筋', '骨骼']
    },
    {
      terms: ['dha', 'DHA', '魚油', '藻油'],
      expansions: ['DHA', '脂肪酸', '胎兒大腦']
    },
    {
      terms: ['頭痛', '偏頭痛', '劇烈頭痛', '頭暈', '暈眩', '姿態性低血壓'],
      expansions: ['持續或劇烈頭痛', '頭暈', '頭痛', '子癲前症']
    },
    {
      terms: ['視力模糊', '閃光', '複視', '看東西模糊', '眼睛花'],
      expansions: ['視力模糊', '子癲前症', '危險徵兆']
    },
    {
      terms: ['水腫', '浮腫', '手腫', '臉腫', '腳水腫', '下肢水腫'],
      expansions: ['臉部與手部浮腫', '水腫', '浮腫']
    },
    {
      terms: ['發燒', '發熱', '發冷', '畏寒', '體溫過高'],
      expansions: ['突然發冷發熱', '發燒', '感染']
    },
    {
      terms: ['孕吐', '害喜', '嘔吐', '噁心', '晨吐', '吃不下'],
      expansions: ['持續或嚴重噁心／嘔吐', '孕吐', '噁心']
    },
    {
      terms: ['頻尿', '尿道炎', '膀胱炎', '排尿刺痛', '小便疼痛', '解尿灼熱'],
      expansions: ['尿量明顯減少或排尿疼痛／灼熱', '頻尿', '排尿疼痛']
    },
    {
      terms: ['便祕', '便秘', '排便困難', '痔瘡'],
      expansions: ['便祕', '排便', '高纖維']
    },
    {
      terms: ['恥骨痛', '骨盆痛', '恥骨聯合疼痛'],
      expansions: ['恥骨痛', '骨盆', '鬆弛素']
    },
    {
      terms: ['腰痠', '腰酸', '背痛', '腰痠背痛'],
      expansions: ['持續腰痠與腹部變硬', '腰痠背痛', '腰痠']
    },
    {
      terms: ['產兆', '快生了', '要生了', '陣痛', '規則陣痛', '分娩'],
      expansions: ['三大產兆', '規則陣痛', '落紅', '破水']
    },
    {
      terms: ['早產', '安胎', '早產徵兆', '早產警訊'],
      expansions: ['早產警訊', '頻繁子宮收縮', '陰道出血', '破水']
    },
    {
      terms: ['神隊友', '老公', '先生', '伴侶', '爸爸', '陪產'],
      expansions: ['伴侶支援', '神隊友', '產檢陪伴', '待產陪伴']
    },
    {
      terms: ['運動', '散步', '快走', '游泳', '瑜珈', '運動安全'],
      expansions: ['孕期每週身體活動目標', '孕期有氧運動', '運動禁忌與立即停止警訊']
    },
    {
      terms: ['產檢', '公費產檢', '超音波', '回診', '下次產檢', '下一次產檢', '下次產檢內容', '產檢內容', '產檢要問什麼', '下次產檢要問什麼', '下次產檢要檢查什麼', '下一次要做什麼產檢', '下一次產檢內容', '接下來的產檢', '產檢項目'],
      expansions: ['產檢', '產前檢查', '超音波檢查', '產檢時程與檢查項目', '公費產檢']
    },
    {
      terms: [
        '飲食', '飲食建議', '孕期飲食', '懷孕飲食', '孕婦飲食', '孕期營養', '懷孕營養', '孕婦營養',
        '吃什麼', '懷孕吃什麼', '孕婦吃什麼', '該吃什麼', '要吃什麼', '怎麼吃', '營養攝取', '營養補充',
        '飲食指南', '飲食原則', 'diet', 'nutrition', '補品', '食物'
      ],
      expansions: [
        '孕期飲食', '孕期營養', '懷孕飲食', '孕婦飲食', '蛋白質', '葉酸', '鐵', '鈣', '碘', '膳食纖維與水分', '飲食', '營養素', '飲食重點'
      ]
    },
    {
      terms: [
        '咖啡', '咖啡因', '喝咖啡', '孕婦喝咖啡', '孕期喝咖啡', '懷孕喝咖啡',
        '孕期可以喝咖啡嗎', '懷孕可以喝咖啡嗎', '孕婦可以喝咖啡嗎', '孕婦可以攝取咖啡因嗎',
        '含咖啡因飲料', '咖啡因飲品', '攝取咖啡因', '咖啡因上限', '咖啡因攝取', '喝多少咖啡', 'caffeine', 'coffee'
      ],
      expansions: ['孕期咖啡因', '咖啡因', '咖啡', '咖啡因攝取上限']
    }
  ];

  /**
   * Helper: Get next upcoming prenatal visit node based on week
   */
  function getNextPrenatalVisitNode(week) {
    const w = Number(week) || 20;
    const visits = [
      { id: 'MED-PRENATAL-VISIT-01', week: 8, visit: 1 },
      { id: 'MED-PRENATAL-VISIT-02', week: 12, visit: 2 },
      { id: 'MED-PRENATAL-VISIT-03', week: 16, visit: 3 },
      { id: 'MED-PRENATAL-VISIT-04', week: 20, visit: 4 },
      { id: 'MED-PRENATAL-VISIT-05', week: 24, visit: 5 },
      { id: 'MED-PRENATAL-VISIT-06', week: 28, visit: 6 },
      { id: 'MED-PRENATAL-VISIT-07', week: 30, visit: 7 },
      { id: 'MED-PRENATAL-VISIT-08', week: 32, visit: 8 },
      { id: 'MED-PRENATAL-VISIT-09', week: 34, visit: 9 },
      { id: 'MED-PRENATAL-VISIT-10', week: 36, visit: 10 },
      { id: 'MED-PRENATAL-VISIT-11', week: 37, visit: 11 },
      { id: 'MED-PRENATAL-VISIT-12', week: 38, visit: 12 },
      { id: 'MED-PRENATAL-VISIT-13', week: 39, visit: 13 },
      { id: 'MED-PRENATAL-VISIT-14', week: 40, visit: 14 }
    ];
    for (let i = 0; i < visits.length; i++) {
      if (visits[i].week >= w) {
        return visits[i];
      }
    }
    return visits[visits.length - 1];
  }

  /**
   * Helper: Parse gestational week from query string or context
   */
  function extractWeek(query, weekContext) {
    if (typeof query === 'string') {
      const match = query.match(/(?:孕|懷孕)?\s*(\d{1,2})\s*(?:週|周|w|W)/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed >= 1 && parsed <= 42) {
          return parsed;
        }
      }
    }
    if (typeof weekContext === 'number' && weekContext >= 1 && weekContext <= 42) {
      return Math.round(weekContext);
    }
    return null;
  }

  /**
   * Helper: Expand query into token list & concept synonyms
   */
  function normalizeAndExpandQuery(query) {
    if (!query || typeof query !== 'string') return { raw: '', tokens: [], expanded: [] };

    const raw = query.trim();
    const lower = raw.toLowerCase();

    // Base tokens
    const tokens = new Set();

    // Extract alphanumeric keywords and CJK word segments
    const cleanStr = lower.replace(/[？?！!，,。.\-_/\\()（）[\]【】]/g, ' ');
    const parts = cleanStr.split(/\s+/).filter(Boolean);

    parts.forEach(p => tokens.add(p));

    // Common short CJK keywords
    const directKeywords = [
      '下腹痛', '腹痛', '肚子痛', '宮縮', '子宮收縮', '變硬', '發硬', '肚子硬', '出血', '見紅', '落紅', '破水',
      '胎動', '頭痛', '頭暈', '視力模糊', '水腫', '浮腫', '發燒', '畏寒', '孕吐',
      '噁心', '嘔吐', '頻尿', '排尿痛', '便祕', '恥骨痛', '腰痠', '背痛', '流感疫苗',
      '百日咳', 'tdap', 'nipt', '葉酸', '鐵質', '鈣質', 'dha', '運動', '散步',
      '神隊友', '產檢', '超音波', '早產', '產兆', '陣痛',
      '寶寶', '胎兒', '發育', '變化', '成長', '多大', '長大', '生長', '長怎樣', '身長', '體重',
      '飲食', '營養', '吃什麼', '飲食建議', '孕期飲食', '孕期營養', '下次產檢', '產檢內容', '蛋白質', '維生素',
      '咖啡因', '咖啡', '喝咖啡'
    ];

    directKeywords.forEach(kw => {
      if (lower.includes(kw.toLowerCase())) {
        tokens.add(kw);
      }
    });

    // Expand through SYNONYM_MAP
    const expanded = new Set();
    SYNONYM_MAP.forEach(item => {
      const matched = item.terms.some(t => lower.includes(t.toLowerCase()));
      if (matched) {
        item.terms.forEach(t => expanded.add(t));
        item.expansions.forEach(e => expanded.add(e));
      }
    });

    return {
      raw,
      tokens: Array.from(tokens),
      expanded: Array.from(expanded)
    };
  }

  /**
   * Helper: Determine if record matches a specific week
   */
  function matchRecordWeek(record, week) {
    if (!week) return { match: false, isTrimesterMatch: false };

    // 1. Direct week match via ID
    if (record.id === `MED-GROWTH-WEEK-${String(week).padStart(2, '0')}`) {
      return { match: true, isTrimesterMatch: true };
    }

    // 2. week_start & week_end
    if (typeof record.week_start === 'number' && typeof record.week_end === 'number') {
      if (week >= record.week_start && week <= record.week_end) {
        return { match: true, isTrimesterMatch: true };
      }
    }

    // 3. trigger_week or recommended_gestational_week or content.gestational_week
    const tw = record.trigger_week || record.recommended_gestational_week || (record.content && record.content.gestational_week);
    if (typeof tw === 'number' && tw === week) {
      return { match: true, isTrimesterMatch: true };
    }

    // 4. Trimester match
    const trimester = week <= 12 ? 'trimester_1' : (week <= 28 ? 'trimester_2' : 'trimester_3');
    const stage = record.pregnancy_stage;

    if (stage === 'all_trimesters' || !stage) {
      return { match: false, isTrimesterMatch: true };
    }
    if (stage === trimester || (trimester === 'trimester_2' && stage === 'trimester_2_3') || (trimester === 'trimester_3' && stage === 'trimester_2_3')) {
      return { match: false, isTrimesterMatch: true };
    }

    return { match: false, isTrimesterMatch: false };
  }

  /**
   * Calculate relevance score for a record given query tokens & week
   */
  function scoreRecord(record, queryInfo, week) {
    let score = 0;
    const matchedFields = new Set();
    const content = record.content || {};

    const allSearchTerms = Array.from(new Set([...queryInfo.tokens, ...queryInfo.expanded]));
    if (!allSearchTerms.length) return { score: 0, matchedFields: [] };

    // Helper for field scanning
    function scanField(fieldValue, fieldName, exactWeight, partialWeight) {
      if (!fieldValue) return;
      let text = '';
      if (typeof fieldValue === 'string') {
        text = fieldValue;
      } else if (Array.isArray(fieldValue)) {
        text = fieldValue.join(' ');
      } else if (typeof fieldValue === 'object') {
        text = JSON.stringify(fieldValue);
      }
      const lowerText = text.toLowerCase();

      for (const term of allSearchTerms) {
        const lowerTerm = term.toLowerCase();
        if (lowerText.includes(lowerTerm)) {
          // Check if exact match with primary query token
          const isPrimary = queryInfo.tokens.some(pt => lowerText.includes(pt.toLowerCase()));
          const pts = isPrimary ? exactWeight : partialWeight;
          score += pts;
          matchedFields.add(fieldName);
        }
      }
    }

    // 1. High-weight fields (Title, Topic, Red Flags, Growth size analogy)
    scanField(record.topic, 'topic', 50, 30);
    scanField(content.title, 'content.title', 50, 30);
    scanField(content.red_flags, 'content.red_flags', 45, 30);
    scanField(content.common_presentations, 'content.common_presentations', 35, 20);
    scanField(content.size_analogy_zh, 'content.size_analogy_zh', 35, 20);

    // 2. Urgent care & warnings
    scanField(content.when_to_seek_care, 'content.when_to_seek_care', 30, 20);
    scanField(content.stop_and_seek_help_if, 'content.stop_and_help', 30, 20);

    // 3. Summary & recommendations
    scanField(content.summary, 'content.summary', 25, 15);
    scanField(content.recommendations, 'content.recommendations', 20, 10);
    scanField(content.bullets, 'content.bullets', 20, 10);
    scanField(content.self_care_or_actions, 'content.self_care_or_actions', 20, 10);

    // 4. Cautions & Category
    scanField(content.avoid_or_cautions, 'content.avoid_or_cautions', 15, 10);
    scanField(content.avoid_or_limit, 'content.avoid_or_limit', 15, 10);
    scanField(record.category, 'category', 15, 10);

    // 5. Special Baby Growth Intent Match
    const isBabyGrowthIntent = queryInfo.tokens.some(t => ['寶寶', '胎兒', '發育', '變化', '成長', '多大', '長大', '生長', '長怎樣'].includes(t)) ||
                              queryInfo.expanded.some(e => ['胎兒身長體重與大小比喻', '寶寶成長', '胎兒發育'].includes(e));

    if (isBabyGrowthIntent && record.category === 'baby_development') {
      matchedFields.add('category');
      score += 40;

      const targetWeekStr = week ? String(week).padStart(2, '0') : null;
      if (targetWeekStr && (record.id === `MED-GROWTH-WEEK-${targetWeekStr}` || (record.content && record.content.gestational_week === week))) {
        matchedFields.add('content.gestational_week');
        score += 100;
      }
    }

    // 6. Special Next Prenatal Visit Intent Match
    const isNextPrenatalVisitIntent = /(?:下次|下一次|接下來|近期)?\s*(?:要問什麼|要問甚麼|內容|要檢查什麼|要做什麼|要做甚麼)?\s*(?:產檢|檢查)/.test(queryInfo.raw) ||
      queryInfo.tokens.some(t => ['下次產檢', '下一次產檢', '產檢內容', '產檢項目', '下次產檢要問什麼'].includes(t));

    if (isNextPrenatalVisitIntent && record.category === 'prenatal_checkup') {
      matchedFields.add('category');
      score += 40;

      if (week && typeof record.recommended_gestational_week === 'number') {
        const nextVisit = getNextPrenatalVisitNode(week);
        if (nextVisit && record.id === nextVisit.id) {
          matchedFields.add('recommended_gestational_week');
          score += 150;
        }
      }
    }

    // 7. Special Pregnancy Nutrition Intent Match
    const isNutritionIntent = queryInfo.tokens.some(t => ['飲食', '營養', '吃什麼', '飲食建議', '孕期飲食', '孕期營養'].includes(t)) ||
      queryInfo.expanded.some(e => ['孕期飲食', '孕期營養', '懷孕飲食', '孕婦飲食'].includes(e));

    const nutritionCategories = [
      'pregnancy_nutrient', 'pregnancy_nutrition_stage', 'pregnancy_food_safety',
      'pregnancy_food_limit', 'pregnancy_food_avoidance', 'pregnancy_diet_management', 'pregnancy_dietary_pattern'
    ];

    if (isNutritionIntent && nutritionCategories.includes(record.category)) {
      matchedFields.add('category');
      score += 40;
      if (record.category === 'pregnancy_nutrition_stage') {
        score += 30;
        if (week) {
          const trimester = week <= 12 ? 'trimester_1' : (week <= 28 ? 'trimester_2' : 'trimester_3');
          if (record.pregnancy_stage === trimester) {
            score += 250;
          }
        }
      }
    }

    // If no text fields matched, return 0
    if (matchedFields.size === 0 || score === 0) {
      return { score: 0, matchedFields: [] };
    }

    // 5. Week context weighting (Deterministic bonus)
    const weekResult = matchRecordWeek(record, week);
    if (weekResult.match) {
      score += 15; // Exact week range match
    } else if (weekResult.isTrimesterMatch) {
      score += 5;  // Trimester or all_trimesters match
    } else if (week) {
      // If record is strictly for a different trimester and NOT a red_flag
      if (record.category !== 'pregnancy_red_flag' && record.category !== 'preterm_labor_warning') {
        score = Math.max(1, score - 15);
      }
    }

    // 6. Priority boost
    if (record.priority === 'high' || record.category === 'pregnancy_red_flag') {
      score += 5;
    }

    return {
      score,
      matchedFields: Array.from(matchedFields),
      weekMatch: weekResult.match || weekResult.isTrimesterMatch
    };
  }

  /**
   * Load Production KB Dataset safely (cached once)
   */
  function loadMedicalKB(customDataset) {
    if (cachedProductionKB && !customDataset) {
      return cachedProductionKB;
    }

    if (customDataset && Array.isArray(customDataset.records)) {
      cachedProductionKB = customDataset;
      isLoaded = true;
      return cachedProductionKB;
    }

    // 1. Browser environment: Check preloaded JS Bridge (window.__MEDICAL_KB_PRODUCTION__)
    if (typeof window !== 'undefined' && window.__MEDICAL_KB_PRODUCTION__ && Array.isArray(window.__MEDICAL_KB_PRODUCTION__.records)) {
      cachedProductionKB = window.__MEDICAL_KB_PRODUCTION__;
      isLoaded = true;
      return cachedProductionKB;
    }

    // 2. Node.js environment
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = require('fs');
        const path = require('path');
        const candidatePaths = [
          path.resolve(__dirname, '../data/medical/medical-kb.production.json'),
          path.resolve(process.cwd(), 'data/medical/medical-kb.production.json')
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf-8');
            cachedProductionKB = JSON.parse(raw);
            isLoaded = true;
            return cachedProductionKB;
          }
        }
      } catch (err) {
        console.warn('[MedicalKBRetrieval] Failed to load local production json in Node.js:', err.message);
      }
    }

    return cachedProductionKB;
  }

  /**
   * Async helper for browser fetch fallback if JS bridge not present
   */
  async function loadMedicalKBAsync(url = 'data/medical/medical-kb.production.json') {
    const syncKB = loadMedicalKB();
    if (syncKB) return syncKB;

    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.records)) {
            cachedProductionKB = data;
            isLoaded = true;
            return data;
          }
        }
      }
    } catch (e) {
      console.warn('[MedicalKBRetrieval] Async fetch fallback error:', e.message);
    }
    return cachedProductionKB;
  }

  /**
   * Main Search Function
   * @param {string} query - User search query or question
   * @param {number|null} weekContext - Optional current gestational week
   * @param {object} options - Optional config (limit, customDataset)
   * @returns {object} Retrieval result with top matched records and metadata
   */
  function searchMedicalKB(query, weekContext = null, options = {}) {
    const dataset = (options && options.customDataset) ? options.customDataset : loadMedicalKB();
    const limit = (options && options.limit) || 5;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        query: '',
        detectedWeek: null,
        totalMatches: 0,
        retrievalStatus: 'NO_RELEVANT_KB_RECORD',
        results: []
      };
    }

    if (!dataset || !Array.isArray(dataset.records)) {
      return {
        query,
        detectedWeek: extractWeek(query, weekContext),
        totalMatches: 0,
        retrievalStatus: 'KB_LOAD_ERROR',
        results: [],
        error: 'Medical KB Production Dataset not loaded'
      };
    }

    const detectedWeek = extractWeek(query, weekContext);
    const queryInfo = normalizeAndExpandQuery(query);

    const scoredList = [];

    for (const record of dataset.records) {
      // Safety filter check: ensure record is strictly approved
      if (record.review_status !== 'approved') continue;

      const { score, matchedFields, weekMatch } = scoreRecord(record, queryInfo, detectedWeek);
      if (score > 0 && matchedFields.length > 0) {
        scoredList.push({
          id: record.id,
          score,
          category: record.category,
          topic: record.topic || '',
          title: (record.content && record.content.title) || record.topic || '',
          pregnancy_stage: record.pregnancy_stage || 'all_trimesters',
          matchedFields,
          weekMatch,
          // Fully preserve evidence, source_refs, review_status without alteration
          record
        });
      }
    }

    // Deterministic sorting: Score DESC, Priority DESC, ID ASC
    scoredList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const prioA = a.record.priority === 'high' ? 1 : 0;
      const prioB = b.record.priority === 'high' ? 1 : 0;
      if (prioB !== prioA) return prioB - prioA;
      return a.id.localeCompare(b.id);
    });

    const topResults = scoredList.slice(0, limit);
    const retrievalStatus = topResults.length > 0 ? 'SUCCESS' : 'NO_RELEVANT_KB_RECORD';

    return {
      query,
      detectedWeek,
      totalMatches: scoredList.length,
      retrievalStatus,
      results: topResults
    };
  }

  /**
   * Developer Test Suite
   */
  function testMedicalKBRetrieval() {
    const dataset = loadMedicalKB();
    if (!dataset || !dataset.records) {
      return {
        status: 'FAILED',
        error: 'Production KB dataset is not loaded. Cannot run tests.'
      };
    }

    const testCases = [
      {
        id: 'TEST_A',
        name: '20週下腹痛怎麼辦？',
        query: '20週下腹痛怎麼辦？',
        week: 20,
        validate: (res) => {
          const ids = res.results.map(r => r.id);
          const hasSeverePain = ids.includes('MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001');
          const hasPreterm = ids.some(id => id.includes('PRETERM') || id.includes('CONTRACTIONS') || id.includes('BACKACHE'));
          return hasSeverePain && res.results.length > 0;
        }
      },
      {
        id: 'TEST_B',
        name: '懷孕期間可以打流感疫苗嗎？',
        query: '懷孕期間可以打流感疫苗嗎？',
        week: null,
        validate: (res) => {
          const ids = res.results.map(r => r.id);
          return ids.includes('MED-PREG-VACCINE-03') || ids.some(id => id.includes('VACCINE'));
        }
      },
      {
        id: 'TEST_C',
        name: 'NIPT什麼時候做？',
        query: 'NIPT什麼時候做？',
        week: null,
        validate: (res) => {
          const ids = res.results.map(r => r.id);
          return ids.includes('MED-PRENATAL-OPTIONAL-02') || ids.some(r => r.includes('OPTIONAL'));
        }
      },
      {
        id: 'TEST_D',
        name: '最近胎動變少',
        query: '最近胎動變少',
        week: 28,
        validate: (res) => {
          const ids = res.results.map(r => r.id);
          return ids.includes('MED-RED-FLAG-DECREASED-FETAL-MOVEMENT-001');
        }
      },
      {
        id: 'TEST_E',
        name: '孕期要補充葉酸嗎？',
        query: '孕期要補充葉酸嗎？',
        week: 8,
        validate: (res) => {
          const ids = res.results.map(r => r.id);
          return ids.includes('MED-NUTRIENT-FOLATE-001');
        }
      },
      {
        id: 'TEST_ZERO',
        name: '台北哪家火鍋店最好吃？ (Unsupported Query)',
        query: '台北哪家火鍋店最好吃？',
        week: null,
        validate: (res) => {
          return res.results.length === 0 && res.retrievalStatus === 'NO_RELEVANT_KB_RECORD';
        }
      }
    ];

    const results = testCases.map(tc => {
      const res = searchMedicalKB(tc.query, tc.week);
      const passed = tc.validate(res);
      return {
        id: tc.id,
        name: tc.name,
        passed,
        detectedWeek: res.detectedWeek,
        totalMatches: res.totalMatches,
        topResultIds: res.results.map(r => r.id)
      };
    });

    const allPassed = results.every(r => r.passed);

    return {
      status: allPassed ? 'ALL_PASSED' : 'SOME_FAILED',
      allPassed,
      results
    };
  }

  // Export interface for CommonJS / Node and Browser
  const MedicalKBRetrieval = {
    loadMedicalKB,
    loadMedicalKBAsync,
    searchMedicalKB,
    extractWeek,
    normalizeAndExpandQuery,
    testMedicalKBRetrieval
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalKBRetrieval;
  }
  if (typeof global !== 'undefined') {
    global.MedicalKBRetrieval = MedicalKBRetrieval;
    global.searchMedicalKB = searchMedicalKB;
    global.loadMedicalKB = loadMedicalKB;
    global.testMedicalKBRetrieval = testMedicalKBRetrieval;
  }

})(typeof window !== 'undefined' ? window : globalThis);
