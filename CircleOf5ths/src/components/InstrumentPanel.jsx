import { useState, useMemo, useRef, useEffect } from 'react';
import { NOTE_COLORS, pcToName, SCALES } from '../data/musicTheory.js';
import Piano from './Piano.jsx';
import GuitarFretboard from './GuitarFretboard.jsx';

const SCALE_OPTIONS = Object.entries(SCALES).map(([key, s]) => ({ key, label: s.label }));

function ScaleDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = value ? SCALE_OPTIONS.find(o => o.key === value) : null;

  useEffect(() => {
    if (!open) return;
    function handle(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
        style={active
          ? { background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(147,197,253,0.9)' }
          : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
        {active ? active.label : 'none'}
        <span className="text-[8px] opacity-60">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden py-1"
          style={{ background: 'rgba(24,24,40,0.97)', border: '1px solid rgba(255,255,255,0.12)', minWidth: '9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-[11px] transition-colors hover:bg-white/10"
            style={{ color: !active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', fontWeight: !active ? 600 : 400 }}>
            None
          </button>
          {SCALE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] transition-colors hover:bg-white/10"
              style={{ color: value === key ? 'rgba(147,197,253,0.95)' : 'rgba(255,255,255,0.55)', fontWeight: value === key ? 700 : 400, background: value === key ? 'rgba(96,165,250,0.1)' : 'transparent' }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InstrumentPanel({
  currentKeyInfo,
  activeScalePcs,
  activeChordPcs, activeChordRoot, activeName,
  isFlat, labelMode, onLabelModeChange,
  instrumentMode, onInstrumentModeChange,
  selectedChordDegree, scaleLabel,
  colorNotePcs,
  audio,
}) {
  const { rootPc } = currentKeyInfo;
  const { playScale, playChord, stop, isPlaying, isLoading, activePc } = audio;
  const [showColorNotes, setShowColorNotes] = useState(true);
  const [compareMode,    setCompareMode]    = useState(null);

  const hasColorNotes  = colorNotePcs?.size > 0;
  const colorPcs       = showColorNotes && hasColorNotes && !activeChordPcs ? colorNotePcs : null;

  // Pitch classes of the comparison scale, relative to the same root
  const compareScalePcs = useMemo(() => {
    if (!compareMode) return null;
    const intervals = SCALES[compareMode]?.intervals;
    if (!intervals) return null;
    return new Set(intervals.map(i => (rootPc + i) % 12));
  }, [compareMode, rootPc]);

  const chips = activeChordPcs
    ? activeChordPcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }))
    : activeScalePcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }));

  function handlePlay() {
    if (isPlaying) { stop(); return; }
    if (activeChordPcs) {
      playChord(activeChordPcs, 4, 'arpeggio');
    } else {
      playScale(activeScalePcs, 4);
    }
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Instrument View</span>
          {/* Notes / Intervals toggle */}
          <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
            {['notes','intervals'].map(m => (
              <button key={m}
                onClick={() => onLabelModeChange(m)}
                className="px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors"
                style={labelMode === m
                  ? { background: 'rgba(255,255,255,0.1)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.35)' }}>
                {m}
              </button>
            ))}
          </div>
          {hasColorNotes && (
            <button
              onClick={() => setShowColorNotes(v => !v)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
              style={showColorNotes
                ? { background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', color: 'rgba(251,191,36,0.9)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
              ◆ Characteristic tones
            </button>
          )}
          {/* Compare scale selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25">Compare:</span>
            <ScaleDropdown value={compareMode} onChange={setCompareMode} />
          </div>
        </div>

        {/* Piano / Guitar toggle */}
        <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
          {[['piano','🎹 Piano'],['guitar','🎸 Guitar']].map(([mode, label]) => (
            <button key={mode}
              onClick={() => onInstrumentModeChange(mode)}
              className="px-4 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
              style={instrumentMode === mode
                ? { background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }
                : { color: 'rgba(255,255,255,0.38)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Instrument view */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px]">
          {instrumentMode === 'piano' ? (
            <Piano
              currentKeyInfo={currentKeyInfo}
              activeScalePcs={activeScalePcs}
              activeChordPcs={activeChordPcs}
              activeChordRoot={activeChordRoot}
              isFlat={isFlat}
              labelMode={labelMode}
              scaleLabel={scaleLabel}
              colorPcs={colorPcs}
              activePc={activePc}
              compareScalePcs={compareScalePcs}
            />
          ) : (
            <div className="mt-1 mb-1">
              <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
                Guitar · {activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : scaleLabel}
              </p>
              <GuitarFretboard
                activeScalePcs={activeScalePcs}
                activeChordPcs={activeChordPcs}
                activeChordRoot={activeChordRoot}
                rootPc={rootPc}
                labelMode={labelMode}
                isFlat={isFlat}
                colorPcs={colorPcs}
                activePc={activePc}
                compareScalePcs={compareScalePcs}
              />
            </div>
          )}
        </div>
      </div>

      {/* Audio bar */}
      <div className="flex items-center gap-3 mt-4 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-opacity disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }}>
          {isPlaying ? '◼' : '▶'}
        </button>
        <span className="text-[10px] text-white/28 uppercase tracking-wide flex-shrink-0">
          {isLoading ? 'Loading samples…' : activeChordPcs ? 'Chord' : 'Scale'}
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {chips.map(({ pc, label: chipLabel }, i) => {
            const color = NOTE_COLORS[pc];
            const isRoot = activeChordPcs ? pc === activeChordRoot : pc === rootPc;
            return (
              <button
                key={i}
                onClick={() => !isPlaying && playChord([pc], 4, 'block')}
                className="text-[11px] font-bold rounded-lg px-2 py-1 border transition-opacity hover:opacity-80"
                style={{
                  background: isRoot ? `${color}45` : `${color}18`,
                  borderColor: `${color}50`,
                  color,
                }}>
                {chipLabel}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-[10px] text-white/20">
          {activeName || currentKeyInfo.label}
        </span>
      </div>

      {/* Compare legend */}
      {compareScalePcs && (
        <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <svg width={14} height={14}><circle cx={7} cy={7} r={4} fill="rgba(167,139,250,0.6)"/></svg>
            In both
          </span>
          <span className="flex items-center gap-1">
            <svg width={14} height={14}><circle cx={7} cy={7} r={4} fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.7)" strokeWidth={1.5} strokeDasharray="3 2"/></svg>
            {SCALES[compareMode]?.label} only
          </span>
          <span className="flex items-center gap-1">
            <svg width={14} height={14}><circle cx={7} cy={7} r={6} fill="none" stroke="rgba(251,146,60,0.7)" strokeWidth={1.5} strokeDasharray="3 2"/></svg>
            Current only
          </span>
        </div>
      )}
    </div>
  );
}
