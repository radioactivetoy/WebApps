import { useState, useEffect, useRef } from 'react';
import { NOTE_COLORS } from '../data/musicTheory.js';

const PROGRESSIONS = {
  major: [
    { name: 'Pop',       degrees: [0, 4, 5, 3] },
    { name: '50s',       degrees: [0, 5, 3, 4] },
    { name: 'Classic',   degrees: [0, 3, 4, 0] },
    { name: 'Jazz ii–V–I', degrees: [1, 4, 0] },
    { name: 'Circle',    degrees: [2, 5, 1, 4, 0, 3] },
    { name: 'Blues',     degrees: [0, 3, 0, 4, 3, 0] },
  ],
  minor: [
    { name: 'Pop minor',  degrees: [0, 5, 2, 6] },
    { name: 'Rock',       degrees: [0, 6, 5, 6] },
    { name: 'Andalusian', degrees: [0, 6, 5, 4] },
    { name: 'Jazz ii–V–i', degrees: [1, 4, 0] },
    { name: 'Classic',    degrees: [0, 3, 4, 0] },
  ],
  dorian: [
    { name: 'Groove',  degrees: [0, 3] },
    { name: 'Modal',   degrees: [0, 1, 3] },
    { name: 'ii–V–I',  degrees: [1, 4, 0] },
  ],
  mixolydian: [
    { name: 'Rock',  degrees: [0, 6, 3] },
    { name: 'Mixo',  degrees: [0, 3, 6, 0] },
  ],
  lydian: [
    { name: 'Dream', degrees: [0, 1, 0, 4] },
    { name: 'Film',  degrees: [0, 3, 1, 0] },
  ],
};

const STEP_MS = 1400;

export default function CommonProgressions({ scaleMode, diatonicChords, onChordSelect }) {
  const progressions = PROGRESSIONS[scaleMode];
  const [playing, setPlaying] = useState(null); // { idx, step }
  const onChordSelectRef = useRef(onChordSelect);
  onChordSelectRef.current = onChordSelect;

  useEffect(() => {
    setPlaying(null);
  }, [scaleMode]);

  useEffect(() => {
    if (!playing) return;
    const prog = progressions?.[playing.idx];
    if (!prog) return;
    onChordSelectRef.current(prog.degrees[playing.step]);
    const timer = setTimeout(() => {
      setPlaying(p => p ? { ...p, step: (p.step + 1) % prog.degrees.length } : null);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, progressions]);

  if (!progressions || !diatonicChords.length) return null;

  function toggle(idx) {
    setPlaying(p => (p?.idx === idx ? null : { idx, step: 0 }));
    if (playing?.idx === idx) onChordSelectRef.current(null);
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">Common Progressions</p>
      <div className="flex flex-col gap-2">
        {progressions.map((prog, idx) => {
          const isPlaying = playing?.idx === idx;
          return (
            <div key={prog.name} className="flex items-center gap-3">
              <button
                onClick={() => toggle(idx)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 w-[88px] text-left transition-colors"
                style={isPlaying
                  ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                {isPlaying ? '⏸ ' : '▶ '}{prog.name}
              </button>
              <div className="flex items-center gap-1 flex-wrap">
                {prog.degrees.map((deg, si) => {
                  const chord = diatonicChords[deg];
                  if (!chord) return null;
                  const color = NOTE_COLORS[chord.rootPc];
                  const isActive = isPlaying && playing.step === si;
                  return (
                    <button
                      key={si}
                      onClick={() => onChordSelect(deg)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md transition-all"
                      style={isActive
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
    </div>
  );
}
