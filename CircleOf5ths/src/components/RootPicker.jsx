import { NOTE_COLORS, musicKeys, pcToName } from '../data/musicTheory.js';

const CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function RootPicker({ rootPc, scaleMode, isFlat, onKeySelect }) {
  function handleClick(pc) {
    const type = scaleMode === 'minor' ? 'minor' : 'major';
    const key = Object.keys(musicKeys).find(
      k => musicKeys[k].rootPc === pc && musicKeys[k].type === type
    );
    if (key) onKeySelect(key);
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 flex-wrap rounded-xl"
      style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <span className="text-[9px] font-bold tracking-[2px] text-white/30 uppercase mr-1">Root</span>
      {CHROMATIC.map(pc => {
        const active = pc === rootPc;
        const color = NOTE_COLORS[pc];
        return (
          <button
            key={pc}
            onClick={() => handleClick(pc)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all hover:opacity-80 whitespace-nowrap"
            style={active
              ? { background: color, color: '#000' }
              : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {pcToName(pc, isFlat)}
          </button>
        );
      })}
    </div>
  );
}
