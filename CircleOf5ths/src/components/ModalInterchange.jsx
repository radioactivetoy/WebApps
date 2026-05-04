import { NOTE_COLORS, buildDiatonicChords } from '../data/musicTheory.js';

const PARALLEL = {
  major: [0, 2, 3, 5, 7, 8, 10], // natural minor
  minor: [0, 2, 4, 5, 7, 9, 11], // major
};

const DEGREE_LABELS = ['I','bII','II','bIII','III','IV','bV','V','bVI','VI','bVII','VII'];

function triadQuality(pcs) {
  const t = (pcs[1] - pcs[0] + 12) % 12;
  const f = (pcs[2] - pcs[0] + 12) % 12;
  if (t === 4 && f === 7) return 'major';
  if (t === 3 && f === 7) return 'minor';
  if (t === 3 && f === 6) return 'dim';
  return 'other';
}

function borrowedNumeral(chordRootPc, keyRootPc, quality) {
  const interval = (chordRootPc - keyRootPc + 12) % 12;
  let num = DEGREE_LABELS[interval];
  if (quality === 'minor') num = num.toLowerCase();
  else if (quality === 'dim') num = num.toLowerCase() + '°';
  return num;
}

export default function ModalInterchange({ activeScalePcs, scaleMode, rootPc, isFlat, onHighlightChord }) {
  if (!PARALLEL[scaleMode]) return null;

  const parallelPcs = PARALLEL[scaleMode].map(i => (rootPc + i) % 12);
  const currentChords = buildDiatonicChords(activeScalePcs, isFlat, 'triad');
  const parallelChords = buildDiatonicChords(parallelPcs, isFlat, 'triad');

  const currentByRoot = Object.fromEntries(
    currentChords.map(c => [c.rootPc, triadQuality(c.pcs)])
  );

  const borrowed = parallelChords
    .filter(c => {
      const q = triadQuality(c.pcs);
      return currentByRoot[c.rootPc] === undefined || currentByRoot[c.rootPc] !== q;
    })
    .map(c => {
      const q = triadQuality(c.pcs);
      return { ...c, numeral: borrowedNumeral(c.rootPc, rootPc, q) };
    });

  if (borrowed.length === 0) return null;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Modal Interchange · parallel {scaleMode === 'major' ? 'minor' : 'major'}
      </p>
      <div className="flex gap-2 flex-wrap">
        {borrowed.map(chord => {
          const color = NOTE_COLORS[chord.rootPc];
          return (
            <button
              key={chord.rootPc}
              onClick={() => onHighlightChord({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name })}
              className="flex flex-col items-center py-2 px-3 rounded-xl border transition-all hover:opacity-80"
              style={{ background: `${color}18`, borderColor: `${color}40` }}>
              <span className="font-bold text-[13px]" style={{ color }}>{chord.numeral}</span>
              <span className="text-[10px] text-white/45 mt-0.5">{chord.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
