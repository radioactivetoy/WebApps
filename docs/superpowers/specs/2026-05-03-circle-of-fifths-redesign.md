# Circle of Fifths Explorer — Full Redesign Spec

**Date:** 2026-05-03  
**Status:** Approved  

---

## Overview

A full visual and feature redesign of the Circle of Fifths Explorer React app. The existing `App.jsx` (single 860-line file) is refactored into focused components, given a Modern Gradient aesthetic with a consistent per-note color system, and extended with four new feature areas: audio playback, guitar chord diagrams, a related keys panel, and enharmonic labels.

---

## Architecture

### File Structure

```
CircleOf5ths/
├── App.jsx                          ← thin orchestrator; holds top-level state only
├── src/
│   ├── main.jsx
│   ├── index.css                    ← Tailwind directives + custom CSS vars
│   ├── data/
│   │   └── musicTheory.js           ← all constants (musicKeys, circleSlices, noteYBase, etc.)
│   └── components/
│       ├── Header.jsx               ← title + dark/light mode toggle
│       ├── KeyInfoBar.jsx           ← key name, enharmonic, relative/parallel/dom/subdom pills
│       ├── Circle.jsx               ← SVG circle of fifths (JS-computed arc paths)
│       ├── Staff.jsx                ← staff + key signature + scale notes
│       ├── InstrumentPanel.jsx      ← Piano/Guitar toggle + Notes/Intervals toggle wrapper
│       ├── Piano.jsx                ← piano keyboard SVG
│       ├── GuitarDiagram.jsx        ← fretboard SVG for selected chord
│       ├── DiatonicChords.jsx       ← chord grid + Triads/7ths toggle
│       ├── RelatedKeys.jsx          ← relative/parallel/dominant/subdominant panel
│       └── AIAssistant.jsx          ← AI panel (Gemini API, restyled)
│   └── hooks/
│       └── useAudio.js              ← Web Audio API: playScale(), playChord()
```

### State (lives in App.jsx, passed as props)

| State | Type | Description |
|---|---|---|
| `selectedKey` | string | Current key e.g. `'C'`, `'Am'` |
| `selectedChordDegree` | number\|null | Index 0–6 of selected diatonic chord |
| `customChordHighlight` | object\|null | `{ name, pcs, rootPc }` from AI assistant |
| `chordType` | `'triad'`\|`'seventh'` | Triad or seventh chord mode |
| `instrumentMode` | `'piano'`\|`'guitar'` | Piano or guitar view |
| `labelMode` | `'notes'`\|`'intervals'` | Label display on instrument |
| `darkMode` | boolean | Dark/light theme toggle; defaults to `true` (dark-first) |
| `rotationAngle` | number | Smooth circle rotation angle |

---

## Visual Design

### Theme — Modern Gradient

- **Background:** `linear-gradient(135deg, #0f0c29, #302b63, #24243e)`
- **Panels:** `background: rgba(255,255,255,0.045)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.09)`, `border-radius: 18px`
- **Dark/light toggle:** Adds/removes a `dark` class on `<html>`; Tailwind `darkMode: 'class'` in config (updated from `'media'`)

### Note Color System

Each of the 12 chromatic pitch classes has one color, used consistently across every UI element that references a note.

| Note | Color | Hex |
|---|---|---|
| C | Red | `#f87171` |
| C#/Db | Red-Orange | `#fc8b4d` |
| D | Orange | `#fb923c` |
| D#/Eb | Amber-Yellow | `#fcd34d` |
| E | Amber | `#fbbf24` |
| F | Green | `#4ade80` |
| F#/Gb | Emerald | `#34d399` |
| G | Cyan | `#22d3ee` |
| G#/Ab | Teal | `#5eead4` |
| A | Indigo | `#818cf8` |
| A#/Bb | Violet | `#a78bfa` |
| B | Fuchsia | `#e879f9` |

A `NOTE_COLORS` lookup object is exported from `musicTheory.js` and imported wherever note colors are needed — no color values are duplicated across components.

### Color Usage Across Components

