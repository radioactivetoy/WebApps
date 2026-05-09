# Instruments & Alternate Tunings Design

> **For agentic workers:** implement via `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

**Goal:** Add alternate guitar tunings (10 tunings) and two new fretboard instruments (violin, ukulele) to the Circle of Fifths Explorer instrument panel.

**Scope:** Three self-contained changes — new data file, rename+generalize one component, update one panel component. No changes to `App.jsx`, `musicTheory.js`, `useAudio.js`, or any other file.

---

## Architecture

### New file: `src/data/instruments.js`

Plain JS data — no logic. Exports a single `INSTRUMENTS` object keyed by instrument id (`piano`, `guitar`, `violin`, `ukulele`). Each non-piano entry has:

- `label` / `emoji` — display text and icon
- `defaultTuning` — key into `tunings`
- `stringWidths` — SVG stroke widths, ordered **high string to low string**
- `fretCount` — how many frets to render
- `fretMarkers` — `{ [fret]: dotCount }` (1 = single dot, 2 = double dot at 12th)
- `tunings` — object keyed by tuning id, each with `label`, `openPcs` (high→low), `labels` (high→low)

`piano` entry has `tunings: null` and no other fretboard fields — it exists only so the toggle can be built from the same data structure.

### Renamed+generalized: `GuitarFretboard.jsx` → `FretboardInstrument.jsx`

The existing `GuitarFretboard.jsx` is renamed to `FretboardInstrument.jsx` and its six hardcoded constants (`STRING_LABELS`, `STRING_OPEN_PCS`, `STRING_WIDTHS`, `FRET_MARKERS`, fret count `15`, and `VB_H = 185`) become derived from props.

**New props added:**
```
openPcs        number[]   open-string pitch classes, high→low
stringLabels   string[]   open-string note names, high→low
stringWidths   number[]   SVG stroke widths, high→low
fretCount      number     how many frets to render (replaces literal 15)
fretMarkers    object     { [fret]: 1|2 } (replaces FRET_MARKERS constant)
```

**Computed from props (not hardcoded):**
```js
const numStrings = openPcs.length;          // 4 or 6
const SS = 27.4;                            // fixed string spacing in viewbox units
const STRINGS_H = (numStrings - 1) * SS;
const VB_H = STRINGS_H + MT + MB;          // scales with string count
const midY = MT + STRINGS_H / 2;
```

All note-dot rendering logic, fret/nut/inlay rendering, and visual props (`activeScalePcs`, `activeChordPcs`, `activeChordRoot`, `rootPc`, `labelMode`, `isFlat`, `colorPcs`, `activePc`, `compareScalePcs`) are **unchanged**.

The fret label row at the bottom renders `[1, 3, 5, 7, 9, 12, fretCount]` so it adapts to violin (12 frets) automatically.

### Modified: `src/components/InstrumentPanel.jsx`

**Imports:** Replace `GuitarFretboard` import with `FretboardInstrument`. Add `INSTRUMENTS` import from `../data/instruments.js`.

**New state:**
```js
const [guitarTuning, setGuitarTuning] = useState(
  () => localStorage.getItem('co5_guitar_tuning') || 'standard'
);
const [ukuleleTuning, setUkuleleTuning] = useState(
  () => localStorage.getItem('co5_ukulele_tuning') || 'standard'
);
```

**Persist tuning changes:**
```js
useEffect(() => localStorage.setItem('co5_guitar_tuning', guitarTuning), [guitarTuning]);
useEffect(() => localStorage.setItem('co5_ukulele_tuning', ukuleleTuning), [ukuleleTuning]);
```

**Active tuning resolution** (computed, not state):
```js
const activeTuning = useMemo(() => {
  const inst = INSTRUMENTS[instrumentMode];
  if (!inst?.tunings) return null;
  const tuningKey = instrumentMode === 'guitar' ? guitarTuning
    : instrumentMode === 'ukulele' ? ukuleleTuning
    : inst.defaultTuning;
  return inst.tunings[tuningKey] ?? inst.tunings[inst.defaultTuning];
}, [instrumentMode, guitarTuning, ukuleleTuning]);
```

**Instrument toggle** — replace the 2-button `[🎹 Piano][🎸 Guitar]` with a 4-button row built from `Object.entries(INSTRUMENTS)`:
```jsx
<div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
  {Object.entries(INSTRUMENTS).map(([id, { label, emoji }]) => (
    <button key={id} onClick={() => onInstrumentModeChange(id)} ...>
      {emoji} {label}
    </button>
  ))}
