import { useState } from 'react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

export default function AIAssistant({ currentKeyInfo, scaleLabel, scaleMode, activeScalePcs, isFlat, parentKeyName }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  async function callGemini(prompt) {
    if (!API_KEY) { setError('No API key — add VITE_GEMINI_API_KEY to .env and restart the dev server.'); return; }
    setLoading(true); setResponse(null); setError('');
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
          {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: 'You are an expert music theorist. Be concise.' }] },
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message ?? `HTTP ${res.status}`;
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            setError(`API error: ${msg}`); setLoading(false); return;
          }
          throw new Error(msg);
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) { setResponse(text); setLoading(false); return; }
      } catch (e) {
        if (i < 2) await new Promise(r => setTimeout(r, delays[i]));
        else { setError(`AI error: ${e.message}`); setLoading(false); return; }
      }
    }
    setLoading(false);
  }

  const { pcToName } = { pcToName: (pc, flat) => ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'][flat ? [0,1,2,3,4,5,6,7,8,9,10,11].indexOf(pc) : pc] };
  const noteNames = activeScalePcs.map(pc => {
    const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const flatNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    return isFlat ? flatNames[pc] : names[pc];
  }).join(', ');

  const modeContext = parentKeyName
    ? `${scaleLabel} (derived from ${parentKeyName} Major, notes: ${noteNames})`
    : `${scaleLabel} (notes: ${noteNames})`;

  function handleCharacteristics() {
    callGemini(
      `Describe the emotional character and typical use of ${modeContext}. Mention 2-3 famous songs or pieces that use this sound. Under 150 words, no markdown.`
    );
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xl">🤖</span>
        <div>
          <div className="font-bold text-sm text-white">AI Musical Assistant</div>
          <div className="text-xs text-white/35 mt-0.5">Discover the emotional character of this scale</div>
        </div>
        <button onClick={handleCharacteristics} disabled={loading}
          className="ml-auto px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(96,165,250,0.25))', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
          ✨ Key Characteristics
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl animate-pulse"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-purple-300 font-medium">Consulting the musical oracle…</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {response && !loading && (
        <div className="mt-4 p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