- **Circle:** Active wedge filled in root note color; diatonic neighbor wedges tinted in their note colors; center displays active key in its color
- **Key Info Bar:** Key name rendered in its note color; enharmonic shown alongside
- **Staff:** Each note head colored by its pitch class
- **Piano:** White/black key fill tinted by note color (intensity varies: chord root = full, chord tone = mid, scale note = dim, outside scale = near-black)
- **Piano labels:** Note name rendered in its note color on every key
- **Diatonic Chord grid:** Roman numeral colored by chord root's note color
- **Related Keys buttons:** Each button colored in the target key's root note color
- **Audio chips:** Each note chip colored by pitch class

---

## Components

### Header.jsx

- Gradient title "Circle of Fifths" (`#a78bfa → #60a5fa → #34d399`)
- Subtitle "Music Theory Explorer"
- Dark/light toggle button (right-aligned), toggles `dark` class on `<html>`

### KeyInfoBar.jsx

Props: `currentKeyInfo`, `selectedKey`, `onKeySelect`

- Key name in large bold text, colored by note color
- Enharmonic equivalent shown if applicable (e.g. "F# / Gb Major")
- Pill: Relative key (colored in relative root's note color) — clickable
- Pill: Parallel key — clickable
- Arrow link: Dominant key — clickable  
- Arrow link: Subdominant key — clickable
- Trailing: accidental count + type (e.g. "2 sharps · F# C#")

### Circle.jsx

Props: `selectedKey`, `onKeySelect`, `rotationAngle`

- SVG drawn with JS-computed donut arc paths (same technique as `circle-mockup.html`)
- **Outer ring** (major keys): `rInner=132, rOuter=175`
- **Gap**: visible separator ring
- **Inner ring** (minor keys): `rInner=74, rOuter=108`
- **Center circle**: shows active key name + mode + accidental count
- Active wedge: note color at 80% opacity
- Diatonic neighbors (same key ±1 on circle): note color at 25% opacity
- All others: near-transparent with subtle border
- Labels positioned at arc midpoints, sized for readability (no overlap)
- Enharmonic keys (F#/Gb) show both names stacked in smaller font
- Smooth CSS rotation transition on key change (existing behaviour, preserved)

### Staff.jsx

Props: `currentKeyInfo`

- Unchanged rendering logic from original
- Note heads colored by pitch class using `NOTE_COLORS`
- Staff lines: `rgba(255,255,255,0.12)` on dark background
- Treble clef: semi-transparent white

### InstrumentPanel.jsx

Props: `currentKeyInfo`, `activeChordPcs`, `activeChordRoot`, `activeName`, `isFlat`, `labelMode`, `onLabelModeChange`, `instrumentMode`, `onInstrumentModeChange`, `selectedChordDegree`

- Header row: panel label + **Notes/Intervals** toggle + **Piano/Guitar** toggle
- Conditionally renders `<Piano>` or `<GuitarDiagram>` based on `instrumentMode`
- Audio playback bar at bottom (always visible):
  - Play button → calls `useAudio().playScale()` or `playChord()` depending on context
  - Note chips for current scale or selected chord, each colored by pitch

### Piano.jsx

Props: `currentKeyInfo`, `activeChordPcs`, `activeChordRoot`, `isFlat`, `labelMode`

- SVG piano, 3 octaves (C3–B5), 21 white keys × 40px wide, black keys 24px wide × 75px tall, white keys 40px wide × 130px tall
- **All keys labeled**: note name at bottom of white keys, note name at center of black keys
- Label color = note color from `NOTE_COLORS`
- Key fill when **no chord selected** (scale mode):
  - Root: note color at 75% opacity
  - Scale note: note color at 22% opacity
  - Outside scale (black keys): near-black `#0d0b1e`
- Key fill when **chord selected**:
  - Chord root: note color at 85% opacity, bold label
  - Chord tone: note color at 50% opacity
  - Scale note: note color at 22% opacity
  - Outside scale: near-black
- `labelMode='intervals'` replaces note name with interval (R, 2, b3, 3, etc.)
- Legend row below piano: Chord Root · Chord Tone · Scale Note · Outside Scale

### GuitarDiagram.jsx

Props: `chordName`, `chordPcs`, `rootPc`

- SVG fretboard: 6 strings, 5 frets
- Finger dot positions computed from `GUITAR_CHORDS` in `musicTheory.js`, a lookup keyed by `"<root><quality>"` e.g. `"C"`, `"Am"`, `"Bdim"`, `"Gmaj7"`
- Each entry shape: `{ strings: [e2,a,d,g,b,e1], fret: number, fingers: [{string, fret, note}] }` where `strings` values are `'x'` (muted), `0` (open), or `1–4` (finger position relative to `fret`)
- Covers all 24 diatonic chord roots × {major, minor, dim, maj7, m7, 7, m7b5} = ~56 shapes; uses first-position or common open shapes where possible
- Finger dots colored by the pitch class they play (using `NOTE_COLORS`)
- Open string circles and muted string × marks shown above nut
- Chord name + notes displayed beside diagram
- Falls back to a "No diagram available" placeholder for chords with no entry in the table

### DiatonicChords.jsx

Props: `diatonicChords`, `selectedChordDegree`, `onChordSelect`, `chordType`, `onChordTypeChange`

- Header: "Diatonic Chords" label + Triads/7ths toggle
- 7-button grid; each button shows:
  - Roman numeral in root note's color (from `NOTE_COLORS`)
  - Chord name below in muted text
- Active chord: emerald-tinted background + border glow
- Clicking active chord again deselects it (sets `selectedChordDegree` to null)

### RelatedKeys.jsx

Props: `currentKeyInfo`, `selectedKey`, `onKeySelect`

- Panel title: "Related Keys"
- 4 rows: Relative, Parallel, Dominant (↑5th), Subdominant (↓5th)
- Each row: label on left, clickable pill on right
- Pill background and text tinted in the target key's root note color

### AIAssistant.jsx

Props: `currentKeyInfo`, `onHighlightChord`

- Restyled to match glass panel theme; same Gemini API logic as original
- "Key Characteristics" button: gradient purple→blue
- "Generate Progression" button: gradient blue→cyan
- Genre selector preserved
- AI-generated chord buttons in progression: colored by chord root note color
- Loading state: pulse animation in theme colors
- Error state: red-tinted glass panel

### useAudio.js (hook)

Exports `useAudio()` returning `{ playScale, playChord, isPlaying }`.

- Uses `Web Audio API` (`AudioContext`, `OscillatorNode`, `GainNode`) — no external library
- `playScale(scalePcs, rootOctave)`: plays notes ascending with 200ms between each, sine wave, subtle envelope
- `playChord(pcs, rootOctave, mode)`:
  - `mode='arpeggio'` (default): plays notes in sequence, 150ms apart
  - `mode='block'`: plays all notes simultaneously, 600ms sustain
- `AudioContext` created lazily on first user interaction (browser autoplay policy)

### musicTheory.js (data module)

Exports all constants currently defined at the top of `App.jsx`:
- `musicKeys`, `circleSlices`, `noteYBase`, `pcToName`, `getInterval`, `noteToPc`
- `majorNumerals`, `minorNumerals`, `major7Numerals`, `minor7Numerals`
- `majorIntervalNames`, `minorIntervalNames`, `majorSteps`, `minorSteps`
- `PIANO_KEYS` (pre-computed piano key array)
- `NOTE_COLORS` (12-entry pitch class → hex color map)
- `GUITAR_CHORDS` (chord shape lookup table for GuitarDiagram)

---

## Tailwind Config Changes

- `darkMode: 'class'` (changed from `'media'` — enables the Header toggle)
- `content` array already includes `./App.jsx` and `./src/**/*.{js,ts,jsx,tsx}`

---

## Out of Scope

- Keyboard navigation / shortcuts
- Mobile-specific layout (piano scrolls horizontally on small screens as before)
- MIDI input
- Multiple simultaneous key comparison
- Backend / persistence

---

## Build Order

1. `musicTheory.js` — extract all data/constants (no UI)
2. `useAudio.js` — self-contained hook, testable in isolation
3. `Header.jsx` + `KeyInfoBar.jsx` — top chrome, wires dark mode
4. `Circle.jsx` — core visual, note color system established here
5. `Staff.jsx` — straightforward port with note color applied
6. `Piano.jsx` — most complex instrument component
7. `GuitarDiagram.jsx` — new component, needs chord lookup table
8. `RelatedKeys.jsx` — simple computed panel
9. `DiatonicChords.jsx` — port + color system
10. `InstrumentPanel.jsx` — wrapper wiring Piano/Guitar + audio bar
11. `AIAssistant.jsx` — restyle only, logic unchanged
12. `App.jsx` — assemble all components, verify state wiring
