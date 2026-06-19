/* ============================================================
   admin.js — Admin Panel UI
   Faqat isAdmin === true foydalanuvchi uchun
   ============================================================ */

let _adminRefreshTimer = null;
let _admTab = 'users';

async function renderAdminPanel() {
  if (!currentUser?.isAdmin) { showScreen('home'); return; }
  showScreen('admin');

  const screen = document.getElementById('screen-admin');
  if (!screen) return;

  screen.innerHTML = `
    <div class="adm-header">
      <span class="adm-title">🛡️ ${T('admin_panel')}</span>
      <button class="btn-icon" onclick="doLogout()" title="${T('logout')}" style="font-size:18px;width:36px;height:36px">🚪</button>
    </div>

    <div class="adm-top-stats" id="adm-top">
      <div class="adm-stat-card"><div class="adm-stat-num" id="adm-n-users">—</div><div class="adm-stat-lbl">${T('admin_total')}</div></div>
      <div class="adm-stat-card online"><div class="adm-stat-num" id="adm-n-online">—</div><div class="adm-stat-lbl">${T('admin_online')}</div></div>
      <div class="adm-stat-card"><div class="adm-stat-num" id="adm-n-sessions">—</div><div class="adm-stat-lbl">${T('admin_sessions')}</div></div>
    </div>

    <div class="adm-tabs">
      <button class="adm-tab active" id="admt-users"    onclick="admSwitchTab('users')">👥 ${T('admin_users')}</button>
      <button class="adm-tab"        id="admt-online"   onclick="admSwitchTab('online')">🟢 ${T('admin_online')}</button>
      <button class="adm-tab"        id="admt-sessions" onclick="admSwitchTab('sessions')">📋 ${T('admin_sessions')}</button>
    </div>

    <div id="adm-content" style="overflow-x:auto;width:100%">
      <div class="adm-loading">${T('loading')}</div>
    </div>
    <div class="adm-footer">
      🔄 Har 30 sonda yangilanadi •
      <span id="adm-updated">—</span>
    </div>`;

  await admLoadData();

  if (_adminRefreshTimer) clearInterval(_adminRefreshTimer);
  _adminRefreshTimer = setInterval(admLoadData, 30000);
}

async function admLoadData() {
  const content = document.getElementById('adm-content');
  if (!content) return;

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret: window._ADMIN_SECRET })
    });

    if (res.status === 403) {
        content.innerHTML = `<div style="color:#f87171;text-align:center;padding:20px">${T('no_permission')}</div>`;
      return;
    }

    const d = await res.json();
    if (d.error) throw new Error(d.error);

    // Raqamlarni yangilash
    const nu = document.getElementById('adm-n-users');
    const no = document.getElementById('adm-n-online');
    const ns = document.getElementById('adm-n-sessions');
    if (nu) nu.textContent = d.stats.totalUsers;
    if (no) no.textContent = d.stats.onlineCount;
    if (ns) ns.textContent = d.stats.totalSessions;

    const upd = document.getElementById('adm-updated');
    if (upd) upd.textContent = new Date().toLocaleTimeString('uz-UZ');

    // Jadval ko'rsatish
    admRenderTab(_admTab, d);

    // Tab ni window._admData ga saqlash
    window._admData = d;

  } catch(err) {
    content.innerHTML = `<div style="color:#f87171;text-align:center;padding:20px">${T('error')}: ${err.message}</div>`;
  }
}

function admSwitchTab(tab) {
  _admTab = tab;
  document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
  const bt = document.getElementById('admt-' + tab);
  if (bt) bt.classList.add('active');
  if (window._admData) admRenderTab(tab, window._admData);
}

function admRenderTab(tab, d) {
  if (tab === 'users')    admRenderUsers(d.users);
  if (tab === 'online')   admRenderOnline(d.online);
  if (tab === 'sessions') admRenderSessions(d.allSessions);
}

