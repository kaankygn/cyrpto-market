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
    const { symbol, rangeLabel, indicators } = req.body || {};
    if (!indicators) return res.status(400).json({ error: 'Missing indicators' });

    const prompt = `You are a concise crypto market analyst. You are given precomputed technical indicators for ${symbol || 'an asset'} over the ${rangeLabel || 'selected'} range. Explain what they show in plain English, grounded ONLY in these numbers — do not invent data. Then give a short, hedged near-term outlook. Neutral and factual. NOT financial advice.

Indicators (JSON):
${JSON.stringify(indicators)}

Respond as JSON with exactly:
{
  "analysis": "2-3 sentence explanation of what the indicators show",
  "outlook": "1-2 sentence hedged near-term outlook",
  "keyPoints": ["short point", "short point", "short point"]
}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
        }),
      }
    );

    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: 'LLM request failed', detail: t.slice(0, 400) });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { analysis: text, outlook: '', keyPoints: [] }; }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e).slice(0, 400) });
  }
}