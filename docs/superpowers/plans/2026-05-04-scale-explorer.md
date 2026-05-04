# Scale Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scale type selector (modes, pentatonic, blues) as a pill row that updates the piano, staff, and diatonic chord grid without touching the Circle of Fifths.

**Architecture:** A new `scaleMode` state in `App.jsx` overlays the existing key selection — `activeScalePcs` is derived from `currentKeyInfo.rootPc` + `SCALES[scaleMode].intervals`. All components that currently read `currentKeyInfo.scalePcs` switch to the computed `activeScalePcs`. Chord quality computation moves to a shared helper so both `App.jsx` and `DiatonicChords.jsx` stay in sync.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3 (class dark mode), plain JS music theory helpers.

---

## File Map

| File | Action |
|---|---|
| `CircleOf5ths/src/data/musicTheory.js` | Add `SCALES`, `computeDrawScale`, `buildDiatonicChords` |
| `CircleOf5ths/src/components/ScaleSelector.jsx` | Create new |
| `CircleOf5ths/App.jsx` | Add `scaleMode` state, wire everything |
| `CircleOf5ths/src/components/KeyInfoBar.jsx` | Add parent key badge |
| `CircleOf5ths/src/components/Staff.jsx` | Accept `activeDrawScale` prop |
| `CircleOf5ths/src/components/Piano.jsx` | Accept `activeScalePcs` prop |
| `CircleOf5ths/src/components/InstrumentPanel.jsx` | Accept + forward `activeScalePcs` |
| `CircleOf5ths/src/components/DiatonicChords.jsx` | Use `activeScalePcs`; hide for pent/blues; suppress fn badges for modes |

---

## Task 1 — Add data helpers to `musicTheory.js`

**Files:**
- Modify: `CircleOf5ths/src/data/musicTheory.js`

- [ ] **Step 1: Add `SCALES` constant** — append after the existing `majorSteps`/`minorSteps` lines:

```js
// ── Scale definitions ─────────────────────────────────────────────────────────
// parentOffset: semitones to add to rootPc to get the parent major key root (modes only)
export const SCALES = {
  'major':      { label: 'Major',    intervals: [0,2,4,5,7,9,11], parentOffset: null },
  'dorian':     { label: 'Dorian',   intervals: [0,2,3,5,7,9,10], parentOffset: 10   },
  'phrygian':   { label: 'Phrygian', intervals: [0,1,3,5,7,8,10], parentOffset: 8    },
  'lydian':     { label: 'Lydian',   intervals: [0,2,4,6,7,9,11], parentOffset: 7    },
  'mixolydian': { label: 'Mixo',     intervals: [0,2,4,5,7,9,10], parentOffset: 5    },
  'minor':      { label: 'Minor',    intervals: [0,2,3,5,7,8,10], parentOffset: null },
  'locrian':    { label: 'Locrian',  intervals: [0,1,3,5,6,8,10], parentOffset: 1    },
  'maj-pent':   { label: 'Maj Pent', intervals: [0,2,4,7,9],      parentOffset: null },
  'min-pent':   { label: 'Min Pent', intervals: [0,3,5,7,10],     parentOffset: null },
  'blues':      { label: 'Blues',    intervals: [0,3,5,6,7,10],   parentOffset: null },
};
```

- [ ] **Step 2: Add `computeDrawScale` helper** — append after `SCALES`:

```js
// Maps each pc to the natural letter used for its staff position.
// Sharp spelling: C# sits on C's line; flat spelling: Db sits on D's line.
const _STAFF_SHARP = ['C','C','D','D','E','F','F','G','G','A','A','B'];
const _STAFF_FLAT  = ['C','D','D','E','E','F','G','G','A','A','B','B'];

export function computeDrawScale(rootPc, scalePcs, isFlat) {
  const letters = isFlat ? _STAFF_FLAT : _STAFF_SHARP;
  let octave = rootPc >= 9 ? 3 : 4; // A/Bb/B roots start at octave 3
  return scalePcs.map((pc, i) => {
    if (i > 0 && pc < scalePcs[i - 1]) octave++; // wrapped past B→C
    return letters[pc] + octave;
  });
}
```

