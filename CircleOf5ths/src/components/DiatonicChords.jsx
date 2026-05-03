import { NOTE_COLORS, pcToName,
  majorNumerals, minorNumerals, major7Numerals, minor7Numerals } from '../data/musicTheory.js';

export default function DiatonicChords({
  currentKeyInfo, selectedChordDegree, onChordSelect, chordType, onChordTypeChange
}) {
  const { scalePcs, type } = currentKeyInfo;
  const isFlat = currentKeyInfo.accType === 'flat';
  const activeNumerals = type === 'major'
    ? (chordType === 'triad' ? majorNumerals : major7Numerals)
    : (chordType === 'triad' ? minorNumerals : minor7Numerals);

  const chords = scalePcs.map((cRootPc, i) => {
    const numeral = activeNumerals[i];
    let suffix = '';
    if (chordType === 'triad') {
      if (numeral.includes('°')) suffix = 'dim';
      else if (numeral === numeral.toLowerCase() && !numeral.includes('I')) suffix = 'm';
    } else {
      if (numeral.includes('maj7')) suffix = 'maj7';
      else if (numeral.includes('ø7')) suffix = 'm7b5';
      else if (numeral.toLowerCase().includes('m7')) suffix = 'm7';
      else if (numeral.includes('7')) suffix = '7';
    }
    const name = pcToName(cRootPc, isFlat) + suffix;
    const color = NOTE_COLORS[cRootPc];
    return { degree: i, numeral, name, color, rootPc: cRootPc };
  });

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
        <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5 flex-shrink-0">
          {['triad','seventh'].map(t => (
            <button key={t}
              onClick={() => onChordTypeChange(t)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
              style={chordType === t
                ? { background: 'linear-gradient(135deg,#34d399,#22d3ee)', color: '#0f0c29' }
                : { color: 'rgba(255,255,255,0.35)' }}>
              {t === 'triad' ? 'Triads' : '7ths'}
            </button>
          ))}
        </div>
      </div>
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
