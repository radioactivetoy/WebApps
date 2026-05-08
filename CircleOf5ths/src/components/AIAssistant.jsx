import { useState } from 'react';
import { NOTE_COLORS } from '../data/musicTheory.js';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const MODEL   = 'gemini-3.1-flash-lite';

const HINT_GROUPS = [
  {
    label: 'Section',
    color: '#a78bfa',
    hints: ['Chorus', 'Verse', 'Bridge', 'Pre-chorus', 'Intro', 'Outro'],
  },
  {
    label: 'Feel',
    color: '#60a5fa',
    hints: ['Exotic', 'Surprising', 'Melodic', 'Dark', 'Dramatic', 'Tense', 'Relaxed', 'Emotional', 'Cinematic', 'Groovy', 'Energetic', 'Minimal'],
  },
  {
    label: 'Colour',
    color: '#34d399',
    hints: [
      'Jazz', 'Bebop', 'Fusion', 'Bossa Nova',
      'Blues', 'Gospel', 'R&B', 'Neo-soul', 'Funk',
      'Latin', 'Flamenco', 'Middle Eastern', 'Celtic',
      'Classical', 'Romantic', 'Impressionist', 'Baroque', 'Film Score',
      'Modal', 'Chromatic', 'Ambient',
    ],
  },
];

