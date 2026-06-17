/* ============================================================
   So'z O'rgatuvchi — MCQ (ko'p tanlovli test) rejimi
   Fayl     : js/mcq.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • startMcq         — MCQ sessiyasini boshlash
     • renderMcq        — joriy savolni 4 variant bilan ko'rsatish
     • pickMcq(btn, chosen, correct) — javobni tekshirish va rang berish
     • mcqNext          — keyingi savolga o'tish
     • speakMcqWord     — so'zni ovozli o'qish
   ============================================================ */

// ===== MCQ =====
let mcqWords=[],mcqQueue=[],mcqIndex=0,mcqScore={correct:0,wrong:0},mcqAnswered=false;

function startMcq(){
  mcqWords=buildWordList();if(mcqWords.length<4){alert("Kamida 4 ta so'z kerak!");return;}
  mcqQueue=shuffle(mcqWords.map((_,i)=>i));
  mcqIndex=0;mcqScore={correct:0,wrong:0};mcqAnswered=false;
  showScreen('mcq');renderMcq();
}
function renderMcq(){
  if(mcqIndex>=mcqQueue.length){showDone(mcqScore.correct,mcqScore.wrong);return;}
  const w=mcqWords[mcqQueue[mcqIndex]];mcqAnswered=false;
  document.getElementById('mcq-word').textContent=w.uz;
  setBadge('mcq-type',w.en);
  document.getElementById('mcq-next-btn').style.display='none';
  // 4 options: correct + 3 random wrong
  const others=mcqWords.filter((_,i)=>i!==mcqQueue[mcqIndex]);
  const wrongs=shuffle(others).slice(0,3);
  const opts=shuffle([w,...wrongs]);
  const container=document.getElementById('mcq-options');container.innerHTML='';
  opts.forEach(opt=>{
    const btn=document.createElement('button');btn.className='mcq-btn';
    btn.textContent=opt.en;
    btn.onclick=()=>pickMcq(btn,opt.en,w.en);
    container.appendChild(btn);
  });
  const t=mcqWords.length,l=mcqQueue.length-mcqIndex;
  document.getElementById('mcq-progress').style.width=Math.round(((t-l)/t)*100)+'%';
  document.getElementById('mcq-left').textContent=l;
  document.getElementById('mcq-correct').textContent=mcqScore.correct;
  document.getElementById('mcq-wrong').textContent=mcqScore.wrong;
}
function pickMcq(btn,chosen,correct){
  if(mcqAnswered)return;mcqAnswered=true;
  const ok=norm(chosen)===norm(correct);
  recordError(correct,ok);
  document.querySelectorAll('.mcq-btn').forEach(b=>{
    if(norm(b.textContent)===norm(correct))b.classList.add('correct-opt');
    else if(b===btn&&!ok)b.classList.add('wrong-opt');
    b.style.pointerEvents='none';
  });
  if(ok){mcqScore.correct++;addXP(10);}else mcqScore.wrong++;
  speak(correct);
  document.getElementById('mcq-next-btn').style.display='flex';
}
function mcqNext(){mcqIndex++;renderMcq();}
function speakMcqWord(){if(mcqIndex<mcqQueue.length)speak(mcqWords[mcqQueue[mcqIndex]].en);}

