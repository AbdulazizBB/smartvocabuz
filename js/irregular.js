/* ============================================================
   So'z O'rgatuvchi — Irregular Verbs (Noto'g'ri fe'llar)
   Fayl     : js/irregular.js
   Bog'liqlik: data.js (IRREGULAR_VERBS), core.js
   Qamrab oladi:
     4 ta o'yin rejimi:
     1) Flashcard rejimi
        • startIrrCards / renderIrrCard / irrCardFlip
        • irrCardNext / irrCardPrev / speakIrrCard
     2) Match rejimi (juftlik topish)
        • startIrrMatch / renderIrrMatch / irrMatchClick
        (base shakl ↔ past shakl kartalarini juflash)
     3) Fill-in rejimi (bo'sh joy to'ldirish)
        • startIrrFill / renderIrrFill / irrFillCheck
        • irrFillKey(e) / irrFillNext / irrFillFinish
     4) Quiz rejimi (4 variantli test)
        • startIrrQuiz / renderIrrQuiz / irrQuizAnswer
        • speakIrrQuiz / irrQuizNext / irrQuizFinish
   ============================================================ */

function showIrrScreen() { showScreen('irr-home'); }

// --- FLASHCARD MODE ---
let irrCardQueue = [];
let irrCardIndex = 0;
let irrCardFlipped = false;

function startIrrCards() {
  irrCardQueue = shuffle(IRREGULAR_VERBS.map((_,i)=>i));
  irrCardIndex = 0;
  showScreen('irr-cards');
  renderIrrCard();
}
function renderIrrCard() {
  const v = IRREGULAR_VERBS[irrCardQueue[irrCardIndex]];
  irrCardFlipped = false;
  document.getElementById('irr-card-emoji').textContent = v.emoji;
  document.getElementById('irr-card-base').textContent = v.base;
  document.getElementById('irr-card-uz').textContent = v.uz;
  document.getElementById('irr-card-past').textContent = v.past;
  document.getElementById('irr-card-pp').textContent = v.pp;
  document.getElementById('irr-card-back').style.display = 'none';
  document.getElementById('irr-card-hint').style.display = 'block';
  document.getElementById('irr-card-counter').textContent = (irrCardIndex+1) + ' / ' + irrCardQueue.length;
  document.getElementById('irr-card-progress').style.width = Math.round((irrCardIndex/irrCardQueue.length)*100) + '%';
}
function irrCardFlip() {
  if (irrCardFlipped) return;
  irrCardFlipped = true;
  document.getElementById('irr-card-back').style.display = 'block';
  document.getElementById('irr-card-hint').style.display = 'none';
  const v = IRREGULAR_VERBS[irrCardQueue[irrCardIndex]];
  speak(v.base);
}
function irrCardNext() {
  irrCardIndex = (irrCardIndex + 1) % irrCardQueue.length;
  renderIrrCard();
}
function irrCardPrev() {
  irrCardIndex = (irrCardIndex - 1 + irrCardQueue.length) % irrCardQueue.length;
  renderIrrCard();
}
function speakIrrCard() {
  const v = IRREGULAR_VERBS[irrCardQueue[irrCardIndex]];
  const btn = document.getElementById('irr-card-audio');
  btn.classList.add('speaking');
  if (!irrCardFlipped) {
    speak(v.base, () => btn.classList.remove('speaking'));
  } else {
    speak(v.base + ', ' + v.past + ', ' + v.pp, () => btn.classList.remove('speaking'));
  }
}

// --- MATCH GAME ---
let irrMatchPairs = [];
let irrMatchSelected = null;
let irrMatchFound = 0;

