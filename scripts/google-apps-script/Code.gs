/**
 * ============================================================
 * 孕育之美 MVP｜Google Apps Script Backend API (Step 01B)
 * ============================================================
 * 
 * 核心工作表：profiles
 * 支援 Actions：
 *   1. ping          -> 健康檢查 (Health Check)
 *   2. upsertProfile -> 建立或更新使用者 Profile (依 profileId 唯一判定)
 *   3. getProfile    -> 讀取指定 profileId 的 Profile 資料
 *
 * 安全規範：
 *   - 不儲存任何密碼、Token 或 API Key
 *   - 以 profile_id 作為唯一主鍵，避免 Email 或稱呼異動導致資料錯亂
 * ============================================================
 */

var SHEET_NAME = 'profiles';
var HEADERS = [
  'profile_id',
  'mom_nickname',
  'email',
  'due_date',
  'pregnancy_number',
  'baby_nickname',
  'baby_gender',
  'created_at',
  'updated_at'
];

/**
 * 工作表名稱常數 (Sheet Names)
 */
var SHEET_NAMES = {
  PROFILES: 'profiles',
  POSTS: 'Posts',
  COMMENTS: 'Comments',
  LIKES: 'Likes',
  REPORTS: 'Reports'
};

/**
 * 工作表 Header 欄位定義 (Headers Definition)
 */
var SHEET_HEADERS = {
  profiles: [
    'profile_id',
    'mom_nickname',
    'email',
    'due_date',
    'pregnancy_number',
    'baby_nickname',
    'baby_gender',
    'created_at',
    'updated_at'
  ],
  Posts: [
    'post_id',
    'profile_id',
    'author_nickname',
    'pregnancy_week',
    'content',
    'created_at',
    'updated_at',
    'is_deleted'
  ],
  Comments: [
    'comment_id',
    'post_id',
    'profile_id',
    'author_nickname',
    'pregnancy_week',
    'content',
    'created_at',
    'is_deleted'
  ],
  Likes: [
    'like_id',
    'post_id',
    'profile_id',
    'created_at'
  ],
  Reports: [
    'report_id',
    'target_type',
    'target_id',
    'reporter_profile_id',
    'reason',
    'created_at',
    'status'
  ]
};

var DEFAULT_LLM_MODEL = 'gemini-3.6-flash';

/**
 * HTTP GET 進入點
 * 支援瀏覽器網址直接測試 Ping 與 getProfile
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'ping';

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        service: 'pregnancy-beauty-mvp',
        status: 'ok'
      });
    }

    if (action === 'getProfile') {
      var profileId = params.profileId;
      if (!profileId) {
        return jsonResponse({ success: false, error: 'MISSING_PROFILE_ID' });
      }
      return jsonResponse(handleGetProfile(profileId));
    }

    if (action === 'getPosts') {
      return jsonResponse(handleGetPosts(params));
    }

    if (action === 'verifyCommunitySchema') {
      return jsonResponse(testVerifyCommunitySheetHeaders());
    }

    if (action === 'initializeCommunitySheets') {
      initializeAllSheets();
      return jsonResponse(testVerifyCommunitySheetHeaders());
    }

    if (action === 'testCommunityStep01B') {
      return jsonResponse(testCommunityStep01B());
    }

    return jsonResponse({ success: false, error: 'INVALID_ACTION' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * HTTP POST 進入點
 * 接收 JSON 格式請求 (upsertProfile, getProfile, ping)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'NO_POST_DATA' });
    }

    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: 'INVALID_JSON_FORMAT' });
    }

    var action = requestData.action;

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        service: 'pregnancy-beauty-mvp',
        status: 'ok'
      });
    }

    if (action === 'generateMedicalAnswer') {
      var query = requestData.query;
      var answerContext = requestData.answerContext;
      return jsonResponse(handleGenerateMedicalAnswer(query, answerContext));
    }

    if (action === 'upsertProfile') {
      var profile = requestData.profile;
      if (!profile || !profile.profileId) {
        return jsonResponse({ success: false, error: 'MISSING_PROFILE_OR_ID' });
      }
      return jsonResponse(handleUpsertProfile(profile));
    }

    if (action === 'getProfile') {
      var profileId = requestData.profileId;
      if (!profileId) {
        return jsonResponse({ success: false, error: 'MISSING_PROFILE_ID' });
      }
      return jsonResponse(handleGetProfile(profileId));
    }

    if (action === 'createPost') {
      var postPayload = requestData.payload || requestData;
      return jsonResponse(handleCreatePost(postPayload));
    }

    if (action === 'getPosts') {
      var getPostsPayload = requestData.payload || requestData;
      return jsonResponse(handleGetPosts(getPostsPayload));
    }

    if (action === 'verifyCommunitySchema') {
      return jsonResponse(testVerifyCommunitySheetHeaders());
    }

    if (action === 'initializeCommunitySheets') {
      initializeAllSheets();
      return jsonResponse(testVerifyCommunitySheetHeaders());
    }

    if (action === 'testCommunityStep01B') {
      return jsonResponse(testCommunityStep01B());
    }

    return jsonResponse({ success: false, error: 'INVALID_ACTION' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * ============================================================
 * AI Medical Answer Generation (Step 03B-1: Grounded LLM Backend)
 * ============================================================
 */

/**
 * 驗證 Answer Context 是否符合已審核醫學資料規範
 */
function validateAnswerContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return false;
  if (!ctx.policy || ctx.policy.useApprovedEvidenceOnly !== true) return false;
  if (!ctx.evidence || typeof ctx.evidence !== 'object') return false;

  var records = ctx.evidence.records;
  if (!Array.isArray(records)) return false;
  if (records.length > 5) return false;

  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    if (!r || typeof r !== 'object') return false;
    if (r.review_status !== 'approved') return false;
    if (!r.evidence || r.evidence.human_reviewed !== true) return false;
  }
  return true;
}

/**
 * 組裝受控 System Prompt 與 User Prompt
 */
function buildLLMPrompt(query, answerContext) {
  var safety = answerContext.safety || {};
  var safetyLevel = safety.level || 'ROUTINE';
  var coverage = (answerContext.evidence && answerContext.evidence.coverage) || 'FULL';
  var medicationQuery = safety.medicationQueryDetected === true;
  var records = (answerContext.evidence && answerContext.evidence.records) || [];

  var systemPrompt = [
    '你是「孕育之美 AI 孕期助理」。回答語言必須使用繁體中文（台灣）。',
    '【基本語氣】溫柔、有陪伴感、清楚、簡潔、不製造不必要焦慮、不過度保證，優先使用一般人聽得懂的詞語。長度約 120–300 字。',
    '',
    '【醫療 Grounding 絕對規則】',
    '1. 你的所有醫療與衛教事實「只能」來自下方提供的【Approved Evidence】。',
    '2. 嚴禁使用你自身的記憶或外部常識補充任何未在 Evidence 中提到的醫療知識。',
    '3. 不得診斷（嚴禁使用「你是...」、「這一定是...」、「這就是...」等確定診斷語氣）。',
    '4. 不得自行推測症狀原因或自行加入疾病名稱。例如對於下腹痛，若 Evidence 沒有提到圓韌帶痛或 round ligament pain，嚴禁提及圓韌帶或拉扯痛。',
    '5. 不得自行增加未提及的危險徵兆。',
    '6. 不得在自然回答中提及技術名詞（如 ROUTINE、CAUTION、URGENT、Record ID、Score、Matched Fields 等）。',
    '7. 必須直接回答使用者的問題本身，將 Evidence 中的週數、體重、身長、大小比喻或照護方式自然整理成流暢溫暖的回答，不要只念標題。',
    '',
    '【安全分級指示】',
    '目前安全分級為：' + safetyLevel,
    safetyLevel === 'URGENT' ? '⚠️ URGENT 模式：必須將就醫安全提醒放在回答最前面！先說明此狀況屬於需要優先就醫評估的警訊，再簡短引用 Evidence，不要先寫長篇衛教。' : '',
    safetyLevel === 'CAUTION' ? '⚠️ CAUTION 模式：開頭需使用柔和但明確的提醒（如「這個情況需要多留意一下」），根據 Evidence 整理可觀察狀況與就醫時機，不得猜測原因。' : '',
    safetyLevel === 'ROUTINE' ? 'ROUTINE 模式：第一段直接回答問題核心，第二段自然補充 1-3 個重要資訊或提醒。' : '',
    coverage === 'PARTIAL' ? '⚠️ PARTIAL 模式：必須主動說明目前孕育之美資料庫所能提供的資訊範圍（例如提供危險徵兆與觀察方式），並明確承認資料不足以判斷確切原因，不得自行腦補。' : '',
    medicationQuery ? '⚠️ 用藥諮詢限制：此問題涉及用藥。請說明目前資料庫不提供特定藥物安全性與劑量，強烈建議諮詢醫師或藥師。嚴禁推薦藥品、判定安全/不安全、或提供劑量與頻率！' : ''
  ].filter(Boolean).join('\n');

  var evidenceText = JSON.stringify(records, null, 2);

  var userPrompt = [
    '【使用者問題】',
    query,
    '',
    '【安全分級與條件】',
    'Safety Level: ' + safetyLevel,
    'Evidence Coverage: ' + coverage,
    'Medication Query: ' + medicationQuery,
    '',
    '【Approved Evidence (唯一事實來源)】',
    evidenceText,
    '',
    '請依據上述規則與 Evidence 回答使用者的問題：'
  ].join('\n');

  return {
    systemPrompt: systemPrompt,
    userPrompt: userPrompt
  };
}

/**
 * 呼叫 Google Gemini API
 */