</div>
```
Active style: `linear-gradient(135deg,#a78bfa,#60a5fa)` (same as current).

**Tuning row** — rendered between the header row and the instrument view, visible only when the active instrument has multiple tunings:
```jsx
{INSTRUMENTS[instrumentMode]?.tunings &&
 Object.keys(INSTRUMENTS[instrumentMode].tunings).length > 1 && (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[10px] text-white/25">Tuning:</span>
    <TuningDropdown
      tunings={INSTRUMENTS[instrumentMode].tunings}
      value={instrumentMode === 'guitar' ? guitarTuning : ukuleleTuning}
      onChange={instrumentMode === 'guitar' ? setGuitarTuning : setUkuleleTuning}
    />
  </div>
)}
```

`TuningDropdown` is a small local component (same pattern as existing `ScaleDropdown`) — a button that toggles a dropdown list of tuning options. Dismiss on outside click via `useEffect` + `document` listener.

**Fretboard render** — replace the `instrumentMode === 'guitar' ? <GuitarFretboard> : <Piano>` branch:
```jsx
{instrumentMode === 'piano' ? (
  <Piano ... />
) : (
  <div className="mt-1 mb-1">
    <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
      {INSTRUMENTS[instrumentMode].label}
      {activeTuning && ` · ${activeTuning.label}`}
      {' · '}{activeChordPcs ? pcToName(activeChordRoot, isFlat) + ' chord' : scaleLabel}
    </p>
    <FretboardInstrument
      openPcs={activeTuning.openPcs}
      stringLabels={activeTuning.labels}
      stringWidths={INSTRUMENTS[instrumentMode].stringWidths}
      fretCount={INSTRUMENTS[instrumentMode].fretCount}
      fretMarkers={INSTRUMENTS[instrumentMode].fretMarkers}
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
```

---

## Tuning Reference

### Guitar (6 strings, high→low, 15 frets)

| ID | Label | openPcs | labels |
|---|---|---|---|
| `standard` | Standard (EADGBE) | [4,11,7,2,9,4] | e B G D A E |
| `dropD` | Drop D (DADGBE) | [4,11,7,2,9,2] | e B G D A D |
| `openG` | Open G (DGDGBD) | [2,11,7,2,7,2] | D B G D G D |
| `openD` | Open D (DADf#AD) | [2,9,6,2,9,2] | D A F# D A D |
| `dadgad` | DADGAD | [2,9,7,2,9,2] | D A G D A D |
| `openE` | Open E (EBEg#BE) | [4,11,8,4,11,4] | E B G# E B E |
| `openA` | Open A (EAEac#E) | [4,1,9,4,9,4] | E C# A E A E |
| `halfDown` | Half-step ↓ (Eb) | [3,10,6,1,8,3] | eb Bb Gb Db Ab Eb |
| `fullDown` | Full-step ↓ (D) | [2,9,5,0,7,2] | D A F C G D |
| `dropC` | Drop C (CADGBE) | [4,11,7,2,9,0] | E B G D A C |

### Violin (4 strings, high→low, 12 frets)

| ID | Label | openPcs | labels |
|---|---|---|---|
| `standard` | Standard (GDAE) | [4,9,2,7] | E A D G |

Fret markers: `{ 3:1, 5:1, 7:1, 12:2 }`

### Ukulele (4 strings, high→low, 15 frets)

| ID | Label | openPcs | labels |
|---|---|---|---|
| `standard` | Standard (GCEA) | [9,4,0,7] | A E C G |
| `dTuning` | D Tuning (ADF#B) | [11,6,2,9] | B F# D A |

Fret markers: `{ 5:1, 7:1, 10:1, 12:2, 15:1 }`

Note: Ukulele uses re-entrant G (G4, not G3) — pitch classes are correct; octave differences don't affect the fretboard display.

---

## File Change Summary

| File | Change |
|---|---|
| `src/data/instruments.js` | **New** — instrument + tuning data |
| `src/components/GuitarFretboard.jsx` | **Renamed** to `FretboardInstrument.jsx`, generalized with props |
| `src/components/InstrumentPanel.jsx` | 4-way toggle, tuning dropdown, uses `FretboardInstrument` |

No changes to `App.jsx`, `musicTheory.js`, `useAudio.js`, `GuitarDiagram.jsx`, or any other component.

---

## Non-Goals

- Playback tuned to alternate guitar pitches (audio always plays by pitch class, not absolute frequency)
- Violin scordatura or other exotic instrument tunings
- Chord voicing diagrams for violin/ukulele (that's `GuitarDiagram.jsx` which is guitar-only and unchanged)
- More than 15 frets