- [ ] **Step 3: Add `buildDiatonicChords` helper** — append after `computeDrawScale`:

```js
// Computes diatonic chord names + pcs for any 7-note scale.
// Returns array of { degree, numeral, name, pcs, rootPc }.
export function buildDiatonicChords(scalePcs, isFlat, chordType) {
  const ROMAN = ['I','II','III','IV','V','VI','VII'];
  return scalePcs.map((rootPc, i) => {
    const third   = scalePcs[(i + 2) % 7];
    const fifth   = scalePcs[(i + 4) % 7];
    const seventh = scalePcs[(i + 6) % 7];
    const t = (third   - rootPc + 12) % 12;
    const f = (fifth   - rootPc + 12) % 12;
    const s = (seventh - rootPc + 12) % 12;

    let quality;
    if      (t === 4 && f === 7) quality = 'major';
    else if (t === 3 && f === 7) quality = 'minor';
    else if (t === 3 && f === 6) quality = 'dim';
    else                         quality = 'aug';

    const roman = ROMAN[i];
    let numeral, suffix;
    if      (quality === 'major') { numeral = roman;                   suffix = '';    }
    else if (quality === 'minor') { numeral = roman.toLowerCase();     suffix = 'm';   }
    else if (quality === 'dim')   { numeral = roman.toLowerCase()+'°'; suffix = 'dim'; }
    else                          { numeral = roman+'+';               suffix = 'aug'; }

    let name, pcs;
    if (chordType === 'seventh') {
      let suf7;
      if      (quality==='major' && s===11) { suf7='maj7'; numeral=roman+'maj7';              }
      else if (quality==='major' && s===10) { suf7='7';    numeral=roman+'7';                 }
      else if (quality==='minor' && s===10) { suf7='m7';   numeral=roman.toLowerCase()+'7';   }
      else if (quality==='dim'   && s===10) { suf7='m7b5'; numeral=roman.toLowerCase()+'ø7';  }
      else if (quality==='dim'   && s===9)  { suf7='dim7'; numeral=roman.toLowerCase()+'°7';  }
      else                                  { suf7='m7';   numeral=roman.toLowerCase()+'7';   }
      name = pcToName(rootPc, isFlat) + suf7;
      pcs  = [rootPc, third, fifth, seventh];
    } else {
      name = pcToName(rootPc, isFlat) + suffix;
      pcs  = [rootPc, third, fifth];
    }
    return { degree: i, numeral, name, pcs, rootPc };
  });
}
```

- [ ] **Step 4: Verify the file parses** — start dev server and confirm no console errors:

```powershell
cd CircleOf5ths && npm run dev
```

Open http://localhost:5173 — app should load normally (no visible change yet).

- [ ] **Step 5: Commit**

```powershell
git add CircleOf5ths/src/data/musicTheory.js
git commit -m "feat: add SCALES, computeDrawScale, buildDiatonicChords to musicTheory"
```

---

## Task 2 — Create `ScaleSelector.jsx`

**Files:**
- Create: `CircleOf5ths/src/components/ScaleSelector.jsx`

- [ ] **Step 1: Create the file**

```jsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add CircleOf5ths/src/components/ScaleSelector.jsx
git commit -m "feat: add ScaleSelector pill row component"
```

---

## Task 3 — Wire `scaleMode` into `App.jsx`

**Files:**
- Modify: `CircleOf5ths/App.jsx`

- [ ] **Step 1: Update imports** — change the import block at the top to:

```js
import React, { useState, useEffect, useMemo } from 'react';
import { musicKeys, circleSlices, SCALES, computeDrawScale, buildDiatonicChords, pcToName } from './src/data/musicTheory.js';
import Header from './src/components/Header.jsx';
import KeyInfoBar from './src/components/KeyInfoBar.jsx';
import Circle from './src/components/Circle.jsx';
import Staff from './src/components/Staff.jsx';
import InstrumentPanel from './src/components/InstrumentPanel.jsx';
import DiatonicChords from './src/components/DiatonicChords.jsx';
import RelatedKeys from './src/components/RelatedKeys.jsx';
import AIAssistant from './src/components/AIAssistant.jsx';
import ScaleSelector from './src/components/ScaleSelector.jsx';
```

