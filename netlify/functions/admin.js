/* ============================================================
   Netlify Function — Admin Panel API
   POST /api/admin
   Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_SECRET
   ============================================================ */

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function sbGet(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  // Admin secret tekshiruvi
  if (!ADMIN_SECRET || body.adminSecret !== ADMIN_SECRET) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'DB not configured' }) };
  }

  try {
    // Barcha foydalanuvchilar (so'nggi 500)
    const users = await sbGet('profiles?order=last_seen.desc&limit=500');

    // Online sessiyalar (2 daqiqa ichida ping)
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const online = await sbGet(
      `sessions?is_active=eq.true&last_ping=gte.${twoMinsAgo}&order=last_ping.desc&limit=100`
    );

    // Barcha sessiyalar tarixi (so'nggi 500)
    const allSessions = await sbGet('sessions?order=login_at.desc&limit=500');

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        users,
        online,
        allSessions,
        stats: {
          totalUsers: users.length,
          onlineCount: online.length,
          totalSessions: allSessions.length
        }
      })
    };
  } catch (err) {
    console.error('[admin]', err.message);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
