/* ============================================================
   So'z O'rgatuvchi — Statistika
   Fayl     : js/stats.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • renderStats      — umumiy statistika ekranini ko'rsatish
                          (jami javoblar, to'g'ri %, eng ko'p
                           xato qilingan so'zlar ro'yxati)
     • resetStats       — barcha statistika ma'lumotlarini tozalash
   ============================================================ */

// ===== STATS =====
function renderStats(){
  // summary cards
  const acc=totalAnswered>0?Math.round((totalCorrect/totalAnswered)*100):0;
  const lv=getLevel(xp);
  document.getElementById('stat-grid').innerHTML=`
    <div class="stat-card"><div class="stat-num">${streak}🔥</div><div class="stat-label">${T('streak_label')}</div></div>
    <div class="stat-card"><div class="stat-num">${lv}</div><div class="stat-label">${T('level')}</div></div>
    <div class="stat-card"><div class="stat-num">${xp}</div><div class="stat-label">${T('total_xp')}</div></div>
    <div class="stat-card"><div class="stat-num">${acc}%</div><div class="stat-label">${T('accuracy')}</div></div>`;
  // hard words
  const hw=document.getElementById('hard-words-list');hw.innerHTML='';
  const sorted=Object.entries(wordErrors).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!sorted.length){hw.innerHTML='<p style="color:#666;font-size:13px">'+T('no_errors_yet')+'</p>';return;}
  sorted.forEach(([en,cnt])=>{
    const uz=units.flatMap(u=>u.words).find(w=>w.en===en)?.uz||'';
    const div=document.createElement('div');div.className='hard-word';
    div.innerHTML=`<div class="hard-word-en">${en} <span style="color:#a78bfa;font-size:11px">${getTypeLabel(getWordType(en))||''}</span></div>
      <div style="color:#aaa;font-size:11px">${uz}</div>
      <div class="hard-word-cnt">${cnt} ${T('mistake_times')}</div>`;
    hw.appendChild(div);
  });
}
function resetStats(){
  if(!confirm(T('confirm_clear_stats')))return;
  wordErrors={};totalAnswered=0;totalCorrect=0;
  sv('wordErrors',wordErrors);sv('totalAnswered',0);sv('totalCorrect',0);
  renderStats();
}