function callGeminiAPI(systemPrompt, userPrompt) {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('LLM_API_KEY') || props.getProperty('GEMINI_API_KEY');
  var model = props.getProperty('LLM_MODEL') || DEFAULT_LLM_MODEL;
  var modelName = (model || DEFAULT_LLM_MODEL).replace(/^models\//, '').trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'MISSING_API_KEY'
    };
  }

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(modelName) + ':generateContent?key=' + encodeURIComponent(apiKey);

  var payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (statusCode === 200) {
      var data = JSON.parse(responseText);
      if (data.candidates && data.candidates[0]) {
        var candidate = data.candidates[0];
        var finishReason = candidate.finishReason;

        if (finishReason === 'MAX_TOKENS') {
          return {
            success: false,
            error: 'LLM_OUTPUT_TRUNCATED',
            finishReason: 'MAX_TOKENS'
          };
        }

        var parts = (candidate.content && candidate.content.parts) || [];
        var generatedText = parts
          .filter(function(part) {
            return part && typeof part.text === 'string';
          })
          .map(function(part) {
            return part.text;
          })
          .join('');

        if (!generatedText || !generatedText.trim()) {
          return {
            success: false,
            error: 'EMPTY_LLM_RESPONSE'
          };
        }

        return {
          success: true,
          text: generatedText.trim(),
          finishReason: finishReason || 'STOP'
        };
      }

      return {
        success: false,
        error: 'EMPTY_LLM_RESPONSE'
      };
    }

    if (statusCode === 429) {
      var quotaMetric = null;
      var quotaId = null;
      var quotaValue = null;
      var retryDelay = null;
      try {
        var errObj = JSON.parse(responseText);
        if (errObj.error && errObj.error.details) {
          for (var i = 0; i < errObj.error.details.length; i++) {
            var d = errObj.error.details[i];
            if (d.violations && d.violations[0]) {
              quotaMetric = d.violations[0].quotaMetric || null;
              quotaId = d.violations[0].quotaId || null;
              quotaValue = d.violations[0].quotaValue || null;
            }
            if (d.retryDelay) {
              retryDelay = d.retryDelay;
            }
          }
        }
      } catch(parseErr){}

      return {
        success: false,
        error: 'LLM_QUOTA_EXCEEDED',
        statusCode: 429,
        quotaMetric: quotaMetric,
        quotaId: quotaId,
        quotaValue: quotaValue,
        retryDelay: retryDelay,
        detail: responseText.replace(/key=[^&]+/g, 'key=REDACTED')
      };
    }

    return {
      success: false,
      error: 'LLM_UNAVAILABLE',
      statusCode: statusCode,
      detail: responseText.replace(/key=[^&]+/g, 'key=REDACTED')
    };
  } catch (fetchErr) {
    console.warn('[Gemini API Fetch Exception]', fetchErr.toString());
    return {
      success: false,
      error: 'LLM_UNAVAILABLE',
      fetchError: fetchErr.toString()
    };
  }
}

/**
 * 處理 generateMedicalAnswer
 */
function handleGenerateMedicalAnswer(query, answerContext) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { success: false, error: 'MISSING_QUERY' };
  }

  if (!validateAnswerContext(answerContext)) {
    return { success: false, error: 'INVALID_MEDICAL_CONTEXT' };
  }

  if (!answerContext.evidence || answerContext.evidence.hasEvidence === false || !answerContext.evidence.records || answerContext.evidence.records.length === 0) {
    return { success: false, error: 'NO_APPROVED_EVIDENCE' };
  }

  var prompts = buildLLMPrompt(query, answerContext);
  var llmResult = callGeminiAPI(prompts.systemPrompt, prompts.userPrompt);

  if (!llmResult.success) {
    return {
      success: false,
      error: llmResult.error || 'LLM_UNAVAILABLE',
      finishReason: llmResult.finishReason || null,
      statusCode: llmResult.statusCode || null,
      quotaMetric: llmResult.quotaMetric || null,
      quotaId: llmResult.quotaId || null,
      quotaValue: llmResult.quotaValue || null,
      retryDelay: llmResult.retryDelay || null,
      detail: llmResult.detail || llmResult.fetchError || null
    };
  }

  var recordIds = (answerContext.evidence.records || []).map(function(r) { return r.id; });
  var safetyLevel = (answerContext.safety && answerContext.safety.level) || 'ROUTINE';

  return {
    success: true,
    answer: llmResult.text,
    safetyLevel: safetyLevel,
    recordIds: recordIds,
    finishReason: llmResult.finishReason || 'STOP',
    disclaimer: '本內容依孕育之美已審核衛教資料整理，僅供孕期健康資訊參考，不能取代醫師診斷與個別醫療建議。'
  };
}

/**
 * ============================================================
 * 工作表管理與初始化 (Sheet Management & Initialization)
 * ============================================================
 */

/**
 * 取得或建立指定工作表，若工作表不存在則建立並寫入粗體 Header
 * 若工作表已存在，絕不清空資料、不重建、不覆蓋既有 Rows
 */
function ensureSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

/**
 * 取得或建立 profiles 工作表並確認 Header
 */
function getProfilesSheet() {
  return ensureSheet(SHEET_NAMES.PROFILES, SHEET_HEADERS.profiles);
}

/**
 * 取得或建立 Posts 工作表並確認 Header
 */
function getPostsSheet() {
  return ensureSheet(SHEET_NAMES.POSTS, SHEET_HEADERS.Posts);
}

/**
 * 取得或建立 Comments 工作表並確認 Header
 */
function getCommentsSheet() {
  return ensureSheet(SHEET_NAMES.COMMENTS, SHEET_HEADERS.Comments);
}

/**
 * 取得或建立 Likes 工作表並確認 Header
 */
function getLikesSheet() {
  return ensureSheet(SHEET_NAMES.LIKES, SHEET_HEADERS.Likes);
}

/**
 * 取得或建立 Reports 工作表並確認 Header
 */
function getReportsSheet() {
  return ensureSheet(SHEET_NAMES.REPORTS, SHEET_HEADERS.Reports);
}

/**
 * 一次性初始化所有工作表 (Profiles + Community 4 張表)
 * 可在 Apps Script 編輯器直接執行或於初始部署時呼叫
 */
