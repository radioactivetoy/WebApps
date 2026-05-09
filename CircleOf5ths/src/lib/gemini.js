const MODEL  = 'gemini-3.1-flash-lite';
const DELAYS = [1000, 2000, 4000];

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

export async function callGemini(prompt) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: 'You are an expert music theorist. Be concise.' }] },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message ?? `HTTP ${res.status}`;
      if (res.status === 400 || res.status === 401 || res.status === 403) throw new Error(msg);
      if (i < 2) { await new Promise(r => setTimeout(r, DELAYS[i])); continue; }
      throw new Error(msg);
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    if (i < 2) await new Promise(r => setTimeout(r, DELAYS[i]));
  }
  throw new Error('No response after retries');
}
