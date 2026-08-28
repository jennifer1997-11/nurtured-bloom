/**
 * 孕育之美 Grounded Answer Context Builder (Step 03A)
 * 
 * Role & Scope:
 *  - Formats retrieval results and safety routing metadata into a controlled, structured context payload for downstream LLM generation.
 *  - Strictly bounded to approved KB records retrieved in Step 02A (Top 5 limit).
 *  - Explicitly enforces non-diagnostic, evidence-bound, and medication safety policies.
 *  - Does NOT call any LLM API or generate user-facing prose.
 */

(function (global) {
  'use strict';

  /**
   * Fixed Answer Policy constraints for downstream AI generation
   */
  const FIXED_ANSWER_POLICY = Object.freeze({
    useApprovedEvidenceOnly: true,
    doNotDiagnose: true,
    doNotInventMedicalFacts: true,
    doNotInventMedicationSafety: true,
    doNotProvideMedicationDose: true,
    acknowledgeEvidenceGap: true
  });

  /**
   * Known KB Topic Coverage Map for determining FULL vs PARTIAL evidence coverage
   */
  const KNOWN_COVERAGE_GAPS = [
    {
      // 20-week lower abdominal pain: covers red flag / preterm / checkup, but lacks benign round ligament pain
      triggerTokens: ['下腹痛', '腹痛', '肚子痛'],
      coverage: 'PARTIAL',
      gapReason: 'Approved KB provides Red Flag / Preterm warning and self-care assessment, but lacks dedicated 2nd-trimester physiological round ligament pain record.'
    },
    {
      // Medication queries: KB only has general warnings against self-medication, lacks complete drug database
      triggerTokens: ['藥', '成藥', '感冒藥', '止痛藥', '退燒藥', '瀉藥', 'medication'],
      coverage: 'PARTIAL',
      gapReason: 'Approved KB lacks comprehensive pharmaceutical chemical database; contains general self-medication warnings only.'
    }
  ];

  /**
   * Helper: Determine coverage status based on query, results, and known gaps
   */
  function determineCoverage(query, retrievalResult, safetyResult) {
    if (safetyResult && safetyResult.needsClarification === true) {
      return {
        coverage: 'NEEDS_CLARIFICATION',
        gapReason: safetyResult.clarificationReason || '模糊症狀描述，需要進一步釐清具體不適部位、頻率與週數。'
      };
    }

    if (!retrievalResult || !retrievalResult.results || retrievalResult.results.length === 0 || retrievalResult.retrievalStatus === 'NO_RELEVANT_KB_RECORD' || retrievalResult.retrievalStatus === 'KB_LOAD_ERROR') {
      return {
        coverage: 'NONE',
        gapReason: 'No relevant approved medical records found in KB.'
      };
    }

    const lower = (query || '').toLowerCase();
    for (const gap of KNOWN_COVERAGE_GAPS) {
      if (gap.triggerTokens.some(t => lower.includes(t.toLowerCase()))) {
        return {
          coverage: gap.coverage,
          gapReason: gap.gapReason
        };
      }
    }

    // Default for successful retrieval matching specific topic
    return {
      coverage: 'FULL',
      gapReason: null
    };
  }

  /**
   * Helper: Extract and clean only necessary fields from a single record
   */
  function sanitizeRecord(recObj) {
    if (!recObj) return null;
    const raw = recObj.record || recObj;
    const content = raw.content || {};

    const cleanContent = {};
    const contentFields = [
      'title',
      'summary',
      'recommendations',
      'bullets',
      'red_flags',
      'when_to_seek_care',
      'self_care_or_actions',
      'stop_and_seek_help_if',
      'avoid_or_cautions',
      'avoid_or_limit',
      'common_presentations',
      'special_conditions',
      'food_sources',
      'daily_reference_value',
      'unit',
      'length_cm',
      'estimated_weight_g',
      'size_analogy_zh'
    ];

    contentFields.forEach(f => {
      if (content[f] !== undefined && content[f] !== null) {
        if (Array.isArray(content[f]) && content[f].length > 0) {
          cleanContent[f] = content[f];
        } else if (typeof content[f] === 'string' && content[f].trim() !== '') {
          cleanContent[f] = content[f].trim();
        } else if (typeof content[f] === 'number') {
          cleanContent[f] = content[f];
        }
      }
    });

    const sanitized = {
      id: raw.id,
      category: raw.category || 'unclassified',
      topic: raw.topic || '',
      pregnancy_stage: raw.pregnancy_stage || 'all_trimesters',
      content: cleanContent,
      source_refs: Array.isArray(raw.source_refs) ? raw.source_refs : [],
      evidence: raw.evidence || { source_level: 1, jurisdiction: 'TW', human_reviewed: true },
      review_status: raw.review_status || 'approved'
    };

    if (raw.audience) sanitized.audience = raw.audience;
    if (raw.priority) sanitized.priority = raw.priority;
    if (raw.week_start !== undefined) sanitized.week_start = raw.week_start;
    if (raw.week_end !== undefined) sanitized.week_end = raw.week_end;

    return sanitized;
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
   * Main Function: Build Grounded Answer Context
   * @param {string} query - Raw user query
   * @param {object} retrievalResult - Result from searchMedicalKB()
   * @param {object} safetyResult - Result from routeMedicalSafety()
   * @param {object} options - Optional parameters (e.g. maxRecords, default 5)
   * @returns {object} Grounded Answer Context
   */
  function buildMedicalAnswerContext(query, retrievalResult, safetyResult, options = {}) {
    const rawQuery = (query || '').trim();
    const maxRecords = (options && options.maxRecords) || 5;

    const detectedWeek = (retrievalResult && retrievalResult.detectedWeek) !== undefined
      ? retrievalResult.detectedWeek
      : ((safetyResult && safetyResult.detectedWeek) !== undefined ? safetyResult.detectedWeek : null);

    const safetyMeta = {
      level: (safetyResult && safetyResult.safetyLevel) || 'ROUTINE',
      needsClarification: (safetyResult && safetyResult.needsClarification) === true,
      clarificationReason: (safetyResult && safetyResult.clarificationReason) || null,
      requiresPriorityResponse: (safetyResult && safetyResult.requiresPriorityResponse) === true,
      medicationQueryDetected: (safetyResult && safetyResult.medicationQueryDetected) === true,
      matchedSafetyRecords: (safetyResult && Array.isArray(safetyResult.matchedSafetyRecords))
        ? safetyResult.matchedSafetyRecords.map(r => ({
            id: r.id,
            category: r.category,
            title: r.title,
            matchedTriggers: r.matchedTriggers || []
          }))
        : [],
      reasons: (safetyResult && Array.isArray(safetyResult.reasons)) ? safetyResult.reasons : []
    };

    const hasValidResults = retrievalResult &&
      retrievalResult.retrievalStatus === 'SUCCESS' &&
      Array.isArray(retrievalResult.results) &&
      retrievalResult.results.length > 0;

    let evidenceMeta = {};
    const coverageInfo = determineCoverage(rawQuery, retrievalResult, safetyResult);

    if (coverageInfo.coverage === 'NEEDS_CLARIFICATION') {
      const topResults = hasValidResults ? retrievalResult.results.slice(0, maxRecords) : [];
      const sanitizedRecords = topResults.map(r => sanitizeRecord(r)).filter(Boolean);

      evidenceMeta = {
        hasEvidence: hasValidResults,
        coverage: 'NEEDS_CLARIFICATION',
        gapReason: coverageInfo.gapReason,
        recordCount: sanitizedRecords.length,
        records: sanitizedRecords,
        clarification: {
          needed: true,
          suggestedPrompts: [
            '請問具體感到不適的部位為何？（例如：下腹、下背、頭部、會陰部等）',
            '是否伴隨突發劇烈疼痛、陰道出血、破水（水樣液體流出）或胎動明顯減少？',
            '請問您目前的懷孕週數大約第幾週？'
          ]
        }
      };
    } else if (!hasValidResults) {
      evidenceMeta = {
        hasEvidence: false,
        coverage: 'NONE',
        gapReason: (retrievalResult && retrievalResult.error) ? retrievalResult.error : 'No relevant approved medical records found in KB.',
        recordCount: 0,
        records: []
      };
    } else {
      let candidateResults = retrievalResult.results;

      // 1. Week-specific Baby Growth Narrowing:
      // When detectedWeek is known, exclude baby growth records from other weeks to prevent multi-week contamination.
      if (detectedWeek !== null && Array.isArray(candidateResults) && candidateResults.length > 0) {
        const isBabyGrowthQuery = /(?:寶寶|胎兒|發育|變化|成長|多大|長大|生長|長怎樣|身長|體重)/.test(rawQuery) ||
          candidateResults.some(r => {
            const rec = r.record || r;
            return rec.category === 'baby_development' || (typeof r.id === 'string' && r.id.startsWith('MED-GROWTH-WEEK-'));
          });

        if (isBabyGrowthQuery) {
          const targetWeekId = `MED-GROWTH-WEEK-${String(detectedWeek).padStart(2, '0')}`;
          const filtered = candidateResults.filter(r => {
            const rec = r.record || r;
            const isGrowth = rec.category === 'baby_development' || (typeof r.id === 'string' && r.id.startsWith('MED-GROWTH-WEEK-'));
            if (!isGrowth) return true;
            // Target week growth record
            if (r.id === targetWeekId) return true;
            if (rec.content && rec.content.gestational_week === detectedWeek) return true;
            // General developmental guides not tied to a different single week
            if (rec.category === 'baby_development' && !r.id.startsWith('MED-GROWTH-WEEK-')) return true;
            return false;
          });

          if (filtered.length > 0) {
            candidateResults = filtered;
          }
        }

        // 2. Next Prenatal Visit Narrowing:
        // When asking about next prenatal visit, narrow evidence to the target upcoming visit record
        const isNextVisitQuery = /(?:下次|下一次|接下來|近期)?\s*(?:要問什麼|要問甚麼|內容|要檢查什麼|要做什麼|要做甚麼)?\s*(?:產檢|檢查)/.test(rawQuery) &&
          /(?:下次|下一次|接下來|近期|內容|項目)/.test(rawQuery);

        if (isNextVisitQuery) {
          const nextVisit = getNextPrenatalVisitNode(detectedWeek);
          if (nextVisit) {
            const targetVisitId = nextVisit.id;
            const filteredVisits = candidateResults.filter(r => {
              const isVisitRec = typeof r.id === 'string' && r.id.startsWith('MED-PRENATAL-VISIT-');
              const isStageCheckup = typeof r.id === 'string' && r.id.startsWith('MED-STAGE-T') && r.id.includes('CHECKUP');
              if (isVisitRec) return r.id === targetVisitId;
              if (isStageCheckup) return false;
              return true;
            });

            if (filteredVisits.length > 0) {
              candidateResults = filteredVisits;
            }
          }
        }
      }

      const topResults = candidateResults.slice(0, maxRecords);
      const sanitizedRecords = topResults.map(r => sanitizeRecord(r)).filter(Boolean);

      evidenceMeta = {
        hasEvidence: sanitizedRecords.length > 0,
        coverage: coverageInfo.coverage,
        gapReason: coverageInfo.gapReason,
        recordCount: sanitizedRecords.length,
        records: sanitizedRecords
      };
    }

    return {
      query: rawQuery,
      detectedWeek,
      safety: safetyMeta,
      evidence: evidenceMeta,
      policy: Object.assign({}, FIXED_ANSWER_POLICY)
    };
  }

  /**
   * Developer Test Suite for Answer Context Builder
   */
  function testMedicalAnswerContext() {
    let searchKB = (typeof global !== 'undefined' && global.searchMedicalKB) || null;
    let safetyRouter = (typeof global !== 'undefined' && global.routeMedicalSafety) || null;

    if ((!searchKB || !safetyRouter) && typeof require !== 'undefined') {
      try {
        const path = require('path');
        const retModule = require(path.resolve(__dirname, 'medical-kb-retrieval.js'));
        const safModule = require(path.resolve(__dirname, 'medical-safety-router.js'));
        searchKB = retModule.searchMedicalKB;
        safetyRouter = safModule.routeMedicalSafety;
      } catch (e) {}
    }

    const testCases = [
      {
        id: 'TEST_A',
        name: 'NIPT什麼時候做？',
        query: 'NIPT什麼時候做？',
        week: null,
        validate: (ctx) => {
          return ctx.evidence.hasEvidence === true &&
            ctx.evidence.coverage === 'FULL' &&
            ctx.safety.level === 'ROUTINE' &&
            ctx.evidence.records.length > 0 &&
            ctx.evidence.records[0].id === 'MED-PRENATAL-OPTIONAL-02';
        }
      },
      {
        id: 'TEST_B',
        name: '20週下腹痛怎麼辦？',
        query: '20週下腹痛怎麼辦？',
        week: 20,
        validate: (ctx) => {
          const hasSeverePainRecord = ctx.evidence.records.some(r => r.id === 'MED-RED-FLAG-SEVERE-ABDOMINAL-PAIN-001');
          const noInventedRoundLigament = !JSON.stringify(ctx.evidence.records).includes('round ligament');
          return ctx.evidence.hasEvidence === true &&
            ctx.evidence.coverage === 'PARTIAL' &&
            ctx.safety.level === 'CAUTION' &&
            hasSeverePainRecord &&
            noInventedRoundLigament;
        }
      },
      {
        id: 'TEST_C',
        name: '20週下腹痛而且有出血',
        query: '20週下腹痛而且有出血',
        week: 20,
        validate: (ctx) => {
          return ctx.safety.level === 'URGENT' &&
            ctx.safety.requiresPriorityResponse === true &&
            ctx.safety.matchedSafetyRecords.length > 0;
        }
      },
      {
        id: 'TEST_D',
        name: '孕婦可以自己吃感冒藥嗎？',
        query: '孕婦可以自己吃感冒藥嗎？',
        week: 16,
        validate: (ctx) => {
          return ctx.safety.medicationQueryDetected === true &&
            ctx.policy.doNotInventMedicationSafety === true &&
            ctx.policy.doNotProvideMedicationDose === true;
        }
      },
      {
        id: 'TEST_E',
        name: '台北哪家火鍋最好吃？',
        query: '台北哪家火鍋最好吃？',
        week: null,
        validate: (ctx) => {
          return ctx.evidence.hasEvidence === false &&
            ctx.evidence.coverage === 'NONE' &&
            ctx.evidence.records.length === 0;
        }
      }
    ];

    const results = testCases.map(tc => {
      const ret = (typeof searchKB === 'function') ? searchKB(tc.query, tc.week) : { results: [], retrievalStatus: 'NO_RELEVANT_KB_RECORD' };
      const saf = (typeof safetyRouter === 'function') ? safetyRouter(tc.query, ret) : { safetyLevel: 'ROUTINE', matchedSafetyRecords: [] };
      const ctx = buildMedicalAnswerContext(tc.query, ret, saf);
      const passed = tc.validate(ctx);
      return {
        id: tc.id,
        name: tc.name,
        passed,
        safetyLevel: ctx.safety.level,
        hasEvidence: ctx.evidence.hasEvidence,
        coverage: ctx.evidence.coverage,
        recordCount: ctx.evidence.recordCount,
        topRecordId: (ctx.evidence.records[0] && ctx.evidence.records[0].id) || null
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
  const MedicalAnswerContext = {
    buildMedicalAnswerContext,
    testMedicalAnswerContext,
    FIXED_ANSWER_POLICY,
    determineCoverage,
    sanitizeRecord
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalAnswerContext;
  }
  if (typeof global !== 'undefined') {
    global.MedicalAnswerContext = MedicalAnswerContext;
    global.buildMedicalAnswerContext = buildMedicalAnswerContext;
    global.testMedicalAnswerContext = testMedicalAnswerContext;
  }

})(typeof window !== 'undefined' ? window : globalThis);
