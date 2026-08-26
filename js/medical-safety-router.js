/**
 * 孕育之美 Pregnancy Safety Routing Layer (Step 02B)
 * 
 * Source of Truth: data/medical/medical-kb.production.json (Approved Records Only)
 * 
 * Role & Scope:
 *  - Deterministic Safety Triage Router
 *  - Evaluates user query + retrieval results against approved KB Red Flag triggers
 *  - Three Strict Safety Levels: ROUTINE, CAUTION, URGENT
 *  - Rule: Retrieval finding a Red Flag record alone DOES NOT automatically equal URGENT.
 *  - Strictly non-diagnostic: No user-facing diagnosis or speculative medical treatment advice.
 */

(function (global) {
  'use strict';

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
   * Controlled KB-Derived Safety Trigger Definitions
   * Derived 100% from approved production records.
   */
  const RED_FLAG_TRIGGERS = [
    {
      recordId: 'MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001',
      category: 'pregnancy_red_flag',
      title: '持續或劇烈腹痛',
      symptomKeywords: [
        '腹痛', '下腹痛', '肚子痛', '下腹部疼痛', '腹部痛', '肚子絞痛', '抽痛',
        ['下腹', '痛'], ['肚子', '痛'], ['腹部', '痛']
      ],
      acuteModifiers: [
        '持續', '一直', '劇烈', '劇痛', '很痛', '嚴重', '沒有改善', '沒改善', '無法緩解', '越來越痛', '絞痛', '劇烈疼痛', '難以忍受'
      ],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-VAGINAL-BLEEDING-001',
      category: 'pregnancy_red_flag',
      title: '陰道出血',
      symptomKeywords: [
        '出血', '陰道出血', '流血', '見紅', '鮮血', '血塊', '褐色分泌物', '點狀出血', '血絲',
        ['陰道', '出血'], ['流出', '血']
      ],
      acuteModifiers: [], // In HPA guidelines, any vaginal bleeding is an immediate assessment trigger
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-PRETERM-SIGN-CONTRACTIONS-001',
      category: 'preterm_labor_warning',
      title: '早產警訊：頻繁子宮收縮',
      symptomKeywords: [
        '宮縮', '子宮收縮', '肚子變硬', '腹部變硬', '肚子緊', '子宮發硬', '肚子硬硬的', '肚子硬',
        ['肚子', '變硬'], ['腹部', '變硬'], ['子宮', '變硬'], ['肚子', '硬'], ['子宮', '收縮']
      ],
      acuteModifiers: [
        '頻繁', '規律', '一直變硬', '持續變硬', '6次', '7次', '8次', '9次', '10次', '多次',
        '每10分鐘', '一小時', '1小時', '沒有改善', '沒改善', '像石頭', '一直', '持續'
      ],
      applicableWeeks: { min: 20, max: 36 } // Strictly <37 weeks
    },
    {
      recordId: 'MED-RED-FLAG-BACKACHE-HARDENING-001',
      category: 'pregnancy_red_flag',
      title: '持續腰痠與腹部變硬',
      symptomKeywords: [
        '腰痠', '腰酸', '背痛', ['腰', '痠'], ['腰', '酸']
      ],
      acuteModifiers: [
        '腹部變硬', '肚子變硬', '持續變硬', '肚子硬', '像石頭', '伴隨宮縮',
        ['肚子', '變硬'], ['腹部', '變硬'], ['肚子', '硬']
      ],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-RUPTURE-MEMBRANES-001',
      category: 'pregnancy_red_flag',
      title: '陰道持續流出水樣液體／疑似破水',
      symptomKeywords: [
        '破水', '漏水', '羊水流出', '水樣液體', '流出水', '清澈水樣', '漏羊水', '褲底濕一大片',
        ['羊水', '流出'], ['流出', '水樣'], ['陰道', '流水']
      ],
      acuteModifiers: [], // Immediate emergency evaluation
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-DECREASED-FETAL-MOVEMENT-001',
      category: 'pregnancy_red_flag',
      title: '胎動停止或比平常活動量少一半',
      symptomKeywords: [
        '胎動變少', '胎動減少', '沒有胎動', '胎動停止', '沒胎動', '胎動微弱', '胎動少', '感覺不到胎動', '少一半',
        ['胎動', '少'], ['胎動', '變少'], ['胎動', '減少'], ['胎動', '停止'], ['沒', '胎動'], ['沒有', '胎動']
      ],
      acuteModifiers: [], // Immediate evaluation
      applicableWeeks: { min: 20, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-SEVERE-HEADACHE-001',
      category: 'pregnancy_red_flag',
      title: '持續或劇烈頭痛',
      symptomKeywords: [
        '頭痛', '偏頭痛', ['頭', '痛']
      ],
      acuteModifiers: [
        '持續', '劇烈', '劇痛', '一直痛', '無法緩解', '嚴重', '沒改善', '伴隨視力模糊', '一直'
      ],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-BLURRED-VISION-001',
      category: 'pregnancy_red_flag',
      title: '視力模糊',
      symptomKeywords: [
        '視力模糊', '看東西模糊', '閃光', '複視', '眼前黑點', '眼前閃爍',
        ['視力', '模糊'], ['看不', '清楚'], ['眼睛', '花']
      ],
      acuteModifiers: [],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-FACE-HAND-SWELLING-001',
      category: 'pregnancy_red_flag',
      title: '臉部與手部浮腫',
      symptomKeywords: [
        '手部浮腫', '臉部浮腫', '臉腫', '手腫', '眼皮浮腫', '戒指卡住', '手發腫',
        ['臉', '浮腫'], ['手', '浮腫'], ['臉部', '腫'], ['手部', '腫']
      ],
      acuteModifiers: [],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-FEVER-CHILLS-001',
      category: 'pregnancy_red_flag',
      title: '突然發冷發熱',
      symptomKeywords: [
        '發燒', '發冷發熱', '發熱', '畏寒', '寒顫', '發抖', '體溫超過38',
        ['發冷', '發熱'], ['畏寒', '發燒'], ['突發', '高燒']
      ],
      acuteModifiers: [
        '突發', '突然', '高燒', '畏寒', '發冷', '寒顫'
      ],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-SEVERE-VOMITING-001',
      category: 'pregnancy_red_flag',
      title: '持續或嚴重噁心／嘔吐',
      symptomKeywords: [
        '孕吐', '嘔吐', '吐'
      ],
      acuteModifiers: [
        '嚴重', '劇烈', '無法進食', '無法喝水', '脫水', '吃什麼吐什麼', '連水都喝不下', '持續不退', '一直吐'
      ],
      applicableWeeks: { min: 1, max: 42 }
    },
    {
      recordId: 'MED-RED-FLAG-URINARY-CHANGE-001',
      category: 'pregnancy_red_flag',
      title: '尿量明顯減少或排尿疼痛／灼熱',
      symptomKeywords: [
        '排尿疼痛', '解尿灼熱', '小便痛', '尿量減少', '排尿刺痛',
        ['排尿', '痛'], ['解尿', '痛'], ['小便', '痛'], ['尿量', '減少']
      ],
      acuteModifiers: [
        '劇痛', '灼熱', '明顯減少', '尿不出來', '血尿'
      ],
      applicableWeeks: { min: 1, max: 42 }
    }
  ];

  /**
   * General non-acute symptom keywords that trigger CAUTION level
   */
  const CAUTION_SYMPTOM_KEYWORDS = [
    '下腹痛', '腹痛', '肚子痛', '頭痛', '頭暈', '孕吐', '噁心', '頻尿',
    '便祕', '便秘', '水腫', '恥骨痛', '腰痠', '背痛', '抽筋', '小腿抽筋',
    '失眠', '脹氣', '皮膚癢', '牙齦流血', '痔瘡', '肚子悶',
    ['肚子', '痛'], ['下腹', '痛'], ['腰', '痠'], ['頭', '痛'], ['頭', '暈']
  ];

  /**
   * Ambiguous or non-specific physical discomfort keywords that trigger NEEDS_CLARIFICATION
   */
  const AMBIGUOUS_SYMPTOM_KEYWORDS = [
    '怪怪的', '不舒服', '不適', '不太對勁', '不對勁', '難受', '痛痛的',
    '怪怪', '卡卡的', '悶悶的', '脹脹的', '酸酸的', '熱熱的', '怪異',
    ['肚子', '怪'], ['身體', '不舒服'], ['下面', '怪'], ['頭', '怪'], ['感覺', '怪'],
    ['有點', '痛'], ['有點', '怪']
  ];

  /**
   * Medication query keywords
   */
  const MEDICATION_KEYWORDS = [
    '藥', '成藥', '西藥', '中藥', '止痛藥', '感冒藥', '退燒藥', '瀉藥',
    '軟便劑', '抗生素', '消炎藥', '安胎藥', '胃藥', '普拿疼', 'medication', 'medicine'
  ];

  /**
   * Helper: Flexible matching for single string or array of co-occurring sub-tokens
   */
  function matchKeywords(text, list) {
    if (!text || !list || !list.length) return false;
    const lower = text.toLowerCase();
    return list.some(item => {
      if (Array.isArray(item)) {
        return item.every(sub => lower.includes(sub.toLowerCase()));
      }
      return lower.includes(item.toLowerCase());
    });
  }

  /**
   * Helper: Check if query contains medication references
   */
  function detectMedicationQuery(query) {
    if (!query || typeof query !== 'string') return false;
    return matchKeywords(query, MEDICATION_KEYWORDS);
  }

  /**
   * Main Safety Router Function
   * @param {string} query - Raw user query string
   * @param {object} retrievalResult - Output from searchMedicalKB()
   * @returns {object} Structured Safety Result
   */
  function routeMedicalSafety(query, retrievalResult) {
    const rawQuery = (query || '').trim();
    const lowerQuery = rawQuery.toLowerCase();
    const detectedWeek = extractWeek(rawQuery, (retrievalResult && retrievalResult.detectedWeek) || null);
    const medicationQueryDetected = detectMedicationQuery(rawQuery);
    const hasAmbiguousSymptom = matchKeywords(lowerQuery, AMBIGUOUS_SYMPTOM_KEYWORDS);

    const matchedSafetyRecords = [];
    const reasons = [];
    let safetyLevel = 'ROUTINE';
    let needsClarification = false;
    let clarificationReason = null;

    // 1. Evaluate Direct Red Flag Triggers against User Query
    RED_FLAG_TRIGGERS.forEach(trigger => {
      // Check week applicability if week is known
      if (detectedWeek !== null) {
        if (detectedWeek < trigger.applicableWeeks.min || detectedWeek > trigger.applicableWeeks.max) {
          return; // Skip if week is strictly outside applicable window (e.g. preterm warning at 40w)
        }
      }

      const hasSymptom = matchKeywords(lowerQuery, trigger.symptomKeywords);
      if (!hasSymptom) return;

      // Check if acute modifiers are required
      const requiresModifiers = trigger.acuteModifiers.length > 0;
      const hasAcuteModifier = requiresModifiers ? matchKeywords(lowerQuery, trigger.acuteModifiers) : true;

      if (hasAcuteModifier) {
        matchedSafetyRecords.push({
          id: trigger.recordId,
          category: trigger.category,
          title: trigger.title,
          matchedTriggers: [
            ...trigger.symptomKeywords.filter(kw => typeof kw === 'string' && lowerQuery.includes(kw.toLowerCase())),
            ...trigger.acuteModifiers.filter(mod => typeof mod === 'string' && lowerQuery.includes(mod.toLowerCase()))
          ]
        });

        reasons.push(`User query directly matches approved Red Flag trigger [${trigger.title}] with required acute criteria.`);
      }
    });

    // 2. Multi-Symptom Combination Escalation
    const hasAbdominalPain = matchKeywords(lowerQuery, ['下腹痛', '腹痛', '肚子痛', '腹部疼痛', ['肚子', '痛'], ['下腹', '痛']]);
    const hasBleeding = matchKeywords(lowerQuery, ['出血', '陰道出血', '流血', '見紅', '鮮血', '褐色分泌物', ['陰道', '出血']]);
    const hasContractions = matchKeywords(lowerQuery, ['宮縮', '肚子變硬', '腹部變硬', '肚子緊', ['肚子', '變硬'], ['腹部', '變硬'], ['肚子', '硬']]);

    // Combination A: Abdominal pain + Bleeding -> Escalate to URGENT
    if (hasAbdominalPain && hasBleeding) {
      if (!matchedSafetyRecords.some(r => r.id === 'MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001')) {
        matchedSafetyRecords.push({
          id: 'MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001',
          category: 'pregnancy_red_flag',
          title: '持續或劇烈腹痛 (合併出血)',
          matchedTriggers: ['下腹痛/腹痛', '陰道出血/出血']
        });
      }
      reasons.push('Combination trigger: Abdominal pain combined with vaginal bleeding requires immediate medical evaluation.');
    }

    // Combination B: Week 20-36 + Frequent/Persistent Contractions -> Escalate to URGENT
    if (detectedWeek !== null && detectedWeek >= 20 && detectedWeek < 37) {
      if (hasContractions && (matchKeywords(lowerQuery, ['一直', '頻繁', '次', '規律', '一小時', '1小時', '沒改善', '持續', '7次', '6次', '8次']))) {
        if (!matchedSafetyRecords.some(r => r.id === 'MED-PRETERM-SIGN-CONTRACTIONS-001')) {
          matchedSafetyRecords.push({
            id: 'MED-PRETERM-SIGN-CONTRACTIONS-001',
            category: 'preterm_labor_warning',
            title: '早產警訊：頻繁子宮收縮',
            matchedTriggers: ['20-36週宮縮/腹部變硬', '頻繁/持續收縮描述']
          });
        }
        reasons.push(`Combination trigger: Gestational week ${detectedWeek} with frequent/persistent uterine contractions matches preterm warning.`);
      }
    }

    // 3. Determine Safety Level & Clarification
    if (matchedSafetyRecords.length > 0) {
      safetyLevel = 'URGENT';
    } else if (hasAmbiguousSymptom) {
      // Ambiguous physical discomfort without acute triggers
      safetyLevel = 'CAUTION';
      needsClarification = true;
      clarificationReason = 'User description of physical discomfort is ambiguous or non-specific. Additional symptom location, frequency, and week context are needed.';
      reasons.push(clarificationReason);
    } else {
      // Check for standard CAUTION level:
      // A: Query mentions general non-acute pregnancy symptoms
      const hasCautionSymptom = matchKeywords(lowerQuery, CAUTION_SYMPTOM_KEYWORDS);
      // B: Top retrieval result contains pregnancy_symptom_requires_assessment or when_to_seek_care without acute trigger
      const topResults = (retrievalResult && retrievalResult.results) || [];
      const hasAssessmentRecord = topResults.some(r => 
        r.category === 'pregnancy_symptom_requires_assessment' ||
        r.category === 'common_pregnancy_discomfort' ||
        (r.record && r.record.content && r.record.content.when_to_seek_care)
      );

      if (hasCautionSymptom || hasAssessmentRecord || medicationQueryDetected) {
        safetyLevel = 'CAUTION';
        if (hasCautionSymptom) {
          reasons.push('User query mentions symptom requiring observation and when-to-seek-care guidance, but lacks acute escalation criteria.');
        }
        if (medicationQueryDetected) {
          reasons.push('Medication query detected. Maternal medication requires healthcare provider guidance.');
        }
        if (!hasCautionSymptom && hasAssessmentRecord) {
          reasons.push('Retrieval result includes symptom assessment references.');
        }
      } else {
        safetyLevel = 'ROUTINE';
        reasons.push('Routine prenatal guidance or information inquiry with no symptom or acute safety triggers.');
      }
    }

    // 4. Priority response flag: true for URGENT, and for CAUTION with active symptoms or clarification needs
    const requiresPriorityResponse = (safetyLevel === 'URGENT' || (safetyLevel === 'CAUTION' && (matchedSafetyRecords.length > 0 || needsClarification)));

    return {
      safetyLevel,
      needsClarification,
      clarificationReason,
      matchedSafetyRecords,
      detectedWeek,
      medicationQueryDetected,
      reasons,
      requiresPriorityResponse
    };
  }

  /**
   * Developer Test Suite for Safety Router
   */
  function testMedicalSafetyRouter() {
    let searchKB = (typeof global !== 'undefined' && global.searchMedicalKB) || null;
    if (!searchKB && typeof require !== 'undefined') {
      try {
        const path = require('path');
        const cand = [
          path.resolve(__dirname, 'medical-kb-retrieval.js'),
          path.resolve(__dirname, './medical-kb-retrieval.js'),
          path.resolve(process.cwd(), 'js/medical-kb-retrieval.js')
        ];
        for (const p of cand) {
          try {
            const retrievalModule = require(p);
            if (retrievalModule && retrievalModule.searchMedicalKB) {
              searchKB = retrievalModule.searchMedicalKB;
              break;
            }
          } catch(e){}
        }
      } catch (e) {}
    }

    const runRetrieval = (q, w) => {
      if (typeof searchKB === 'function') {
        return searchKB(q, w);
      }
      return { query: q, detectedWeek: w, results: [] };
    };

    const testCases = [
      {
        id: 'TEST_A',
        name: '20週下腹痛怎麼辦？ (No acute modifier -> CAUTION, not URGENT)',
        query: '20週下腹痛怎麼辦？',
        week: 20,
        expectedLevel: 'CAUTION',
        validate: (res) => res.safetyLevel === 'CAUTION' && res.matchedSafetyRecords.length === 0
      },
      {
        id: 'TEST_B',
        name: '20週下腹痛而且一直很痛沒有改善 (Acute modifier -> URGENT)',
        query: '20週下腹痛而且一直很痛沒有改善',
        week: 20,
        expectedLevel: 'URGENT',
        validate: (res) => res.safetyLevel === 'URGENT' && res.matchedSafetyRecords.some(r => r.id === 'MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001')
      },
      {
        id: 'TEST_C',
        name: '20週下腹痛而且有出血 (Combination Abdominal Pain + Bleeding -> URGENT)',
        query: '20週下腹痛而且有出血',
        week: 20,
        expectedLevel: 'URGENT',
        validate: (res) => res.safetyLevel === 'URGENT' && res.matchedSafetyRecords.length > 0
      },
      {
        id: 'TEST_D',
        name: '25週肚子一直變硬，一小時大概7次 (Preterm Contractions -> URGENT)',
        query: '25週肚子一直變硬，一小時大概7次',
        week: 25,
        expectedLevel: 'URGENT',
        validate: (res) => res.safetyLevel === 'URGENT' && res.matchedSafetyRecords.some(r => r.id === 'MED-PRETERM-SIGN-CONTRACTIONS-001')
      },
      {
        id: 'TEST_E',
        name: '最近胎動變少 (Decreased Fetal Movement -> URGENT)',
        query: '最近胎動變少',
        week: 28,
        expectedLevel: 'URGENT',
        validate: (res) => res.safetyLevel === 'URGENT' && res.matchedSafetyRecords.some(r => r.id === 'MED-RED-FLAG-DECREASED-FETAL-MOVEMENT-001')
      },
      {
        id: 'TEST_F',
        name: '孕期要補充葉酸嗎？ (Routine Nutrition -> ROUTINE)',
        query: '孕期要補充葉酸嗎？',
        week: 8,
        expectedLevel: 'ROUTINE',
        validate: (res) => res.safetyLevel === 'ROUTINE' && !res.medicationQueryDetected
      },
      {
        id: 'TEST_G',
        name: 'NIPT什麼時候做？ (Routine Screening -> ROUTINE)',
        query: 'NIPT什麼時候做？',
        week: 12,
        expectedLevel: 'ROUTINE',
        validate: (res) => res.safetyLevel === 'ROUTINE' && !res.medicationQueryDetected
      },
      {
        id: 'TEST_H',
        name: '孕婦感冒可以自己吃感冒藥嗎？ (Medication Query -> medicationQueryDetected: true)',
        query: '孕婦感冒可以自己吃感冒藥嗎？',
        week: 16,
        expectedLevel: 'CAUTION',
        validate: (res) => res.medicationQueryDetected === true && res.safetyLevel === 'CAUTION'
      }
    ];

    const results = testCases.map(tc => {
      const retRes = runRetrieval(tc.query, tc.week);
      const safetyRes = routeMedicalSafety(tc.query, retRes);
      const passed = tc.validate(safetyRes);
      return {
        id: tc.id,
        name: tc.name,
        passed,
        safetyLevel: safetyRes.safetyLevel,
        expectedLevel: tc.expectedLevel,
        matchedSafetyRecords: safetyRes.matchedSafetyRecords.map(r => r.id),
        medicationQueryDetected: safetyRes.medicationQueryDetected,
        reasons: safetyRes.reasons
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
  const MedicalSafetyRouter = {
    routeMedicalSafety,
    testMedicalSafetyRouter,
    RED_FLAG_TRIGGERS,
    detectMedicationQuery,
    extractWeek
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalSafetyRouter;
  }
  if (typeof global !== 'undefined') {
    global.MedicalSafetyRouter = MedicalSafetyRouter;
    global.routeMedicalSafety = routeMedicalSafety;
    global.testMedicalSafetyRouter = testMedicalSafetyRouter;
  }

})(typeof window !== 'undefined' ? window : globalThis);