- [ ] **Step 2: Add `scaleMode` state and derived values** — replace the state block and derived values (lines 17–29) with:

```js
  const [selectedKey, setSelectedKey]                   = useState('C');
  const [selectedChordDegree, setSelectedChordDegree]   = useState(null);
  const [customChordHighlight, setCustomChordHighlight] = useState(null);
  const [chordType, setChordType]                       = useState('triad');
  const [instrumentMode, setInstrumentMode]             = useState('piano');
  const [labelMode, setLabelMode]                       = useState('notes');
  const [scaleMode, setScaleMode]                       = useState('major');
  const [rotationAngle, setRotationAngle]               = useState(0);

  const currentKeyInfo = musicKeys[selectedKey];
  const isFlat = currentKeyInfo.accType === 'flat';
  const selectedIndex = circleSlices.findIndex(
    s => s.major === selectedKey || s.minor === selectedKey
  );

  // Compute active scale pitch classes from root + mode intervals
  const activeScalePcs = useMemo(() =>
    SCALES[scaleMode].intervals.map(i => (currentKeyInfo.rootPc + i) % 12),
    [scaleMode, currentKeyInfo.rootPc]
  );

  // Draw scale (note names with octaves) for Staff
  const activeDrawScale = useMemo(() =>
    (scaleMode === 'major' || scaleMode === 'minor')
      ? currentKeyInfo.drawScale
      : computeDrawScale(currentKeyInfo.rootPc, activeScalePcs, isFlat),
    [scaleMode, currentKeyInfo, activeScalePcs, isFlat]
  );

  // Parent key name for modal scales — returns a musicKeys key like 'Bb', 'F', 'G'
  const parentKeyName = useMemo(() => {
    const offset = SCALES[scaleMode].parentOffset;
    if (offset === null) return null;
    const parentPc = (currentKeyInfo.rootPc + offset) % 12;
    return Object.keys(musicKeys).find(
      k => musicKeys[k].type === 'major' && musicKeys[k].rootPc === parentPc
    ) ?? null;
  }, [scaleMode, currentKeyInfo.rootPc]);
```

- [ ] **Step 3: Update key-change effect to reset scaleMode** — replace the existing `useEffect` for rotation (around line 32) with:

```js
  useEffect(() => {
    setSelectedChordDegree(null);
    setCustomChordHighlight(null);
    setScaleMode(currentKeyInfo.type === 'minor' ? 'minor' : 'major');
    setRotationAngle(prev => {
      const cur = ((prev % 360) + 360) % 360;
      const target = selectedIndex * 30;
      let diff = target - cur;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return prev + diff;
    });
  }, [selectedKey, selectedIndex]);
```

- [ ] **Step 4: Replace `diatonicChords` computation** — replace lines 45–70 (the `activeNumerals` + `diatonicChords` block) with:

```js
  // Only compute diatonic chords for 7-note scales
  const is7Note = activeScalePcs.length === 7;
  const diatonicChords = is7Note
    ? buildDiatonicChords(activeScalePcs, isFlat, chordType)
    : [];

  const activeChord = selectedChordDegree !== null ? diatonicChords[selectedChordDegree] : null;
  const activePcs   = customChordHighlight?.pcs  || activeChord?.pcs  || null;
  const activeRoot  = customChordHighlight ? customChordHighlight.rootPc : activeChord?.rootPc;
  const activeName  = customChordHighlight ? customChordHighlight.name  : activeChord?.name;
```

- [ ] **Step 5: Add `handleScaleModeChange`** — add after `handleChordSelect`:

```js
  function handleScaleModeChange(mode) {
    setScaleMode(mode);
    setSelectedChordDegree(null);
    setCustomChordHighlight(null);
  }
```

