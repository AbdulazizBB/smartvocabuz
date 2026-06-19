/* ============================================================
   So'z O'rgatuvchi — Ulashish va Import
   Fayl     : js/share.js
   Bog'liqlik: data.js, core.js
   Qamrab oladi:
     • renderShare      — barcha birliklarni export/import
                          ekranida ko'rsatish
     • copyUnit(id)     — tanlangan birlikni Base64 kodga aylantirib
                          clipboard'ga nusxalash
     • doImport()       — clipboard'dan kiritilgan kodni dekod qilib
                          yangi birlik qo'shish (xato tekshiruvi bilan)
   ============================================================ */

// ===== SHARE =====
function renderShare(){
  const list=document.getElementById('share-unit-list');list.innerHTML='';
  units.forEach(u=>{
    const div=document.createElement('div');div.className='unit-card';
    div.innerHTML=`<div style="flex:1;text-align:left">
        <div class="unit-name">${u.name}</div>
        <div class="unit-count">${u.words.length} ta so'z</div>
      </div>
      <button class="btn btn-sm" onclick="copyUnit('${u.id}')" style="width:auto">📋 Nusxa</button>`;
    list.appendChild(div);
  });
}
function copyUnit(id){
  const u=units.find(x=>x.id===id);if(!u)return;
  const code=btoa(unescape(encodeURIComponent(JSON.stringify({name:u.name,words:u.words}))));
  navigator.clipboard.writeText(code).then(()=>alert(T('code_copied'))).catch(()=>{
    prompt("Bu kodni nusxalang:",code);
  });
}
function doImport(){
  const raw=document.getElementById('import-code').value.trim();
  const errEl=document.getElementById('import-error');errEl.style.display='none';
  try{
    const json=JSON.parse(decodeURIComponent(escape(atob(raw))));
    if(!json.name||!Array.isArray(json.words))throw new Error();
    const exists=units.find(u=>u.name===json.name);
    if(exists){if(!confirm(json.name + ' ' + T('confirm_overwrite')))return;exists.words=json.words;}
    else units.push({id:uid(),name:json.name,words:json.words});
    sv('vocab_v5',units);document.getElementById('import-code').value='';
    alert('✅ '+json.name+' '+T('import_success'));
  }catch{errEl.textContent=T('code_invalid');errEl.style.display='block';}
}

