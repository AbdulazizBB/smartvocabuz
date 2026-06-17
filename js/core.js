/* ============================================================
   So'z O'rgatuvchi — Asosiy logika (Core)
   Fayl     : js/core.js
   Bog'liqlik: data.js (avval yuklanishi kerak)
   Qamrab oladi:
     • ld() / sv()      — localStorage o'qish/yozish yordamchilari
     • Holat o'zgaruvchilari (units, xp, streak, theme, ...)
     • applyTheme / toggleTheme — qorong'u/yorug' tema
     • checkStreak      — kunlik streak hisoblash
     • addXP / updateXPBar / showXPPopup — gamifikatsiya
     • showScreen       — ekranlar orasida o'tish
     • renderHome       — bosh ekranni yangilash
     • goMode / renderUnitSelect / toggleSel / launchMode
     • buildWordList    — tanlangan birliklardan so'z ro'yxati
     • speak()          — Web Speech API orqali talaffuz
     • shuffle / norm / setBadge / recordError — yordamchilar
   ============================================================ */

function ld(k,d){try{const s=localStorage.getItem(k);return s?JSON.parse(s):d;}catch{return d;}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

let units=ld('vocab_v5',DEFAULT_UNITS);
let selectedUnitIds=[];
let currentMode='flashcard';
let editingUnitId=null;

// Gamification
let xp=ld('xp',0);
let streak=ld('streak',0);
let lastDay=ld('lastDay','');
let wordErrors=ld('wordErrors',{}); // {en: count}
let totalAnswered=ld('totalAnswered',0);
let totalCorrect=ld('totalCorrect',0);
let theme=ld('theme','dark');

// ===== THEME =====
function applyTheme(){
  document.getElementById('body').className=theme==='light'?'light':'';
  document.getElementById('theme-btn').textContent=theme==='light'?'🌙':'☀️';
}
function toggleTheme(){
  theme=theme==='light'?'dark':'light';
  sv('theme',theme);applyTheme();
}

// ===== STREAK =====
function checkStreak(){
  const today=new Date().toDateString();
  if(lastDay===today)return;
  const yesterday=new Date(Date.now()-86400000).toDateString();
  if(lastDay===yesterday)streak++;
  else if(lastDay!==today)streak=1;
  lastDay=today;
  sv('streak',streak);sv('lastDay',lastDay);
}

// ===== XP / LEVEL =====
function getLevel(x){return Math.floor(x/100)+1;}
function xpForLevel(l){return(l-1)*100;}
function addXP(amount){
  xp+=amount;sv('xp',xp);
  showXPPopup('+'+amount+' XP ⭐');
  updateXPBar();
}
function showXPPopup(txt){
  const el=document.getElementById('xp-popup');
  el.textContent=txt;el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),1500);
}
function updateXPBar(){
  const lv=getLevel(xp);
  const base=xpForLevel(lv);
  const next=xpForLevel(lv+1);
  const pct=Math.round(((xp-base)/(next-base))*100);
  document.getElementById('level-label').textContent='Level '+lv;
  document.getElementById('xp-label').textContent=(xp-base)+' / '+(next-base)+' XP';
  document.getElementById('xp-bar').style.width=pct+'%';
  document.getElementById('streak-num').textContent=streak;
}

// ===== SCREENS =====
function showScreen(name){
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  if(name==='home'){renderHome();}
  if(name==='unit-manage')renderUnitManage();
  if(name==='stats')renderStats();
  if(name==='share-screen')renderShare();
}
function renderHome(){
  const total=units.reduce((s,u)=>s+u.words.length,0);
  document.getElementById('home-total').textContent=units.length+" ta bo'lim • "+total+" ta so'z";
  updateXPBar();
}

// ===== MODE =====
function goMode(mode){
  currentMode=mode;
  const labels={flashcard:'🃏 Yod olish',quiz:'✍️ Test',mcq:'🎯 Variantli',speed:'⚡ Tezkor'};
  document.getElementById('mode-label').textContent=labels[mode]||mode;
  selectedUnitIds=[];
  renderUnitSelect();showScreen('unit-select');
}
function renderUnitSelect(){
  const list=document.getElementById('unit-select-list');list.innerHTML='';
  units.forEach(u=>{
    const div=document.createElement('div');div.className='unit-sel-item';div.id='sel_'+u.id;
    div.onclick=()=>toggleSel(u.id);
    div.innerHTML=`<span class="check" id="chk_${u.id}">○</span>
      <div><div class="unit-name">${u.name}</div><div class="unit-count">${u.words.length} ta so'z</div></div>`;
    list.appendChild(div);
  });
}
function toggleSel(id){
  const idx=selectedUnitIds.indexOf(id);
  if(idx>=0)selectedUnitIds.splice(idx,1);else selectedUnitIds.push(id);
  const sel=selectedUnitIds.includes(id);
  document.getElementById('sel_'+id).classList.toggle('selected',sel);
  document.getElementById('chk_'+id).textContent=sel?'✓':'○';
}
function launchMode(){
  if(!selectedUnitIds.length){alert("Kamida bitta bo'lim tanlang!");return;}
  checkStreak();
  if(currentMode==='flashcard')startFlashcard();
  else if(currentMode==='quiz')startQuiz();
  else if(currentMode==='mcq')startMcq();
  else if(currentMode==='speed')startSpeed();
}

function buildWordList(){
  const ws=[];
  selectedUnitIds.forEach(id=>{const u=units.find(x=>x.id===id);if(u)u.words.forEach(w=>ws.push({...w}));});
  return ws;
}

// ===== AUDIO =====
function speak(text,onEnd){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='en-GB';u.rate=0.85;
  const v=window.speechSynthesis.getVoices().find(x=>x.lang.startsWith('en'));
  if(v)u.voice=v;
  u.onend=()=>{if(onEnd)onEnd();};u.onerror=()=>{if(onEnd)onEnd();};
  window.speechSynthesis.speak(u);
}

// ===== HELPERS =====
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function norm(s){return s.trim().toLowerCase().replace(/[''`]/g,"'");}
function setBadge(elId,en){
  const tl=getTypeLabel(getWordType(en));
  const el=document.getElementById(elId);
  if(tl){el.textContent=tl;el.style.display='inline-block';}else el.style.display='none';
}
function recordError(en,isCorrect){
  if(!isCorrect){wordErrors[en]=(wordErrors[en]||0)+1;sv('wordErrors',wordErrors);}
  totalAnswered++;if(isCorrect)totalCorrect++;
  sv('totalAnswered',totalAnswered);sv('totalCorrect',totalCorrect);
}

// ===== FLASHCARD =====
