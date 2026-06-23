/* ============================================================
   Netlify Function — Gemini AI Tushuntirma
   FIX: response parsing, CORS headers, model fallback,
        safety filter handling, lang-aware prompts
   ============================================================ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'GEMINI_API_KEY sozlanmagan' }) };
  }

  let ctx;
  try { ctx = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Noto'g'ri format" }) }; }

  const lang = ctx.lang || 'uz';
  const prompt = buildPrompt(ctx, lang);

  // Try gemini-1.5-flash first (more stable), then 2.0-flash as fallback
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
              candidateCount: 1
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
          })
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`${model} HTTP ${res.status}:`, errBody);
        continue; // try next model
      }

      const data = await res.json();

      // Handle blocked responses
      const candidate = data?.candidates?.[0];
      if (!candidate) {
        console.error(`${model}: no candidates`, JSON.stringify(data));
        continue;
      }

      // Some responses have finishReason=SAFETY with no content
      if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
        console.warn(`${model}: blocked by safety filter`);
        continue;
      }

      const text = candidate?.content?.parts?.[0]?.text || '';
      if (!text.trim()) {
        console.error(`${model}: empty text, full response:`, JSON.stringify(data));
        continue;
      }

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ explanation: text.trim() })
      };

    } catch (err) {
      console.error(`${model} error:`, err.message);
      // continue to next model
    }
  }

  // All models failed
  return {
    statusCode: 502,
    headers: CORS,
    body: JSON.stringify({ error: 'Gemini API javob bermadi. Offline tushuntirma ko\'rsatilmoqda.' })
  };
};

function buildPrompt(ctx, lang) {
  const instrMap = {
    uz: "Javobni FAQAT o'zbek tilida ber. Qisqa (3-5 jumla). Tuzilma: 1) Nima uchun xato 2) To'g'ri qoida 3) Qisqa misol.",
    ru: "Отвечай ТОЛЬКО на русском языке. Кратко (3-5 предложений). Структура: 1) Почему ошибка 2) Правило 3) Пример.",
    en: "Answer ONLY in English. Short (3-5 sentences). Structure: 1) Why wrong 2) The rule 3) Example."
  };
  const instr = instrMap[lang] || instrMap.uz;

  if (ctx.type === 'irregular') {
    return `${instr}\n\nFe'l: "${ctx.word}" (ma'nosi: "${ctx.uz || ''}")\nTo'g'ri shakl: "${ctx.correct}"\nFoydalanuvchi yozdi: "${ctx.wrong || '(bo\\'sh)'}"\n\nBu noto'g'ri fe'lning barcha uch shaklini (base/past/past participle) ko'rsat.`;
  }
  if (ctx.type === 'exercise') {
    return `${instr}\n\nMavzu: ${ctx.extra || 'Grammar'}\nSavol: "${ctx.word}"\nTo'g'ri javob: "${ctx.correct}"\nFoydalanuvchi javobi: "${ctx.wrong || '(hech narsa)'}"\n\nQoidani qisqa formula ko'rinishida ber.`;
  }
  return `${instr}\n\nO'zbekcha: "${ctx.uz || ''}"\nTo'g'ri inglizcha: "${ctx.correct}"\nFoydalanuvchi yozdi: "${ctx.wrong || '(bo\\'sh)'}"\n\nSo'zning ma'nosini va ishlatilishini tushuntir. Misol gap ber.`;
}
