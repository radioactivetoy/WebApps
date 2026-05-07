import { useState, useEffect } from 'react';
import { NOTE_COLORS, buildDiatonicChords,
  majorHarmonicFn, minorHarmonicFn, HARMONIC_FN_COLORS } from '../data/musicTheory.js';

// Degree patterns: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°
const NAMED_PATTERNS = [
  { name: 'Pop  (I–V–vi–IV)',         pattern: [0,4,5,3] },
  { name: '50s / Do-Wop  (I–vi–IV–V)', pattern: [0,5,3,4] },
  { name: 'Classic Rock  (I–IV–V)',   pattern: [0,3,4] },
  { name: 'I–IV–V–I  (Blues)',        pattern: [0,3,4,0] },
  { name: 'Jazz ii–V–I',              pattern: [1,4,0] },
  { name: 'Jazz Turnaround  (I–vi–ii–V)', pattern: [0,5,1,4] },
  { name: 'Nashville  (I–ii–IV–V)',   pattern: [0,1,3,4] },
  { name: 'Let It Be  (I–IV–vi–V)',   pattern: [0,3,5,4] },
  { name: 'Pachelbel Canon  (I–V–vi–iii–IV)', pattern: [0,4,5,2,3] },
  { name: 'Axis  (vi–IV–I–V)',        pattern: [5,3,0,4] },
  { name: 'Power Ballad  (I–V–IV)',   pattern: [0,4,3] },
  { name: 'Andalusian  (i–VII–VI–V)', pattern: [0,6,5,4] },
  { name: 'Pop Minor  (i–VI–III–VII)', pattern: [0,5,2,6] },
  { name: 'Minor Rock  (i–VII–VI–VII)', pattern: [0,6,5,6] },
  { name: 'Circle of 4ths',          pattern: [2,5,1,4,0,3] },
  { name: 'iii–vi–II–V  (Jazz)',      pattern: [2,5,1,4] },
  { name: 'I–IV Vamp',               pattern: [0,3] },
  { name: 'i–VII Vamp',              pattern: [0,6] },
];

function recognizeProgression(history) {
  if (history.length < 2) return null;
  for (const { name, pattern } of NAMED_PATTERNS) {
    if (history.length < pattern.length) continue;
    const tail = history.slice(-pattern.length);
    if (tail.every((d, i) => d === pattern[i])) return name;
  }
  return null;
}

const VARIANTS = [
  ['triad',      'Triad'],
  ['seventh',    '7th'],
  ['ninth',      '9th'],
  ['eleventh',   '11th'],
  ['thirteenth', '13th'],
  ['sixth',      '6th'],
  ['six-nine',   '6/9'],
  ['seven-sus4', '7sus4'],
  ['sus2',       'Sus2'],
  ['sus4',       'Sus4'],
  ['add9',       'Add9'],
  ['add11',      'Add11'],
  [null,         'Altered'],
  ['dom7b9',     '7b9'],
  ['dom7s9',     '7#9'],
  ['dom7s11',    '7#11'],
  ['dom7alt',    '7alt'],
  ['chrom-dim7', 'dim7'],
  ['chrom-aug',  'Aug+'],
];

export default function DiatonicChords({
  activeScalePcs, scaleMode, isFlat,
  selectedChordDegree, onChordSelect, chordVariant, onChordVariantChange
}) {
  const is7Note = activeScalePcs.length === 7;
  const showHarmonicFn = scaleMode === 'major' || scaleMode === 'minor';

  const [chordHistory, setChordHistory] = useState([]);
  const scaleKey = activeScalePcs.join(',');
  useEffect(() => { setChordHistory([]); }, [scaleKey]);

  function handleChordClick(degree, isActive) {
    const newDegree = isActive ? null : degree;
    onChordSelect(newDegree);
    if (newDegree !== null) {
      setChordHistory(h => {
        if (h[h.length - 1] === newDegree) return h;
        return [...h.slice(-7), newDegree];
      });
    }
  }

  // Grid always shows triads for overview; variant affects only the selected chord
  const chords = is7Note
    ? buildDiatonicChords(activeScalePcs, isFlat, 'triad').map((c, i) => ({
        ...c,
        color: NOTE_COLORS[c.rootPc],
        fn: scaleMode === 'major' ? majorHarmonicFn[i]
          : scaleMode === 'minor' ? minorHarmonicFn[i]
          : null,
      }))
    : [];

  const selectedTriad = selectedChordDegree !== null ? chords[selectedChordDegree] : null;
  const selectedVariant = selectedChordDegree !== null
    ? buildDiatonicChords(activeScalePcs, isFlat, chordVariant)[selectedChordDegree]
    : null;
  const selected = selectedVariant;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <span className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase flex-shrink-0">Diatonic Chords</span>
        {selected && (
          <span className="text-xs text-white/50 truncate">— {selected.name}</span>
        )}
      </div>

      {!is7Note ? (
        <p className="text-center text-xs text-white/25 py-4">
          Chord grid available for 7-note scales.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5">
            {chords.map(chord => {
              const isActive = selectedChordDegree === chord.degree;
              return (
                <button
                  key={chord.degree}
                  onClick={() => handleChordClick(chord.degree, isActive)}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all"
                  style={isActive
                    ? { background: `${chord.color}25`, borderColor: `${chord.color}70`, boxShadow: `0 0 14px ${chord.color}30` }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <span className="font-bold text-[13px]"
                    style={{ color: isActive ? chord.color : chord.color + 'BB' }}>
                    {chord.numeral}
                  </span>
                  <span className="text-[10px] mt-0.5 font-medium"
                    style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                    {chord.name}
                  </span>
                  {showHarmonicFn && chord.fn && (
                    <span className="text-[8px] mt-1 px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        color: HARMONIC_FN_COLORS[chord.fn],
                        background: `${HARMONIC_FN_COLORS[chord.fn]}22`,
                      }}>
                      {chord.fn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {chordHistory.length >= 2 && (() => {
            const match = recognizeProgression(chordHistory);
            return (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06] flex-wrap">
                {chordHistory.map((deg, i) => {
                  const c = chords[deg];
                  if (!c) return null;
                  return (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-[9px] text-white/15">→</span>}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: `${c.color}20`, color: c.color }}>
                        {c.numeral}
                      </span>
                    </span>
                  );
                })}
                {match && (
                  <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.35)', color: 'rgba(167,139,250,0.9)' }}>
                    ✓ {match}
                  </span>
                )}
                <button
                  onClick={() => setChordHistory([])}
                  className="ml-auto text-[9px] text-white/20 hover:text-white/40 transition-colors px-1">
                  ×
                </button>
              </div>
            );
          })()}

          {selectedTriad && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06] flex-wrap">
              <span className="text-[10px] text-white/25 uppercase font-bold tracking-widest flex-shrink-0">
                Voicing
              </span>
              <div className="flex gap-1 flex-wrap items-center">
                {VARIANTS.map(([val, label]) => val === null ? (
                  <span key="sep" className="text-[9px] font-bold tracking-widest uppercase text-white/20 mx-1">
                    {label}
                  </span>
                ) : (
                  <button key={val}
                    onClick={() => onChordVariantChange(val)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                    style={chordVariant === val
                      ? { background: `${selectedTriad.color}30`, border: `1px solid ${selectedTriad.color}60`, color: selectedTriad.color }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
