/* ============================================================
   So'z O'rgatuvchi — Birliklar (Units) boshqaruvi
   Fayl     : js/units.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • renderUnitManage — mavjud birliklarni tahrirlash ekrani
     • editUnit(id)     — birlikni tahrirlash formasini ochish
     • deleteUnit(id)   — birlikni o'chirish (tasdiqlash bilan)
     • parseWords(text) — matndan so'z juftlarini ajratib olish
                          (qator bo'yicha, "-" yoki "=" ajratgich)
     • saveUnit()       — yangi yoki tahrirlangan birlikni saqlash
     • uid()            — noyob ID generatsiyasi (timestamp + random)
   ============================================================ */

// ===== UNIT MANAGE =====
function renderUnitManage(){
  const list=document.getElementById('unit-list');list.innerHTML='';
  if(!units.length){list.innerHTML='<p style="color:#666;font-size:13px">Bo\'lim yo\'q.</p>';return;}
  units.forEach(u=>{
    const div=document.createElement('div');div.className='unit-card';
    div.innerHTML=`<div onclick="editUnit('${u.id}')" style="flex:1;cursor:pointer">
        <div class="unit-name">${u.name}</div><div class="unit-count">${u.words.length} ta so'z</div>
      </div>
      <div class="unit-actions">
        <button class="icon-btn" onclick="editUnit('${u.id}')">✏️</button>
        <button class="icon-btn" onclick="deleteUnit('${u.id}')">🗑️</button>
      </div>`;
    list.appendChild(div);
  });
}
function showAddUnit(){
  editingUnitId=null;
  document.getElementById('edit-unit-title').textContent="Yangi bo'lim";
  document.getElementById('unit-name-input').value='';
  document.getElementById('words-input').value='';
  document.getElementById('edit-error').style.display='none';
  document.getElementById('existing-words-section').style.display='none';
  showScreen('unit-edit');
}
function editUnit(id){
  const u=units.find(x=>x.id===id);if(!u)return;
  editingUnitId=id;
  document.getElementById('edit-unit-title').textContent='Tahrirlash';
  document.getElementById('unit-name-input').value=u.name;
  document.getElementById('words-input').value='';
  document.getElementById('edit-error').style.display='none';
  const sec=document.getElementById('existing-words-section');
  const wl=document.getElementById('existing-word-list');wl.innerHTML='';
  u.words.forEach((w,i)=>{
    const tl=getTypeLabel(getWordType(w.en));
    const div=document.createElement('div');div.className='word-item';
    div.innerHTML=`<div class="word-item-text">
        <div class="word-en">${w.en}${tl?' <span class="wtype" style="font-size:10px">'+tl+'</span>':''}</div>
        <div class="word-uz">${w.uz}</div>
      </div>
      <button class="icon-btn" onclick="removeWord('${id}',${i})" style="font-size:15px">✕</button>`;
    wl.appendChild(div);
  });
  sec.style.display=u.words.length?'block':'none';
  showScreen('unit-edit');
}
function removeWord(uid,idx){const u=units.find(x=>x.id===uid);if(!u)return;u.words.splice(idx,1);sv('vocab_v5',units);editUnit(uid);}
function deleteUnit(id){if(!confirm("Bu bo'limni o'chirasizmi?"))return;units=units.filter(x=>x.id!==id);sv('vocab_v5',units);renderUnitManage();}
function parseWords(text){
  return text.split('\n').map(l=>l.trim()).filter(l=>l).map(line=>{
    const eq=line.lastIndexOf('=');
    if(eq<0)throw new Error('Format xato: '+line);
    const en=line.slice(0,eq).trim(),uz=line.slice(eq+1).trim();
    if(!en||!uz)throw new Error("Bo'sh: "+line);
    return {en,tr:'',uz};
  });
}
function saveUnit(){
  const name=document.getElementById('unit-name-input').value.trim();
  const text=document.getElementById('words-input').value.trim();
  const errEl=document.getElementById('edit-error');errEl.style.display='none';
  if(!name){errEl.textContent="Bo'lim nomini kiriting!";errEl.style.display='block';return;}
  let nw=[];
  if(text){try{nw=parseWords(text);}catch(e){errEl.textContent=e.message;errEl.style.display='block';return;}}
  if(editingUnitId){const u=units.find(x=>x.id===editingUnitId);u.name=name;u.words=[...u.words,...nw];}
  else{if(!nw.length){errEl.textContent="Kamida bitta so'z!";errEl.style.display='block';return;}units.push({id:uid(),name,words:nw});}
  sv('vocab_v5',units);showScreen('unit-manage');
}
function uid(){return 'u_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);}

if(window.speechSynthesis){window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices();window.speechSynthesis.getVoices();}
checkStreak();applyTheme();renderHome();

