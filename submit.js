/* ============================================
   合格体験記 投稿フォーム — JavaScript
   (Google Apps Script 版)
   ============================================ */

// ★★★ デプロイした Google Apps Script の URL をここに貼り付け ★★★
const API_URL = 'https://script.google.com/macros/s/AKfycbz8Viqp9gmDRYc4OpY_1J1o5162B3dBwudgkEUqEx-OxiKSOFBlnROv3YrS2JsqV7iUGg/exec';

document.addEventListener('DOMContentLoaded', () => {
  initSakura();
  initForm();
});

/* --- 桜の花びら生成 --- */
function initSakura() {
  const container = document.getElementById('sakuraContainer');
  const petalCount = 25;

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = (6 + Math.random() * 8) + 's';
    petal.style.animationDelay = Math.random() * 10 + 's';
    petal.style.opacity = 0.3 + Math.random() * 0.5;
    container.appendChild(petal);
  }
}

/* --- フォーム初期化 --- */
function initForm() {
  const form = document.getElementById('storyForm');
  const modal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  form.addEventListener('submit', handleSubmit);
  modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

/* --- フォーム送信処理 --- */
async function handleSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');

  // バリデーション
  const fields = {
    initials: document.getElementById('initials').value.trim(),
    examType: document.getElementById('examType').value,
    year: document.getElementById('year').value,
    school: document.getElementById('school').value.trim(),
    struggle: document.getElementById('struggle').value.trim(),
    growth: document.getElementById('growth').value.trim(),
    message: document.getElementById('message').value.trim(),
    summary: document.getElementById('summary').value.trim(),
  };

  // 必須フィールドチェック
  const requiredFields = ['initials', 'examType', 'year', 'school', 'struggle', 'growth', 'message'];
  for (const key of requiredFields) {
    if (!fields[key]) {
      const el = document.getElementById(key);
      el.focus();
      el.style.borderColor = '#dc3545';
      el.style.boxShadow = '0 0 0 4px rgba(220, 53, 69, 0.15)';
      setTimeout(() => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }, 2000);
      return;
    }
  }

  // 星評価
  const ratingEl = document.querySelector('input[name="rating"]:checked');
  if (!ratingEl) {
    document.getElementById('starRating').style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      document.getElementById('starRating').style.animation = '';
    }, 400);
    return;
  }

  // 同意チェック
  const consentCheck = document.getElementById('consentCheck');
  if (!consentCheck.checked) {
    consentCheck.parentElement.parentElement.style.borderColor = '#dc3545';
    consentCheck.parentElement.parentElement.style.boxShadow = '0 0 0 4px rgba(220, 53, 69, 0.15)';
    consentCheck.focus();
    setTimeout(() => {
      consentCheck.parentElement.parentElement.style.borderColor = '';
      consentCheck.parentElement.parentElement.style.boxShadow = '';
    }, 2000);
    return;
  }

  // データオブジェクト構築
  const story = {
    initials: fields.initials,
    examType: fields.examType,
    year: fields.year,
    school: fields.school,
    struggle: fields.struggle,
    growth: fields.growth,
    message: fields.message,
    summary: fields.summary,
    rating: parseInt(ratingEl.value),
    parentMessage: document.getElementById('parentMessage').value.trim(),
  };

  // 送信中 UI
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>⏳</span><span>送信中...</span>';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(story),
    });

    const result = await response.json();

    if (result.success) {
      // モーダル表示
      document.getElementById('successModal').classList.add('active');
      // フォームリセット
      document.getElementById('storyForm').reset();
    } else {
      throw new Error(result.error || '送信に失敗しました');
    }
  } catch (error) {
    alert('投稿の送信に失敗しました。\nネットワーク接続を確認してください。\n\n' + error.message);
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>🎊</span><span>投稿する</span>';
  }
}
