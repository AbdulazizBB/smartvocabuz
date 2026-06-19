/* ============================================================
   auth.js — Supabase Auth (SDK bilan, Google OAuth to'g'ri)
   supabase.min.js dan keyin yuklanishi SHART
   ============================================================ */

let currentUser = null;
let _sbClient = null;

// Supabase client (bir marta yaratiladi)
function getSB() {
  if (_sbClient) return _sbClient;
  if (!window._SB_URL || !window._SB_ANON) return null;
  if (!window.supabase) return null;
  _sbClient = window.supabase.createClient(window._SB_URL, window._SB_ANON, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sv_supabase_session'
    }
  });
  return _sbClient;
}

function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function loadUser() { try { return JSON.parse(localStorage.getItem('sv_user') || 'null'); } catch { return null; } }
function saveUser(u) { localStorage.setItem('sv_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('sv_user'); }

// ---- LOGIN MUVAFFAQIYATLI ----
async function _onLoginSuccess(sbUser) {
  if (!sbUser?.id) return;

  const isAdmin = (sbUser.email === window._ADMIN_EMAIL);
  const name = sbUser.user_metadata?.full_name
    || sbUser.user_metadata?.name
    || sbUser.email?.split('@')[0]
    || 'User';

  const user = {
    id: sbUser.id,
    name,
    email: sbUser.email || '',
    avatar: sbUser.user_metadata?.avatar_url || null,
    sessionId: uuid4(),
    isAdmin,
    lang: _lang || 'uz',
    loginTime: Date.now()
  };

  currentUser = user;
  saveUser(user);

  await tracker.registerSession(user);
  tracker.startHeartbeat();
  hideAuthScreen();

  if (isAdmin) { showScreen('admin'); renderAdminPanel(); }
  else { showScreen('home'); renderHome(); }
}

// ---- EMAIL LOGIN ----
async function doEmailLogin() {
  const email = (document.getElementById('login-email')?.value || '').trim();
  const pass = (document.getElementById('login-pass')?.value || '').trim();
  const errEl = document.getElementById('login-error');
  if (errEl) errEl.textContent = '';

  if (!email || !pass) { if (errEl) errEl.textContent = T('auth_fill_fields'); return; }

  setAuthLoading('login', true);
  const sb = getSB();

  if (!sb) {
    if (errEl) errEl.textContent = 'Supabase ulanmagan';
    setAuthLoading('login', false);
    return;
  }

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (error) {
    if (errEl) errEl.textContent = T('auth_wrong_pass');
    setAuthLoading('login', false);
    return;
  }

  await _onLoginSuccess(data.user);
  setAuthLoading('login', false);
}

// ---- EMAIL REGISTER ----
async function doEmailRegister() {
  const name = (document.getElementById('reg-name')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const pass = (document.getElementById('reg-pass')?.value || '').trim();
  const pass2 = (document.getElementById('reg-pass2')?.value || '').trim();
  const errEl = document.getElementById('reg-error');
  if (errEl) { errEl.textContent = ''; errEl.style.color = ''; }

  if (!name || !email || !pass) { if (errEl) errEl.textContent = T('auth_fill_fields'); return; }
  if (pass !== pass2) { if (errEl) errEl.textContent = T('auth_pass_mismatch'); return; }
  if (pass.length < 6) { if (errEl) errEl.textContent = T('auth_pass_short'); return; }

  setAuthLoading('reg', true);
  const sb = getSB();

  if (!sb) {
    if (errEl) errEl.textContent = 'Supabase ulanmagan';
    setAuthLoading('reg', false);
    return;
  }

  const { data, error } = await sb.auth.signUp({
    email, password: pass,
    options: { data: { full_name: name } }
  });

  if (error) {
    if (errEl) errEl.textContent = error.message;
    setAuthLoading('reg', false);
    return;
  }

  if (data.user && !data.user.confirmed_at && !data.session) {
    // Email tasdiqlash kutilmoqda
    if (errEl) { errEl.style.color = '#34d399'; errEl.textContent = '✓ Email yuborildi! Tasdiqlang va kiring.'; }
    setAuthLoading('reg', false);
    return;
  }

  if (data.user) await _onLoginSuccess(data.user);
  setAuthLoading('reg', false);
}

// ---- GOOGLE LOGIN ----
async function doGoogleLogin() {
  const sb = getSB();
  if (!sb) { alert('Supabase ulanmagan'); return; }

  const redirectTo = window.location.origin
    ? window.location.origin + window.location.pathname
    : window.location.href.split('?')[0].split('#')[0];

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });

  if (error) {
    console.error('Google OAuth error object:', error);
    const msg = error.message || (error.status ? `${error.status}` : 'Unknown error');
    let userMsg = 'Google login xatosi: ' + msg;
    // Common Supabase error: provider disabled or redirect mismatch
    if (msg.includes('Unsupported provider') || msg.toLowerCase().includes('provider is not enabled')) {
      userMsg += '\n\nSababi: Google provider Supabase sozlamalarida yoqilmagan yoki redirect URL mos emas.';
      userMsg += '\nIltimos Supabase project → Authentication → Providers → Google ni yoqing.';
      userMsg += '\nVa Auth settings → Redirect URLs ga ushbu URL ni qoshing: ' + redirectTo;
    }
    alert(userMsg);
  }
}

// ---- LOGOUT ----
async function doLogout() {
  if (currentUser) await tracker.endSession(currentUser.sessionId);
  const sb = getSB();
  if (sb) await sb.auth.signOut();
  currentUser = null;
  clearUser();
  showAuthScreen('login');
}

// ---- AUTH EKRAN ----
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
  ['login-error', 'reg-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.color = ''; }
  });
}

function setAuthLoading(type, on) {
  const btn = document.getElementById(type + '-btn');
  if (btn) { btn.disabled = on; btn.style.opacity = on ? '0.7' : '1'; }
}

function authKeydown(e, type) {
  if (e.key === 'Enter') { if (type === 'login') doEmailLogin(); else doEmailRegister(); }
}

// ---- INIT ----
async function initAuth() {
  applyLang();

  const sb = getSB();
  if (!sb) {
    // Supabase yo'q — to'g'ridan-to'g'ri login ekrani
    showAuthScreen('login');
    return;
  }

  // 1. Supabase sessiyasini tekshirish (Google callback ham shu yerda)
  const { data: { session } } = await sb.auth.getSession();

  if (session?.user) {
    await _onLoginSuccess(session.user);
    return;
  }

  // 2. Oldingi foydalanuvchi yo'q — login ekrani
  clearUser();
  showAuthScreen('login');

  // 3. Auth holat o'zgarishini kuzatish (avtomatik refresh)
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user && !currentUser) {
      await _onLoginSuccess(session.user);
    }
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      clearUser();
      showAuthScreen('login');
    }
  });
}
