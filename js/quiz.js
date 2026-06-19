/* ============================================================
   So'z O'rgatuvchi — Quiz (yozma test) rejimi
   Fayl     : js/quiz.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • startQuiz / restartCurrent — quizni boshlash/qayta boshlash
     • showCurrent      — joriy savolni ko'rsatish
     • updateQProgress / updateQScore — progress va ball yangilash
     • speakQuizWord    — so'zni ovozli o'qish
     • handleSubmit     — foydalanuvchi javobini tekshirish
     • handleNext       — keyingi savolga o'tish
     • finishRound      — raund yakunlash
     • handleKey(e)     — Enter tugmasi uchun klaviatura hodisasi
     • showDone(c, w)   — yakuniy natija ekrani
   ============================================================ */

// ===== QUIZ =====
let quizWords=[],queue=[],mistakes={},score={correct:0,wrong:0},qstate=null,currentIdx=null;

function startQuiz(){
  quizWords=buildWordList();if(!quizWords.length){alert(T('no_words'));return;}
  queue=shuffle(quizWords.map((_,i)=>i));
  mistakes={};score={correct:0,wrong:0};qstate=null;
  updateQScore();showScreen('quiz');showCurrent();
}
function restartCurrent(){
  if(currentMode==='quiz')startQuiz();
  else if(currentMode==='mcq')startMcq();
  else if(currentMode==='speed')startSpeed();
}
function showCurrent(){
  if(!queue.length){finishRound();return;}
  currentIdx=queue[0];const w=quizWords[currentIdx];
  document.getElementById('quiz-word').textContent=w.uz;
  setBadge('quiz-type',w.en);
  const inp=document.getElementById('word-input');
  inp.value='';inp.className='word-input';inp.disabled=false;
  document.getElementById('feedback-correct').style.display='none';
  document.getElementById('feedback-wrong').style.display='none';
  document.getElementById('btn-check').style.display='block';
  document.getElementById('btn-next').style.display='none';
  updateQProgress();setTimeout(()=>inp.focus(),80);
}
function updateQProgress(){
  const t=quizWords.length,l=queue.length;
  document.getElementById('q-progress-fill').style.width=Math.round(((t-l)/t)*100)+'%';
  document.getElementById('queue-left').textContent=l;
}
function updateQScore(){
  document.getElementById('score-correct').textContent=score.correct;
  document.getElementById('score-wrong').textContent=score.wrong;
}
function speakQuizWord(){if(currentIdx!==null)speak(quizWords[currentIdx].en);}
function handleSubmit(){
  if(qstate!==null)return;
  const inp=document.getElementById('word-input');
  const w=quizWords[currentIdx];
  const ok=norm(inp.value)===norm(w.en);
  recordError(w.en,ok);
  if(ok){
    qstate='correct';inp.className='word-input correct';inp.disabled=true;
    document.getElementById('feedback-correct').style.display='block';
    document.getElementById('btn-check').style.display='none';
    if(mistakes[currentIdx]>0)mistakes[currentIdx]--;
    score.correct++;updateQScore();addXP(10);speak(w.en);
    setTimeout(()=>{qstate=null;queue=queue.slice(1);showCurrent();},1200);
  } else {
    qstate='wrong';inp.className='word-input wrong';
    document.getElementById('correct-answer').textContent=w.en;
    const trEl=document.getElementById('correct-tr');
    trEl.textContent=w.tr||'';trEl.style.display=w.tr?'block':'none';
    document.getElementById('feedback-wrong').style.display='block';
    document.getElementById('btn-check').style.display='none';
    document.getElementById('btn-next').style.display='block';
    mistakes[currentIdx]=(mistakes[currentIdx]||0)+1;
    score.wrong++;updateQScore();speak(w.en);
  }
}
function handleNext(){
  const idx=currentIdx;qstate=null;queue=queue.slice(1);
  queue.splice(Math.min(3,queue.length),0,idx);showCurrent();
}
function finishRound(){
  const rem=Object.keys(mistakes).filter(k=>mistakes[k]>0).map(Number);
  if(!rem.length){showDone(score.correct,score.wrong);}
  else{queue=shuffle(rem);showCurrent();}
}
function handleKey(e){if(e.key==='Enter'){if(qstate==='wrong')handleNext();else if(!qstate)handleSubmit();}}

function showDone(c,w){
  document.getElementById('final-correct').textContent=c;
  document.getElementById('final-wrong').textContent=w;
  const earned=c*10;
  document.getElementById('done-xp-earned').textContent = earned>0 ? ('+'+earned+' '+T('xp_label')) : '';
  document.getElementById('done-title').textContent = w===0 ? T('done_perfect') : T('done_congrats');
  document.getElementById('done-emoji').textContent = w===0 ? '🏆' : '🎉';
  showScreen('done');
}

