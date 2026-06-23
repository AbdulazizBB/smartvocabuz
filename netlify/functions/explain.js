/* ============================================================
   Netlify Function — Gemini AI Tushuntirma
   FIX (audit): prompt endi foydalanuvchi tili bilan mos keladi
   (ctx.lang qabul qilinadi — uz/ru/en)
   ============================================================ */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API kalit sozlanmagan' }) };
  }

  let ctx;
  try { ctx = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "Noto'g'ri format" }) }; }

  const prompt = buildPrompt(ctx, ctx.lang || 'uz');

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
        })
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return { statusCode: 500, body: JSON.stringify({ error: 'AI javob bermadi' }) };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explanation: text.trim() })
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};

function buildPrompt(ctx, lang) {
  const instrMap = {
    uz: "Javobni FAQAT o'zbek tilida ber. Qisqa (3-5 jumla). Tuzilma: 1) Nima uchun xato 2) To'g'ri qoida/formula 3) Qisqa misol gap.",
    ru: "Отвечай ТОЛЬКО на русском языке. Кратко (3-5 предложений). Структура: 1) Почему ошибка 2) Правило/формула 3) Пример.",
    en: "Answer ONLY in English. Short (3-5 sentences). Structure: 1) Why it's wrong 2) The rule/formula 3) Example sentence."
  };
  const base = instrMap[lang] || instrMap.uz;

  if (ctx.type === 'irregular') {
    return `${base}\n\nIrregular Verb: "${ctx.word}" (meaning: "${ctx.uz || ''}")\nCorrect form: "${ctx.correct}"\nUser wrote: "${ctx.wrong || '(blank)'}"\n\nExplain why "${ctx.correct}" is correct. Include all three verb forms (base / past / past participle).`;
  }
  if (ctx.type === 'exercise') {
    return `${base}\n\nGrammar topic: ${ctx.extra || 'Grammar'}\nQuestion: "${ctx.word}"\nCorrect answer: "${ctx.correct}"\nUser answered: "${ctx.wrong || '(none)'}"\n\nExplain why "${ctx.correct}" is correct. Give the rule as a short formula (e.g. Subject + verb-s).`;
  }
  return `${base}\n\nUzbek meaning: "${ctx.uz || ''}"\nCorrect English word: "${ctx.correct}"\nUser wrote: "${ctx.wrong || '(blank)'}"\n\nExplain the word's meaning, how to use it, and give one example sentence. If the user's answer was close but wrong, explain the difference.`;
}