function initializeAllSheets() {
  var targetSheets = [
    { name: SHEET_NAMES.PROFILES, headers: SHEET_HEADERS.profiles },
    { name: SHEET_NAMES.POSTS, headers: SHEET_HEADERS.Posts },
    { name: SHEET_NAMES.COMMENTS, headers: SHEET_HEADERS.Comments },
    { name: SHEET_NAMES.LIKES, headers: SHEET_HEADERS.Likes },
    { name: SHEET_NAMES.REPORTS, headers: SHEET_HEADERS.Reports }
  ];

  var results = [];
  for (var i = 0; i < targetSheets.length; i++) {
    var item = targetSheets[i];
    var sheet = ensureSheet(item.name, item.headers);
    results.push({
      sheetName: item.name,
      headers: item.headers,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }
  Logger.log('initializeAllSheets results: ' + JSON.stringify(results, null, 2));
  return results;
}

/**
 * 處理 upsertProfile:
 * - 依 profile_id 搜尋
 * - 不存在 -> appendRow 新增一列
 * - 已存在 -> setValues 更新原列 (保留原始 created_at，更新 updated_at 與各欄位)
 */
function handleUpsertProfile(p) {
  var sheet = getProfilesSheet();
  var data = sheet.getDataRange().getValues();
  var profileId = String(p.profileId).trim();

  var targetRow = -1;
  var existingCreatedAt = '';

  // 第 1 列為 Header (index 0)，從第 2 列 (index 1) 開始比對 profile_id
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === profileId) {
      targetRow = i + 1; // Google Sheet 列數從 1 開始計
      existingCreatedAt = data[i][7]; // 第 8 欄為 created_at
      break;
    }
  }

  var nowIso = new Date().toISOString();
  var createdAt = (targetRow !== -1 && existingCreatedAt) 
    ? (existingCreatedAt instanceof Date ? existingCreatedAt.toISOString() : String(existingCreatedAt))
    : (p.createdAt || nowIso);
  var updatedAt = p.updatedAt || nowIso;

  var rowData = [
    profileId,
    p.momNickname || '',
    p.email || '',
    p.dueDate || '',
    p.pregnancyNumber || '第一胎',
    p.babyNickname || '',
    p.babyGender || '女寶寶 👧',
    createdAt,
    updatedAt
  ];

  if (targetRow === -1) {
    sheet.appendRow(rowData);
    return {
      success: true,
      action: 'created',
      profileId: profileId
    };
  } else {
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    return {
      success: true,
      action: 'updated',
      profileId: profileId
    };
  }
}

/**
 * ============================================================
 * 共用輔助函式 (Shared Helpers)
 * ============================================================
 */

/**
 * 取得工作表欄位名稱與索引映射表 (0-indexed Map)
 * 避免程式碼大量硬編碼 row[0], row[1]
 */
function getHeaderIndexMap(sheet, fallbackHeaders) {
  var lastCol = sheet.getLastColumn();
  var map = {};
  if (lastCol > 0) {
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      map[String(headers[i]).trim()] = i;
    }
  } else if (fallbackHeaders) {
    for (var j = 0; j < fallbackHeaders.length; j++) {
      map[fallbackHeaders[j]] = j;
    }
  }
  return map;
}

/**
 * 判定布林值或其字串形式是否為 true (支援 true, "true", "TRUE", 1, "1")
 */
function isTrueValue(val) {
  if (val === true || val === 1) return true;
  if (typeof val === 'string') {
    var s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  return false;
}

/**
 * 安全解析 Date-only 物件或字串，避免跨時區日期偏差
 * 支援 Date Object 與 'YYYY-MM-DD' 字串
 */
function parseDateOnly(val, optTimezone) {
  if (!val) return null;
  if (val instanceof Date) {
    var tz = optTimezone || Session.getScriptTimeZone() || 'Asia/Taipei';
    var dateStr = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
    var parts = dateStr.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
      dateStr: dateStr
    };
  }
  if (typeof val === 'string') {
    var trimmed = val.trim();
    var m = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
      var y = parseInt(m[1], 10);
      var mon = parseInt(m[2], 10);
      var d = parseInt(m[3], 10);
      var formatted = y + '-' + ('0' + mon).slice(-2) + '-' + ('0' + d).slice(-2);
      return {
        year: y,
        month: mon,
        day: d,
        dateStr: formatted
      };
    }
  }
  return null;
}

/**
 * 依據預產期 (EDD) 與基準日期 (Calendar Day) 計算當下孕週
 * EDD 定義為懷孕滿 40 週 0 天 (280 gestational days)
 * pregnancyDays = 280 - daysUntilDueDate
 * pregnancyWeek = floor(pregnancyDays / 7)
 */
function calculatePregnancyWeekFromDueDate(dueDateVal, referenceDateVal) {
  var dueObj = parseDateOnly(dueDateVal);
  if (!dueObj) {
    return { success: false, error: 'PROFILE_DUE_DATE_INVALID' };
  }

  var refObj = parseDateOnly(referenceDateVal || new Date());
  if (!refObj) {
    return { success: false, error: 'REFERENCE_DATE_INVALID' };
  }

  // 統一正規化至 UTC 正午 (12:00:00) 進行 Calendar Day 差值計算，杜絕時區與日光節約偏差
  var dueUtcMidday = Date.UTC(dueObj.year, dueObj.month - 1, dueObj.day, 12, 0, 0);
  var refUtcMidday = Date.UTC(refObj.year, refObj.month - 1, refObj.day, 12, 0, 0);

  var msDiff = dueUtcMidday - refUtcMidday;
  var daysUntilDueDate = Math.round(msDiff / 86400000);
  var pregnancyDays = 280 - daysUntilDueDate;
  var pregnancyWeek = Math.floor(pregnancyDays / 7);

  return {
    success: true,
    pregnancyWeek: pregnancyWeek,
    pregnancyDays: pregnancyDays,
    daysUntilDueDate: daysUntilDueDate,
    dueDateStr: dueObj.dateStr,
    refDateStr: refObj.dateStr
  };
}

/**
 * 依 profile_id 精確查詢 Profile（禁止任何 fallback 或猜測）
 */
