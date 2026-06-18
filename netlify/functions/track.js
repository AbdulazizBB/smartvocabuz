/* ============================================================
   Netlify Function — Foydalanuvchi kuzatuvchi
   POST /api/track
   Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
   Actions: session_start | session_end | heartbeat | sync_stats | update_lang
   ============================================================ */

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

async function sbReq(path, method = 'GET', body = null, prefer = '') {
  const headers = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json'
  };
  if (prefer) headers['Prefer'] = prefer;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, opts);
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

function calcLevel(xp) {
  if (xp < 100)  return 'Beginner';
  if (xp < 300)  return 'Elementary';
  if (xp < 600)  return 'Pre-Intermediate';
  if (xp < 1000) return 'Intermediate';
  if (xp < 1500) return 'Upper-Intermediate';
  return 'Advanced';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };
  if (!SB_URL || !SB_KEY) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'DB not configured' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { action, userId, name, sessionId, lang, xp, streak, totalCorrect, totalWrong } = body;
  const now = new Date().toISOString();

  try {
    // --- session_start ---
    if (action === 'session_start') {
      const level = calcLevel(xp || 0);

      // Profil upsert
      await sbReq(
        `profiles?id=eq.${userId}`,
        'PATCH',
        { name: name || '', lang: lang || 'uz', last_seen: now },
        'return=minimal'
      );

      // Agar profil yo'q bo'lsa yaratish
      await sbReq('profiles', 'POST',
        [{ id: userId, name: name || '', lang: lang || 'uz', xp: xp || 0, streak: streak || 0, level, last_seen: now }],
        'resolution=ignore-duplicates'
      );

      // Sessiya yaratish
      const country = event.headers['x-country'] || event.headers['cf-ipcountry'] || null;
      await sbReq('sessions', 'POST',
        [{ id: sessionId, user_id: userId, user_name: name || '', lang: lang || 'uz', country, login_at: now, last_ping: now, is_active: true }],
        'resolution=ignore-duplicates'
      );

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // --- session_end ---
    if (action === 'session_end') {
      await sbReq(`sessions?id=eq.${sessionId}`, 'PATCH', { logout_at: now, is_active: false }, 'return=minimal');
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // --- heartbeat ---
    if (action === 'heartbeat') {
      await sbReq(`sessions?id=eq.${sessionId}`, 'PATCH', { last_ping: now, is_active: true }, 'return=minimal');
      await sbReq(`profiles?id=eq.${userId}`, 'PATCH', { last_seen: now }, 'return=minimal');
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // --- sync_stats ---
    if (action === 'sync_stats') {
      const level = calcLevel(xp || 0);
      await sbReq(`profiles?id=eq.${userId}`, 'PATCH', {
        xp: xp || 0, streak: streak || 0,
        total_correct: totalCorrect || 0,
        total_wrong: totalWrong || 0,
        level, last_seen: now
      }, 'return=minimal');
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // --- update_lang ---
    if (action === 'update_lang') {
      await sbReq(`profiles?id=eq.${userId}`, 'PATCH', { lang }, 'return=minimal');
      await sbReq(`sessions?id=eq.${sessionId}`, 'PATCH', { lang }, 'return=minimal');
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('[track]', err.message);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
