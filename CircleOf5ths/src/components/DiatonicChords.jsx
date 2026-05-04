import { NOTE_COLORS, buildDiatonicChords,
  majorHarmonicFn, minorHarmonicFn, HARMONIC_FN_COLORS } from '../data/musicTheory.js';

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
                  onClick={() => onChordSelect(isActive ? null : chord.degree)}
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
