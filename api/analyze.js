export default async function handler(req, res) {
  // CORS (local dev'in canlı fonksiyonu çağırabilmesi için)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.GEMINI_KEY;
  if (!key) return res.status(500).json({ error: 'Missing GEMINI_KEY' });

  // Debug: geçerli model adlarını listele (tarayıcıda /api/analyze aç)
  if (req.method === 'GET') {
    const lr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const lj = await lr.json();
    const models = (lj.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => m.name);
    return res.status(200).json({ models });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { symbol, rangeLabel, indicators, mode, lang } = req.body || {};
    if (!indicators) return res.status(400).json({ error: 'Missing indicators' });

    const language = lang === 'tr' ? 'Turkish' : 'English';
    const depth = mode === 'simple'
      ? 'Be very brief and beginner-friendly: analysis = 1-2 short sentences, outlook = 1 short sentence, keyPoints = at most 2 short items.'
      : 'analysis = 2-3 sentences, outlook = 1-2 sentences, keyPoints = 3 short items.';

    const prompt = `You are a concise crypto market analyst. You are given precomputed technical indicators for ${symbol || 'an asset'} over the ${rangeLabel || 'selected'} range. Explain what they show, grounded ONLY in these numbers — do not invent data. Then give a short, hedged near-term outlook. Neutral and factual. NOT financial advice.

Write the response in ${language}. ${depth}

Indicators (JSON):
${JSON.stringify(indicators)}

Respond as JSON with exactly:
{
  "analysis": "...",
  "outlook": "...",
  "keyPoints": ["..."]
}`;

    const callGemini = (model) =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
        }),
      });

    // Model meşgulse (503/429/5xx) tekrar dene, olmazsa yedek modele geç
    const models = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
    let data = null, lastErr = '';
    for (let i = 0; i < 4 && !data; i++) {
      const model = i < 3 ? models[0] : models[1];
      const rr = await callGemini(model);
      if (rr.ok) { data = await rr.json(); break; }
      lastErr = await rr.text();
      if (![429, 500, 502, 503].includes(rr.status)) break;
      await new Promise((res2) => setTimeout(res2, 400 * (i + 1)));
    }

    if (!data) {
      return res.status(502).json({ error: 'LLM request failed', detail: lastErr.slice(0, 400) });
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { analysis: text, outlook: '', keyPoints: [] }; }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e).slice(0, 400) });
  }
}