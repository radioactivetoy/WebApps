import { NOTE_COLORS, PIANO_KEYS, pcToName, INTERVAL_LABELS } from '../data/musicTheory.js';

const WHITE_W = 40;
const WHITE_H = 130;
const BLACK_W = 24;
const BLACK_H = 78;

function whiteX(whiteIdx) { return whiteIdx * WHITE_W + 1; }
function blackX(whiteIdx) { return whiteIdx * WHITE_W + WHITE_W - BLACK_W / 2 + 1; }

export default function Piano({ currentKeyInfo, activeScalePcs, activeChordPcs, activeChordRoot, isFlat, labelMode, scaleLabel }) {
  const { rootPc } = currentKeyInfo;
  const scalePcs = activeScalePcs;
  const whiteKeys = PIANO_KEYS.filter(k => !k.isBlack);
  const blackKeys = PIANO_KEYS.filter(k => k.isBlack);
  const totalWhite = whiteKeys.length;

  function keyState(pc) {
    const c = NOTE_COLORS[pc];
    if (activeChordPcs) {
      if (pc === activeChordRoot || activeChordPcs.includes(pc))
        return { fill: c, active: true, dim: false };
      if (scalePcs.includes(pc))
        return { fill: `${c}40`, active: false, dim: true };
      return { fill: null, active: false, dim: false };
    }
    if (pc === rootPc || scalePcs.includes(pc))
      return { fill: c, active: true, dim: false };
    return { fill: null, active: false, dim: false };
  }

  function intervalData(pc) {
    const ref = activeChordRoot !== undefined ? activeChordRoot : rootPc;
    const diff = (pc - ref + 12) % 12;
    return INTERVAL_LABELS[diff];
  }

  function noteName(pc) {
    return pcToName(pc, isFlat);
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Piano · {activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : scaleLabel ?? currentKeyInfo.label}
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
            const state = keyState(k.pc);
            const fill = state.fill ?? '#f5f5f5';
            const textFill = state.active ? 'rgba(0,0,0,0.8)' : state.dim ? NOTE_COLORS[k.pc] : '#888';
            const isChordActive = state.active && !!activeChordPcs;
            const x = whiteX(k.whiteIdx);
            return (
              <g key={k.note}>
                <rect x={x} y={1} width={WHITE_W - 2} height={WHITE_H}
                  rx={4} fill={fill} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                {isChordActive && <rect x={x} y={1} width={WHITE_W - 2} height={WHITE_H}
                  rx={4} fill="none" stroke="white" strokeWidth={2} />}
                {labelMode === 'intervals' ? (() => {
                  const iv = intervalData(k.pc);
                  return (
                    <>
                      <text x={x + (WHITE_W - 2) / 2} y={WHITE_H - 20}
                        textAnchor="middle" fontSize={9} fontWeight={700}
                        fill={textFill} style={{ fontFamily: 'system-ui, sans-serif' }}>
                        {iv.line1}
                      </text>
                      <text x={x + (WHITE_W - 2) / 2} y={WHITE_H - 8}
                        textAnchor="middle" fontSize={10} fontWeight={800}
                        fill={textFill} style={{ fontFamily: 'system-ui, sans-serif' }}>
                        {iv.line2}
                      </text>
                    </>
                  );
                })() : (
                  <text x={x + (WHITE_W - 2) / 2} y={WHITE_H - 7}
                    textAnchor="middle" fontSize={11} fontWeight={700}
                    fill={textFill} style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {noteName(k.pc)}
                  </text>
                )}
              </g>
            );
          })}
          {/* Black keys */}
          {blackKeys.map(k => {
            const state = keyState(k.pc);
            const fill = state.dim ? `${NOTE_COLORS[k.pc]}88` : (state.fill ?? '#000');
            const textFill = state.active ? 'rgba(0,0,0,0.85)' : state.dim ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.7)';
            const isChordActive = state.active && !!activeChordPcs;
            const x = blackX(k.whiteIdx);
            return (
              <g key={k.note}>
                <rect x={x} y={1} width={BLACK_W} height={BLACK_H}
                  rx={3} fill={fill} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                {isChordActive && <rect x={x} y={1} width={BLACK_W} height={BLACK_H}
                  rx={3} fill="none" stroke="white" strokeWidth={2} />}
                <text x={x + BLACK_W / 2} y={BLACK_H - 7}
                  textAnchor="middle" fontSize={9} fontWeight={700}
                  fill={textFill} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {labelMode === 'intervals' ? intervalData(k.pc).short : noteName(k.pc)}
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
            <Legend dot="rgba(248,113,113,0.6)" label="Chord Tone" />
            <Legend dot="rgba(248,113,113,0.22)" label="Scale Tone" />
            <Legend dot="#f5f5f5" label="Outside" border />
          </>
        ) : (
          <>
            <Legend dot="#f87171" label="Root" />
            <Legend dot="rgba(74,222,128,0.45)" label="Scale Note" />
            <Legend dot="#f5f5f5" label="Outside Scale" border />
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
