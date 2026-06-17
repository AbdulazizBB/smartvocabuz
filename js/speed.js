/* ============================================================
   So'z O'rgatuvchi — Tezkor (Speed) rejimi
   Fayl     : js/speed.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • startSpeed       — tezkor sessiyani boshlash (taymer bilan)
     • stopSpeed        — sessiyani to'xtatish
     • renderSpeed      — joriy so'z va taymerni ko'rsatish
     • spTimeUp         — taymer tugaganda avtomatik o'tish
     • spHandleKey(e)   — Enter klaviatura hodisasi
     • spSubmit         — javobni tekshirish va XP berish
     • speakSpeedWord   — joriy so'zni ovozli o'qish
   ============================================================ */

// ===== SPEED MODE =====
let spWords=[],spQueue=[],spIndex=0,spScore={correct:0,wrong:0},spTimer=null,spTimeLeft=0,spAnswered=false;
const SP_TIME=10;

function startSpeed(){
  spWords=buildWordList();if(!spWords.length){alert("So'z yo'q!");return;}
  spQueue=shuffle(spWords.map((_,i)=>i));
  spIndex=0;spScore={correct:0,wrong:0};
  showScreen('speed');renderSpeed();
}
function stopSpeed(){clearInterval(spTimer);showScreen('home');}
function renderSpeed(){
  if(spIndex>=spQueue.length){clearInterval(spTimer);showDone(spScore.correct,spScore.wrong);return;}
  const w=spWords[spQueue[spIndex]];spAnswered=false;
  document.getElementById('sp-word').textContent=w.uz;
  setBadge('sp-type',w.en);
  const inp=document.getElementById('sp-input');
  inp.value='';inp.className='word-input';inp.disabled=false;
  document.getElementById('sp-correct-msg').style.display='none';
  document.getElementById('sp-wrong-box').style.display='none';
  document.getElementById('sp-correct').textContent=spScore.correct;
  document.getElementById('sp-wrong').textContent=spScore.wrong;
  spTimeLeft=SP_TIME;
  document.getElementById('sp-timer').textContent=spTimeLeft;
  document.getElementById('timer-bar').style.width='100%';
  clearInterval(spTimer);
  spTimer=setInterval(()=>{
    spTimeLeft--;
    document.getElementById('sp-timer').textContent=spTimeLeft;
    document.getElementById('timer-bar').style.width=Math.round((spTimeLeft/SP_TIME)*100)+'%';
    if(spTimeLeft<=0){clearInterval(spTimer);spTimeUp();}
  },1000);
  setTimeout(()=>inp.focus(),80);
}
function spTimeUp(){
  if(spAnswered)return;spAnswered=true;
  const w=spWords[spQueue[spIndex]];
  recordError(w.en,false);
  document.getElementById('sp-correct-answer').textContent=w.en;
  document.getElementById('sp-wrong-box').style.display='block';
  document.getElementById('sp-input').disabled=true;
  spScore.wrong++;speak(w.en);
  setTimeout(()=>{spIndex++;renderSpeed();},1800);
}
function spHandleKey(e){
  if(e.key==='Enter')spSubmit();
}
function spSubmit(){
  if(spAnswered)return;
  const inp=document.getElementById('sp-input');
  const w=spWords[spQueue[spIndex]];
  const ok=norm(inp.value)===norm(w.en);
  if(!ok)return; // wrong — keep trying until time up
  spAnswered=true;clearInterval(spTimer);
  recordError(w.en,true);
  inp.className='word-input correct';inp.disabled=true;
  document.getElementById('sp-correct-msg').style.display='block';
  spScore.correct++;addXP(15);speak(w.en);
  setTimeout(()=>{spIndex++;renderSpeed();},900);
}
function speakSpeedWord(){if(spIndex<spQueue.length)speak(spWords[spQueue[spIndex]].en);}