- [ ] **Step 6: Update JSX** — replace the `return (...)` block with:

```jsx
  return (
    <div className="min-h-screen font-sans text-white" style={{ background: 'var(--bg-gradient)' }}>
      <Header />
      <KeyInfoBar
        selectedKey={selectedKey}
        currentKeyInfo={currentKeyInfo}
        scaleMode={scaleMode}
        parentKeyName={parentKeyName}
        onKeySelect={handleKeySelect}
      />
      <ScaleSelector
        scaleMode={scaleMode}
        onScaleModeChange={handleScaleModeChange}
        rootPc={currentKeyInfo.rootPc}
      />

      <main className="max-w-[1350px] mx-auto px-6 py-5 flex gap-5">
        {/* Left column */}
        <div className="flex-shrink-0 flex flex-col gap-4 w-[420px]">
          <Circle
            selectedKey={selectedKey}
            onKeySelect={handleKeySelect}
            rotationAngle={rotationAngle}
          />
          <RelatedKeys
            selectedKey={selectedKey}
            currentKeyInfo={currentKeyInfo}
            onKeySelect={handleKeySelect}
          />
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Staff
            currentKeyInfo={currentKeyInfo}
            activeDrawScale={activeDrawScale}
            scaleLabel={`${currentKeyInfo.label.split(' ')[0]} ${SCALES[scaleMode].label}`}
          />
          <InstrumentPanel
            currentKeyInfo={currentKeyInfo}
            activeScalePcs={activeScalePcs}
            activeChordPcs={activePcs}
            activeChordRoot={activeRoot}
            activeName={activeName}
            isFlat={isFlat}
            labelMode={labelMode}
            onLabelModeChange={setLabelMode}
            instrumentMode={instrumentMode}
            onInstrumentModeChange={setInstrumentMode}
            selectedChordDegree={selectedChordDegree}
          />
          <DiatonicChords
            activeScalePcs={activeScalePcs}
            scaleMode={scaleMode}
            isFlat={isFlat}
            selectedChordDegree={selectedChordDegree}
            onChordSelect={handleChordSelect}
            chordType={chordType}
            onChordTypeChange={setChordType}
          />
          <AIAssistant
            currentKeyInfo={currentKeyInfo}
            onHighlightChord={info => {
              setCustomChordHighlight(info);
              setSelectedChordDegree(null);
            }}
          />
        </div>
      </main>
    </div>
  );
```

- [ ] **Step 7: Verify** — check http://localhost:5173 — app loads, scale pill row appears below Key Info bar, clicking Major/Minor still works.

- [ ] **Step 8: Commit**

```powershell
git add CircleOf5ths/App.jsx
git commit -m "feat: add scaleMode state and activeScalePcs wiring in App"
```

---

## Task 4 — Update `KeyInfoBar.jsx` (parent key badge)

**Files:**
- Modify: `CircleOf5ths/src/components/KeyInfoBar.jsx`

- [ ] **Step 1: Update the component signature and add parent key badge** — replace the entire file:

