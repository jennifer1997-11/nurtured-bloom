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
 * 取得或建立 profiles 工作表並確認 Header
 */
function getProfilesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
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
 * 處理 getProfile:
 * - 依 profileId 搜尋並回傳 Profile 內容
 * - 若找不到則回傳 PROFILE_NOT_FOUND
 */
function handleGetProfile(profileId) {
  var sheet = getProfilesSheet();
  var data = sheet.getDataRange().getValues();
  var pid = String(profileId).trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === pid) {
      return {
        success: true,
        profile: {
          profileId: String(data[i][0]),
          momNickname: String(data[i][1]),
          email: String(data[i][2]),
          dueDate: data[i][3] ? (data[i][3] instanceof Date ? Utilities.formatDate(data[i][3], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(data[i][3])) : '',
          pregnancyNumber: String(data[i][4]),
          babyNickname: String(data[i][5]),
          babyGender: String(data[i][6]),
          createdAt: data[i][7] ? (data[i][7] instanceof Date ? data[i][7].toISOString() : String(data[i][7])) : '',
          updatedAt: data[i][8] ? (data[i][8] instanceof Date ? data[i][8].toISOString() : String(data[i][8])) : ''
        }
      };
    }
  }

  return {
    success: false,
    error: 'PROFILE_NOT_FOUND'
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
