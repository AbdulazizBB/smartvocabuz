/* ============================================================
   Netlify Function — Gemini AI Tushuntirma
   Fayl     : netlify/functions/explain.js
   Maqsad   : Gemini API ga xavfsiz murojaat qilish
               (API key foydalanuvchidan yashirinadi)
   So'rov   : POST /api/explain
   Body     : { type, word, correct, wrong, uz, extra }
   Javob    : { explanation: "..." }
   ============================================================ */

exports.handler = async (event) => {
  // Faqat POST qabul qilinadi
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Faqat POST so'rov qabul qilinadi" })
    };
  }

  // API key environment dan olinadi (Netlify dashboard da saqlanadi)
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API kalit sozlanmagan" })
    };
  }

  let ctx;
  try {
    ctx = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Noto'g'ri so'rov formati" })
    };
  }

  // Prompt yasash
  const prompt = buildPrompt(ctx);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
      }
    );

    const data = await res.json();

    // Gemini javobini ajratib olish
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "AI javob bermadi" })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explanation: text.trim() })
    };

  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "AI serveriga ulanib bo'lmadi" })
    };
  }
};

/* ── Prompt yasovchi funksiya ── */
function buildPrompt(ctx) {
  const base = `Siz ingliz tili o'qituvchisiz. Javobni FAQAT o'zbek tilida bering. 
Qisqa va tushunarli bo'lsin (3-4 jumla). Murakkab atamalar ishlatmang.
Tuzilma: 1) Nima uchun xato 2) To'g'ri qoida/formula 3) Qisqa misol gap.`;

  if (ctx.type === 'irregular') {
    return `${base}

Mavzu: Noto'g'ri fe'llar (Irregular Verbs)
Fe'l (base): "${ctx.word}" — o'zbekcha: "${ctx.uz}"
To'g'ri javob: "${ctx.correct}"
Foydalanuvchi yozdi: "${ctx.wrong || '(bo\'sh qoldirdi)'}"

Nima uchun "${ctx.correct}" to'g'ri ekanini tushuntir. Fe'lning uchta shaklini (base/past/pp) ayt.`;
  }

  if (ctx.type === 'exercise') {
    return `${base}

Mavzu: ${ctx.extra || 'Grammar'}
Savol: "${ctx.word}"
To'g'ri javob: "${ctx.correct}"
Foydalanuvchi tanladi: "${ctx.wrong || '(tanlamadi)'}"

Nima uchun "${ctx.correct}" to'g'ri ekanini tushuntir. Grammatik qoidani formula shaklida ber.`;
  }

  // vocab
  return `${base}

Mavzu: Ingliz so'zlari
O'zbekcha ma'no: "${ctx.uz}"
To'g'ri inglizcha: "${ctx.correct}"
Foydalanuvchi yozdi: "${ctx.wrong || '(bo\'sh qoldirdi)'}"

Bu so'zning ma'nosi va to'g'ri ishlatilishini tushuntir. Eslab qolish uchun misol gap keltir.`;
}
