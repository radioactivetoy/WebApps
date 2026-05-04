# Scale Explorer — Spec

**Date:** 2026-05-04
**Status:** Approved

---

## Overview

Add a scale type selector to the Circle of Fifths Explorer so users can view pentatonic, blues, and Greek modal scales on the piano, staff, and diatonic chord grid — in addition to the existing major/minor diatonic scales.

---

## State

One new piece of state in `App.jsx`:

```js
const [scaleMode, setScaleMode] = useState('major');
```

`scaleMode` is an overlay on top of the existing `selectedKey` / `currentKeyInfo`. Everything that currently reads `currentKeyInfo.scalePcs` switches to a computed `activeScalePcs`:

```js
const activeScalePcs = SCALES[scaleMode].intervals.map(i => (currentKeyInfo.rootPc + i) % 12);
```

When `selectedKey` changes, `scaleMode` resets to `'major'` (for major keys) or `'minor'` (for minor keys) to preserve current default behaviour.

---

## Data: `SCALES` constant (`musicTheory.js`)

```js
export const SCALES = {
  'major':      { label: 'Major',     intervals: [0,2,4,5,7,9,11], parentOffset: null },
  'dorian':     { label: 'Dorian',    intervals: [0,2,3,5,7,9,10], parentOffset: 10 },
  'phrygian':   { label: 'Phrygian',  intervals: [0,1,3,5,7,8,10], parentOffset: 8  },
  'lydian':     { label: 'Lydian',    intervals: [0,2,4,6,7,9,11], parentOffset: 7  },
  'mixolydian': { label: 'Mixo',      intervals: [0,2,4,5,7,9,10], parentOffset: 5  },
  'minor':      { label: 'Minor',     intervals: [0,2,3,5,7,8,10], parentOffset: null },
  'locrian':    { label: 'Locrian',   intervals: [0,1,3,5,6,8,10], parentOffset: 1  },
  'maj-pent':   { label: 'Maj Pent',  intervals: [0,2,4,7,9],      parentOffset: null },
  'min-pent':   { label: 'Min Pent',  intervals: [0,3,5,7,10],     parentOffset: null },
  'blues':      { label: 'Blues',     intervals: [0,3,5,6,7,10],   parentOffset: null },
};
```

`parentOffset` is the semitone offset from the root to the parent major key root (e.g. Dorian: `(rootPc + 10) % 12` gives the parent major key). `null` means no parent key applies.

---

## New Component: `ScaleSelector.jsx`

**Props:** `scaleMode`, `onScaleModeChange`, `rootNoteColor`

Renders a horizontally scrollable pill row. Three groups separated by a thin `1px` divider:

```
Scale  [ Major ]  [ Minor ]  |  [ Dorian ] [ Phrygian ] [ Lydian ] [ Mixo ] [ Locrian ]  |  [ Maj Pent ] [ Min Pent ] [ Blues ]
```

- Active pill: `background: rootNoteColor`, `color: #000`, `font-weight: 700`
- Inactive pill: `background: rgba(255,255,255,0.07)`, `color: rgba(255,255,255,0.5)`
- Container: same glass panel style as Key Info Bar (`rgba(255,255,255,0.025)`, `border-radius: 12px`)
- Positioned between `KeyInfoBar` and the circle/staff row in `App.jsx`

---

## `KeyInfoBar.jsx` changes

When `SCALES[scaleMode].parentOffset !== null`, compute and show a clickable parent key badge:

```js
const parentPc = (currentKeyInfo.rootPc + SCALES[scaleMode].parentOffset + 12) % 12;
const parentName = pcToName(parentPc, false); // always sharp spelling for major keys
```

Badge renders as: **`parent key: Bb →`** — clicking it calls `onKeySelect(parentName)` to navigate to that major key. Badge color uses `NOTE_COLORS[parentPc]`.

Badge is shown only for the five modes that have a parent offset (Dorian, Phrygian, Lydian, Mixolydian, Locrian).

---

## `Circle.jsx` — no changes

The circle highlighting logic stays exactly as-is. The parent key relationship is communicated through the Key Info Bar only, keeping the circle uncluttered.

---

## `DiatonicChords.jsx` changes

**7-note scales** (major, minor, all five modes): compute diatonic chords from `activeScalePcs` exactly as today. The chord qualities naturally reflect the mode (e.g. C Dorian → Cm, Dm, Eb, F, Gm, A°, Bb). Harmonic function badges continue to show for major and minor; hide them for modes (function labels like "Tonic/Dominant" are major/minor-specific).

**5- and 6-note scales** (maj-pent, min-pent, blues): hide the chord grid. Show instead:

```
Chord grid available for 7-note scales.
```

Centred, muted text inside the panel area. The panel container itself stays visible so the layout doesn't jump.

**Props change:** receives `activeScalePcs` and `scaleMode` instead of deriving from `currentKeyInfo.scalePcs`.

---

## `Staff.jsx` changes

Receives `activeScalePcs` (array of pitch classes) and `rootPc`. Renders one coloured note head per pitch class, ascending from root, using the existing `noteYBase` lookup. For pentatonic (5 notes) and blues (6 notes) fewer dots appear — staff lines unchanged.

Note head colour: `NOTE_COLORS[pc]` as today.

---

## `Piano.jsx` changes

Already prop-driven. Receives `activeScalePcs` instead of `currentKeyInfo.scalePcs`. No other changes.

---

## `InstrumentPanel.jsx` changes

Passes `activeScalePcs` down to `Piano` and (indirectly) to audio playback. No structural change.

---

## `App.jsx` changes

1. Add `scaleMode` state (default `'major'`).
2. Reset `scaleMode` to `'major'` or `'minor'` when `selectedKey` changes (in the existing `useEffect` that fires on key change).
3. Compute `activeScalePcs` from `currentKeyInfo.rootPc` + `SCALES[scaleMode].intervals`.
4. Compute `parentKeyName` for modes (passed to `KeyInfoBar`).
5. Render `<ScaleSelector>` between `<KeyInfoBar>` and the circle/staff row.
6. Pass `activeScalePcs`, `scaleMode` to `InstrumentPanel`, `DiatonicChords`, `Staff`.

---

## Files

| File | Action |
|---|---|
| `src/data/musicTheory.js` | Add `SCALES` constant |
| `src/components/ScaleSelector.jsx` | Create new |
| `src/components/KeyInfoBar.jsx` | Add parent key badge |
| `src/components/DiatonicChords.jsx` | Use `activeScalePcs`; hide for pentatonic/blues; suppress harmonic fn badges for modes |
| `src/components/Staff.jsx` | Use `activeScalePcs` |
| `src/components/Piano.jsx` | Receive `activeScalePcs` prop |
| `src/components/InstrumentPanel.jsx` | Pass `activeScalePcs` to Piano |
| `App.jsx` | New state + computed values + wiring |

---

## Out of Scope

- Harmonic minor, melodic minor, other exotic scales
- Modal chord harmonic function labels (Tonic/Dominant etc.) for modes
- Audio playback changes (plays `activeScalePcs` already via existing hook)
- Guitar diagram changes (chord shapes unchanged)
- Mobile layout changes