function startIrrMatch() {
  const sample = shuffle(IRREGULAR_VERBS.map((_,i)=>i)).slice(0, 8);
  irrMatchPairs = [];
  sample.forEach(idx => {
    irrMatchPairs.push({idx, side:'base', text: IRREGULAR_VERBS[idx].base + ' ' + IRREGULAR_VERBS[idx].emoji, matched:false});
    irrMatchPairs.push({idx, side:'past', text: IRREGULAR_VERBS[idx].past, matched:false});
  });
  irrMatchPairs = shuffle(irrMatchPairs);
  irrMatchSelected = null;
  irrMatchFound = 0;
  document.getElementById('irr-match-total').textContent = sample.length;
  document.getElementById('irr-match-pairs').textContent = '0';
  showScreen('irr-match');
  renderIrrMatch();
}
function renderIrrMatch() {
  const grid = document.getElementById('irr-match-grid');
  grid.innerHTML = '';
  irrMatchPairs.forEach((card, i) => {
    const btn = document.createElement('button');
    btn.className = 'mcq-btn';
    btn.style.minHeight = '56px';
    if (card.matched) {
      btn.style.background = 'rgba(34,197,94,0.2)';
      btn.style.borderColor = 'rgba(34,197,94,0.4)';
      btn.style.opacity = '0.5';
      btn.disabled = true;
    } else if (irrMatchSelected === i) {
      btn.style.background = 'rgba(167,139,250,0.25)';
      btn.style.borderColor = '#a78bfa';
    }
    btn.textContent = card.text;
    btn.onclick = () => irrMatchClick(i);
    grid.appendChild(btn);
  });
}
function irrMatchClick(i) {
  if (irrMatchPairs[i].matched) return;
  if (irrMatchSelected === null) {
    irrMatchSelected = i;
    renderIrrMatch();
    return;
  }
  if (irrMatchSelected === i) {
    irrMatchSelected = null;
    renderIrrMatch();
    return;
  }
  const a = irrMatchPairs[irrMatchSelected];
  const b = irrMatchPairs[i];
  if (a.idx === b.idx && a.side !== b.side) {
    a.matched = true; b.matched = true;
    irrMatchFound++;
    document.getElementById('irr-match-pairs').textContent = irrMatchFound;
    const v = IRREGULAR_VERBS[a.idx];
    speak(v.base + ' ' + v.past);
    irrMatchSelected = null;
    renderIrrMatch();
    if (irrMatchFound === irrMatchPairs.length / 2) {
      setTimeout(() => {
        document.getElementById('irr-final-correct').textContent = irrMatchFound;
        document.getElementById('irr-final-wrong').textContent = 0;
        document.getElementById('irr-done-sub').textContent = 'Juftlik o\'yini tugadi!';
        showScreen('irr-done');
      }, 700);
    }
  } else {
    irrMatchSelected = i;
    renderIrrMatch();
    setTimeout(() => { irrMatchSelected = null; renderIrrMatch(); }, 500);
  }
}

// --- FILL TABLE MODE ---
let irrFillQueue = [];
let irrFillIndex = 0;
let irrFillScore = {correct:0, wrong:0};
let irrFillTarget = 'past'; // 'past' or 'pp'
let irrFillAnswered = false;

function startIrrFill() {
  irrFillQueue = shuffle(IRREGULAR_VERBS.map((_,i)=>i));
  irrFillIndex = 0;
  irrFillScore = {correct:0, wrong:0};
  showScreen('irr-fill');
  renderIrrFill();
}
function renderIrrFill() {
  if (irrFillIndex >= irrFillQueue.length) { irrFillFinish(); return; }
  const v = IRREGULAR_VERBS[irrFillQueue[irrFillIndex]];
  irrFillAnswered = false;
  irrFillTarget = Math.random() < 0.5 ? 'past' : 'pp';

  document.getElementById('irr-fill-emoji').textContent = v.emoji;
  document.getElementById('irr-fill-base').textContent = v.base;
  document.getElementById('irr-fill-uz').textContent = v.uz;
  document.getElementById('irr-fill-target-label').textContent = irrFillTarget === 'past' ? 'PAST SIMPLE' : 'PAST PARTICIPLE';

  const inp = document.getElementById('irr-fill-input');
  inp.value = '';
  inp.disabled = false;
  inp.className = 'word-input';
  setTimeout(() => inp.focus(), 80);

  document.getElementById('irr-fill-correct-msg').style.display = 'none';
  document.getElementById('irr-fill-wrong-msg').style.display = 'none';
  document.getElementById('irr-fill-check-btn').style.display = 'block';
  document.getElementById('irr-fill-next-btn').style.display = 'none';

  const pct = Math.round((irrFillIndex / irrFillQueue.length) * 100);
  document.getElementById('irr-fill-progress').style.width = pct + '%';
  document.getElementById('irr-fill-progress-text').textContent = (irrFillIndex+1) + ' / ' + irrFillQueue.length;
  document.getElementById('irr-fill-correct').textContent = irrFillScore.correct;
  document.getElementById('irr-fill-wrong').textContent = irrFillScore.wrong;
}
function irrFillCheck() {
  if (irrFillAnswered) return;
  const v = IRREGULAR_VERBS[irrFillQueue[irrFillIndex]];
  const inp = document.getElementById('irr-fill-input');
  const val = inp.value.trim().toLowerCase();
  if (!val) return;
  irrFillAnswered = true;
  const target = irrFillTarget === 'past' ? v.past : v.pp;
  // accept any of multiple forms separated by ; or /
  const acceptable = target.toLowerCase().split(/[;/]/).map(s=>s.trim());
  const correct = acceptable.some(a => a === val);

  inp.disabled = true;
  inp.className = 'word-input ' + (correct ? 'correct' : 'wrong');

  if (correct) {
    irrFillScore.correct++;
    document.getElementById('irr-fill-correct-msg').style.display = 'block';
    speak(v.base + ' ' + target.split(/[;/]/)[0]);
  } else {
    irrFillScore.wrong++;
    document.getElementById('irr-fill-answer').textContent = target;
    document.getElementById('irr-fill-wrong-msg').style.display = 'block';
    speak(v.base + ' ' + target.split(/[;/]/)[0]);
  }
  document.getElementById('irr-fill-correct').textContent = irrFillScore.correct;
  document.getElementById('irr-fill-wrong').textContent = irrFillScore.wrong;
  document.getElementById('irr-fill-check-btn').style.display = 'none';
  document.getElementById('irr-fill-next-btn').style.display = 'block';
}
function irrFillKey(e) {
  if (e.key === 'Enter') {
    if (irrFillAnswered) irrFillNext();
    else irrFillCheck();
  }
}
function irrFillNext() {
  irrFillIndex++;
  renderIrrFill();
}
function irrFillFinish() {
  document.getElementById('irr-final-correct').textContent = irrFillScore.correct;
  document.getElementById('irr-final-wrong').textContent = irrFillScore.wrong;
  document.getElementById('irr-done-sub').textContent = 'To\'ldirish mashqi tugadi!';
  showScreen('irr-done');
}

