// ============================================
// 合格体験記 投稿掲示板 — Google Apps Script
// ============================================
//
// ★ セットアップ手順：
//
// 1. Google スプレッドシートを新規作成する
//    - シート名を「投稿データ」にリネーム
//    - 1行目（ヘッダー）に以下を入力：
//      A1: id | B1: timestamp | C1: initials | D1: examType
//      E1: year | F1: school | G1: struggle | H1: growth
//      I1: message | J1: summary | K1: rating | L1: parentMessage
//
// 2. メニュー「拡張機能」→「Apps Script」を開く
//
// 3. このファイルの内容をすべてコピーしてエディタに貼り付け
//
// 4. 画面上部の「デプロイ」→「新しいデプロイ」を選択
//    - 種類：「ウェブアプリ」
//    - 実行ユーザー：「自分」
//    - アクセス権：「全員」（★ログイン不要にするため）
//    - 「デプロイ」をクリック
//
// 5. 表示される「ウェブアプリ URL」をコピー
//    → submit.js と admin.js の API_URL にペースト
//
// ============================================

// --- GET: 全データ取得 ---
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getAll') {
      return getAllStories();
    }

    if (action === 'delete') {
      const id = e.parameter.id;
      return deleteStory(id);
    }

    return createJsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ error: err.message });
  }
}

// --- POST: 新規投稿 ---
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return addStory(data);
  } catch (err) {
    return createJsonResponse({ error: err.message });
  }
}

// --- 全投稿取得 ---
function getAllStories() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('投稿データ');
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return createJsonResponse({ stories: [] });
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const stories = data.map(row => ({
    id: row[0],
    timestamp: row[1],
    initials: row[2],
    examType: row[3],
    year: row[4],
    school: row[5],
    struggle: row[6],
    growth: row[7],
    message: row[8],
    summary: row[9],
    rating: row[10],
    parentMessage: row[11]
  })).reverse(); // 新しい順

  return createJsonResponse({ stories: stories });
}

// --- 投稿追加 ---
function addStory(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('投稿データ');
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();

  sheet.appendRow([
    id,
    timestamp,
    data.initials || '',
    data.examType || '',
    String(data.year || ''),
    data.school || '',
    data.struggle || '',
    data.growth || '',
    data.message || '',
    data.summary || '',
    data.rating || 0,
    data.parentMessage || ''
  ]);

  return createJsonResponse({ success: true, id: id });
}

// --- 投稿削除 ---
function deleteStory(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('投稿データ');
  const lastRow = sheet.getLastRow();

  for (let i = 2; i <= lastRow; i++) {
    if (sheet.getRange(i, 1).getValue() === id) {
      sheet.deleteRow(i);
      return createJsonResponse({ success: true });
    }
  }

  return createJsonResponse({ error: 'Not found' });
}

// --- JSON レスポンス作成 ---
function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
