import { NOTE_COLORS, PIANO_KEYS, pcToName, getInterval } from '../data/musicTheory.js';

const WHITE_W = 40;
const WHITE_H = 130;
const BLACK_W = 24;
const BLACK_H = 78;

function whiteX(whiteIdx) { return whiteIdx * WHITE_W + 1; }
function blackX(whiteIdx) { return whiteIdx * WHITE_W + WHITE_W - BLACK_W / 2 + 1; }

export default function Piano({ currentKeyInfo, activeChordPcs, activeChordRoot, isFlat, labelMode }) {
  const { scalePcs, rootPc } = currentKeyInfo;
  const whiteKeys = PIANO_KEYS.filter(k => !k.isBlack);
  const blackKeys = PIANO_KEYS.filter(k => k.isBlack);
  const totalWhite = whiteKeys.length;

  function keyColor(pc) {
    const c = NOTE_COLORS[pc];
    if (activeChordPcs) {
      if (pc === activeChordRoot) return `${c}DA`;
      if (activeChordPcs.includes(pc)) return `${c}80`;
      if (scalePcs.includes(pc)) return `${c}38`;
      return '#0d0b1e';
    }
    if (pc === rootPc) return `${c}BF`;
    if (scalePcs.includes(pc)) return `${c}38`;
    return null;
  }

  function label(pc) {
    if (labelMode === 'intervals') {
      const ref = activeChordRoot !== undefined ? activeChordRoot : rootPc;
      return getInterval(pc, ref);
    }
    return pcToName(pc, isFlat);
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Piano · {activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : currentKeyInfo.label + ' scale'}
      </p>
      <div className="overflow-x-auto">
        <svg
          width={totalWhite * WHITE_W + 2}
          height={WHITE_H + 10}
          viewBox={`0 0 ${totalWhite * WHITE_W + 2} ${WHITE_H + 10}`}
          style={{ display: 'block', minWidth: totalWhite * WHITE_W + 2 }}
        >
          {/* White keys */}
          {whiteKeys.map(k => {
            const fill = keyColor(k.pc) ?? '#0d0b1e20';
            const border = NOTE_COLORS[k.pc] + '50';
            const x = whiteX(k.whiteIdx);
            const noteColor = NOTE_COLORS[k.pc];
            return (
              <g key={k.note}>
                <rect x={x} y={1} width={WHITE_W - 2} height={WHITE_H}
                  rx={4} fill={fill} stroke={border} strokeWidth={1} />
                <text x={x + (WHITE_W - 2) / 2} y={WHITE_H - 8}
                  textAnchor="middle" fontSize={9} fontWeight={700}
                  fill={noteColor} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {label(k.pc)}
                </text>
              </g>
            );
          })}
          {/* Black keys */}
          {blackKeys.map(k => {
            const fillOverride = keyColor(k.pc);
            const fill = fillOverride ?? '#0d0b1e';
            const noteColor = NOTE_COLORS[k.pc];
            const x = blackX(k.whiteIdx);
            return (
              <g key={k.note}>
                <rect x={x} y={1} width={BLACK_W} height={BLACK_H}
                  rx={3} fill={fill} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                <text x={x + BLACK_W / 2} y={BLACK_H - 8}
                  textAnchor="middle" fontSize={7} fontWeight={600}
                  fill={fillOverride ? 'white' : `${noteColor}55`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {label(k.pc)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex gap-5 mt-3 flex-wrap">
        {activeChordPcs ? (
          <>
            <Legend dot="#f87171" label="Chord Root" />
            <Legend dot="rgba(248,113,113,0.5)" label="Chord Tone" />
            <Legend dot="rgba(74,222,128,0.25)" label="Scale Note" />
            <Legend dot="#0d0b1e" label="Outside Scale" border />
          </>
        ) : (
          <>
            <Legend dot="#f87171" label="Root" />
            <Legend dot="rgba(74,222,128,0.25)" label="Scale Note" />
            <Legend dot="#0d0b1e" label="Outside Scale" border />
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ dot, label, border }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: dot, border: border ? '1px solid rgba(255,255,255,0.15)' : undefined }} />
      {label}
    </div>
  );
}