```jsx
import { NOTE_COLORS, musicKeys, circleSlices } from '../data/musicTheory.js';

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
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors hover:opacity-80"
      style={{ background: `${color}18`, borderColor: `${color}40`, color }}
    >
      <span className="text-white/40 font-normal">{label}:</span>
      {musicKeys[keyName].label}
    </button>
  );
}

export default function KeyInfoBar({ selectedKey, currentKeyInfo, parentKeyName, onKeySelect }) {
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

  // parentKeyName is a musicKeys key like 'Bb' or null
  const parentEntry = parentKeyName ? musicKeys[parentKeyName] : null;
  const parentColor = parentEntry ? NOTE_COLORS[parentEntry.rootPc] : null;

  return (
    <div className="px-7 py-2.5 flex items-center gap-3 flex-wrap border-b"
      style={{ background: `${color}10`, borderColor: `${color}25` }}>
      <span className="text-xl font-black" style={{ color }}>{displayLabel}</span>
      {parentEntry && parentColor && (
        <button
          onClick={() => onKeySelect(parentKeyName)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border hover:opacity-80 transition-opacity"
          style={{ background: `${parentColor}18`, borderColor: `${parentColor}40`, color: parentColor }}>
          <span className="text-white/40 font-normal">parent key:</span>
          {parentEntry.label} →
        </button>
      )}
      <Pill label="Relative"    keyName={relativeKey}    onKeySelect={onKeySelect} />
      <Pill label="Parallel"    keyName={parallelKey}    onKeySelect={onKeySelect} />
      <Pill label="→ Dominant"  keyName={dominantKey}    onKeySelect={onKeySelect} />
      <Pill label="→ Subdom"    keyName={subdominantKey} onKeySelect={onKeySelect} />
      <span className="ml-auto text-xs text-white/25">{accText}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify** — select C, choose Dorian → "parent key: Bb Major →" badge appears in Key Info bar. Select Major → badge disappears.

- [ ] **Step 3: Commit**

```powershell
git add CircleOf5ths/src/components/KeyInfoBar.jsx
git commit -m "feat: add parent key badge to KeyInfoBar for modal scales"
```

---

## Task 5 — Update `Staff.jsx`

**Files:**
- Modify: `CircleOf5ths/src/components/Staff.jsx`

- [ ] **Step 1: Replace the component** — the Staff now receives `activeDrawScale` and `scaleLabel` instead of reading from `currentKeyInfo.drawScale`/`label`:

```jsx
import { NOTE_COLORS, noteYBase, noteToPc } from '../data/musicTheory.js';

const STAFF_LINES = [18, 28, 38, 48, 58];
const SHARP_Y = [18, 33, 13, 28, 43, 23, 38];
const FLAT_Y  = [38, 23, 43, 28, 48, 33, 53];

