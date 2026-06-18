/* ============================================================
   Netlify Function — Google OAuth callback
   Fayl   : netlify/functions/auth_google.js
   Endpoint: GET /api/auth/google/callback
   Supabase Auth orqali Google login
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  // Supabase o'zi Google OAuth ni boshqaradi
  // Bu function faqat user ma'lumotlarini tekshiradi
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const { token, userId, name, email, avatar } = JSON.parse(event.body || '{}');

  if (!userId) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'No user id' }) };
  }

  try {
    // Foydalanuvchini DB ga yozish/yangilash
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: name || email || userId,
        email,
        avatar_url: avatar,
        last_seen: new Date().toISOString()
      })
    });

    // Agar foydalanuvchi yangi bo'lsa — yaratish
    if (res.status === 404 || (await res.text()) === '[]') {
      await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: userId, name: name || email || userId,
          email, avatar_url: avatar, lang: 'uz',
          xp: 0, streak: 0, level: 'Beginner',
          last_seen: new Date().toISOString()
        })
      });
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
