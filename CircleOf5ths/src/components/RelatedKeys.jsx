import { NOTE_COLORS, musicKeys, circleSlices } from '../data/musicTheory.js';

function getRelated(selectedKey, currentKeyInfo) {
  const { rootPc, type } = currentKeyInfo;
  const relative = type === 'major'
    ? circleSlices.find(s => s.major === selectedKey)?.minor
    : circleSlices.find(s => s.minor === selectedKey)?.major;
  const parallel = Object.keys(musicKeys).find(k =>
    musicKeys[k].rootPc === rootPc && musicKeys[k].type !== type
  );
  const dominant = Object.keys(musicKeys).find(k =>
    musicKeys[k].rootPc === (rootPc + 7) % 12 && musicKeys[k].type === type
  );
  const subdominant = Object.keys(musicKeys).find(k =>
    musicKeys[k].rootPc === (rootPc + 5) % 12 && musicKeys[k].type === type
  );
  return [
    { label: 'Relative',           key: relative },
    { label: 'Parallel',           key: parallel },
    { label: 'Dominant (↑5th)',    key: dominant },
    { label: 'Subdominant (↓5th)', key: subdominant },
  ];
}

export default function RelatedKeys({ selectedKey, currentKeyInfo, onKeySelect }) {
  const rows = getRelated(selectedKey, currentKeyInfo);
  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">Related Keys</p>
      <div className="flex flex-col divide-y divide-white/[0.06]">
        {rows.map(({ label, key }) => {
          if (!key || !musicKeys[key]) return null;
          const pc = musicKeys[key].rootPc;
          const color = NOTE_COLORS[pc];
          return (
            <div key={label} className="flex items-center justify-between py-2">
              <span className="text-sm text-white/40">{label}</span>
              <button
                onClick={() => onKeySelect(key)}
                className="text-sm font-bold rounded-full px-3 py-0.5 border transition-opacity hover:opacity-80"
                style={{ background: `${color}20`, borderColor: `${color}40`, color }}
              >
                {musicKeys[key].label} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
