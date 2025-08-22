// /api/ai.js — Vercel Serverless Function (CommonJS)
module.exports = async (req, res) => {
  // CORS (så Webflow kan kalde endpointet)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const { message, system } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system || 'Svar kort, varmt og på dansk.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
