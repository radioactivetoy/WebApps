import { NOTE_COLORS, PIANO_KEYS, pcToName, INTERVAL_LABELS } from '../data/musicTheory.js';

const WHITE_W = 40;
const WHITE_H = 130;
const BLACK_W = 24;
const BLACK_H = 80;
const W_R = 12;   // dot radius on white keys
const B_R = 9;    // dot radius on black keys

function whiteX(n) { return n * WHITE_W; }
function blackX(n) { return (n + 1) * WHITE_W - BLACK_W / 2; }

function kPath(x, w, h, r) {
  return `M${x} 0L${x+w} 0L${x+w} ${h-r}Q${x+w} ${h} ${x+w-r} ${h}L${x+r} ${h}Q${x} ${h} ${x} ${h-r}Z`;
}

export default function Piano({ currentKeyInfo, activeScalePcs, activeChordPcs, activeChordRoot, isFlat, labelMode, scaleLabel, colorPcs, activePc }) {
  const { rootPc } = currentKeyInfo;
  const scalePcsSet  = new Set(activeScalePcs);
  const chordPcsSet  = activeChordPcs ? new Set(activeChordPcs) : null;
  const highlightRoot = activeChordRoot ?? rootPc;
  const intervalRef   = activeChordRoot ?? rootPc;

  const whiteKeys  = PIANO_KEYS.filter(k => !k.isBlack);
  const blackKeys  = PIANO_KEYS.filter(k => k.isBlack);
  const totalWhite = whiteKeys.length;
  const VB_W = totalWhite * WHITE_W;
  const VB_H = WHITE_H + 8;

  function showDot(pc) {
    if (chordPcsSet) return chordPcsSet.has(pc) || scalePcsSet.has(pc);
    return scalePcsSet.has(pc);
  }

  function dotOpacity(pc) {
    if (!chordPcsSet) return 1;
    return chordPcsSet.has(pc) ? 1 : 0.2;
  }

  function isNonDia(pc) {
    return !!(chordPcsSet?.has(pc) && !scalePcsSet.has(pc));
  }

  function dotLabel(pc) {
    if (labelMode === 'intervals') {
      const diff = (pc - intervalRef + 12) % 12;
      return INTERVAL_LABELS[diff].short;
    }
    return pcToName(pc, isFlat);
  }

  function renderDot(pc, cx, cy, r) {
    const color  = NOTE_COLORS[pc];
    const nonDia = isNonDia(pc);
    const isRoot = pc === highlightRoot && !nonDia;
    const lbl    = dotLabel(pc);
    return (
      <g opacity={dotOpacity(pc)}>
        {nonDia ? (
          <>
            {/* Full-opacity fill so it reads as a chord tone; dashed border marks it outside key */}
            <circle cx={cx} cy={cy} r={r} fill={color} />
            <circle cx={cx} cy={cy} r={r + 1.5} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 3" />
          </>
        ) : (
          <circle cx={cx} cy={cy} r={r} fill={color} />
        )}
        {isRoot && (
          <>
            <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={3.5} />
            <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="white" strokeWidth={2} />
          </>
        )}
        {colorPcs?.has(pc) && !nonDia && (
          <circle cx={cx} cy={cy} r={r + 3.5} fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth={1.5} />
        )}
        {activePc === pc && (
          <>
            <circle cx={cx} cy={cy} r={r + 6} fill="rgba(255,255,255,0.18)" />
            <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="white" strokeWidth={1.5} strokeOpacity={0.7} />
          </>
        )}
        {lbl && (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
            fontSize={r * 0.65} fontWeight={700} fill="rgba(0,0,0,0.82)"
            style={{ fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}>
            {lbl}
          </text>
        )}
      </g>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Piano · {activeChordPcs
          ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord')
          : scaleLabel ?? currentKeyInfo.label}
      </p>
      <svg width="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ display: 'block' }}>

        {/* White keys — monochrome */}
        {whiteKeys.map(k => {
          const x  = whiteX(k.whiteIdx);
          const cx = x + (WHITE_W - 1) / 2;
          const cy = WHITE_H - W_R - 5;
          return (
            <g key={k.note}>
              <path d={kPath(x, WHITE_W - 1, WHITE_H, 4)} fill="#f2f0f7" />
              {showDot(k.pc) && renderDot(k.pc, cx, cy, W_R)}
            </g>
          );
        })}

        {/* Black keys — monochrome, rendered on top */}
        {blackKeys.map(k => {
          const x  = blackX(k.whiteIdx);
          const cx = x + BLACK_W / 2;
          const cy = BLACK_H - B_R - 5;
          return (
            <g key={k.note}>
              <path d={kPath(x, BLACK_W, BLACK_H, 3)} fill="#252033" />
              {showDot(k.pc) && renderDot(k.pc, cx, cy, B_R)}
            </g>
          );
        })}

      </svg>

      {/* Legend */}
      <div className="flex gap-5 mt-3 flex-wrap">
        <LegendDot ring label="Root" />
        {activeChordPcs ? (
          <>
            <LegendDot label="Chord tone" />
            <LegendDot dim label="Scale only" />
            <LegendDot dashed label="Outside key" />
          </>
        ) : (
          <LegendDot label="Scale note" />
        )}
      </div>
    </div>
  );
}

function LegendDot({ label, ring, dim, dashed }) {
  const color = '#a78bfa';
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
      <svg width={16} height={16} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
        {dashed ? (
          <>
            <circle cx={8} cy={8} r={5} fill={color} />
            <circle cx={8} cy={8} r={6.5} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 3" />
          </>
        ) : (
          <circle cx={8} cy={8} r={6} fill={color} opacity={dim ? 0.2 : 1} />
        )}
        {ring && (
          <>
            <circle cx={8} cy={8} r={7} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={3} />
            <circle cx={8} cy={8} r={7} fill="none" stroke="white" strokeWidth={1.5} />
          </>
        )}
      </svg>
      {label}
    </div>
  );
}