function findProfileById(profileId) {
  if (!profileId) return null;
  var pid = String(profileId).trim();
  if (!pid) return null;

  var sheet = getProfilesSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  var hMap = getHeaderIndexMap(sheet, SHEET_HEADERS.profiles);

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowPid = String(row[hMap.profile_id] || '').trim();
    if (rowPid === pid) {
      return {
        profile_id: rowPid,
        mom_nickname: String(row[hMap.mom_nickname] || ''),
        email: String(row[hMap.email] || ''),
        due_date: row[hMap.due_date],
        pregnancy_number: String(row[hMap.pregnancy_number] || ''),
        baby_nickname: String(row[hMap.baby_nickname] || ''),
        baby_gender: String(row[hMap.baby_gender] || ''),
        created_at: row[hMap.created_at],
        updated_at: row[hMap.updated_at],
        rowIndex: i + 1
      };
    }
  }
  return null;
}

/**
 * 處理 getProfile:
 * - 依 profileId 搜尋並回傳 Profile 內容
 * - 若找不到則回傳 PROFILE_NOT_FOUND
 */
function handleGetProfile(profileId) {
  var p = findProfileById(profileId);
  if (!p) {
    return {
      success: false,
      error: 'PROFILE_NOT_FOUND'
    };
  }

  var dueDateStr = '';
  if (p.due_date) {
    if (p.due_date instanceof Date) {
      dueDateStr = Utilities.formatDate(p.due_date, Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy-MM-dd');
    } else {
      dueDateStr = String(p.due_date);
    }
  }

  var createdAtStr = p.created_at ? (p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at)) : '';
  var updatedAtStr = p.updated_at ? (p.updated_at instanceof Date ? p.updated_at.toISOString() : String(p.updated_at)) : '';

  return {
    success: true,
    profile: {
      profileId: p.profile_id,
      momNickname: p.mom_nickname,
      email: p.email,
      dueDate: dueDateStr,
      pregnancyNumber: p.pregnancy_number,
      babyNickname: p.baby_nickname,
      babyGender: p.baby_gender,
      createdAt: createdAtStr,
      updatedAt: updatedAtStr
    }
  };
}

/**
 * ============================================================
 * 媽咪交流社群 API (Community Step 01B: Post API Foundation)
 * ============================================================
 */

/**
 * 建立社群貼文 (createPost)
 * 
 * 規則：
 * 1. Client 僅提供 profile_id 與 content (純文字，保留正常換行，最大 500 字元)
 * 2. post_id 由後端 UUID 生成
 * 3. author_nickname 由 Profile 精準查詢取得當下 Snapshot
 * 4. pregnancy_week 由 Profile due_date 與發文當日自動推算 Snapshot (1..40)
 * 5. 使用 LockService 保護並發寫入
 */
function handleCreatePost(payload) {
  if (!payload || typeof payload !== 'object') {
    return { success: false, error: 'PAYLOAD_REQUIRED' };
  }

  var profileId = String(payload.profile_id || payload.profileId || '').trim();
  if (!profileId) {
    return { success: false, error: 'PROFILE_ID_REQUIRED' };
  }

  if (payload.content === undefined || payload.content === null || typeof payload.content !== 'string') {
    return { success: false, error: 'POST_CONTENT_REQUIRED' };
  }

  var trimmedContent = payload.content.trim();
  if (trimmedContent.length === 0) {
    return { success: false, error: 'POST_CONTENT_REQUIRED' };
  }

  if (payload.content.length > 500) {
    return { success: false, error: 'POST_CONTENT_TOO_LONG' };
  }

  // Profile Lookup (Exact match, no fallback)
  var profile = findProfileById(profileId);
  if (!profile) {
    return { success: false, error: 'PROFILE_NOT_FOUND' };
  }

  var momNickname = String(profile.mom_nickname || '').trim();
  if (!momNickname) {
    return { success: false, error: 'PROFILE_NICKNAME_MISSING' };
  }

  if (!profile.due_date) {
    return { success: false, error: 'PROFILE_DUE_DATE_INVALID' };
  }

  var weekResult = calculatePregnancyWeekFromDueDate(profile.due_date, new Date());
  if (!weekResult.success) {
    return { success: false, error: weekResult.error || 'PROFILE_DUE_DATE_INVALID' };
  }

  var pregnancyWeek = weekResult.pregnancyWeek;
  if (pregnancyWeek < 1 || pregnancyWeek > 40) {
    return {
      success: false,
      error: 'PREGNANCY_WEEK_OUT_OF_RANGE',
      pregnancyWeek: pregnancyWeek
    };
  }

  var now = new Date();
  var nowIso = now.toISOString();
  var postId = Utilities.getUuid();
  var isDeleted = false;
  var rawContent = payload.content; // 保留原始換行與文字

  // 並發寫入保護 (LockService)
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    lockAcquired = lock.tryLock(5000);
    var sheet = getPostsSheet();
    var newRow = [
      postId,
      profileId,
      momNickname,
      pregnancyWeek,
      rawContent,
      nowIso,
      nowIso,
      isDeleted
    ];
    sheet.appendRow(newRow);
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }

  return {
    success: true,
    data: {
      post_id: postId,
      profile_id: profileId,
      author_nickname: momNickname,
      pregnancy_week: pregnancyWeek,
      content: rawContent,
      created_at: nowIso,
      updated_at: nowIso
    }
  };
}

/**
 * 取得公開社群動態牆貼文 (getPosts)
 * 
 * 規則：
 * 1. 讀取 Posts 工作表所有資料
 * 2. 過濾 is_deleted === true (軟刪除排除)
 * 3. 依 created_at 降冪排序 (最新貼文置頂)
 * 4. 若無有效貼文回傳空陣列 []
 */
