import { useState, useEffect, useRef } from 'react';
import { NOTE_COLORS, noteToPc, pcToName } from '../data/musicTheory.js';
import { GEMINI_API_KEY, callGemini as geminiCall } from '../lib/gemini.js';

const AI_GENRES = [
  'Pop','Rock','Metal','Funk','R&B','Soul','Gospel',
  'Jazz','Bossa Nova','Blues','Country','Folk','Flamenco',
  'Hip-Hop','Electronic','Ambient','Latin','Cinematic','Classical','Neo-Soul',
];

const PROGRESSIONS = {
  major: [
    { name: 'Pop  (I–V–vi–IV)',         degrees: [0, 4, 5, 3] },
    { name: '50s  (I–vi–IV–V)',         degrees: [0, 5, 3, 4] },
    { name: 'Country  (I–V–IV–V)',      degrees: [0, 4, 3, 4] },
    { name: 'Classic  (I–IV–V–I)',      degrees: [0, 3, 4, 0] },
    { name: 'Gospel  (I–IV–I–V)',       degrees: [0, 3, 0, 4] },
    { name: 'Axis  (vi–IV–I–V)',        degrees: [5, 3, 0, 4] },
    { name: 'Jazz ii–V–I',              degrees: [1, 4, 0] },
    { name: 'Turnaround  (I–vi–ii–V)', degrees: [0, 5, 1, 4] },
    { name: 'Circle  (iii–vi–ii–V–I)', degrees: [2, 5, 1, 4, 0] },
    { name: 'Canon  (I–V–vi–iii–IV–I–IV–V)', degrees: [0, 4, 5, 2, 3, 0, 3, 4] },
    { name: 'Blues  (I–IV–I–V–IV–I)',  degrees: [0, 3, 0, 4, 3, 0] },
    { name: 'Extended Blues  (12-bar)', degrees: [0,0,0,0, 3,3,0,0, 4,3,0,4] },
    { name: 'Soul  (I–IV–vi–V–IV)',    degrees: [0, 3, 5, 4, 3] },
  ],
  minor: [
    { name: 'Pop minor  (i–VI–III–VII)', degrees: [0, 5, 2, 6] },
    { name: 'Rock  (i–VII–VI–VII)',      degrees: [0, 6, 5, 6] },
    { name: 'Andalusian  (i–VII–VI–V)', degrees: [0, 6, 5, 4] },
    { name: 'Dorian vibe  (i–IV–i–VII)', degrees: [0, 3, 0, 6] },
    { name: 'Jazz ii–V–i',              degrees: [1, 4, 0] },
    { name: 'Classic  (i–iv–V–i)',      degrees: [0, 3, 4, 0] },
    { name: 'Film  (i–VI–VII–i)',       degrees: [0, 5, 6, 0] },
    { name: 'Epic  (i–VI–III–VII–IV–i–V–i)', degrees: [0, 5, 2, 6, 3, 0, 4, 0] },
    { name: '8-bar minor blues',        degrees: [0,0,0,0, 3,0,4,0] },
  ],
  dorian: [
    { name: 'Groove  (i–IV)',            degrees: [0, 3] },
    { name: 'Modal  (i–II–IV)',          degrees: [0, 1, 3] },
    { name: 'ii–V–I',                   degrees: [1, 4, 0] },
    { name: 'Dorian vamp  (i–IV–i–IV–V)', degrees: [0, 3, 0, 3, 4] },
  ],
  phrygian: [
    { name: 'Cadence  (I–♭II)',          degrees: [0, 1] },
    { name: 'Metal  (I–♭VII–♭VI–I)',     degrees: [0, 6, 5, 0] },
    { name: 'Modal  (I–♭II–♭III–♭II)',   degrees: [0, 1, 2, 1] },
    { name: 'Flamenco  (i–♭II–i–♭VII–♭VI–V)', degrees: [0, 1, 0, 6, 5, 4] },
  ],
  lydian: [
    { name: 'Dream  (I–♯IV–I–V)',        degrees: [0, 1, 0, 4] },
    { name: 'Film  (I–IV–♯IV–I)',        degrees: [0, 3, 1, 0] },
    { name: 'Floating  (I–II–I–II–V)',   degrees: [0, 1, 0, 1, 4] },
  ],
  mixolydian: [
    { name: 'Rock  (I–♭VII–IV)',         degrees: [0, 6, 3] },
    { name: 'Mixo loop  (I–IV–♭VII–I)', degrees: [0, 3, 6, 0] },
    { name: 'Extended  (I–♭VII–IV–I–♭VII–V)', degrees: [0, 6, 3, 0, 6, 4] },
  ],
  locrian: [
    { name: 'Half-dim  (i°–♭II–iv–♭II)', degrees: [0, 1, 3, 1] },
    { name: 'Tension  (i°–♭III–i°–V)',   degrees: [0, 2, 0, 4] },
  ],
  'harm-minor': [
    { name: 'Classic  (i–iv–V–i)',       degrees: [0, 3, 4, 0] },
    { name: 'Andalusian  (i–VI–V–i)',    degrees: [0, 5, 4, 0] },
    { name: 'Neapolitan  (ii°–V–i)',     degrees: [1, 4, 0] },
    { name: 'Hungarian  (i–iv–i–V–i)',   degrees: [0, 3, 0, 4, 0] },
  ],
  'mel-minor': [
    { name: 'Jazz i–IV',                 degrees: [0, 3, 0, 4] },
    { name: 'ii–V–i',                   degrees: [1, 4, 0] },
    { name: 'Coltrane  (i–IV–♭VII–♭III)', degrees: [0, 3, 6, 2] },
  ],
  'lyd-dom': [
    { name: 'Fusion  (I–♭III–♭VII–IV)', degrees: [0, 2, 0, 4] },
    { name: 'Tritone  (I–♭V–I–IV)',      degrees: [0, 3, 6, 0] },
  ],
  'phryg-dom': [
    { name: 'Andaluz  (I–♭II–I–V)',      degrees: [0, 1, 0, 5] },
    { name: 'Oriental  (I–♭II–♭III–♭II)', degrees: [0, 1, 2, 1] },
    { name: 'Spanish  (I–♭II–IV–I–V)',   degrees: [0, 1, 3, 0, 4] },
  ],
  altered: [
    { name: 'V–i',                       degrees: [0, 3, 4, 0] },
    { name: 'Jazz alt  (I–♭III–♭VII–IV)', degrees: [0, 2, 0, 5] },
  ],
};