// --- QUIZ MODE (multiple choice) ---
let irrQuizQueue = [];
let irrQuizIndex = 0;
let irrQuizScore = {correct:0, wrong:0};
let irrQuizAnswered = false;
let irrQuizTarget = 'past';

function startIrrQuiz() {
  irrQuizQueue = shuffle(IRREGULAR_VERBS.map((_,i)=>i));
  irrQuizIndex = 0;
  irrQuizScore = {correct:0, wrong:0};
  showScreen('irr-quiz');
  renderIrrQuiz();
}
function renderIrrQuiz() {
  if (irrQuizIndex >= irrQuizQueue.length) { irrQuizFinish(); return; }
  const idx = irrQuizQueue[irrQuizIndex];
  const v = IRREGULAR_VERBS[idx];
  irrQuizAnswered = false;
  irrQuizTarget = Math.random() < 0.5 ? 'past' : 'pp';
  const correctAnswer = (irrQuizTarget === 'past' ? v.past : v.pp).split(/[;/]/)[0].trim();

  document.getElementById('irr-quiz-emoji').textContent = v.emoji;
  document.getElementById('irr-quiz-label').textContent = (irrQuizTarget === 'past' ? 'PAST SIMPLE' : 'PAST PARTICIPLE') + ' shaklini tanlang:';
  document.getElementById('irr-quiz-word').textContent = v.base;
  document.getElementById('irr-quiz-uz').textContent = v.uz;

  // build 4 options
  let options = [correctAnswer];
  const others = IRREGULAR_VERBS.filter((_,i)=>i!==idx);
  const shuffledOthers = shuffle(others);
  for (const o of shuffledOthers) {
    if (options.length >= 4) break;
    const cand = (irrQuizTarget === 'past' ? o.past : o.pp).split(/[;/]/)[0].trim();
    if (!options.includes(cand)) options.push(cand);
  }
  options = shuffle(options);

  const optDiv = document.getElementById('irr-quiz-options');
  optDiv.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'mcq-btn';
    btn.textContent = opt;
    btn.onclick = () => irrQuizAnswer(opt, btn, correctAnswer);
    optDiv.appendChild(btn);
  });

  document.getElementById('irr-quiz-next-btn').style.display = 'none';
  const pct = Math.round((irrQuizIndex / irrQuizQueue.length) * 100);
  document.getElementById('irr-quiz-progress').style.width = pct + '%';
  document.getElementById('irr-quiz-progress-text').textContent = (irrQuizIndex+1) + ' / ' + irrQuizQueue.length;
  document.getElementById('irr-quiz-correct').textContent = irrQuizScore.correct;
  document.getElementById('irr-quiz-wrong').textContent = irrQuizScore.wrong;
}
function irrQuizAnswer(chosen, btn, correctAnswer) {
  if (irrQuizAnswered) return;
  irrQuizAnswered = true;
  const correct = chosen === correctAnswer;
  if (correct) irrQuizScore.correct++; else irrQuizScore.wrong++;
  document.getElementById('irr-quiz-correct').textContent = irrQuizScore.correct;
  document.getElementById('irr-quiz-wrong').textContent = irrQuizScore.wrong;

  document.querySelectorAll('#irr-quiz-options button').forEach(b => {
    b.disabled = true;
    if (b.textContent === correctAnswer) {
      b.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      b.style.borderColor = 'transparent';
      b.style.color = '#fff';
    } else if (b === btn && !correct) {
      b.style.background = 'linear-gradient(135deg,#f87171,#dc2626)';
      b.style.borderColor = 'transparent';
      b.style.color = '#fff';
    }
  });

  const v = IRREGULAR_VERBS[irrQuizQueue[irrQuizIndex]];
  speak(v.base + ' ' + correctAnswer);
  document.getElementById('irr-quiz-next-btn').style.display = 'block';
}
function speakIrrQuiz() {
  const v = IRREGULAR_VERBS[irrQuizQueue[irrQuizIndex]];
  speak(v.base);
}
function irrQuizNext() {
  irrQuizIndex++;
  renderIrrQuiz();
}
function irrQuizFinish() {
  document.getElementById('irr-final-correct').textContent = irrQuizScore.correct;
  document.getElementById('irr-final-wrong').textContent = irrQuizScore.wrong;
  document.getElementById('irr-done-sub').textContent = 'Variantli test tugadi!';
  showScreen('irr-done');
}

