import { NOTE_COLORS, GUITAR_CHORDS, OPEN_STRING_PCS, pcToName } from '../data/musicTheory.js';

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

function stringPc(stringIdx, fret) {
  return (OPEN_STRING_PCS[stringIdx] + fret) % 12;
}

export default function GuitarDiagram({ chordName, isFlat }) {
  const shape = GUITAR_CHORDS[chordName];

  if (!shape) {
    return (
      <div className="flex items-center justify-center h-40 text-white/25 text-sm">
        No diagram for {chordName}
      </div>
    );
  }

  const { strings, baseFret } = shape;
  const FRETS = 5;
  const STRING_SPACING = 28;
  const FRET_SPACING = 26;
  const MARGIN_TOP = 36;
  const MARGIN_LEFT = 32;
  const DOT_R = 10;
  const W = MARGIN_LEFT + STRING_SPACING * 5 + 20;
  const H = MARGIN_TOP + FRET_SPACING * FRETS + 20;

  return (
    <div className="flex items-start gap-5">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
        {/* Fret number label if not open position */}
        {baseFret > 1 && (
          <text x={4} y={MARGIN_TOP + FRET_SPACING * 0.7}
            fontSize={11} fill="rgba(255,255,255,0.4)"
            style={{ fontFamily: 'system-ui, sans-serif' }}>
            {baseFret}
          </text>
        )}
        {/* Nut or position indicator */}
        {baseFret === 1
          ? <rect x={MARGIN_LEFT} y={MARGIN_TOP} width={STRING_SPACING * 5} height={4}
              rx={2} fill="rgba(255,255,255,0.5)" />
          : <line x1={MARGIN_LEFT} x2={MARGIN_LEFT + STRING_SPACING * 5}
              y1={MARGIN_TOP} y2={MARGIN_TOP}
              stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        }
        {/* Fret lines */}
        {Array.from({ length: FRETS }).map((_, fi) => (
          <line key={fi}
            x1={MARGIN_LEFT} x2={MARGIN_LEFT + STRING_SPACING * 5}
            y1={MARGIN_TOP + (fi + 1) * FRET_SPACING}
            y2={MARGIN_TOP + (fi + 1) * FRET_SPACING}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        ))}
        {/* String lines */}
        {Array.from({ length: 6 }).map((_, si) => (
          <line key={si}
            x1={MARGIN_LEFT + si * STRING_SPACING}
            x2={MARGIN_LEFT + si * STRING_SPACING}
            y1={MARGIN_TOP} y2={MARGIN_TOP + FRETS * FRET_SPACING}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
        ))}
        {/* Open / muted / finger dots */}
        {strings.map((fretVal, si) => {
          const x = MARGIN_LEFT + si * STRING_SPACING;
          if (fretVal === 'x') {
            return (
              <text key={si} x={x} y={MARGIN_TOP - 10}
                textAnchor="middle" fontSize={13} fill="rgba(239,68,68,0.8)"
                style={{ fontFamily: 'system-ui, sans-serif' }}>✕</text>
            );
          }
          if (fretVal === 0) {
            return (
              <circle key={si} cx={x} cy={MARGIN_TOP - 12} r={7}
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
            );
          }
          const fretPos = fretVal - baseFret + 1;
          if (fretPos < 1 || fretPos > FRETS) return null;
          const cy = MARGIN_TOP + (fretPos - 0.5) * FRET_SPACING;
          const pc = stringPc(si, fretVal);
          const color = NOTE_COLORS[pc];
          return (
            <g key={si}>
              <circle cx={x} cy={cy} r={DOT_R} fill={color} />
              <text x={x} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fontWeight={700} fill="#0f0c29"
                style={{ fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}>
                {pcToName(pc, false)}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Chord info beside diagram */}
      <div className="flex flex-col gap-1 pt-2">
        <div className="font-bold text-base text-white">{chordName}</div>
        <div className="text-xs text-white/35">
          {strings.map((f, si) => {
            if (f === 'x' || f === 0) return null;
            return pcToName(stringPc(si, f), isFlat);
          }).filter(Boolean).join(' · ')}
        </div>
        {baseFret > 1 && (
          <div className="text-xs text-white/25">Fret {baseFret}</div>
        )}
      </div>
    </div>
  );
}