export default function Staff({ currentKeyInfo, activeDrawScale, scaleLabel }) {
  const { accidentals, accType } = currentKeyInfo;
  const drawScale = activeDrawScale;
  const label = scaleLabel;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Scale &amp; Key Signature — {label}
      </p>
      <svg width="100%" height="80" viewBox="0 0 580 80" className="overflow-visible">
        {STAFF_LINES.map(y => (
          <line key={y} x1={42} x2={572} y1={y} y2={y}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        ))}
        <text x={42} y={62} fontSize={52} fontFamily="serif" fill="rgba(255,255,255,0.6)">𝄞</text>
        {Array.from({ length: accidentals }).map((_, i) => {
          const yPos = accType === 'sharp' ? SHARP_Y[i] : FLAT_Y[i];
          return (
            <text key={i} x={68 + i * 13} y={yPos + 5}
              fontSize={22} fontFamily="serif" fill="rgba(255,255,255,0.65)" fontWeight="bold">
              {accType === 'sharp' ? '♯' : '♭'}
            </text>
          );
        })}
        {drawScale.map((note, i) => {
          const y = noteYBase[note];
          if (y === undefined) return null;
          const x = 152 + i * 50;
          const pc = noteToPc(note.replace(/[0-9]/g, ''));
          const color = NOTE_COLORS[pc] ?? 'rgba(255,255,255,0.6)';
          const isUpStem = y >= 38;
          return (
            <g key={i}>
              {y >= 68 && Array.from({ length: Math.ceil((y - 63) / 10) }).map((_, li) => (
                <line key={li} x1={x-12} x2={x+12} y1={68+li*10} y2={68+li*10}
                  stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              ))}
              <ellipse cx={x} cy={y} rx={7} ry={5}
                transform={`rotate(-15 ${x} ${y})`} fill={color} />
              {isUpStem
                ? <line x1={x+6} x2={x+6} y1={y} y2={y-28} stroke={color} strokeWidth={1.5} />
                : <line x1={x-6} x2={x-6} y1={y} y2={y+28} stroke={color} strokeWidth={1.5} />
              }
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify** — switch to Dorian → staff label updates to "C Dorian". Switch to Maj Pent → 5 note dots appear. Major/Minor → original behavior unchanged.

- [ ] **Step 3: Commit**

```powershell
git add CircleOf5ths/src/components/Staff.jsx
git commit -m "feat: Staff accepts activeDrawScale prop for modal/pentatonic scales"
```

---

## Task 6 — Update `Piano.jsx` and `InstrumentPanel.jsx`

**Files:**
- Modify: `CircleOf5ths/src/components/Piano.jsx`
- Modify: `CircleOf5ths/src/components/InstrumentPanel.jsx`

- [ ] **Step 1: Update `Piano.jsx`** — change the prop signature and `keyColor` to use `activeScalePcs`:

Replace line 11 (`export default function Piano(...)`) and lines 12–27:

```jsx
export default function Piano({ currentKeyInfo, activeScalePcs, activeChordPcs, activeChordRoot, isFlat, labelMode }) {
  const { rootPc } = currentKeyInfo;
  const scalePcs = activeScalePcs;
  const whiteKeys = PIANO_KEYS.filter(k => !k.isBlack);
  const blackKeys = PIANO_KEYS.filter(k => k.isBlack);
  const totalWhite = whiteKeys.length;

  function keyColor(pc) {
    const c = NOTE_COLORS[pc];
    if (activeChordPcs) {
      if (pc === activeChordRoot) return c;
      if (activeChordPcs.includes(pc)) return c;
      return null;
    }
    if (pc === rootPc) return c;
    if (scalePcs.includes(pc)) return c;
    return null;
  }
```

- [ ] **Step 2: Update `InstrumentPanel.jsx`** — accept and forward `activeScalePcs`:

Replace line 6 (`export default function InstrumentPanel(...)`) and lines 7–14:

```jsx
export default function InstrumentPanel({
  currentKeyInfo,
  activeScalePcs,
  activeChordPcs, activeChordRoot, activeName,
  isFlat, labelMode, onLabelModeChange,
  instrumentMode, onInstrumentModeChange,
  selectedChordDegree,
}) {
  const { rootPc } = currentKeyInfo;
  const { playScale, playChord, isPlaying } = useAudio();

  const chips = activeChordPcs
    ? activeChordPcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }))
    : activeScalePcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }));

  function handlePlay() {
    if (isPlaying) return;
    if (activeChordPcs) {
      playChord(activeChordPcs, 4, 'arpeggio');
    } else {
      playScale(activeScalePcs, 4);
    }
  }
```

Then in the JSX, pass `activeScalePcs` to Piano — replace the `<Piano .../>` element:

```jsx
        <Piano
          currentKeyInfo={currentKeyInfo}
          activeScalePcs={activeScalePcs}
          activeChordPcs={activeChordPcs}
          activeChordRoot={activeChordRoot}
          isFlat={isFlat}
          labelMode={labelMode}
        />
```

- [ ] **Step 3: Verify** — select C major, switch to Minor Pentatonic → piano shows only 5 colored keys (C Eb F G Bb). Blues → 6 keys. Dorian → 7 with Eb and Bb colored instead of E and B.

- [ ] **Step 4: Commit**

```powershell
git add CircleOf5ths/src/components/Piano.jsx CircleOf5ths/src/components/InstrumentPanel.jsx
git commit -m "feat: Piano and InstrumentPanel use activeScalePcs for highlighting"
```

---

## Task 7 — Update `DiatonicChords.jsx`

**Files:**
- Modify: `CircleOf5ths/src/components/DiatonicChords.jsx`

- [ ] **Step 1: Replace the entire file**:

```jsx
import { NOTE_COLORS, buildDiatonicChords,
  majorHarmonicFn, minorHarmonicFn, HARMONIC_FN_COLORS } from '../data/musicTheory.js';

const MODAL_SCALES = new Set(['dorian','phrygian','lydian','mixolydian','locrian']);

export default function DiatonicChords({
  activeScalePcs, scaleMode, isFlat,
  selectedChordDegree, onChordSelect, chordType, onChordTypeChange
}) {
  const is7Note = activeScalePcs.length === 7;
  const showHarmonicFn = scaleMode === 'major' || scaleMode === 'minor';

  const chords = is7Note
    ? buildDiatonicChords(activeScalePcs, isFlat, chordType).map((c, i) => ({
        ...c,
        color: NOTE_COLORS[c.rootPc],
        fn: scaleMode === 'major' ? majorHarmonicFn[i]
          : scaleMode === 'minor' ? minorHarmonicFn[i]
          : null,
      }))
    : [];

  const selected = selectedChordDegree !== null ? chords[selectedChordDegree] : null;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Diatonic Chords</span>
          {selected && (
            <span className="text-xs text-white/50 truncate">— {selected.name}</span>
          )}
        </div>
        {is7Note && (
          <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5 flex-shrink-0">
            {['triad','seventh'].map(t => (
              <button key={t}
                onClick={() => onChordTypeChange(t)}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                style={chordType === t
                  ? { background: 'linear-gradient(135deg,#34d399,#22d3ee)', color: '#0f0c29' }
                  : { color: 'rgba(255,255,255,0.35)' }}>
                {t === 'triad' ? 'Triads' : '7ths'}
              </button>
            ))}
          </div>
        )}
      </div>

      {!is7Note ? (
        <p className="text-center text-xs text-white/25 py-4">
          Chord grid available for 7-note scales.
        </p>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {chords.map(chord => {
            const isActive = selectedChordDegree === chord.degree;
            return (
              <button
                key={chord.degree}
                onClick={() => onChordSelect(isActive ? null : chord.degree)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all"
                style={isActive
                  ? { background: `${chord.color}25`, borderColor: `${chord.color}70`, boxShadow: `0 0 14px ${chord.color}30` }
                  : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="font-bold text-[13px]"
                  style={{ color: isActive ? chord.color : chord.color + 'BB' }}>
                  {chord.numeral}
                </span>
                <span className="text-[10px] mt-0.5 font-medium"
                  style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                  {chord.name}
                </span>
                {showHarmonicFn && chord.fn && (
                  <span className="text-[8px] mt-1 px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      color: HARMONIC_FN_COLORS[chord.fn],
                      background: `${HARMONIC_FN_COLORS[chord.fn]}22`,
                    }}>
                    {chord.fn}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify all scale types**:
  - C Major → 7 chords with Tonic/Subdom/Dominant badges ✓
  - C Minor → 7 chords with minor harmonic fn badges ✓
  - C Dorian → 7 chords (Cm, D, Eb, Fm, Gm, Adim, Bb), no fn badges ✓
  - C Lydian → 7 chords starting C, D, Em, F#dim, G, Am, Bm ✓ (Lydian has raised 4th so F# appears)
  - C Major Pentatonic → "Chord grid available for 7-note scales." message ✓
  - C Blues → same placeholder message ✓
  - Select a chord in Dorian → piano highlights chord notes ✓

- [ ] **Step 3: Commit**

```powershell
git add CircleOf5ths/src/components/DiatonicChords.jsx
git commit -m "feat: DiatonicChords uses activeScalePcs, hides for pentatonic/blues, modal chord qualities"
```

---

## Task 8 — Final smoke test and push

- [ ] **Step 1: Full manual check**:
  - Key C, Major → everything as before (piano, staff, chords, circle)
  - Key C, Dorian → piano shows C D Eb F G A Bb; staff label "C Dorian"; Key Info shows "parent key: Bb Major →"; chords show Cm D Eb Fm Gm Adim Bb with no fn badges
  - Key G, Mixolydian → piano shows G A B C D E F; chords show G Am Bdim C Dm Em F
  - Key A, Min Pent → piano shows A C D E G; staff shows 5 dots; chord panel shows placeholder
  - Key E, Blues → piano shows E G A Bb B D; 6 dots on staff; chord placeholder
  - Click parent key badge in Dorian → jumps to Bb key, resets to Major ✓
  - Select chord then switch scale mode → chord selection clears ✓

- [ ] **Step 2: Push**

```powershell
git push
```