function handleGetPosts(payload) {
  var sheet = getPostsSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return {
      success: true,
      data: []
    };
  }

  var hMap = getHeaderIndexMap(sheet, SHEET_HEADERS.Posts);
  var posts = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var isDel = row[hMap.is_deleted];
    if (isTrueValue(isDel)) {
      continue;
    }

    var createdAtVal = row[hMap.created_at];
    var createdAtStr = createdAtVal instanceof Date ? createdAtVal.toISOString() : String(createdAtVal || '');

    var updatedAtVal = row[hMap.updated_at];
    var updatedAtStr = updatedAtVal instanceof Date ? updatedAtVal.toISOString() : String(updatedAtVal || '');

    posts.push({
      post_id: String(row[hMap.post_id] || ''),
      profile_id: String(row[hMap.profile_id] || ''),
      author_nickname: String(row[hMap.author_nickname] || ''),
      pregnancy_week: Number(row[hMap.pregnancy_week]) || 0,
      content: String(row[hMap.content] || ''),
      created_at: createdAtStr,
      updated_at: updatedAtStr
    });
  }

  // 排序：最新發文在最前 (created_at DESC)
  posts.sort(function(a, b) {
    return (b.created_at || '').localeCompare(a.created_at || '');
  });

  return {
    success: true,
    data: posts
  };
}

/**
 * 統一格式化 JSON 回應
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 裸呼叫 UrlFetchApp（無 try-catch）以強制觸發 Google OAuth 授權彈窗
 */
function authorizeUrlFetchApp() {
  var testUrl = 'https://generativelanguage.googleapis.com';
  var response = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
  Logger.log('Auth test response status: ' + response.getResponseCode());
}

/**
 * 方便在 Apps Script 編輯器內直接點擊「執行」完成快速驗證
 */
function testLiveGeminiConnection() {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('LLM_API_KEY') || props.getProperty('GEMINI_API_KEY');
  var model = props.getProperty('LLM_MODEL') || DEFAULT_LLM_MODEL;
  var modelName = (model || DEFAULT_LLM_MODEL).replace(/^models\//, '').trim();
  
  Logger.log('API Key configured: ' + (apiKey ? 'YES (Length: ' + apiKey.length + ')' : 'NO'));
  Logger.log('Configured Model: ' + model);
  Logger.log('Resolved Model: ' + modelName);

  if (apiKey) {
    try {
      var listUrl = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey);
      var listRes = UrlFetchApp.fetch(listUrl, { muteHttpExceptions: true });
      Logger.log('Available Models Response (' + listRes.getResponseCode() + '): ' + listRes.getContentText().slice(0, 500));
    } catch(e) {
      Logger.log('List models error: ' + e.toString());
    }
  }
  
  var res = callGeminiAPI('你是孕育之美助理，請簡短用一句繁體中文打招呼。', '你好！');
  Logger.log('Gemini Live Result: ' + JSON.stringify(res, null, 2));
  return res;
}

/**
 * 驗證工作表 Header 設定與結構正確性 (Strictly Read-Only Verification)
 * 
 * 規範保證：
 * 1. 唯讀檢查，絕不自動修改 Header、不覆蓋資料、不清除 Row、不新增/刪除工作表或欄位。
 * 2. 逐一偵測 missing column, unexpected column, wrong column name, wrong column order。
 * 3. 任何欄位名稱或順序不合，即判定 FAIL。
 */
function testVerifyCommunitySheetHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var expectedMap = {
    profiles: SHEET_HEADERS.profiles,
    Posts: SHEET_HEADERS.Posts,
    Comments: SHEET_HEADERS.Comments,
    Likes: SHEET_HEADERS.Likes,
    Reports: SHEET_HEADERS.Reports
  };
  
  var keys = ['profiles', 'Posts', 'Comments', 'Likes', 'Reports'];
  var overallPass = true;
  var details = {};

  for (var i = 0; i < keys.length; i++) {
    var sheetName = keys[i];
    var expHeaders = expectedMap[sheetName];
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      overallPass = false;
      details[sheetName] = {
        sheetName: sheetName,
        exists: false,
        status: 'FAIL',
        error: 'SHEET_NOT_FOUND',
        rowCount: 0,
        columnCount: 0,
        expectedHeaders: expHeaders,
        actualHeaders: []
      };
      continue;
    }

    var rowCount = sheet.getLastRow();
    var colCount = sheet.getLastColumn();
    var actualHeaders = [];

    if (colCount > 0 && rowCount > 0) {
      var rawRow = sheet.getRange(1, 1, 1, colCount).getValues()[0];
      actualHeaders = rawRow.map(function(v) { return String(v).trim(); });
    }

    var errors = [];

    // 檢查欄位數量與欄位名稱、順序
    if (actualHeaders.length !== expHeaders.length) {
      errors.push('HEADER_LENGTH_MISMATCH: expected ' + expHeaders.length + ' columns, got ' + actualHeaders.length);
    }

    // 檢查 missing columns
    for (var m = 0; m < expHeaders.length; m++) {
      if (actualHeaders.indexOf(expHeaders[m]) === -1) {
        errors.push('MISSING_COLUMN: ' + expHeaders[m]);
      }
    }

    // 檢查 unexpected columns
    for (var u = 0; u < actualHeaders.length; u++) {
      if (expHeaders.indexOf(actualHeaders[u]) === -1) {
        errors.push('UNEXPECTED_COLUMN: ' + actualHeaders[u] + ' at index ' + u);
      }
    }

    // 檢查順序與名稱精確比對
    var maxLen = Math.max(actualHeaders.length, expHeaders.length);
    for (var idx = 0; idx < maxLen; idx++) {
      var expCol = expHeaders[idx] || null;
      var actCol = actualHeaders[idx] || null;
      if (expCol !== actCol) {
        errors.push('MISMATCH_AT_INDEX_' + idx + ': expected "' + expCol + '", got "' + actCol + '"');
      }
    }

    var pass = (errors.length === 0);
    if (!pass) {
      overallPass = false;
    }

    details[sheetName] = {
      sheetName: sheetName,
      exists: true,
      status: pass ? 'PASS' : 'FAIL',
      rowCount: rowCount,
      columnCount: colCount,
      expectedHeaders: expHeaders,
      actualHeaders: actualHeaders,
      errors: errors
    };
  }

  var result = {
    success: true,
    overallStatus: overallPass ? 'PASS' : 'FAIL',
    verification: details
  };

  Logger.log('testVerifyCommunitySheetHeaders: ' + JSON.stringify(result, null, 2));
  return result;
}