export default function CommonProgressions({
  scaleMode, diatonicChords, onChordSelect, playChord,
  currentKeyInfo, activeScalePcs, isFlat, parentKeyName, onHighlightChord,
}) {
  const progressions = PROGRESSIONS[scaleMode];
  const [playing, setPlaying]   = useState(null);
  const [bpm, setBpm]           = useState(72);
  const [loop, setLoop]         = useState(true);
  const stepMs                  = Math.round(60000 / bpm);

  // AI state
  const [aiOpen,    setAiOpen]    = useState(false);
  const [aiGenre,   setAiGenre]   = useState('Pop');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState('');
  const [aiResult,  setAiResult]  = useState(null);
  const [aiActive,  setAiActive]  = useState(null);

  const onChordSelectRef    = useRef(onChordSelect);
  onChordSelectRef.current  = onChordSelect;
  const diatonicChordsRef   = useRef(diatonicChords);
  diatonicChordsRef.current = diatonicChords;
  const playChordRef        = useRef(playChord);
  playChordRef.current      = playChord;

  useEffect(() => { setPlaying(null); }, [scaleMode]);

  useEffect(() => {
    if (!playing) return;
    const prog = progressions?.[playing.idx];
    if (!prog) return;
    const degree = prog.degrees[playing.step];
    const chord  = diatonicChordsRef.current[degree];
    onChordSelectRef.current(degree);
    if (chord?.pcs) playChordRef.current?.(chord.pcs, 4, 'block');
    const timer = setTimeout(() => {
      setPlaying(p => {
        if (!p) return null;
        const next = (p.step + 1) % prog.degrees.length;
        if (next === 0 && !loop) { onChordSelectRef.current(null); return null; }
        return { ...p, step: next };
      });
    }, stepMs);
    return () => clearTimeout(timer);
  }, [playing, progressions, stepMs, loop]);

  if (!progressions || !diatonicChords.length) return null;

  function toggle(idx) {
    if (playing?.idx === idx) {
      setPlaying(null);
      onChordSelectRef.current(null);
    } else {
      setPlaying({ idx, step: 0 });
    }
  }

  // ── AI generation ───────────────────────────────────────────────────────────
  async function generateAiProgression() {
    if (!GEMINI_API_KEY) { setAiError('No API key — add VITE_GEMINI_API_KEY to .env and restart.'); return; }
    setAiLoading(true); setAiResult(null); setAiError(''); setAiActive(null);

    const rootName  = currentKeyInfo?.label?.split(' ')[0] ?? '';
    const noteNames = activeScalePcs?.map(pc => pcToName(pc, isFlat)).join(', ') ?? '';
    const modeCtx = parentKeyName
      ? `${rootName} ${scaleMode} (derived from ${parentKeyName} Major, notes: ${noteNames})`
      : `${rootName} ${scaleMode} (notes: ${noteNames})`;

    const prompt = `Generate a ${aiGenre} chord progression in ${modeCtx}.
Use only notes from the scale when possible. Return ONLY valid JSON:
{"progression":[{"numeral":"I","name":"Cmaj7","notes":["C","E","G","B"]}],"explanation":"one sentence about why it works"}`;

    try {
      const text  = await geminiCall(prompt);
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { setAiResult(JSON.parse(match[0])); }
        catch { setAiError('Could not parse AI response.'); }
      } else {
        setAiError('AI returned an unexpected format.');
      }
    } catch (e) {
      setAiError(`AI error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Common Progressions</p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLoop(v => !v)}
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
            style={loop
              ? { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(167,139,250,0.9)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
            ↺ Loop
          </button>
          <span className="text-[10px] text-white/25">{bpm} bpm</span>
          <input type="range" min={40} max={160} value={bpm}
            onChange={e => setBpm(+e.target.value)}
            className="w-20 h-1 accent-violet-400 cursor-pointer" />
          {currentKeyInfo && (
            <button
              onClick={() => { setAiOpen(v => !v); setAiResult(null); setAiError(''); }}
              className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition-all"
              style={aiOpen
                ? { background: 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(96,165,250,0.3))', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}>
              ✨ AI
            </button>
          )}
        </div>
      </div>

      {/* Preset progressions */}
      <div className="flex flex-col gap-2">
        {progressions.map((prog, idx) => {
          const isActive = playing?.idx === idx;
          return (
            <div key={prog.name} className="flex items-center gap-3">
              <button
                onClick={() => toggle(idx)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 w-[88px] text-left transition-colors"
                style={isActive
                  ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                {isActive ? '⏸ ' : '▶ '}{prog.name}
              </button>
              <div className="flex items-center gap-1 flex-wrap">
                {prog.degrees.map((deg, si) => {
                  const chord = diatonicChords[deg];
                  if (!chord) return null;
                  const color = NOTE_COLORS[chord.rootPc];
                  const isStep = isActive && playing.step === si;
                  return (
                    <button key={si} onClick={() => onChordSelect(deg)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md transition-all"
                      style={isStep
                        ? { background: `${color}35`, border: `1px solid ${color}80`, color }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: `${color}99` }}>
                      {chord.numeral}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AI Generate panel ── */}
      {aiOpen && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={aiGenre}
              onChange={e => setAiGenre(e.target.value)}
              className="text-[11px] font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>
              {AI_GENRES.map(g => (
                <option key={g} value={g} style={{ background: '#1e1b4b' }}>{g}</option>
              ))}
            </select>
            <button
              onClick={generateAiProgression}
              disabled={aiLoading}
              className="px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(96,165,250,0.3))', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
              {aiLoading ? '…' : '✨ Generate'}
            </button>
            {aiLoading && (
              <span className="text-[10px] text-purple-400 animate-pulse">Consulting the oracle…</span>
            )}
          </div>

          {aiError && (
            <p className="mt-2 text-[10px] text-red-400/80">{aiError}</p>
          )}

          {aiResult?.progression && !aiLoading && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {aiResult.progression.map((chord, idx) => {
                  const pcs      = chord.notes?.map(noteToPc).filter(n => n !== null) ?? [];
                  const rootMatch = chord.name?.match(/^([A-G][#b]?)/);
                  const rootPc    = rootMatch ? (noteToPc(rootMatch[1]) ?? pcs[0]) : pcs[0];
                  const color  = rootPc !== undefined ? NOTE_COLORS[rootPc] : '#a78bfa';
                  const isAct  = aiActive === idx;
                  return (
                    <button key={idx}
                      onClick={() => {
                        setAiActive(idx);
                        if (pcs.length > 0) {
                          onHighlightChord?.({ name: chord.name, pcs, rootPc });
                          playChordRef.current?.(pcs, 4, 'block');
                        }
                      }}
                      className="px-3 py-2 rounded-xl border text-center min-w-[60px] transition-all"
                      style={isAct
                        ? { background: `${color}28`, borderColor: `${color}60`, boxShadow: `0 0 10px ${color}20` }
                        : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="font-bold text-[13px]" style={{ color }}>{chord.numeral}</div>
                      <div className="text-[9px] mt-0.5 text-white/40">{chord.name}</div>
                    </button>
                  );
                })}
              </div>
              {aiResult.explanation && (
                <p className="text-[10px] text-white/40 leading-relaxed">
                  <span className="text-white/55 font-semibold">Why: </span>
                  {aiResult.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
