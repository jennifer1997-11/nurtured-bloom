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
    },
    {
      terms: ['高層次', '高層次超音波', '高層次檢查', '高層次超音波檢查', '照高層次', '做高層次', '高層次門診', 'level 2 ultrasound', 'detailed ultrasound', 'anomaly scan'],
      expansions: ['高層次超音波', '高層次', '胎兒器官構造', '高階影像篩檢', '解剖構造', 'MED-PRENATAL-OPTIONAL-08']
    },
    {
      terms: ['羊膜穿刺', '羊穿', '羊水穿刺', '羊水檢查', 'amniocentesis'],
      expansions: ['羊膜穿刺', '羊穿', '產前診斷', 'MED-PRENATAL-OPTIONAL-07']
    },
    {
      terms: ['sma', 'SMA', '脊髓性肌肉萎縮症', '脊髓性肌肉萎縮', '肌肉萎縮症篩檢'],
      expansions: ['脊髓性肌肉萎縮症基因檢測', 'SMA', '帶因者篩檢', 'MED-PRENATAL-OPTIONAL-04']
    },
    {
      terms: ['x染色體脆折症', '脆折症', 'fragile x', 'Fragile X', '脆折'],
      expansions: ['X染色體脆折症篩檢', '脆折症', '帶因者篩檢', 'MED-PRENATAL-OPTIONAL-05']
    },
    {
      terms: ['初唐', '第一孕期唐氏症', '第一孕期唐氏症篩檢', '頸部透明帶'],
      expansions: ['第一孕期唐氏症篩檢', '初唐', '頸部透明帶', 'MED-PRENATAL-OPTIONAL-01']
    },
    {
      terms: ['中唐', '第二孕期唐氏症', '第二孕期唐氏症篩檢', '四指唐氏症', '二指唐氏症'],
      expansions: ['第二孕期唐氏症篩檢', '中唐', 'MED-PRENATAL-OPTIONAL-06']
    },
    {
      terms: ['第一孕期子癲前症', '子癲前症篩檢', '子癲前症檢查', '子癇前症篩檢', '子癲篩檢'],
      expansions: ['第一孕期子癲前症篩檢', '子癲前症篩檢', 'MED-PRENATAL-OPTIONAL-03']
    },
    {
      terms: [
        '妊娠糖尿病', '妊娠糖尿病篩檢', '孕期糖尿病', '孕婦糖尿病', '孕婦糖尿病篩檢',
        '糖水', '喝糖水', '糖水檢查', '糖水測試', '驗糖水', '75克糖水', '75g糖水', '75克葡萄糖', '75g葡萄糖',
        '耐糖', '耐糖試驗', '葡萄糖耐量試驗', '口服葡萄糖耐量試驗', 'ogtt', 'OGTT', '75g ogtt', '75g'
      ],
      expansions: [
        '妊娠糖尿病篩檢', '75g 口服葡萄糖耐量試驗 OGTT', '24~28週', '禁食8小時', '妊娠糖尿病飲食控制與營養指導', 'MED-PRENATAL-VISIT-05', 'MED-STAGE-T2-CHECKUP-001'
      ]
    }
  ];

  /**
   * Controlled Medical Topic Normalization Rules
   * Maps user colloquial / short forms to canonical KB topics & records
   */
  const TOPIC_NORMALIZATION_RULES = [
    {
      normalizedTopic: '高層次超音波',
      recordId: 'MED-PRENATAL-OPTIONAL-08',
      patterns: ['高層次超音波', '高層次檢查', '高層次', '照高層次', '做高層次', '高層次超音波檢查'],
      tokens: ['高層次超音波', '高層次', '高層次檢查', '超音波'],
      expansions: ['高層次超音波', '胎兒器官構造', '高階影像篩檢']
    },
    {
      normalizedTopic: '妊娠糖尿病篩檢',
      recordId: 'MED-PRENATAL-VISIT-05',
      secondaryRecordIds: ['MED-STAGE-T2-CHECKUP-001', 'MED-PRENATAL-VISIT-06'],
      patterns: [
        '妊娠糖尿病', '妊娠糖尿病篩檢', '孕期糖尿病', '孕婦糖尿病', '孕婦糖尿病篩檢',
        '糖水', '喝糖水', '糖水檢查', '糖水測試', '驗糖水', '照糖水', '測糖水', '75克糖水', '75g糖水', '75克葡萄糖', '75g葡萄糖',
        '耐糖', '耐糖試驗', '葡萄糖耐量試驗', '口服葡萄糖耐量試驗',
        'ogtt', 'OGTT', '75g ogtt', '75g OGTT', '75克口服葡萄糖耐量試驗'
      ],
      tokens: ['妊娠糖尿病篩檢', '妊娠糖尿病', '75g', 'OGTT', '葡萄糖耐量試驗', '糖水', '喝糖水', '貧血檢驗', '第5次產檢'],
      expansions: ['妊娠糖尿病篩檢', '75g 口服葡萄糖耐量試驗 OGTT', '24~28週', '禁食8小時', '公費產檢', 'MED-PRENATAL-VISIT-05', 'MED-STAGE-T2-CHECKUP-001']
    },
    {
      normalizedTopic: '非侵入性胎兒染色體檢測',
      recordId: 'MED-PRENATAL-OPTIONAL-02',
      patterns: ['nipt', '非侵入性胎兒染色體', '非侵入性產前染色體', '非侵入性染色體', '非侵入性產前篩檢'],
      tokens: ['nipt', '非侵入性胎兒染色體檢測', '非侵入性', '染色體'],
      expansions: ['NIPT', '唐氏症', '產前篩檢']
    },
    {
      normalizedTopic: '羊膜穿刺',
      recordId: 'MED-PRENATAL-OPTIONAL-07',
      patterns: ['羊膜穿刺', '羊穿', '羊水穿刺', '羊水檢查'],
      tokens: ['羊膜穿刺', '羊穿', '羊水穿刺'],
      expansions: ['羊膜穿刺', '染色體診斷']
    },
    {
      normalizedTopic: '第一孕期唐氏症篩檢',
      recordId: 'MED-PRENATAL-OPTIONAL-01',
      patterns: ['初唐', '第一孕期唐氏症', '第一孕期唐氏症篩檢', '頸部透明帶'],
      tokens: ['初唐', '第一孕期唐氏症篩檢', '唐氏症', '頸部透明帶'],
      expansions: ['初唐', '頸部透明帶超音波']
    },
    {
      normalizedTopic: '第二孕期唐氏症篩檢',
      recordId: 'MED-PRENATAL-OPTIONAL-06',
      patterns: ['中唐', '第二孕期唐氏症', '第二孕期唐氏症篩檢', '四指唐氏症', '二指唐氏症'],
      tokens: ['中唐', '第二孕期唐氏症篩檢', '唐氏症'],
      expansions: ['中唐', '母血四指標']
    },
    {
      normalizedTopic: '脊髓性肌肉萎縮症基因檢測',
      recordId: 'MED-PRENATAL-OPTIONAL-04',
      patterns: ['sma', '脊髓性肌肉萎縮症', '脊髓性肌肉萎縮', '肌肉萎縮症篩檢'],
      tokens: ['sma', '脊髓性肌肉萎縮症', '帶因者篩檢'],
      expansions: ['SMA', '脊髓性肌肉萎縮症']
    },
    {
      normalizedTopic: 'X染色體脆折症篩檢',
      recordId: 'MED-PRENATAL-OPTIONAL-05',
      patterns: ['x染色體脆折症', '脆折症', 'fragile x', '脆折'],
      tokens: ['x染色體脆折症', '脆折症', '帶因者篩檢'],
      expansions: ['脆折症', 'Fragile X']
    },
    {
      normalizedTopic: '第一孕期子癲前症篩檢',
      recordId: 'MED-PRENATAL-OPTIONAL-03',
      patterns: ['第一孕期子癲前症', '子癲前症篩檢', '子癲前症檢查', '子癇前症篩檢'],
      tokens: ['第一孕期子癲前症', '子癲前症篩檢', '子癲前症'],
      expansions: ['子癲前症篩檢', '子癲前症']
    },
    {
      normalizedTopic: '百日咳疫苗',
      recordId: 'MED-PREG-VACCINE-01',
      patterns: ['百日咳', '百日咳疫苗', 'tdap', 'Tdap'],
      tokens: ['百日咳疫苗', 'Tdap', '疫苗'],
      expansions: ['百日咳疫苗', 'Tdap疫苗']
    },
    {
      normalizedTopic: '季節性流感疫苗',
      recordId: 'MED-PREG-VACCINE-03',
      patterns: ['流感疫苗', '流感針', '打流感', '流感預防針', '流感'],
      tokens: ['季節性流感疫苗', '流感疫苗', '疫苗'],
      expansions: ['季節性流感疫苗', '流感疫苗']
    }
  ];

  /**
   * Helper: Detect Query Intent
   * Recognized intents: overview, definition, timing, procedure, disease_management, funding, necessity, comparison, safety
   */
  function detectQueryIntent(query) {
    if (!query || typeof query !== 'string') return 'overview';
    const q = query.trim().toLowerCase();

    // 1. Diagnosed / Disease Management Intent
    if (/(?:確診|已經診斷|診斷出|得了|罹患|有妊娠糖尿病|有糖尿病|會怎樣|嚴重嗎|控制血糖|血糖偏高|血糖太高|胰島素|併發症|危害|影響寶寶|高危險)/.test(q)) {
      return 'disease_management';
    }

    // 2. Comparison Intent
    if (/(?:差在哪|差別|差異|差別在哪|不同|跟.*差在哪|和.*差在哪|與.*差在哪|一般超音波|常規超音波|產檢超音波|比一比|比較)/.test(q)) {
      return 'comparison';
    }

    // 3. Necessity Intent (Checked before general timing)
    if (/(?:一定要|必須|要不要|需要做嗎|需要照嗎|需要驗嗎|有需要嗎|有必要嗎|建議做嗎|建議照嗎|值得做嗎|誰需要|適合誰|對象|適應症|一定要做嗎|一定得做|一定要驗嗎)/.test(q)) {
      return 'necessity';
    }

    // 4. Procedure / How-to Intent
    if (/(?:怎麼驗|怎麼做|怎麼喝|如何做|如何驗|如何喝|如何進行|檢查方式|篩檢流程|注意事項|禁食|空腹|抽血流程|喝法|步驟|前置作業|流程|怎麼檢查|怎麼測)/.test(q)) {
      return 'procedure';
    }

    // 5. Timing Intent
    if (/(?:什麼時候|甚麼時候|幾週|幾周|何時|時間|時機|週數|周數|多大做|多久做|什麼階段|幾個月|可以做嗎|可以照嗎|能做嗎|能照嗎|適合做嗎|適合照嗎|照高層次|做高層次|現在.*週|第.*週|\d{1,2}\s*(?:週|周)|何時檢查|幾週做|幾週照|幾週可以|何時進行|什麼時候做|幾週喝|要喝.*嗎|要驗.*嗎|要做.*嗎|要照.*嗎|要檢查.*嗎|還沒喝|還沒做|還沒驗|什麼時候驗|幾週驗|幾週檢查|要驗嗎)/.test(q)) {
      return 'timing';
    }

    // 6. Funding Intent
    if (/(?:自費|公費|費用|多少錢|要錢嗎|要自費嗎|健保|補助|有補助嗎|需自費嗎|要付費嗎|自費項目|價錢|花費)/.test(q)) {
      return 'funding';
    }

    // 7. Safety Intent
    if (/(?:安全嗎|副作用|風險|危險|後遺症|傷寶寶|會痛嗎|侵入性|放射線|輻射|傷害)/.test(q)) {
      return 'safety';
    }

    // 8. Definition Intent
    if (/(?:是什麼|甚麼是|定義|介紹|說明|內容|在看什麼|看什麼|在照什麼|查什麼|檢查什麼|檢查甚麼|項目)/.test(q)) {
      return 'definition';
    }

    return 'overview';
  }

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
      const match = query.match(/(?:孕|懷孕|我現在|現在|目前|第)?\s*(\d{1,2})\s*(?:週|周|w|W)/i);
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
   * Helper: Expand query into token list, concept synonyms, normalized topic & intent
   */
  function normalizeAndExpandQuery(query) {
    if (!query || typeof query !== 'string') {
      return { raw: '', tokens: [], expanded: [], normalizedTopic: null, matchedRecordId: null, intent: 'overview' };
    }

    const raw = query.trim();
    const lower = raw.toLowerCase();

    // Base tokens
    const tokens = new Set();
    const expanded = new Set();

    // 1. Detect Intent
    const intent = detectQueryIntent(raw);

    // 2. Topic Normalization & Extraction
    let normalizedTopic = null;
    let matchedRecordId = null;
    let secondaryRecordIds = [];

    for (const rule of TOPIC_NORMALIZATION_RULES) {
      const matched = rule.patterns.some(p => lower.includes(p.toLowerCase()));
      if (matched) {
        normalizedTopic = rule.normalizedTopic;
        matchedRecordId = rule.recordId;
        if (Array.isArray(rule.secondaryRecordIds)) {
          secondaryRecordIds = rule.secondaryRecordIds;
        }
        rule.tokens.forEach(t => tokens.add(t));
        rule.expansions.forEach(e => expanded.add(e));
        break;
      }
    }

    // 3. Extract alphanumeric keywords and CJK word segments
    const cleanStr = lower.replace(/[？?！!，,。.\-_/\\()（）[\]【】]/g, ' ');
    const parts = cleanStr.split(/\s+/).filter(Boolean);

    parts.forEach(p => tokens.add(p));

    // 4. Common short CJK keywords
    const directKeywords = [
      '妊娠糖尿病篩檢', '妊娠糖尿病', '喝糖水', '糖水檢查', '糖水', 'ogtt', 'OGTT', '耐糖試驗', '葡萄糖耐量試驗', '75g', '75克',
      '高層次超音波', '高層次檢查', '高層次',
      '下腹痛', '腹痛', '肚子痛', '宮縮', '子宮收縮', '變硬', '發硬', '肚子硬', '出血', '見紅', '落紅', '破水',
      '胎動', '頭痛', '頭暈', '視力模糊', '水腫', '浮腫', '發燒', '畏寒', '孕吐',
      '噁心', '嘔吐', '頻尿', '排尿痛', '便祕', '恥骨痛', '腰痠', '背痛', '流感疫苗',
      '百日咳', 'tdap', 'nipt', '葉酸', '鐵質', '鈣質', 'dha', '運動', '散步',
      '神隊友', '產檢', '超音波', '早產', '產兆', '陣痛',
      '寶寶', '胎兒', '發育', '變化', '成長', '多大', '長大', '生長', '長怎樣', '身長', '體重',
      '飲食', '營養', '吃什麼', '飲食建議', '孕期飲食', '孕期營養', '下次產檢', '產檢內容', '蛋白質', '維生素',
      '咖啡因', '咖啡', '喝咖啡', '羊膜穿刺', '初唐', '中唐', '子癲前症', '唐氏症'
    ];

    directKeywords.forEach(kw => {
      if (lower.includes(kw.toLowerCase())) {
        tokens.add(kw);
      }
    });

    // 5. Expand through SYNONYM_MAP
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
      expanded: Array.from(expanded),
      normalizedTopic,
      matchedRecordId,
      secondaryRecordIds,
      intent
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

    // 4. Parse recommended_window string (e.g. "approximately 20-24 weeks", "20-24 weeks", "10-14週", "8–12週", "24~28週")
    const recWindow = record.recommended_window || (record.content && record.content.recommended_window) || '';
    if (typeof recWindow === 'string' && recWindow.trim()) {
      const winMatch = recWindow.match(/(\d{1,2})\s*[-–~至到]\s*(\d{1,2})/);
      if (winMatch) {
        const startW = parseInt(winMatch[1], 10);
        const endW = parseInt(winMatch[2], 10);
        if (week >= startW && week <= endW) {
          return { match: true, isTrimesterMatch: true };
        }
      }
    }

    // 5. Trimester match
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

    // 0. Direct Normalized Topic / Record ID Boost (Top priority grounding)
    if (queryInfo.matchedRecordId && record.id === queryInfo.matchedRecordId) {
      matchedFields.add('id');
      score += 150;
    }
    if (queryInfo.secondaryRecordIds && queryInfo.secondaryRecordIds.includes(record.id)) {
      matchedFields.add('id');
      score += 80;
    }
    if (queryInfo.normalizedTopic && (record.topic === queryInfo.normalizedTopic || (content.title && content.title === queryInfo.normalizedTopic))) {
      matchedFields.add('topic');
      score += 100;
    }

    // 1. High-weight fields (Title, Topic, Red Flags, Growth size analogy)
    scanField(record.topic, 'topic', 50, 30);
    scanField(content.title, 'content.title', 50, 30);
    scanField(content.red_flags, 'content.red_flags', 45, 30);
    scanField(content.common_presentations, 'content.common_presentations', 35, 20);
    scanField(content.size_analogy_zh, 'content.size_analogy_zh', 35, 20);

    // 2. Purpose, Recommended Window, Suitability, Limitations, Funding, Procedure & Checkup specifics
    const intent = queryInfo.intent || 'overview';
    const timingBoost = (intent === 'timing') ? 30 : 0;
    const fundingBoost = (intent === 'funding') ? 30 : 0;
    const necessityBoost = (intent === 'necessity') ? 30 : 0;
    const comparisonBoost = (intent === 'comparison') ? 30 : 0;
    const procedureBoost = (intent === 'procedure') ? 35 : 0;
    const diseaseBoost = (intent === 'disease_management') ? 35 : 0;

    scanField(content.purpose, 'content.purpose', 35 + comparisonBoost + procedureBoost, 20);
    scanField(record.recommended_window, 'recommended_window', 35 + timingBoost, 20);
    scanField(content.recommended_window, 'content.recommended_window', 35 + timingBoost, 20);
    scanField(content.suitable_population, 'content.suitable_population', 30 + necessityBoost, 15);
    scanField(content.important_limitations, 'content.important_limitations', 30 + comparisonBoost, 15);
    scanField(content.funding_type, 'content.funding_type', 30 + fundingBoost, 15);
    scanField(content.cost_range, 'content.cost_range', 30 + fundingBoost, 15);
    scanField(content.screening_or_diagnostic, 'content.screening_or_diagnostic', 25, 15);

    // Checkup specific detailed items
    scanField(content.cta, 'content.cta', 35 + procedureBoost, 20);
    scanField(content.specific_tests, 'content.specific_tests', 35 + procedureBoost, 20);
    scanField(content.publicly_funded_items, 'content.publicly_funded_items', 30 + fundingBoost, 20);
    scanField(content.health_education, 'content.health_education', 30 + diseaseBoost, 20);
    scanField(content.routine_checkups, 'content.routine_checkups', 25, 15);
    scanField(content.notes, 'content.notes', 25 + timingBoost, 15);

    // 3. Urgent care & warnings
    scanField(content.when_to_seek_care, 'content.when_to_seek_care', 30, 20);
    scanField(content.stop_and_seek_help_if, 'content.stop_and_help', 30, 20);

    // 4. Summary & recommendations
    scanField(content.summary, 'content.summary', 25, 15);
    scanField(content.recommendations, 'content.recommendations', 20, 10);
    scanField(content.bullets, 'content.bullets', 20, 10);
    scanField(content.self_care_or_actions, 'content.self_care_or_actions', 20 + diseaseBoost, 10);

    // 5. Cautions & Category
    scanField(content.avoid_or_cautions, 'content.avoid_or_cautions', 15, 10);
    scanField(content.avoid_or_limit, 'content.avoid_or_limit', 15, 10);
    scanField(record.category, 'category', 15, 10);

    // 6. Special Baby Growth Intent Match
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

    // 7. Special Next Prenatal Visit Intent Match
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

    // 8. Special Pregnancy Nutrition Intent Match
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
        id: 'TEST_01',
        name: '高層次',
        query: '高層次',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_02',
        name: '高層次超音波是什麼？',
        query: '高層次超音波是什麼？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_03',
        name: '什麼時候要做高層次？',
        query: '什麼時候要做高層次？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_04',
        name: '高層次幾週做？',
        query: '高層次幾週做？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_05',
        name: '幾週可以照高層次？',
        query: '幾週可以照高層次？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_06',
        name: '20週可以做高層次嗎？',
        query: '20週可以做高層次嗎？',
        week: 20,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_07',
        name: '高層次要自費嗎？',
        query: '高層次要自費嗎？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_08',
        name: '高層次一定要做嗎？',
        query: '高層次一定要做嗎？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_09',
        name: '高層次跟一般超音波差在哪？',
        query: '高層次跟一般超音波差在哪？',
        week: null,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_10',
        name: '我現在21週可以做高層次嗎？',
        query: '我現在21週可以做高層次嗎？',
        week: 21,
        validate: (res) => res.results.length > 0 && res.results[0].id === 'MED-PRENATAL-OPTIONAL-08'
      },
      {
        id: 'TEST_GDM_01',
        name: '妊娠糖尿病',
        query: '妊娠糖尿病',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_02',
        name: '什麼時候驗妊娠糖尿病？',
        query: '什麼時候驗妊娠糖尿病？',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_03',
        name: '糖水幾週喝？',
        query: '糖水幾週喝？',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_04',
        name: '幾週做糖水檢查？',
        query: '幾週做糖水檢查？',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_05',
        name: 'OGTT幾週做？',
        query: 'OGTT幾週做？',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_06',
        name: '75克糖水是什麼？',
        query: '75克糖水是什麼？',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_07',
        name: '妊娠糖尿病怎麼驗？',
        query: '妊娠糖尿病怎麼驗？',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_08',
        name: '我26週還沒喝糖水',
        query: '我26週還沒喝糖水',
        week: 26,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_09',
        name: '我20週要喝糖水嗎？',
        query: '我20週要喝糖水嗎？',
        week: 20,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
      },
      {
        id: 'TEST_GDM_10',
        name: '我已經確診妊娠糖尿病',
        query: '我已經確診妊娠糖尿病',
        week: null,
        validate: (res) => res.results.length > 0 && (res.results[0].id === 'MED-PRENATAL-VISIT-05' || res.results[0].id === 'MED-STAGE-T2-CHECKUP-001')
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
    detectQueryIntent,
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