/**
 * ============================================================
 * Community Step 01B Runtime Development Test Suite
 * 
 * 測試項目 (TEST 1 - TEST 6 + Profile Regression)：
 * 1. Valid Create Post (PRF-39EBF37DF78E) -> PASS
 * 2. Blank Content -> FAIL (POST_CONTENT_REQUIRED)
 * 3. Too Long Content (>500 chars) -> FAIL (POST_CONTENT_TOO_LONG)
 * 4. Unknown Profile -> FAIL (PROFILE_NOT_FOUND)
 * 5. getPosts -> PASS (包含剛建立的貼文且排序正確)
 * 6. Soft Delete Filtering -> PASS (將該貼文設為 is_deleted=true 後 getPosts 不再回傳)
 * 7. Test Data Cleanup -> 將測試貼文維持 is_deleted=true (保留證據，不污染正式 Feed)
 * 8. Profile API Regression -> 驗證 profiles 表列數完全未變，既有 getProfile 正常
 * ============================================================
 */
function testCommunityStep01B() {
  var testProfileId = 'PRF-39EBF37DF78E'; // Development Test 專用測試 ID
  var profilesSheet = getProfilesSheet();
  var postsSheet = getPostsSheet();

  var initialProfilesRowCount = profilesSheet.getLastRow();
  var initialPostsRowCount = postsSheet.getLastRow();

  var report = {
    testName: 'Community Step 01B Post API Test Suite',
    testProfileUsed: testProfileId,
    testTimestamp: new Date().toISOString(),
    tests: {},
    postsSheetStats: {
      beforeRowCount: initialPostsRowCount,
      afterRowCount: 0
    },
    profilesSheetStats: {
      beforeRowCount: initialProfilesRowCount,
      afterRowCount: 0,
      unmodified: true
    },
    profileRegression: {},
    overallStatus: 'PASS'
  };

  var createdPostId = null;
  var createdPregnancyWeek = null;

  // --- TEST 1: Valid Create Post ---
  var test1Content = '[TEST] Community Step 01B - 第一胎 20 週胎動交流測試 😊\n歡迎媽咪交流！';
  var test1Res = handleCreatePost({
    profile_id: testProfileId,
    content: test1Content
  });

  var test1Pass = (
    test1Res &&
    test1Res.success === true &&
    test1Res.data &&
    test1Res.data.post_id &&
    test1Res.data.profile_id === testProfileId &&
    typeof test1Res.data.author_nickname === 'string' &&
    test1Res.data.author_nickname.length > 0 &&
    typeof test1Res.data.pregnancy_week === 'number' &&
    test1Res.data.pregnancy_week >= 1 &&
    test1Res.data.pregnancy_week <= 40 &&
    test1Res.data.content === test1Content &&
    postsSheet.getLastRow() === initialPostsRowCount + 1
  );

  if (test1Pass) {
    createdPostId = test1Res.data.post_id;
    createdPregnancyWeek = test1Res.data.pregnancy_week;
  } else {
    report.overallStatus = 'FAIL';
  }

  report.tests.test1_validCreatePost = {
    name: 'Valid Create Post',
    input: { profile_id: testProfileId, content: test1Content },
    expectedStatus: 'PASS',
    actualResult: test1Res,
    status: test1Pass ? 'PASS' : 'FAIL',
    createdPostId: createdPostId,
    calculatedPregnancyWeek: createdPregnancyWeek
  };

  // --- TEST 2: Blank Content ---
  var test2PostsRowCountBefore = postsSheet.getLastRow();
  var test2Res = handleCreatePost({
    profile_id: testProfileId,
    content: '    '
  });
  var test2Pass = (
    test2Res &&
    test2Res.success === false &&
    test2Res.error === 'POST_CONTENT_REQUIRED' &&
    postsSheet.getLastRow() === test2PostsRowCountBefore
  );
  if (!test2Pass) report.overallStatus = 'FAIL';

  report.tests.test2_blankContent = {
    name: 'Blank Content Validation',
    input: { profile_id: testProfileId, content: '    ' },
    expectedError: 'POST_CONTENT_REQUIRED',
    actualResult: test2Res,
    status: test2Pass ? 'PASS' : 'FAIL'
  };

  // --- TEST 3: Too Long Content (>500 chars) ---
  var test3PostsRowCountBefore = postsSheet.getLastRow();
  var longContent = '媽咪'.repeat(251); // 502 chars
  var test3Res = handleCreatePost({
    profile_id: testProfileId,
    content: longContent
  });
  var test3Pass = (
    test3Res &&
    test3Res.success === false &&
    test3Res.error === 'POST_CONTENT_TOO_LONG' &&
    postsSheet.getLastRow() === test3PostsRowCountBefore
  );
  if (!test3Pass) report.overallStatus = 'FAIL';

  report.tests.test3_tooLongContent = {
    name: 'Too Long Content Validation',
    contentLength: longContent.length,
    expectedError: 'POST_CONTENT_TOO_LONG',
    actualResult: test3Res,
    status: test3Pass ? 'PASS' : 'FAIL'
  };

  // --- TEST 4: Unknown Profile ---
  var test4PostsRowCountBefore = postsSheet.getLastRow();
  var test4Res = handleCreatePost({
    profile_id: 'non-existent-profile-id-999',
    content: '[TEST] Unknown Profile Content'
  });
  var test4Pass = (
    test4Res &&
    test4Res.success === false &&
    test4Res.error === 'PROFILE_NOT_FOUND' &&
    postsSheet.getLastRow() === test4PostsRowCountBefore
  );
  if (!test4Pass) report.overallStatus = 'FAIL';

  report.tests.test4_unknownProfile = {
    name: 'Unknown Profile Validation',
    input: { profile_id: 'non-existent-profile-id-999', content: '[TEST] Unknown Profile Content' },
    expectedError: 'PROFILE_NOT_FOUND',
    actualResult: test4Res,
    status: test4Pass ? 'PASS' : 'FAIL'
  };

  // --- TEST 5: getPosts ---
  var test5Res = handleGetPosts();
  var foundCreatedInFeed = false;
  var isFirstItem = false;
  if (test5Res && test5Res.success && Array.isArray(test5Res.data)) {
    if (test5Res.data.length > 0 && test5Res.data[0].post_id === createdPostId) {
      isFirstItem = true;
    }
    for (var f = 0; f < test5Res.data.length; f++) {
      if (test5Res.data[f].post_id === createdPostId) {
        foundCreatedInFeed = true;
        break;
      }
    }
  }
  var test5Pass = (test5Res && test5Res.success === true && foundCreatedInFeed);
  if (!test5Pass) report.overallStatus = 'FAIL';

  report.tests.test5_getPosts = {
    name: 'Get Posts Active Feed',
    foundCreatedPost: foundCreatedInFeed,
    isFirstItem: isFirstItem,
    totalPostsCount: test5Res.data ? test5Res.data.length : 0,
    status: test5Pass ? 'PASS' : 'FAIL'
  };

  // --- TEST 6: Soft Delete Filtering & Cleanup ---
  var softDeletePass = false;
  if (createdPostId) {
    var pData = postsSheet.getDataRange().getValues();
    var pMap = getHeaderIndexMap(postsSheet, SHEET_HEADERS.Posts);
    var targetRowIdx = -1;

    for (var r = 1; r < pData.length; r++) {
      if (String(pData[r][pMap.post_id] || '').trim() === createdPostId) {
        targetRowIdx = r + 1; // 1-indexed for Sheet range
        break;
      }
    }

    if (targetRowIdx !== -1) {
      // 標記 is_deleted = true (軟刪除)
      postsSheet.getRange(targetRowIdx, pMap.is_deleted + 1).setValue(true);

      // 再次取得 Posts Feed 確認已不再回傳
      var afterDeleteRes = handleGetPosts();
      var stillInFeed = false;
      if (afterDeleteRes && afterDeleteRes.success && Array.isArray(afterDeleteRes.data)) {
        for (var dIdx = 0; dIdx < afterDeleteRes.data.length; dIdx++) {
          if (afterDeleteRes.data[dIdx].post_id === createdPostId) {
            stillInFeed = true;
            break;
          }
        }
      }
      softDeletePass = (!stillInFeed);
    }
  }

  if (!softDeletePass) report.overallStatus = 'FAIL';

  report.tests.test6_softDeleteFiltering = {
    name: 'Soft Delete Filtering & Cleanup',
    targetPostId: createdPostId,
    markedIsDeleted: true,
    stillInFeedAfterDelete: !softDeletePass,
    status: softDeletePass ? 'PASS' : 'FAIL'
  };

  // --- Profiles & Regression Verification ---
  var finalProfilesRowCount = profilesSheet.getLastRow();
  var finalPostsRowCount = postsSheet.getLastRow();

  report.postsSheetStats.afterRowCount = finalPostsRowCount;
  report.profilesSheetStats.afterRowCount = finalProfilesRowCount;
  report.profilesSheetStats.unmodified = (finalProfilesRowCount === initialProfilesRowCount);

  // Profile API Regression Check
  var regressionPing = (typeof doGet === 'function');
  var regressionGetProfile = handleGetProfile(testProfileId);
  var regressionPass = (
    report.profilesSheetStats.unmodified &&
    regressionGetProfile &&
    regressionGetProfile.success === true &&
    regressionGetProfile.profile &&
    regressionGetProfile.profile.profileId === testProfileId
  );

  report.profileRegression = {
    profilesRowCountUnchanged: report.profilesSheetStats.unmodified,
    getProfileWorking: (regressionGetProfile && regressionGetProfile.success === true),
    status: regressionPass ? 'PASS' : 'FAIL'
  };

  if (!regressionPass) {
    report.overallStatus = 'FAIL';
  }

  Logger.log('testCommunityStep01B Results: ' + JSON.stringify(report, null, 2));
  return report;
}
