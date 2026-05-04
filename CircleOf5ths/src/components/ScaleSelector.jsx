import { SCALES, NOTE_COLORS } from '../data/musicTheory.js';

const GROUPS = [
  ['major', 'minor'],
  ['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'],
  ['maj-pent', 'min-pent', 'blues'],
];

export default function ScaleSelector({ scaleMode, onScaleModeChange, rootPc }) {
  const activeColor = NOTE_COLORS[rootPc];
  return (
    <div className="flex items-center gap-2 px-4 py-2 flex-wrap"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
      <span className="text-[9px] font-bold tracking-[2px] text-white/30 uppercase mr-1">Scale</span>
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1.5">
          {gi > 0 && (
            <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', display: 'inline-block', flexShrink: 0 }} />
          )}
          {group.map(key => {
            const active = scaleMode === key;
            return (
              <button
                key={key}
                onClick={() => onScaleModeChange(key)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all whitespace-nowrap"
                style={active
                  ? { background: activeColor, color: '#000', fontWeight: 700 }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                }>
                {SCALES[key].label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
