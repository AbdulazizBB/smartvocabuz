/* ============================================================
   auth.js — Supabase Auth (REST API, SDK siz)
   Login: Email+Parol va Google OAuth
   Session: localStorage + Supabase token
   ============================================================ */

let currentUser = null;
let _sbToken = null; // Supabase access token

// ---- HELPERS ----
function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function loadUser()  { try { const u = localStorage.getItem('sv_user'); return u ? JSON.parse(u) : null; } catch { return null; } }
function saveUser(u) { localStorage.setItem('sv_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('sv_user'); localStorage.removeItem('sv_token'); }
function loadToken() { return localStorage.getItem('sv_token'); }
function saveToken(t){ if (t) localStorage.setItem('sv_token', t); }

// ---- SUPABASE REST ----
async function sbAuth(endpoint, body) {
  if (!window._SB_URL || !window._SB_ANON) throw new Error('Supabase not configured');
  const res = await fetch(`${window._SB_URL}/auth/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': window._SB_ANON },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'Auth error');
  return data;
}

async function sbGetUser(token) {
  if (!window._SB_URL || !window._SB_ANON) return null;
  const res = await fetch(`${window._SB_URL}/auth/v1/user`, {
    headers: { 'apikey': window._SB_ANON, 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function sbRefreshToken(refreshToken) {
  try {
    const data = await sbAuth('token?grant_type=refresh_token', { refresh_token: refreshToken });
    return data;
  } catch { return null; }
}

// ---- ON AUTH SUCCESS ----
async function _onLoginSuccess(sbUser, accessToken, refreshToken) {
  _sbToken = accessToken;
  saveToken(accessToken);
  if (refreshToken) localStorage.setItem('sv_refresh', refreshToken);

  const isAdmin = (sbUser.email === window._ADMIN_EMAIL);
  const name = sbUser.user_metadata?.full_name
    || sbUser.user_metadata?.name
    || sbUser.email?.split('@')[0]
    || 'User';

  const user = {
    id:        sbUser.id,
    name,
    email:     sbUser.email,
    avatar:    sbUser.user_metadata?.avatar_url || null,
    sessionId: uuid4(),
    isAdmin,
    lang:      _lang || 'uz',
    loginTime: Date.now()
  };

  currentUser = user;
  saveUser(user);
  await tracker.registerSession(user);
  tracker.startHeartbeat();

  hideAuthScreen();

  if (isAdmin) {
    showScreen('admin');
    renderAdminPanel();
  } else {
    showScreen('home');
    renderHome();
  }
}

// ---- EMAIL LOGIN ----
async function doEmailLogin() {
  const email = (document.getElementById('login-email')?.value || '').trim();
  const pass  = (document.getElementById('login-pass')?.value || '').trim();
  const errEl = document.getElementById('login-error');
  if (errEl) errEl.textContent = '';

  if (!email || !pass) {
    if (errEl) errEl.textContent = T('auth_fill_fields');
    return;
  }

  setAuthLoading('login', true);

  try {
    const data = await sbAuth('token?grant_type=password', { email, password: pass });
    await _onLoginSuccess(data.user, data.access_token, data.refresh_token);
  } catch (err) {
    if (errEl) errEl.textContent = T('auth_wrong_pass');
  } finally {
    setAuthLoading('login', false);
  }
}

// ---- EMAIL REGISTER ----
async function doEmailRegister() {
  const name  = (document.getElementById('reg-name')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const pass  = (document.getElementById('reg-pass')?.value || '').trim();
  const pass2 = (document.getElementById('reg-pass2')?.value || '').trim();
  const errEl = document.getElementById('reg-error');
  if (errEl) errEl.textContent = '';

  if (!name || !email || !pass) { if (errEl) errEl.textContent = T('auth_fill_fields'); return; }
  if (pass !== pass2)           { if (errEl) errEl.textContent = T('auth_pass_mismatch'); return; }
  if (pass.length < 6)          { if (errEl) errEl.textContent = T('auth_pass_short'); return; }

  setAuthLoading('reg', true);

  try {
    const data = await sbAuth('signup', { email, password: pass, data: { full_name: name } });
    if (data.user && data.access_token) {
      await _onLoginSuccess(data.user, data.access_token, data.refresh_token);
    } else {
      // Email tasdiqlash kerak bo'lsa
      if (errEl) errEl.style.color = '#34d399';
      if (errEl) errEl.textContent = 'Email yuborildi! Tasdiqlang va kiring.';
    }
  } catch (err) {
    if (errEl) errEl.textContent = err.message || T('auth_fill_fields');
  } finally {
    setAuthLoading('reg', false);
  }
}

// ---- GOOGLE LOGIN ----
function doGoogleLogin() {
  if (!window._SB_URL || !window._SB_ANON) {
    alert('Google login faqat saytda ishlaydi');
    return;
  }
  const origin = window.location.origin || window.location.href.split('?')[0].split('#')[0];
  const redirectTo = encodeURIComponent(origin);
  window.location.href = `${window._SB_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
}

// ---- OAUTH CALLBACK ----
async function checkOAuthCallback() {
  const hash = window.location.hash;
  if (!hash.includes('access_token=')) return false;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken  = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken) return false;

  // URL ni tozalash
  window.history.replaceState({}, '', window.location.pathname);

  try {
    const sbUser = await sbGetUser(accessToken);
    if (!sbUser?.id) return false;
    await _onLoginSuccess(sbUser, accessToken, refreshToken);
    return true;
  } catch { return false; }
}

// ---- AUTO-LOGIN (token refresh) ----
async function tryAutoLogin() {
  // 1. Saved token bilan tekshirish
  const token = loadToken();
  const refreshToken = localStorage.getItem('sv_refresh');
  const savedUser = loadUser();

  if (token && savedUser) {
    // Token hali ham amalda ekanini tekshir
    const sbUser = await sbGetUser(token);
    if (sbUser?.id) {
      const isAdmin = (sbUser.email === window._ADMIN_EMAIL);
      currentUser = { ...savedUser, sessionId: uuid4(), loginTime: Date.now(), isAdmin };
      _sbToken = token;
      saveUser(currentUser);
      await tracker.registerSession(currentUser);
      tracker.startHeartbeat();
      hideAuthScreen();
      if (isAdmin) { showScreen('admin'); renderAdminPanel(); }
      else { showScreen('home'); renderHome(); }
      return true;
    }

    // Token eskirgan — refresh qilish
    if (refreshToken) {
      const refreshed = await sbRefreshToken(refreshToken);
      if (refreshed?.access_token) {
        const sbUser2 = await sbGetUser(refreshed.access_token);
        if (sbUser2?.id) {
          await _onLoginSuccess(sbUser2, refreshed.access_token, refreshed.refresh_token);
          return true;
        }
      }
    }
  }

  // Hech narsa ishlamadi — localStorage tozalash
  clearUser();
  return false;
}

// ---- LOGOUT ----
async function doLogout() {
  if (currentUser) {
    await tracker.endSession(currentUser.sessionId);
  }
  // Supabase token ni bekor qilish
  if (_sbToken && window._SB_URL && window._SB_ANON) {
    try {
      await fetch(`${window._SB_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': window._SB_ANON, 'Authorization': `Bearer ${_sbToken}` }
      });
    } catch {}
  }
  _sbToken = null;
  currentUser = null;
  clearUser();
  showAuthScreen('login');
}

// ---- AUTH SCREEN ----
function showAuthScreen(tab) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const s = document.getElementById('screen-auth');
  if (s) s.classList.add('active');
  switchAuthTab(tab || 'login');
}

function hideAuthScreen() {
  const s = document.getElementById('screen-auth');
  if (s) s.classList.remove('active');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  const tabEl = document.getElementById('auth-tab-' + tab);
  if (tabEl) tabEl.classList.add('active');
  document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
  const formEl = document.getElementById('auth-form-' + tab);
  if (formEl) formEl.style.display = 'block';
  // Error larni tozalash
  ['login-error', 'reg-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.color = ''; }
  });
}

function setAuthLoading(type, on) {
  const btn = document.getElementById(type + '-btn');
  if (btn) { btn.disabled = on; btn.style.opacity = on ? '0.7' : '1'; }
}

// ---- KEYBOARD ENTER ----
function authKeydown(e, type) {
  if (e.key === 'Enter') {
    if (type === 'login') doEmailLogin();
    else doEmailRegister();
  }
}

// ---- INIT ----
async function initAuth() {
  // OAuth callback (Google login qaytishi)
  const wasOAuth = await checkOAuthCallback();
  if (wasOAuth) return;

  // Auto-login (avvalgi session)
  const autoLogged = await tryAutoLogin();
  if (autoLogged) return;

  // Yangi foydalanuvchi — login ekrani
  showAuthScreen('login');
}
