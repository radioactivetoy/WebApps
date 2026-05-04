import { NOTE_COLORS, buildDiatonicChords,
  majorHarmonicFn, minorHarmonicFn, HARMONIC_FN_COLORS } from '../data/musicTheory.js';

const MODAL_SCALES = new Set(['dorian','phrygian','lydian','mixolydian','locrian']);

export default function DiatonicChords({
  activeScalePcs, scaleMode, isFlat,
  selectedChordDegree, onChordSelect, chordType, onChordTypeChange
}) {
  const is7Note = activeScalePcs.length === 7;
  const showHarmonicFn = scaleMode === 'major' || scaleMode === 'minor';

  const chords = is7Note
    ? buildDiatonicChords(activeScalePcs, isFlat, chordType).map((c, i) => ({
        ...c,
        color: NOTE_COLORS[c.rootPc],
        fn: scaleMode === 'major' ? majorHarmonicFn[i]
          : scaleMode === 'minor' ? minorHarmonicFn[i]
          : null,
      }))
    : [];

  const selected = selectedChordDegree !== null ? chords[selectedChordDegree] : null;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Diatonic Chords</span>
          {selected && (
            <span className="text-xs text-white/50 truncate">— {selected.name}</span>
          )}
        </div>
        {is7Note && (
          <select
            value={chordType}
            onChange={e => onChordTypeChange(e.target.value)}
            className="text-xs font-semibold rounded-lg px-2 py-1.5 outline-none cursor-pointer flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
            {[
              ['triad',      'Triads'],
              ['seventh',    '7ths'],
              ['ninth',      '9ths'],
              ['eleventh',   '11ths'],
              ['thirteenth', '13ths'],
              ['sus2',       'Sus 2'],
              ['sus4',       'Sus 4'],
              ['add9',       'Add 9'],
              ['add11',      'Add 11'],
            ].map(([val, label]) => (
              <option key={val} value={val} style={{ background: '#1e1b4b' }}>{label}</option>
            ))}
          </select>
        )}
      </div>

      {!is7Note ? (
        <p className="text-center text-xs text-white/25 py-4">
          Chord grid available for 7-note scales.
        </p>
      ) : (
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
      )}
    </div>
  );
}
