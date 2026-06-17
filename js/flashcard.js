/* ============================================================
   So'z O'rgatuvchi — Flashcard rejimi
   Fayl     : js/flashcard.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • startFlashcard   — flashcard sessiyasini boshlash
     • fcRestartAll / fcRestartWrong — qayta boshlash
     • setFcSide        — UZ→EN yoki EN→UZ tomoni tanlash
     • renderFcCard     — kartani ko'rsatish (so'z, tarjima, badge)
     • fcFlip           — kartani ag'darish (animatsiya bilan)
     • fcRate(knew)     — "bildim" / "bilmadim" tugmalari
     • fcSkipNext / fcSkipBack — oldinga/orqaga o'tish
     • speakCurrent     — joriy so'zni ovozli o'qish
     • fcFinish         — sessiya yakunlash va natija ko'rsatish
   ============================================================ */

let fcWords=[],fcQueue=[],fcIndex=0,fcFlipped=false,fcSide='uz',fcKnow=0,fcDont=0,fcDontList=[];

function startFlashcard(){
  fcWords=buildWordList();if(!fcWords.length){alert("So'z yo'q!");return;}
  fcQueue=shuffle(fcWords.map((_,i)=>i));
  fcIndex=0;fcKnow=0;fcDont=0;fcDontList=[];fcFlipped=false;
  showScreen('flashcard');renderFcCard();
}
function fcRestartAll(){startFlashcard();}
function fcRestartWrong(){
  if(!fcDontList.length)return;
  fcQueue=shuffle([...fcDontList]);fcIndex=0;fcKnow=0;fcDont=0;fcDontList=[];fcFlipped=false;
  showScreen('flashcard');renderFcCard();
}
function setFcSide(s){
  fcSide=s;
  document.getElementById('tab-uz').classList.toggle('active',s==='uz');
  document.getElementById('tab-en').classList.toggle('active',s==='en');
  renderFcCard();
}
function renderFcCard(){
  if(fcIndex>=fcQueue.length){fcFinish();return;}
  const w=fcWords[fcQueue[fcIndex]];
  const tl=getTypeLabel(getWordType(w.en));
  fcFlipped=false;
  if(fcSide==='uz'){
    document.getElementById('fc-front-label').textContent="O'ZBEKCHA";
    document.getElementById('fc-front-word').textContent=w.uz;
    document.getElementById('fc-front-type').style.display='none';
    document.getElementById('fc-back-label').textContent="INGLIZCHA";
    document.getElementById('fc-back-word').textContent=w.en;
    document.getElementById('fc-back-tr').textContent=w.tr||'';
    const bt=document.getElementById('fc-back-type');
    if(tl){bt.textContent=tl;bt.style.display='inline-block';}else bt.style.display='none';
  } else {
    document.getElementById('fc-front-label').textContent="INGLIZCHA";
    document.getElementById('fc-front-word').textContent=w.en;
    document.getElementById('fc-front-type').style.display='none';
    document.getElementById('fc-back-label').textContent="O'ZBEKCHA";
    document.getElementById('fc-back-word').textContent=w.uz;
    document.getElementById('fc-back-tr').textContent='';
    const bt=document.getElementById('fc-back-type');
    if(tl){bt.textContent=tl;bt.style.display='inline-block';}else bt.style.display='none';
  }
  document.getElementById('fc-back').style.display='none';
  document.getElementById('fc-hint').style.display='block';
  document.getElementById('fc-rate-btns').style.display='none';
  document.getElementById('fc-nav-btns').style.display='flex';
  document.getElementById('fc-left').textContent=fcQueue.length-fcIndex;
  document.getElementById('fc-counter').textContent=(fcIndex+1)+' / '+fcQueue.length;
  document.getElementById('fc-progress').style.width=Math.round((fcIndex/fcQueue.length)*100)+'%';
  document.getElementById('fc-know-count').textContent=fcKnow;
  document.getElementById('fc-dontknow-count').textContent=fcDont;
}
function fcFlip(){
  if(fcFlipped)return;fcFlipped=true;
  const w=fcWords[fcQueue[fcIndex]];
  document.getElementById('fc-back').style.display='block';
  document.getElementById('fc-hint').style.display='none';
  document.getElementById('fc-rate-btns').style.display='flex';
  document.getElementById('fc-nav-btns').style.display='none';
  speak(w.en);
}
function fcRate(knew){
  const w=fcWords[fcQueue[fcIndex]];
  if(knew){fcKnow++;addXP(5);}else{fcDont++;fcDontList.push(fcQueue[fcIndex]);}
  fcIndex++;renderFcCard();
}
function fcSkipNext(){if(fcIndex<fcQueue.length-1){fcIndex++;renderFcCard();}}
function fcSkipBack(){if(fcIndex>0){fcIndex--;renderFcCard();}}
function speakCurrent(){
  if(fcIndex>=fcQueue.length)return;
  const btn=document.getElementById('fc-audio-btn');btn.classList.add('speaking');
  speak(fcWords[fcQueue[fcIndex]].en,()=>btn.classList.remove('speaking'));
}
function fcFinish(){
  document.getElementById('fc-final-know').textContent=fcKnow;
  document.getElementById('fc-final-dont').textContent=fcDont;
  document.getElementById('fc-retry-wrong-btn').style.display=fcDontList.length?'flex':'none';
  showScreen('fc-done');
}

