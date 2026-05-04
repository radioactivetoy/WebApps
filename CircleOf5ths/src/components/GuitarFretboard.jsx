import { NOTE_COLORS, pcToName, INTERVAL_LABELS } from '../data/musicTheory.js';

// Strings top→bottom: high e, B, G, D, A, low E
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];
const STRING_OPEN_PCS = [4, 11, 7, 2, 9, 4];
const STRING_WIDTHS = [0.8, 0.9, 1.1, 1.4, 1.8, 2.3];

const FRET_MARKERS = { 3: 1, 5: 1, 7: 1, 9: 1, 12: 2, 15: 1 };

const VB_W = 1000, VB_H = 185;
const LABEL_W = 24;
const OPEN_W = 40;
const NUT_X = LABEL_W + OPEN_W;       // 64
const MARGIN_R = 6;
const FRET_AREA_W = VB_W - NUT_X - MARGIN_R; // 930
const FRET_W = FRET_AREA_W / 15;      // 62
const MT = 18, MB = 30;
const STRINGS_H = VB_H - MT - MB;     // 137
const SS = STRINGS_H / 5;             // 27.4  string spacing
const DOT_R = 10;
const OPEN_X = LABEL_W + OPEN_W / 2;  // 44

function sY(s) { return MT + s * SS; }
function fX(f) { return NUT_X + (f - 0.5) * FRET_W; } // center of fret f (1-indexed)
function fLineX(f) { return NUT_X + f * FRET_W; }      // fret bar position (0=nut edge, 1..15)

export default function GuitarFretboard({ activeScalePcs, activeChordPcs, activeChordRoot, rootPc, labelMode, isFlat }) {
  const scalePcsSet = new Set(activeScalePcs);
  const chordPcsSet = activeChordPcs ? new Set(activeChordPcs) : null;
  const highlightRoot = activeChordRoot ?? rootPc;
  const intervalRef = activeChordRoot ?? rootPc;

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

  const midY = MT + STRINGS_H / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ display: 'block' }}>

      {/* ── Fret position inlays ── */}
      {Object.entries(FRET_MARKERS).map(([fStr, count]) => {
        const f = +fStr;
        const x = fX(f);
        if (count === 2) {
          return (
            <g key={f}>
              <circle cx={x} cy={sY(1.5)} r={4} fill="rgba(255,255,255,0.09)" />
              <circle cx={x} cy={sY(3.5)} r={4} fill="rgba(255,255,255,0.09)" />
            </g>
          );
        }
        return <circle key={f} cx={x} cy={midY} r={4} fill="rgba(255,255,255,0.09)" />;
      })}

      {/* ── Fret lines ── */}
      {Array.from({ length: 15 }, (_, i) => (
        <line key={i} x1={fLineX(i + 1)} y1={MT - 2} x2={fLineX(i + 1)} y2={MT + STRINGS_H + 2}
          stroke="rgba(255,255,255,0.18)" strokeWidth={i === 0 ? 1 : 0.8} />
      ))}

      {/* ── Nut ── */}
      <rect x={NUT_X - 3} y={MT - 3} width={5} height={STRINGS_H + 6}
        fill="rgba(255,255,255,0.65)" rx={1} />

      {/* ── String lines ── */}
      {STRING_LABELS.map((_, s) => (
        <line key={s}
          x1={LABEL_W} y1={sY(s)} x2={VB_W - MARGIN_R} y2={sY(s)}
          stroke="rgba(255,255,255,0.22)" strokeWidth={STRING_WIDTHS[s]} />
      ))}

      {/* ── String labels ── */}
      {STRING_LABELS.map((lbl, s) => (
        <text key={s} x={LABEL_W - 5} y={sY(s)} textAnchor="end" dominantBaseline="middle"
          fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.35)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {lbl}
        </text>
      ))}

      {/* ── Fret number labels ── */}
      {[1, 3, 5, 7, 9, 12, 15].map(f => (
        <text key={f} x={fX(f)} y={VB_H - 7} textAnchor="middle"
          fontSize={10} fill="rgba(255,255,255,0.28)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {f}
        </text>
      ))}

      {/* ── Note dots ── */}
      {STRING_OPEN_PCS.map((openPc, s) => {
        const positions = [];

        // Fret 0 — open string
        const oPc = openPc % 12;
        const oInScale = scalePcsSet.has(oPc);
        const oNonDia  = isNonDiatonic(oPc);
        if (oInScale || oNonDia) {
          const color = NOTE_COLORS[oPc];
          const isRoot = oPc === highlightRoot;
          const lbl = dotLabel(oPc);
          positions.push(
            <g key="o" opacity={dotOpacity(oPc)}>
              {oNonDia
                ? <circle cx={OPEN_X} cy={sY(s)} r={DOT_R} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                : <circle cx={OPEN_X} cy={sY(s)} r={DOT_R} fill={color} />}
              {isRoot && !oNonDia && <circle cx={OPEN_X} cy={sY(s)} r={DOT_R} fill="none" stroke="white" strokeWidth={2.5} />}
              {lbl && <text x={OPEN_X} y={sY(s)} textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fontWeight={700} fill={oNonDia ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}
                style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>{lbl}</text>}
            </g>
          );
        }

        // Frets 1–15
        for (let f = 1; f <= 15; f++) {
          const pc = (openPc + f) % 12;
          const inScale = scalePcsSet.has(pc);
          const nonDia  = isNonDiatonic(pc);
          if (!inScale && !nonDia) continue;
          const color = NOTE_COLORS[pc];
          const isRoot = pc === highlightRoot;
          const cx = fX(f);
          const cy = sY(s);
          const lbl = dotLabel(pc);
          positions.push(
            <g key={f} opacity={dotOpacity(pc)}>
              {nonDia
                ? <circle cx={cx} cy={cy} r={DOT_R} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                : <circle cx={cx} cy={cy} r={DOT_R} fill={color} />}
              {isRoot && !nonDia && <circle cx={cx} cy={cy} r={DOT_R} fill="none" stroke="white" strokeWidth={2.5} />}
              {lbl && <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fontWeight={700} fill={nonDia ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}
                style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>{lbl}</text>}
            </g>
          );
        }

        return <g key={s}>{positions}</g>;
      })}
    </svg>
  );
}