function fmtDt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function levelBadge(lvl) {
  const colors = {
    'Beginner': '#6b7280', 'Elementary': '#3b82f6',
    'Pre-Intermediate': '#8b5cf6', 'Intermediate': '#f59e0b',
    'Upper-Intermediate': '#f97316', 'Advanced': '#ef4444'
  };
  const c = colors[lvl] || '#6b7280';
  return `<span style="background:${c}22;color:${c};padding:2px 8px;border-radius:8px;font-size:11px;white-space:nowrap">${lvl||'Beginner'}</span>`;
}

function langFlag(l) { return ({uz:'🇺🇿',ru:'🇷🇺',en:'🇬🇧'})[l] || '🌐'; }

function admRenderUsers(users) {
  const el = document.getElementById('adm-content');
  if (!el) return;
  if (!users?.length) { el.innerHTML = `<div class="adm-empty">${T('no_users')}</div>`; return; }

  el.innerHTML = `<table class="adm-table">
    <thead><tr>
      <th>${T('name')}</th><th>${T('level')}</th><th>${T('xp')}</th><th>${T('correct')}</th><th>${T('wrong')}</th><th>${T('streak')}</th><th>${T('lang')}</th><th>${T('last_seen')}</th>
    </tr></thead>
    <tbody>
      ${users.map(u => `<tr>
        <td><span style="font-weight:600">${escHtml(u.name||'—')}</span>${u.is_admin?' 🛡️':''}</td>
        <td>${levelBadge(u.level)}</td>
        <td style="color:#fbbf24;font-weight:700">${u.xp||0}</td>
        <td style="color:#34d399">${u.total_correct||0}</td>
        <td style="color:#f87171">${u.total_wrong||0}</td>
        <td>${u.streak||0}</td>
        <td>${langFlag(u.lang)}</td>
        <td style="font-size:11px;color:#888;white-space:nowrap">${fmtDt(u.last_seen)}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function admRenderOnline(sessions) {
  const el = document.getElementById('adm-content');
  if (!el) return;
  if (!sessions?.length) {
    el.innerHTML = `<div class="adm-empty">${T('no_online')}</div>`;
    return;
  }
  el.innerHTML = sessions.map(s => `
    <div class="adm-online-card">
      <div>
        <div style="font-weight:700">${escHtml(s.user_name||'—')}</div>
        <div style="font-size:11px;color:#888">${T('entered_at')}: ${fmtDt(s.login_at)}</div>
        <div style="font-size:11px;color:#888">${T('last_ping')}: ${fmtDt(s.last_ping)}</div>
        ${s.country ? `<div style="font-size:11px;color:#888">📍 ${s.country}</div>` : ''}
      </div>
      <div style="text-align:right">${langFlag(s.lang)}<br><span style="color:#34d399;font-size:12px">${T('online_label')}</span></div>
    </div>`).join('');
}

function admRenderSessions(sessions) {
  const el = document.getElementById('adm-content');
  if (!el) return;
  if (!sessions?.length) { el.innerHTML = `<div class="adm-empty">${T('no_sessions')}</div>`; return; }

  el.innerHTML = `<table class="adm-table">
    <thead><tr>
      <th>${T('name')}</th><th>${T('entered_at')}</th><th>${T('exited_at')}</th><th>📍</th><th>${T('lang')}</th><th>${T('status')}</th>
    </tr></thead>
    <tbody>
      ${sessions.slice(0, 200).map(s => `<tr>
        <td style="font-weight:600">${escHtml(s.user_name||'—')}</td>
        <td style="font-size:11px;white-space:nowrap">${fmtDt(s.login_at)}</td>
        <td style="font-size:11px;white-space:nowrap">${s.logout_at ? fmtDt(s.logout_at) : '—'}</td>
        <td style="font-size:12px">${s.country||'—'}</td>
        <td>${langFlag(s.lang)}</td>
        <td>${s.is_active
          ? '<span style="color:#34d399;font-size:12px">🟢</span>'
          : '<span style="color:#6b7280;font-size:12px">⚫</span>'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
