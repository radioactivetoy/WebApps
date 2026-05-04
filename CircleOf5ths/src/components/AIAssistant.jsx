import { useState } from 'react';
import { noteToPc, NOTE_COLORS, pcToName } from '../data/musicTheory.js';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

export default function AIAssistant({ currentKeyInfo, onHighlightChord }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [genre, setGenre] = useState('Pop');
  const [error, setError] = useState('');
  const [activeAiIdx, setActiveAiIdx] = useState(null);

  async function callGemini(prompt, isProgression) {
    if (!API_KEY) { setError('No API key — add VITE_GEMINI_API_KEY to .env and restart the dev server.'); return; }
    setLoading(true); setResponse(null); setError(''); setActiveAiIdx(null);
    const delays = [1000,2000,4000];
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
              contents:[{parts:[{text:prompt}]}],
              systemInstruction:{parts:[{text:'You are an expert music theorist. Be concise.'}]},
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message ?? `HTTP ${res.status}`;
          // Don't retry auth / bad-request errors
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            setError(`API error: ${msg}`);
            setLoading(false); return;
          }
          throw new Error(msg);
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          if (isProgression) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
              try { setResponse(JSON.parse(match[0])); } catch { setResponse(text); }
            } else { setResponse(text); }
          } else { setResponse(text); }
          setLoading(false); return;
        }
      } catch(e) {
        if (i < 2) await new Promise(r => setTimeout(r, delays[i]));
        else { setError(`AI error: ${e.message}`); setLoading(false); return; }
      }
    }
    setLoading(false);
  }

  function handleCharacteristics() {
    callGemini(
      `Describe the emotional feel and 2-3 famous pieces in ${currentKeyInfo.label}. Under 150 words, no markdown.`,
      false
    );
  }

  function handleProgression() {
    callGemini(
      `Generate a ${genre} chord progression in ${currentKeyInfo.label}.
Return ONLY valid JSON: {"progression":[{"numeral":"I","name":"Cmaj7","notes":["C","E","G","B"]}],"explanation":"one sentence"}`,
      true
    );
  }

  const isFlat = currentKeyInfo.accType === 'flat';

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.2)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xl">🤖</span>
        <div>
          <div className="font-bold text-sm text-white">AI Musical Assistant</div>
          <div className="text-xs text-white/35 mt-0.5">Discover key characteristics · Generate progressions</div>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <button onClick={handleCharacteristics} disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(96,165,250,0.25))', border:'1px solid rgba(167,139,250,0.35)', color:'#c4b5fd' }}>
            ✨ Key Characteristics
          </button>
          <div className="flex items-center gap-1 rounded-lg px-3 py-1"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <select value={genre} onChange={e => setGenre(e.target.value)}
              className="text-xs text-white/70 bg-transparent outline-none cursor-pointer">
              {['Pop','Jazz','Classical','R&B','Cinematic'].map(g => (
                <option key={g} value={g} style={{ background:'#1e1b4b' }}>{g}</option>
              ))}
            </select>
            <button onClick={handleProgression} disabled={loading}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background:'linear-gradient(135deg,rgba(96,165,250,0.3),rgba(52,211,153,0.3))', border:'1px solid rgba(96,165,250,0.35)', color:'#93c5fd' }}>
              ✨ Generate
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl animate-pulse"
          style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.15)' }}>
          <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm text-purple-300 font-medium">Consulting the musical oracle...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm text-red-300"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {response && !loading && (
        <div className="mt-4 p-4 rounded-xl"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
          {typeof response === 'object' && response.progression ? (
            <>
              <p className="text-[10px] font-bold tracking-[1.5px] text-white/25 uppercase mb-3">
                Interactive Progression — click to highlight
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {response.progression.map((chord, idx) => {
                  const pcs = chord.notes.map(noteToPc).filter(n => n !== null);
                  const rootPc = pcs[0];
                  const color = rootPc !== undefined ? NOTE_COLORS[rootPc] : '#a78bfa';
                  const isActive = activeAiIdx === idx;
                  return (
                    <button key={idx}
                      onClick={() => {
                        setActiveAiIdx(idx);
                        if (pcs.length > 0) onHighlightChord({ name: chord.name, pcs, rootPc });
                      }}
                      className="px-4 py-2.5 rounded-xl border text-center min-w-[72px] transition-all"
                      style={isActive
                        ? { background:`${color}30`, borderColor:`${color}70`, boxShadow:`0 0 14px ${color}25` }
                        : { background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.1)' }}>
                      <div className="font-bold text-base" style={{ color }}>{chord.numeral}</div>
                      <div className="text-xs mt-0.5 text-white/45">{chord.name}</div>
                    </button>
                  );
                })}
              </div>
              {response.explanation && (
                <p className="text-xs text-white/55 leading-relaxed">
                  <span className="font-bold text-white/70">Why it works: </span>
                  {response.explanation}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {typeof response === 'string' ? response : JSON.stringify(response)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
