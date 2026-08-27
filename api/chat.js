export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.GEMINI_KEY;
  if (!key) return res.status(500).json({ error: 'Missing GEMINI_KEY' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { symbol, rangeLabel, indicators, messages } = req.body || {};
    if (!messages || !messages.length) return res.status(400).json({ error: 'Missing messages' });

    const system = `You are CoinPunk's market analysis assistant, helping the user understand ${symbol || 'an asset'} over the ${rangeLabel || 'selected'} range. Base your answers on these precomputed indicators and do NOT invent price data: ${JSON.stringify(indicators || {})}. You may also explain general concepts (e.g. what RSI, volatility or a breakout means). Keep answers concise (2-4 sentences), neutral and factual. Never give financial advice or explicit buy/sell calls; if asked to predict, answer probabilistically and add a brief "not financial advice" reminder.`;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.text || '') }],
    }));

    const callGemini = (model) =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.5 },
        }),
      });

    const models = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
    let data = null, lastErr = '';
    for (let i = 0; i < 4 && !data; i++) {
      const model = i < 3 ? models[0] : models[1];
      const rr = await callGemini(model);
      if (rr.ok) { data = await rr.json(); break; }
      lastErr = await rr.text();
      if (![429, 500, 502, 503].includes(rr.status)) break;
      await new Promise((r2) => setTimeout(r2, 400 * (i + 1)));
    }

    if (!data) return res.status(502).json({ error: 'LLM request failed', detail: lastErr.slice(0, 400) });

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e).slice(0, 400) });
  }
}
