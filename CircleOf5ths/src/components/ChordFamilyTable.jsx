import { NOTE_COLORS, buildDiatonicChords,
  majorHarmonicFn, minorHarmonicFn, HARMONIC_FN_COLORS, pcToName } from '../data/musicTheory.js';

const PARALLEL_INTERVALS = {
  major:       [0, 2, 3, 5, 7, 8, 10], // borrow from parallel minor
  dorian:      [0, 2, 4, 5, 7, 9, 11], // borrow from parallel major
  phrygian:    [0, 2, 4, 5, 7, 9, 11],
  lydian:      [0, 2, 3, 5, 7, 8, 10],
  mixolydian:  [0, 2, 3, 5, 7, 8, 10],
  minor:       [0, 2, 4, 5, 7, 9, 11], // borrow from parallel major
  locrian:     [0, 2, 4, 5, 7, 9, 11],
  'mel-minor':    [0, 2, 4, 5, 7, 9, 11],
  'harm-minor':   [0, 2, 4, 5, 7, 9, 11],
  'lyd-dom':      [0, 2, 3, 5, 7, 8, 10],
  'phryg-dom':    [0, 2, 4, 5, 7, 9, 11],
  'altered':      [0, 2, 4, 5, 7, 9, 11],
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

function RowLabel({ children }) {
  return (
    <span className="w-14 flex-shrink-0 text-right text-[8px] font-bold tracking-widest uppercase text-white/20 pr-1 leading-none self-center">
      {children}
    </span>
  );
}

export default function ChordFamilyTable({
  activeScalePcs, scaleMode, rootPc, isFlat,
  selectedChordDegree, onChordSelect, onHighlightChord,
}) {
  const is7Note = activeScalePcs.length === 7;
  const showHarmonicFn = scaleMode === 'major' || scaleMode === 'minor';

  if (!is7Note) return null;

  const chords = buildDiatonicChords(activeScalePcs, isFlat, 'triad').map((c, i) => ({
    ...c,
    color: NOTE_COLORS[c.rootPc],
    fn: scaleMode === 'major' ? majorHarmonicFn[i]
      : scaleMode === 'minor' ? minorHarmonicFn[i]
      : null,
  }));

  const parallelIntervals = PARALLEL_INTERVALS[scaleMode];
  const parallelChords = parallelIntervals
    ? buildDiatonicChords(
        parallelIntervals.map(i => (rootPc + i) % 12),
        isFlat, 'triad'
      ).map((c, i) => {
        const q = triadQuality(c.pcs);
        const mainQ = triadQuality(chords[i].pcs);
        const isSame = c.rootPc === chords[i].rootPc && q === mainQ;
        return { ...c, color: NOTE_COLORS[c.rootPc], numeral: borrowedNumeral(c.rootPc, rootPc, q), isSame };
      })
    : null;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">Chord Family</p>

      <div className="flex flex-col gap-1.5">

        {/* ── ii chords: both m7 and dom7 options stacked ── */}
        <div className="flex items-stretch gap-0">
          <RowLabel>Approach</RowLabel>
          <div className="flex-1 grid grid-cols-7 gap-1.5">
            {chords.map(chord => {
              const q = triadQuality(chord.pcs);
              const isMinorTarget = q === 'minor' || q === 'dim';
              const iiRoot = (chord.rootPc + 2) % 12;
              const color = NOTE_COLORS[iiRoot];

              const minorSuffix = isMinorTarget ? 'm7b5' : 'm7';
              const minorPcs = isMinorTarget
                ? [0, 3, 6, 10].map(n => (iiRoot + n) % 12)
                : [0, 3, 7, 10].map(n => (iiRoot + n) % 12);
              const minorName = pcToName(iiRoot, isFlat) + minorSuffix;

              const domPcs = [0, 4, 7, 10].map(n => (iiRoot + n) % 12);
              const domName = pcToName(iiRoot, isFlat) + '7';

              const cellStyle = { background: `${color}0E`, borderColor: `${color}28` };
              const textStyle = { color: `${color}AA` };

              return (
                <div key={chord.degree} className="flex flex-row gap-0.5">
                  <button
                    onClick={() => onHighlightChord?.({ pcs: minorPcs, rootPc: iiRoot, name: minorName })}
                    className="flex-1 flex items-center justify-center py-1.5 rounded-md border text-center transition-all hover:opacity-75"
                    style={cellStyle}>
                    <span className="text-[7px] font-semibold leading-none" style={textStyle}>{minorName}</span>
                  </button>
                  <button
                    onClick={() => onHighlightChord?.({ pcs: domPcs, rootPc: iiRoot, name: domName })}
                    className="flex-1 flex items-center justify-center py-1.5 rounded-md border text-center transition-all hover:opacity-75"
                    style={cellStyle}>
                    <span className="text-[7px] font-semibold leading-none" style={textStyle}>{domName}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Secondary dominants ── */}
        <div className="flex items-stretch gap-0">
          <RowLabel>Sec Dom</RowLabel>
          <div className="flex-1 grid grid-cols-7 gap-1.5">
            {chords.map(chord => {
              const secRoot = (chord.rootPc + 7) % 12;
              const secPcs = [0, 4, 7, 10].map(n => (secRoot + n) % 12);
              const secName = pcToName(secRoot, isFlat) + '7';
              const color = NOTE_COLORS[secRoot];
              return (
                <button
                  key={chord.degree}
                  onClick={() => onHighlightChord?.({ pcs: secPcs, rootPc: secRoot, name: secName })}
                  className="flex flex-col items-center justify-center py-1.5 rounded-lg border text-center transition-all hover:opacity-75"
                  style={{ background: `${color}0E`, borderColor: `${color}28` }}>
                  <span className="text-[9px] font-semibold leading-tight" style={{ color: `${color}AA` }}>
                    {secName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main family ── */}
        <div className="flex items-stretch gap-0">
          <RowLabel>Diatonic</RowLabel>
          <div className="flex-1 grid grid-cols-7 gap-1.5">
            {chords.map(chord => {
              const isActive = selectedChordDegree === chord.degree;
              return (
                <button
                  key={chord.degree}
                  onClick={() => onChordSelect(isActive ? null : chord.degree)}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all"
                  style={isActive
                    ? { background: `${chord.color}25`, borderColor: `${chord.color}70`, boxShadow: `0 0 12px ${chord.color}30` }
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
                    <span className="text-[8px] mt-1 px-1 py-0.5 rounded-full font-semibold"
                      style={{ color: HARMONIC_FN_COLORS[chord.fn], background: `${HARMONIC_FN_COLORS[chord.fn]}22` }}>
                      {chord.fn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Borrowed / parallel ── */}
        {parallelChords && (
          <div className="flex items-stretch gap-0">
            <RowLabel>Borrow</RowLabel>
            <div className="flex-1 grid grid-cols-7 gap-1.5">
              {parallelChords.map((chord, i) => (
                <button
                  key={i}
                  onClick={() => !chord.isSame && onHighlightChord?.({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name })}
                  disabled={chord.isSame}
                  className="flex flex-col items-center justify-center py-1.5 rounded-lg border text-center transition-all hover:opacity-75 disabled:opacity-15 disabled:cursor-default"
                  style={{ background: `${chord.color}0E`, borderColor: `${chord.color}30` }}>
                  <span className="text-[9px] font-bold leading-tight" style={{ color: `${chord.color}BB` }}>
                    {chord.numeral}
                  </span>
                  <span className="text-[8px] text-white/35 leading-tight">{chord.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
