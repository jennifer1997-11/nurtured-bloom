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
