import { NOTE_COLORS, pcToName, INTERVAL_LABELS } from '../data/musicTheory.js';

const VB_W = 1000;
const LABEL_W = 24;
const OPEN_W = 40;
const NUT_X = LABEL_W + OPEN_W;           // 64
const MARGIN_R = 6;
const FRET_AREA_W = VB_W - NUT_X - MARGIN_R; // 930
const MT = 18, MB = 30;
const SS = 27.4;                           // fixed string spacing in viewbox units
const DOT_R = 10;
const OPEN_X = LABEL_W + OPEN_W / 2;      // 44

export default function FretboardInstrument({
  openPcs, stringLabels, stringWidths, fretCount, fretMarkers,
  activeScalePcs, activeChordPcs, activeChordRoot,
  rootPc, labelMode, isFlat, colorPcs, activePc, compareScalePcs,
}) {
  const numStrings = openPcs.length;
  const STRINGS_H = (numStrings - 1) * SS;
  const VB_H = STRINGS_H + MT + MB;
  const FRET_W = FRET_AREA_W / fretCount;
  const midY = MT + STRINGS_H / 2;

  const scalePcsSet = new Set(activeScalePcs);
  const chordPcsSet = activeChordPcs ? new Set(activeChordPcs) : null;
  const highlightRoot = activeChordRoot ?? rootPc;
  const intervalRef   = activeChordRoot ?? rootPc;

  function sY(s) { return MT + s * SS; }
  function fX(f) { return NUT_X + (f - 0.5) * FRET_W; }
  function fLineX(f) { return NUT_X + f * FRET_W; }

  function dotOpacity(pc) {
    if (!chordPcsSet) return 1;
    return chordPcsSet.has(pc) ? 1 : 0.22;
  }

  function isNonDiatonic(pc) {
    return chordPcsSet?.has(pc) && !scalePcsSet.has(pc);
  }

  function dotLabel(pc) {
    if (!labelMode || labelMode === 'none') return null;
    if (labelMode === 'intervals') {
      const diff = (pc - intervalRef + 12) % 12;
      return INTERVAL_LABELS[diff].short;
    }
    return pcToName(pc, isFlat);
  }

  const fretLabels = [...new Set([1, 3, 5, 7, 9, 12, fretCount])].filter(f => f <= fretCount);

  return (
    <svg width="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ display: 'block' }}>

      {/* ── Fret position inlays ── */}
      {Object.entries(fretMarkers).map(([fStr, count]) => {
        const f = +fStr;
        const x = fX(f);
        if (count === 2) {
          return (
            <g key={f}>
              <circle cx={x} cy={sY((numStrings - 1) * 0.3)} r={4} fill="rgba(255,255,255,0.09)" />
              <circle cx={x} cy={sY((numStrings - 1) * 0.7)} r={4} fill="rgba(255,255,255,0.09)" />
            </g>
          );
        }
        return <circle key={f} cx={x} cy={midY} r={4} fill="rgba(255,255,255,0.09)" />;
      })}

      {/* ── Fret lines ── */}
      {Array.from({ length: fretCount }, (_, i) => (
        <line key={i} x1={fLineX(i + 1)} y1={MT - 2} x2={fLineX(i + 1)} y2={MT + STRINGS_H + 2}
          stroke="rgba(255,255,255,0.18)" strokeWidth={i === 0 ? 1 : 0.8} />
      ))}

      {/* ── Nut ── */}
      <rect x={NUT_X - 3} y={MT - 3} width={5} height={STRINGS_H + 6}
        fill="rgba(255,255,255,0.65)" rx={1} />

      {/* ── String lines ── */}
      {stringLabels.map((_, s) => (
        <line key={s}
          x1={LABEL_W} y1={sY(s)} x2={VB_W - MARGIN_R} y2={sY(s)}
          stroke="rgba(255,255,255,0.22)" strokeWidth={stringWidths[s]} />
      ))}

      {/* ── String labels ── */}
      {stringLabels.map((lbl, s) => (
        <text key={s} x={LABEL_W - 5} y={sY(s)} textAnchor="end" dominantBaseline="middle"
          fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.35)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {lbl}
        </text>
      ))}

      {/* ── Fret number labels ── */}
      {fretLabels.map(f => (
        <text key={f} x={fX(f)} y={VB_H - 7} textAnchor="middle"
          fontSize={10} fill="rgba(255,255,255,0.28)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {f}
        </text>
      ))}

      {/* ── Note dots ── */}
      {openPcs.map((openPc, s) => {
        const positions = [];

        function renderDot(pc, cx, cy, key) {
          const inScale     = scalePcsSet.has(pc);
          const nonDia      = isNonDiatonic(pc);
          const compareOnly = compareScalePcs?.has(pc) && !inScale && !nonDia;
          if (!inScale && !nonDia && !compareOnly) return null;
          const color  = NOTE_COLORS[pc];
          const isRoot = pc === highlightRoot;
          const lbl    = dotLabel(pc);
          return (
            <g key={key} opacity={compareOnly ? 1 : dotOpacity(pc)}>
              {compareOnly ? (
                <circle cx={cx} cy={cy} r={DOT_R} fill="rgba(96,165,250,0.15)"
                  stroke="rgba(96,165,250,0.65)" strokeWidth={1.5} strokeDasharray="3 2" />
              ) : nonDia ? (
                <circle cx={cx} cy={cy} r={DOT_R} fill="rgba(255,255,255,0.15)"
                  stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              ) : (
                <circle cx={cx} cy={cy} r={DOT_R} fill={color} />
              )}
              {isRoot && !nonDia && !compareOnly &&
                <circle cx={cx} cy={cy} r={DOT_R} fill="none" stroke="white" strokeWidth={2.5} />}
              {colorPcs?.has(pc) && !nonDia && !compareOnly &&
                <circle cx={cx} cy={cy} r={DOT_R + 4} fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth={1.5} />}
              {activePc === pc && !compareOnly &&
                <circle cx={cx} cy={cy} r={DOT_R + 5} fill="rgba(255,255,255,0.15)"
                  stroke="white" strokeWidth={1.5} strokeOpacity={0.7} />}
              {lbl && !compareOnly &&
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fontWeight={700}
                  fill={nonDia ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}
                  style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>
                  {lbl}
                </text>}
            </g>
          );
        }

        // Fret 0 — open string
        const oPc  = openPc % 12;
        const oDot = renderDot(oPc, OPEN_X, sY(s), 'o');
        if (oDot) positions.push(oDot);

        // Frets 1–fretCount
        for (let f = 1; f <= fretCount; f++) {
          const pc  = (openPc + f) % 12;
          const dot = renderDot(pc, fX(f), sY(s), f);
          if (dot) positions.push(dot);
        }

        return <g key={s}>{positions}</g>;
      })}
    </svg>
  );
}
