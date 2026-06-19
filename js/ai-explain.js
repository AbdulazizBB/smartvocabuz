/* ============================================================
   So'z O'rgatuvchi — AI Tushuntirma moduli
   Fayl     : js/ai-explain.js
   Bog'liqlik: core.js (barcha modullardan KEYIN yuklansin)
   API      : /api/explain → netlify/functions/explain.js
              (Gemini API key server tomonida yashirinadi)
   ============================================================ */

// ===== AI EXPLAIN =====

/**
 * AI tushuntirmani ko'rsatadi
 * @param {Object} ctx  { type, word, correct, wrong, uz, extra }
 * @param {string} containerId  — tushuntirma joylashadigan div ID
 */
async function showAIExplain(ctx, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.style.display = 'block';
  container.innerHTML = `
      <div class="ai-explain-box loading">
        <span class="ai-icon">🤖</span>
        <span class="ai-dots">${T('ai_loading')}<span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span></span>
      </div>`;

  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ lang: (typeof _lang !== 'undefined' ? _lang : 'en') }, ctx))
    });

    if (!res.ok) throw new Error('server_error');
    const data = await res.json();
    if (!data.explanation) throw new Error('empty');

    // Markdown bold (**text**) ni <strong> ga aylantiramiz
    const html = data.explanation
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    container.innerHTML = `
      <div class="ai-explain-box">
        <div class="ai-explain-header">
          <span class="ai-icon">🤖</span>
          <span class="ai-label">${T('ai_explain_label')}</span>
          <button class="ai-close-btn" onclick="hideAIExplain('${containerId}')">✕</button>
        </div>
        <div class="ai-explain-text">${html}</div>
      </div>`;

  } catch (err) {
    const msg = err.message === 'server_error'
      ? T('ai_server_error')
      : T('ai_load_error');
    container.innerHTML = `
      <div class="ai-explain-box error">
        <span class="ai-icon">⚠️</span>
        <span>${msg}</span>
      </div>`;
  }
}

function hideAIExplain(containerId) {
  const el = document.getElementById(containerId);
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
}

// Attach to flashcard "Don't know" button if present (delegated)
document.addEventListener('click', function(e){
  const btn = e.target.closest('.fc-dontknow');
  if(!btn) return;
  const wordEl = document.querySelector('.flashcard-word');
  const trEl = document.querySelector('.flashcard-tr');
  const en = wordEl?.textContent?.trim() || '';
  const uz = trEl?.textContent?.trim() || '';
  if(en) showAIExplain({ type:'vocab', uz, correct: en, wrong: '' }, 'flashcard-ai-explain');
});

// ===== PATCH: barcha rejimlarga AI tushuntirma ulash =====

/* ---- QUIZ ---- */
const _origHandleSubmit = handleSubmit;
handleSubmit = function() {
  _origHandleSubmit();
  setTimeout(() => {
    if (qstate === 'wrong' && currentIdx !== null) {
      const w = quizWords[currentIdx];
      const inp = document.getElementById('word-input');
      showAIExplain({
        type: 'vocab', uz: w.uz, correct: w.en,
        wrong: inp?.value || ''
      }, 'quiz-ai-explain');
    }
  }, 150);
};

/* ---- MCQ ---- */
const _origPickMcq = pickMcq;
pickMcq = function(btn, chosen, correct) {
  _origPickMcq(btn, chosen, correct);
  if (norm(chosen) !== norm(correct)) {
    const w = mcqWords[mcqQueue[mcqIndex]];
    showAIExplain({
      type: 'vocab', uz: w.uz, correct, wrong: chosen
    }, 'mcq-ai-explain');
  }
};

/* ---- SPEED: vaqt tugaganda ---- */
const _origSpTimeUp = spTimeUp;
spTimeUp = function() {
  const w = spWords[spQueue[spIndex]];
  _origSpTimeUp();
  if (w) showAIExplain({
    type: 'vocab', uz: w.uz, correct: w.en, wrong: ''
  }, 'speed-ai-explain');
};

/* ---- SPEED: javob yuborganda ---- */
const _origSpSubmit = spSubmit;
spSubmit = function() {
  const wasAnswered = spAnswered;
  const w = spWords[spQueue[spIndex]];
  const inp = document.getElementById('sp-input');
  const userVal = inp?.value || '';
  _origSpSubmit();
  if (!wasAnswered && w && norm(userVal) !== norm(w.en)) {
    showAIExplain({
      type: 'vocab', uz: w.uz, correct: w.en, wrong: userVal
    }, 'speed-ai-explain');
  }
};

/* ---- EXERCISES ---- */
const _origShowExFeedback = showExFeedback;
showExFeedback = function(correct, ex) {
  _origShowExFeedback(correct, ex);
  if (!correct) {
    const inp = document.getElementById('ex-gap-input');
    showAIExplain({
      type: 'exercise',
      word: ex.question || ex.sentence || ex.q || '',
      correct: ex.answer,
      wrong: inp?.value || '',
      extra: ex.hint || ex.grammar || ''
    }, 'ex-ai-explain');
  }
};

/* ---- IRREGULAR VERBS — Fill ---- */
const _origIrrFillCheck = irrFillCheck;
irrFillCheck = function() {
  const inp = document.getElementById('irr-fill-input');
  const userVal = inp?.value || '';
  const wasAnswered = irrFillAnswered;
  _origIrrFillCheck();
  if (!wasAnswered) {
    const v = IRREGULAR_VERBS[irrFillQueue[irrFillIndex]];
    const target = irrFillTarget === 'past' ? v.past : v.pp;
    if (norm(userVal) !== norm(target.split(/[;/]/)[0])) {
      showAIExplain({
        type: 'irregular',
        word: v.base, uz: v.uz, correct: target, wrong: userVal
      }, 'irr-fill-ai-explain');
    }
  }
};

/* ---- IRREGULAR VERBS — Quiz ---- */
const _origIrrQuizAnswer = irrQuizAnswer;
irrQuizAnswer = function(chosen, btn, correctAnswer) {
  _origIrrQuizAnswer(chosen, btn, correctAnswer);
  if (chosen !== correctAnswer) {
    const v = IRREGULAR_VERBS[irrQuizQueue[irrQuizIndex]];
    showAIExplain({
      type: 'irregular',
      word: v.base, uz: v.uz, correct: correctAnswer, wrong: chosen
    }, 'irr-quiz-ai-explain');
  }
};
