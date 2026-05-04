import { SCALES } from '../data/musicTheory.js';

function getSteps(intervals) {
  const steps = [];
  for (let i = 0; i < intervals.length - 1; i++) steps.push(intervals[i + 1] - intervals[i]);
  steps.push(12 - intervals[intervals.length - 1]);
  return steps;
}

function stepLabel(n) {
  return { 1: 'H', 2: 'W', 3: '3' }[n] ?? String(n);
}

export default function ScaleFormulaStrip({ scaleMode }) {
  const scale = SCALES[scaleMode];
  const steps = getSteps(scale.intervals);

  return (
    <div className="flex items-center gap-3 px-4 py-2 flex-wrap rounded-xl"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-[9px] font-bold tracking-[2px] text-white/25 uppercase flex-shrink-0">Formula</span>
      <div className="flex items-center">
        {steps.map((s, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[11px] font-mono font-semibold text-white/55">{stepLabel(s)}</span>
            {i < steps.length - 1 && <span className="text-white/20 text-[10px] mx-1">–</span>}
          </span>
        ))}
      </div>
      {scale.colorNotes.length > 0 && (
        <>
          <span className="text-white/20 text-xs">·</span>
          <div className="flex gap-1">
            {scale.colorNotes.map(n => (
              <span key={n} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-amber-300/70">{n}</span>
            ))}
          </div>
        </>
      )}
      {scale.context && (
        <>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-[10px] text-white/30 italic">{scale.context}</span>
        </>
      )}
    </div>
  );
}
