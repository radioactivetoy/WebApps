import { NOTE_COLORS, musicKeys, circleSlices, SCALES } from '../data/musicTheory.js';

function getRelatedKeys(selectedKey, currentKeyInfo) {
  const { rootPc, type } = currentKeyInfo;

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
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-opacity hover:opacity-80"
      style={{ background: `${color}18`, borderColor: `${color}40`, color }}
    >
      <span className="text-white/40 font-normal">{label}:</span>
      {musicKeys[keyName].label}
    </button>
  );
}

export default function KeyInfoBar({ selectedKey, currentKeyInfo, parentKeyName, scaleMode, onKeySelect }) {
  const { rootPc, accidentals, accType, label } = currentKeyInfo;
  const color = NOTE_COLORS[rootPc];
  const { relativeKey, parallelKey, dominantKey, subdominantKey } = getRelatedKeys(selectedKey, currentKeyInfo);

  // Root note name (first word of label, e.g. "C", "F#", "Bb")
  const rootName  = label.split(' ')[0];
  const modeName  = SCALES[scaleMode]?.label ?? label.split(' ')[1];
  const fullLabel = `${rootName} ${modeName}`;

  // Enharmonic display (F# / Gb, etc.)
  const enharmonicMap = { 'F#':'Gb', 'Db':'C#', 'Ab':'G#', 'Eb':'D#', 'Bb':'A#' };
  const baseKey    = selectedKey.replace('m','');
  const enharmonic = enharmonicMap[baseKey];
  const displayLabel = enharmonic
    ? fullLabel.replace(rootName, `${rootName} / ${enharmonic}`)
    : fullLabel;

  // Relative/Dominant/Subdom only make harmonic sense for major and minor
  const isTonal = scaleMode === 'major' || scaleMode === 'minor';

  // Accidentals from parent key when in a modal/minor context
  const accRef  = parentKeyName ? musicKeys[parentKeyName] : currentKeyInfo;
  const accText = accRef.accidentals === 0
    ? '0 accidentals · Natural'
    : `${accRef.accidentals} ${accRef.accidentals === 1 ? accRef.accType : accRef.accType + 's'}`;

  // parentKeyName is a musicKeys key like 'Bb' or null
  const parentEntry = parentKeyName ? musicKeys[parentKeyName] : null;
  const parentColor = parentEntry ? NOTE_COLORS[parentEntry.rootPc] : null;

  return (
    <div className="px-7 py-2.5 flex items-center gap-3 flex-wrap border-b"
      style={{ background: `${color}10`, borderColor: `${color}25` }}>
      <span className="text-xl font-black" style={{ color }}>{displayLabel}</span>
      {parentEntry && (
        <button
          onClick={() => onKeySelect(parentKeyName)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border hover:opacity-80 transition-opacity"
          style={{ background: `${parentColor}18`, borderColor: `${parentColor}40`, color: parentColor }}>
          <span className="text-white/40 font-normal">parent key:</span>
          {parentEntry.label} →
        </button>
      )}
      {isTonal && <Pill label="Relative"   keyName={relativeKey}    onKeySelect={onKeySelect} />}
      <Pill label="Parallel"    keyName={parallelKey}    onKeySelect={onKeySelect} />
      {isTonal && <Pill label="→ Dominant"  keyName={dominantKey}    onKeySelect={onKeySelect} />}
      {isTonal && <Pill label="→ Subdom"    keyName={subdominantKey} onKeySelect={onKeySelect} />}
      <span className="ml-auto text-xs text-white/25">{accText}</span>
    </div>
  );
}
