import { SCALES, NOTE_COLORS } from '../data/musicTheory.js';

const GROUPS = [
  ['major', 'minor'],
  ['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'],
  ['maj-pent', 'min-pent', 'blues'],
  ['mel-minor', 'lyd-dom', 'altered'],
  ['harm-minor', 'phryg-dom'],
];

export default function ScaleSelector({ scaleMode, onScaleModeChange, rootPc }) {
  const activeColor = NOTE_COLORS[rootPc];
  return (
    <div className="flex items-center gap-2 px-4 py-2 flex-wrap rounded-xl"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <span className="text-[9px] font-bold tracking-[2px] text-white/30 uppercase mr-1">Scale</span>
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1.5">
          {gi > 0 && (
            <span aria-hidden="true" style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', display: 'inline-block', flexShrink: 0 }} />
          )}
          {group.map(key => {
            const active = scaleMode === key;
            return (
              <button
                key={key}
                aria-pressed={active}
                onClick={() => onScaleModeChange(key)}
                className={`text-[10px] ${active ? 'font-bold' : 'font-semibold'} px-2.5 py-1 rounded-full transition-all whitespace-nowrap hover:opacity-80`}
                style={active
                  ? { background: activeColor, color: '#000' }
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
