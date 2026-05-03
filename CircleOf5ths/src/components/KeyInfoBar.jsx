import { NOTE_COLORS, musicKeys, circleSlices } from '../data/musicTheory.js';

function getRelatedKeys(selectedKey, currentKeyInfo) {
  const { rootPc, type, accType } = currentKeyInfo;

  const relativeKey = type === 'major'
    ? circleSlices.find(s => s.major === selectedKey)?.minor
    : circleSlices.find(s => s.minor === selectedKey)?.major;

  const parallelKey = type === 'major'
    ? Object.keys(musicKeys).find(k => musicKeys[k].rootPc === rootPc && musicKeys[k].type === 'minor')
    : Object.keys(musicKeys).find(k => musicKeys[k].rootPc === rootPc && musicKeys[k].type === 'major');

  const domPc = (rootPc + 7) % 12;
  const dominantKey = Object.keys(musicKeys).find(k =>
    musicKeys[k].rootPc === domPc && musicKeys[k].type === type
  );

  const subPc = (rootPc + 5) % 12;
  const subdominantKey = Object.keys(musicKeys).find(k =>
    musicKeys[k].rootPc === subPc && musicKeys[k].type === type
  );

  return { relativeKey, parallelKey, dominantKey, subdominantKey };
}

function Pill({ label, keyName, onKeySelect }) {
  if (!keyName || !musicKeys[keyName]) return null;
  const pc = musicKeys[keyName].rootPc;
  const color = NOTE_COLORS[pc];
  return (
    <button
      onClick={() => onKeySelect(keyName)}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors hover:opacity-80"
      style={{ background: `${color}18`, borderColor: `${color}40`, color }}
    >
      <span className="text-white/40 font-normal">{label}:</span>
      {musicKeys[keyName].label}
    </button>
  );
}

export default function KeyInfoBar({ selectedKey, currentKeyInfo, onKeySelect }) {
  const { rootPc, accidentals, accType, label } = currentKeyInfo;
  const color = NOTE_COLORS[rootPc];
  const { relativeKey, parallelKey, dominantKey, subdominantKey } = getRelatedKeys(selectedKey, currentKeyInfo);

  const enharmonicMap = { 'F#':'Gb', 'Db':'C#', 'Ab':'G#', 'Eb':'D#', 'Bb':'A#' };
  const baseKey = selectedKey.replace('m','');
  const enharmonic = enharmonicMap[baseKey];
  const displayLabel = enharmonic
    ? label.replace(baseKey, `${baseKey} / ${enharmonic}`)
    : label;

  const accText = accidentals === 0
    ? '0 accidentals · Natural'
    : `${accidentals} ${accidentals === 1 ? accType : accType+'s'}`;

  return (
    <div className="px-7 py-2.5 flex items-center gap-3 flex-wrap border-b"
      style={{ background: `${color}10`, borderColor: `${color}25` }}>
      <span className="text-xl font-black" style={{ color }}>{displayLabel}</span>
      <Pill label="Relative"    keyName={relativeKey}    onKeySelect={onKeySelect} />
      <Pill label="Parallel"    keyName={parallelKey}    onKeySelect={onKeySelect} />
      <Pill label="→ Dominant"  keyName={dominantKey}    onKeySelect={onKeySelect} />
      <Pill label="→ Subdom"    keyName={subdominantKey} onKeySelect={onKeySelect} />
      <span className="ml-auto text-xs text-white/25">{accText}</span>
    </div>
  );
}