export default function AIAssistant({
  currentKeyInfo, scaleLabel, scaleMode, activeScalePcs, isFlat, parentKeyName,
  progressionSequence, diatonicChords, onAddToProgression, onHighlightChord,
}) {
  const [loading, setLoading]                 = useState(false);
  const [response, setResponse]               = useState(null);
  const [error, setError]                     = useState('');
  const [continuationChords, setContinuation] = useState(null);
  const [selectedHints, setSelectedHints]     = useState(new Set());

  function toggleHint(hint) {
    setSelectedHints(prev => {
      const next = new Set(prev);
      next.has(hint) ? next.delete(hint) : next.add(hint);
      return next;
    });
  }

  function hintsClause() {
    if (!selectedHints.size) return '';
    const list = [...selectedHints].join(', ');
    return ` The result should feel: ${list}.`;
  }

  async function callGemini(prompt, parseNext = false) {
    if (!API_KEY) { setError('No API key — add VITE_GEMINI_API_KEY to .env and restart the dev server.'); return; }
    setLoading(true); setResponse(null); setError(''); setContinuation(null);
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
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
        if (text) {
          setResponse(text);
          if (parseNext) {
            const nextLine = text.split('\n').find(l => l.startsWith('NEXT:'));
            if (nextLine) {
              const names = nextLine.replace('NEXT:', '').split('|').map(s => s.trim()).filter(Boolean);
              setContinuation(names);
            }
          }
          setLoading(false); return;
        }
      } catch (e) {
        if (i < 2) await new Promise(r => setTimeout(r, delays[i]));
        else { setError(`AI error: ${e.message}`); setLoading(false); return; }
      }
    }
    setLoading(false);
  }

  const noteNames = activeScalePcs.map(pc => {
    const names     = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const flatNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    return isFlat ? flatNames[pc] : names[pc];
  }).join(', ');

  const modeContext = parentKeyName
    ? `${scaleLabel} (derived from ${parentKeyName} Major, notes: ${noteNames})`
    : `${scaleLabel} (notes: ${noteNames})`;

  function handleCharacteristics() {
    callGemini(
      `Describe the emotional character and typical use of ${modeContext}.${hintsClause()} Mention 2-3 famous songs or pieces that use this sound. Under 150 words, no markdown.`
    );
  }

  function handleAnalyzeProgression() {
    if (!progressionSequence?.length) return;
    const chordNames = progressionSequence.map(c => c.name).join(' – ');
    callGemini(
      `Analyze this chord progression in ${modeContext}: ${chordNames}.${hintsClause()} Describe the harmonic movement, any interesting chord choices or non-diatonic substitutions, the emotional arc, and one concrete suggestion for extending or varying it. Under 200 words, no markdown.`
    );
  }

  function handleContinueProgression() {
    if (!progressionSequence?.length) return;
    const chordNames = progressionSequence.map(c => c.name).join(' – ');
    const available  = diatonicChords?.map(c => c.name).join(', ') ?? '';
    callGemini(
      `Continue this chord progression in ${modeContext}: ${chordNames}.${hintsClause()} Suggest the next 3–4 chords. Prefer diatonic chords (${available}) but include chromatic choices if musically justified. Start your response with exactly one line formatted as: NEXT: Chord1 | Chord2 | Chord3 | Chord4\nThen explain in 1–2 sentences why these choices work. No markdown.`,
      true
    );
  }

  const hasProgression = !!progressionSequence?.length;

  if (!API_KEY) return (
    <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="text-xl opacity-30">🤖</span>
      <div>
        <div className="text-sm font-semibold text-white/30">AI Assistant not configured</div>
        <div className="text-xs text-white/20 mt-0.5">
          Add <code className="text-white/35">VITE_GEMINI_API_KEY</code> to your <code className="text-white/35">.env</code> file and restart the dev server.
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>

      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xl">🤖</span>
        <div>
          <div className="font-bold text-sm text-white">AI Musical Assistant</div>
          <div className="text-xs text-white/35 mt-0.5">Analyse scales and progressions</div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <button onClick={handleCharacteristics} disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(96,165,250,0.25))', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
            ✨ Key Character
          </button>
          <button
            onClick={handleAnalyzeProgression}
            disabled={loading || !hasProgression}
            title={!hasProgression ? 'Build a progression first' : 'Analyse the current progression'}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,rgba(96,165,250,0.2),rgba(52,211,153,0.2))', border: '1px solid rgba(96,165,250,0.3)', color: '#67e8f9' }}>
            🎵 Analyse
          </button>
          <button
            onClick={handleContinueProgression}
            disabled={loading || !hasProgression}
            title={!hasProgression ? 'Build a progression first' : 'Suggest how to continue the progression'}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(167,139,250,0.2))', border: '1px solid rgba(251,191,36,0.3)', color: '#fcd34d' }}>
            ➕ Continue
          </button>
        </div>
      </div>

      {/* Hint chips */}
      <div className="mt-3 flex flex-col gap-1.5">
        {HINT_GROUPS.map(({ label, color, hints }) => (
          <div key={label} className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-bold tracking-widest uppercase w-14 flex-shrink-0"
              style={{ color: color + '60' }}>
              {label}
            </span>
            {hints.map(hint => {
              const active = selectedHints.has(hint);
              return (
                <button
                  key={hint}
                  onClick={() => toggleHint(hint)}
                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all"
                  style={active
                    ? { background: color + '28', border: `1px solid ${color}70`, color }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                  {hint}
                </button>
              );
            })}
          </div>
        ))}
        {selectedHints.size > 0 && (
          <button
            onClick={() => setSelectedHints(new Set())}
            className="self-start text-[8px] text-white/20 hover:text-white/40 transition-colors mt-0.5">
            Clear hints
          </button>
        )}
      </div>

      {/* Loading */}
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

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* Response text */}
      {response && !loading && (
        <div className="mt-4 p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {response.split('\n').filter(l => !l.startsWith('NEXT:')).join('\n').trim()}
          </p>
        </div>
      )}

      {/* Continuation chord chips */}
      {continuationChords?.length > 0 && !loading && (
        <div className="mt-3 p-3 rounded-xl"
          style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <p className="text-[9px] font-bold tracking-[2px] uppercase text-white/25 mb-2">Add to progression</p>
          <div className="flex flex-wrap gap-1.5">
            {continuationChords.map((name, i) => {
              const chord = diatonicChords?.find(c => c.name === name);
              const color = chord ? NOTE_COLORS[chord.rootPc] : 'rgba(255,255,255,0.5)';
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!chord) return;
                    onAddToProgression?.(chord);
                    onHighlightChord?.({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name });
                  }}
                  disabled={!chord}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:opacity-80 disabled:opacity-40"
                  style={{
                    background: chord ? `${color}18` : 'rgba(255,255,255,0.05)',
                    borderColor: chord ? `${color}45` : 'rgba(255,255,255,0.12)',
                    color,
                  }}
                  title={chord ? `Add ${name} to progression` : `${name} not in current diatonic set`}>
                  {name}
                  {chord && <span className="ml-1 opacity-50 text-[9px]">+</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
