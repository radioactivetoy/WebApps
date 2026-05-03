# Circle of Fifths Explorer — Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully redesign the Circle of Fifths Explorer with a Modern Gradient aesthetic, consistent per-note color system, component architecture, and four new features (audio, guitar diagrams, related keys, enharmonic labels).

**Architecture:** Extract all data/logic from App.jsx into `src/data/musicTheory.js` and `src/hooks/useAudio.js`, then port each UI section into focused components under `src/components/`. App.jsx becomes a thin state orchestrator wiring everything together.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3 (darkMode: 'class'), Web Audio API, SVG

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `CircleOf5ths/tailwind.config.js` | Modify | Change darkMode to 'class', add safelist |
| `CircleOf5ths/src/index.css` | Modify | Add gradient background CSS var |
| `CircleOf5ths/src/data/musicTheory.js` | Create | All constants, NOTE_COLORS, GUITAR_CHORDS |
| `CircleOf5ths/src/hooks/useAudio.js` | Create | Web Audio API hook |
| `CircleOf5ths/src/components/Header.jsx` | Create | Title + dark/light toggle |
| `CircleOf5ths/src/components/KeyInfoBar.jsx` | Create | Enharmonic + related key pills |
| `CircleOf5ths/src/components/Circle.jsx` | Create | SVG arc-based circle of fifths |
| `CircleOf5ths/src/components/Staff.jsx` | Create | Staff with note-colored heads |
| `CircleOf5ths/src/components/Piano.jsx` | Create | Full piano with labels on every key |
| `CircleOf5ths/src/components/GuitarDiagram.jsx` | Create | Fretboard SVG |
| `CircleOf5ths/src/components/RelatedKeys.jsx` | Create | Relative/parallel/dom/subdom panel |
| `CircleOf5ths/src/components/DiatonicChords.jsx` | Create | Chord grid with note-colored numerals |
| `CircleOf5ths/src/components/InstrumentPanel.jsx` | Create | Piano/Guitar toggle + audio bar |
| `CircleOf5ths/src/components/AIAssistant.jsx` | Create | AI panel restyled to theme |
| `CircleOf5ths/App.jsx` | Rewrite | Thin orchestrator, all state here |

---

## Task 1: musicTheory.js — Data Layer

**Files:**
- Create: `CircleOf5ths/src/data/musicTheory.js`

- [ ] **Step 1: Create the data file**

Create `CircleOf5ths/src/data/musicTheory.js` with this exact content:

```js
// ── Note color system — one color per chromatic pitch class ──────────────────
export const NOTE_COLORS = {
  0:  '#f87171', // C  — red
  1:  '#fc8b4d', // C#/Db — red-orange
  2:  '#fb923c', // D  — orange
  3:  '#fcd34d', // D#/Eb — amber-yellow
  4:  '#fbbf24', // E  — amber
  5:  '#4ade80', // F  — green
  6:  '#34d399', // F#/Gb — emerald
  7:  '#22d3ee', // G  — cyan
  8:  '#5eead4', // G#/Ab — teal
  9:  '#818cf8', // A  — indigo
  10: '#a78bfa', // A#/Bb — violet
  11: '#e879f9', // B  — fuchsia
};

// ── Key data ─────────────────────────────────────────────────────────────────
export const musicKeys = {
  'C':   { type:'major', rootPc:0,  scalePcs:[0,2,4,5,7,9,11],    accidentals:0, accType:'none',  drawScale:['C4','D4','E4','F4','G4','A4','B4','C5'], label:'C Major' },
  'G':   { type:'major', rootPc:7,  scalePcs:[7,9,11,0,2,4,6],    accidentals:1, accType:'sharp', drawScale:['G4','A4','B4','C5','D5','E5','F5','G5'], label:'G Major' },
  'D':   { type:'major', rootPc:2,  scalePcs:[2,4,6,7,9,11,1],    accidentals:2, accType:'sharp', drawScale:['D4','E4','F4','G4','A4','B4','C5','D5'], label:'D Major' },
  'A':   { type:'major', rootPc:9,  scalePcs:[9,11,1,2,4,6,8],    accidentals:3, accType:'sharp', drawScale:['A3','B3','C4','D4','E4','F4','G4','A4'], label:'A Major' },
  'E':   { type:'major', rootPc:4,  scalePcs:[4,6,8,9,11,1,3],    accidentals:4, accType:'sharp', drawScale:['E4','F4','G4','A4','B4','C5','D5','E5'], label:'E Major' },
  'B':   { type:'major', rootPc:11, scalePcs:[11,1,3,4,6,8,10],   accidentals:5, accType:'sharp', drawScale:['B3','C4','D4','E4','F4','G4','A4','B4'], label:'B Major' },
  'F#':  { type:'major', rootPc:6,  scalePcs:[6,8,10,11,1,3,5],   accidentals:6, accType:'sharp', drawScale:['F4','G4','A4','B4','C5','D5','E5','F5'], label:'F# Major' },
  'Db':  { type:'major', rootPc:1,  scalePcs:[1,3,5,6,8,10,0],    accidentals:5, accType:'flat',  drawScale:['D4','E4','F4','G4','A4','B4','C5','D5'], label:'Db Major' },
  'Ab':  { type:'major', rootPc:8,  scalePcs:[8,10,0,1,3,5,7],    accidentals:4, accType:'flat',  drawScale:['A3','B3','C4','D4','E4','F4','G4','A4'], label:'Ab Major' },
  'Eb':  { type:'major', rootPc:3,  scalePcs:[3,5,7,8,10,0,2],    accidentals:3, accType:'flat',  drawScale:['E4','F4','G4','A4','B4','C5','D5','E5'], label:'Eb Major' },
  'Bb':  { type:'major', rootPc:10, scalePcs:[10,0,2,3,5,7,9],    accidentals:2, accType:'flat',  drawScale:['B3','C4','D4','E4','F4','G4','A4','B4'], label:'Bb Major' },
  'F':   { type:'major', rootPc:5,  scalePcs:[5,7,9,10,0,2,4],    accidentals:1, accType:'flat',  drawScale:['F4','G4','A4','B4','C5','D5','E5','F5'], label:'F Major' },
  'Am':  { type:'minor', rootPc:9,  scalePcs:[9,11,0,2,4,5,7],    accidentals:0, accType:'none',  drawScale:['A3','B3','C4','D4','E4','F4','G4','A4'], label:'A Minor' },
  'Em':  { type:'minor', rootPc:4,  scalePcs:[4,6,7,9,11,0,2],    accidentals:1, accType:'sharp', drawScale:['E4','F4','G4','A4','B4','C5','D5','E5'], label:'E Minor' },
  'Bm':  { type:'minor', rootPc:11, scalePcs:[11,1,2,4,6,7,9],    accidentals:2, accType:'sharp', drawScale:['B3','C4','D4','E4','F4','G4','A4','B4'], label:'B Minor' },
  'F#m': { type:'minor', rootPc:6,  scalePcs:[6,8,9,11,1,2,4],    accidentals:3, accType:'sharp', drawScale:['F4','G4','A4','B4','C5','D5','E5','F5'], label:'F# Minor' },
  'C#m': { type:'minor', rootPc:1,  scalePcs:[1,3,4,6,8,9,11],    accidentals:4, accType:'sharp', drawScale:['C4','D4','E4','F4','G4','A4','B4','C5'], label:'C# Minor' },
  'G#m': { type:'minor', rootPc:8,  scalePcs:[8,10,11,1,3,4,6],   accidentals:5, accType:'sharp', drawScale:['G3','A3','B3','C4','D4','E4','F4','G4'], label:'G# Minor' },
  'Ebm': { type:'minor', rootPc:3,  scalePcs:[3,5,6,8,10,11,1],   accidentals:6, accType:'flat',  drawScale:['E4','F4','G4','A4','B4','C5','D5','E5'], label:'Eb Minor' },
  'Bbm': { type:'minor', rootPc:10, scalePcs:[10,0,1,3,5,6,8],    accidentals:5, accType:'flat',  drawScale:['B3','C4','D4','E4','F4','G4','A4','B4'], label:'Bb Minor' },
  'Fm':  { type:'minor', rootPc:5,  scalePcs:[5,7,8,10,0,1,3],    accidentals:4, accType:'flat',  drawScale:['F4','G4','A4','B4','C5','D5','E5','F5'], label:'F Minor' },
  'Cm':  { type:'minor', rootPc:0,  scalePcs:[0,2,3,5,7,8,10],    accidentals:3, accType:'flat',  drawScale:['C4','D4','E4','F4','G4','A4','B4','C5'], label:'C Minor' },
  'Gm':  { type:'minor', rootPc:7,  scalePcs:[7,9,10,0,2,3,5],    accidentals:2, accType:'flat',  drawScale:['G4','A4','B4','C5','D5','E5','F5','G5'], label:'G Minor' },
  'Dm':  { type:'minor', rootPc:2,  scalePcs:[2,4,5,7,9,10,0],    accidentals:1, accType:'flat',  drawScale:['D4','E4','F4','G4','A4','B4','C5','D5'], label:'D Minor' },
};

// ── Circle slice order (clockwise from top) ───────────────────────────────────
export const circleSlices = [
  { major:'C',  minor:'Am' },
  { major:'G',  minor:'Em' },
  { major:'D',  minor:'Bm' },
  { major:'A',  minor:'F#m' },
  { major:'E',  minor:'C#m' },
  { major:'B',  minor:'G#m' },
  { major:'F#', minor:'Ebm', displayMajor:'F#/Gb', displayMinor:'D#m/Ebm' },
  { major:'Db', minor:'Bbm' },
  { major:'Ab', minor:'Fm' },
  { major:'Eb', minor:'Cm' },
  { major:'Bb', minor:'Gm' },
  { major:'F',  minor:'Dm' },
];

// ── Staff note Y positions ────────────────────────────────────────────────────
export const noteYBase = {
  'G5':25,'F5':30,'E5':35,'D5':40,'C5':45,
  'B4':50,'A4':55,'G4':60,'F4':65,'E4':70,
  'D4':75,'C4':80,'B3':85,'A3':90,'G3':95,
};

// ── Utility functions ─────────────────────────────────────────────────────────
export const pcToName = (pc, isFlat) => {
  const sharp = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const flat  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  return isFlat ? flat[pc] : sharp[pc];
};

export const getInterval = (pc, rootPc) => {
  const diff = (pc - rootPc + 12) % 12;
  return ['R','b2','2','b3','3','4','b5','5','b6','6','b7','7'][diff];
};

export const noteToPc = (noteStr) => {
  if (!noteStr) return null;
  const map = {
    'C':0,'B#':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'Fb':4,
    'F':5,'E#':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,
    'A#':10,'Bb':10,'B':11,'Cb':11,
  };
  const clean = noteStr.trim().replace(/[0-9]/g,'');
  const fmt = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  return map[fmt] !== undefined ? map[fmt] : null;
};

// ── Chord numeral arrays ──────────────────────────────────────────────────────
export const majorNumerals   = ['I','ii','iii','IV','V','vi','vii°'];
export const minorNumerals   = ['i','ii°','III','iv','v','VI','VII'];
export const major7Numerals  = ['Imaj7','ii7','iii7','IVmaj7','V7','vi7','viiø7'];
export const minor7Numerals  = ['im7','iiø7','IIImaj7','iv7','v7','VImaj7','VII7'];
export const majorIntervalNames = ['Root','Major 2nd','Major 3rd','Perfect 4th','Perfect 5th','Major 6th','Major 7th'];
export const minorIntervalNames = ['Root','Major 2nd','Minor 3rd','Perfect 4th','Perfect 5th','Minor 6th','Minor 7th'];
export const majorSteps = 'W - W - H - W - W - W - H';
export const minorSteps = 'W - H - W - W - H - W - W';

// ── Piano key array (C3–B5, 3 octaves) ───────────────────────────────────────
const _notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const PIANO_KEYS = (() => {
  const keys = [];
  let wi = 0;
  for (let oct = 3; oct <= 5; oct++) {
    for (let i = 0; i < 12; i++) {
      const isBlack = [1,3,6,8,10].includes(i);
      keys.push({ note: _notes[i]+oct, pc: i, isBlack, whiteIdx: isBlack ? wi-1 : wi });
      if (!isBlack) wi++;
    }
  }
  return keys;
})();

// ── Guitar chord shapes ───────────────────────────────────────────────────────
// strings order: [low-E, A, D, G, B, high-e]
// values: 'x' = muted, 0 = open string, n = absolute fret number
// baseFret: lowest fret shown in diagram (1 = nut position)
// Standard tuning open string pitch classes: E=4, A=9, D=2, G=7, B=11, E=4
export const OPEN_STRING_PCS = [4, 9, 2, 7, 11, 4]; // low→high

export const GUITAR_CHORDS = {
  // ── Major triads
  'C':    { strings:['x',3,2,0,1,0],    baseFret:1 },
  'D':    { strings:['x','x',0,2,3,2],  baseFret:1 },
  'E':    { strings:[0,2,2,1,0,0],      baseFret:1 },
  'F':    { strings:[1,1,2,3,3,1],      baseFret:1 },
  'G':    { strings:[3,2,0,0,0,3],      baseFret:1 },
  'A':    { strings:['x',0,2,2,2,0],    baseFret:1 },
  'B':    { strings:['x',2,4,4,4,2],    baseFret:1 },
  'F#':   { strings:[2,4,4,3,2,2],      baseFret:1 },
  'Gb':   { strings:[2,4,4,3,2,2],      baseFret:1 },
  'Db':   { strings:['x',4,3,1,2,1],    baseFret:1 },
  'Ab':   { strings:[4,6,6,5,4,4],      baseFret:4 },
  'Eb':   { strings:[3,6,5,3,4,3],      baseFret:3 },
  'Bb':   { strings:['x',1,3,3,3,1],    baseFret:1 },
  // ── Minor triads
  'Am':   { strings:['x',0,2,2,1,0],    baseFret:1 },
  'Em':   { strings:[0,2,2,0,0,0],      baseFret:1 },
  'Dm':   { strings:['x','x',0,2,3,1],  baseFret:1 },
  'Bm':   { strings:['x',2,4,4,3,2],    baseFret:1 },
  'F#m':  { strings:[2,4,4,2,2,2],      baseFret:1 },
  'C#m':  { strings:['x',4,6,6,5,4],    baseFret:4 },
  'G#m':  { strings:[4,6,6,4,4,4],      baseFret:4 },
  'Ebm':  { strings:['x',6,8,8,7,6],    baseFret:6 },
  'Bbm':  { strings:['x',1,3,3,2,1],    baseFret:1 },
  'Fm':   { strings:[1,3,3,1,1,1],      baseFret:1 },
  'Cm':   { strings:['x',3,5,5,4,3],    baseFret:3 },
  'Gm':   { strings:[3,5,5,3,3,3],      baseFret:3 },
  // ── Diminished triads
  'Bdim':   { strings:['x',2,3,4,3,'x'], baseFret:1 },
  'C#dim':  { strings:['x',3,4,5,4,'x'], baseFret:1 },
  'Cdim':   { strings:['x',3,4,5,4,'x'], baseFret:1 },
  'Ddim':   { strings:['x','x',0,1,0,1], baseFret:1 },
  'Edim':   { strings:['x','x',2,3,2,3], baseFret:1 },
  'Fdim':   { strings:['x','x',3,4,3,4], baseFret:1 },
  'Gdim':   { strings:['x','x',5,6,5,6], baseFret:5 },
  'Adim':   { strings:['x',0,1,2,1,'x'], baseFret:1 },
  'Ebdim':  { strings:['x','x',1,2,1,2], baseFret:1 },
  'Abdim':  { strings:['x','x',1,2,1,2], baseFret:4 },
  // ── Dominant 7th
  'C7':   { strings:['x',3,2,3,1,0],    baseFret:1 },
  'D7':   { strings:['x','x',0,2,1,2],  baseFret:1 },
  'E7':   { strings:[0,2,0,1,0,0],      baseFret:1 },
  'F7':   { strings:[1,1,2,1,1,1],      baseFret:1 },
  'G7':   { strings:[3,2,0,0,0,1],      baseFret:1 },
  'A7':   { strings:['x',0,2,0,2,0],    baseFret:1 },
  'B7':   { strings:['x',2,1,2,0,2],    baseFret:1 },
  'F#7':  { strings:[2,4,2,3,2,2],      baseFret:1 },
  'Gb7':  { strings:[2,4,2,3,2,2],      baseFret:1 },
  'Db7':  { strings:['x',4,3,4,2,4],    baseFret:1 },
  'Ab7':  { strings:[4,6,4,5,4,4],      baseFret:4 },
  'Eb7':  { strings:[3,6,3,5,4,3],      baseFret:3 },
  'Bb7':  { strings:['x',1,3,1,3,1],    baseFret:1 },
  // ── Major 7th
  'Cmaj7':  { strings:['x',3,2,0,0,0],  baseFret:1 },
  'Dmaj7':  { strings:['x','x',0,2,2,2],baseFret:1 },
  'Emaj7':  { strings:[0,2,1,1,0,0],    baseFret:1 },
  'Fmaj7':  { strings:['x','x',3,2,1,0],baseFret:1 },
  'Gmaj7':  { strings:[3,2,0,0,0,2],    baseFret:1 },
  'Amaj7':  { strings:['x',0,2,1,2,0],  baseFret:1 },
  'Bmaj7':  { strings:['x',2,4,3,4,2],  baseFret:1 },
  'F#maj7': { strings:[2,4,3,3,2,2],    baseFret:1 },
  'Gbmaj7': { strings:[2,4,3,3,2,2],    baseFret:1 },
  'Dbmaj7': { strings:['x',4,3,5,4,'x'],baseFret:1 },
  'Abmaj7': { strings:[4,6,5,5,4,4],    baseFret:4 },
  'Ebmaj7': { strings:[3,6,5,3,4,3],    baseFret:3 },
  'Bbmaj7': { strings:['x',1,3,2,3,1],  baseFret:1 },
  // ── Minor 7th
  'Am7':   { strings:['x',0,2,0,1,0],   baseFret:1 },
  'Em7':   { strings:[0,2,0,0,0,0],     baseFret:1 },
  'Dm7':   { strings:['x','x',0,2,1,1], baseFret:1 },
  'Bm7':   { strings:['x',2,4,2,3,2],   baseFret:1 },
  'F#m7':  { strings:[2,4,2,2,2,2],     baseFret:1 },
  'C#m7':  { strings:['x',4,6,4,5,4],   baseFret:4 },
  'G#m7':  { strings:[4,6,4,4,4,4],     baseFret:4 },
  'Ebm7':  { strings:['x',6,8,6,7,6],   baseFret:6 },
  'Bbm7':  { strings:['x',1,3,1,2,1],   baseFret:1 },
  'Fm7':   { strings:[1,3,1,1,1,1],     baseFret:1 },
  'Cm7':   { strings:['x',3,5,3,4,3],   baseFret:3 },
  'Gm7':   { strings:[3,5,3,3,3,3],     baseFret:3 },
  // ── Half-diminished (m7b5)
  'Bm7b5':  { strings:['x',2,3,2,3,'x'], baseFret:1 },
  'C#m7b5': { strings:['x',3,4,3,4,'x'], baseFret:1 },
  'Dm7b5':  { strings:['x','x',0,1,1,1], baseFret:1 },
  'Em7b5':  { strings:[0,1,2,0,3,'x'],   baseFret:1 },
  'Fm7b5':  { strings:['x','x',3,4,4,4], baseFret:1 },
  'Gm7b5':  { strings:[3,4,5,3,'x','x'], baseFret:3 },
  'Am7b5':  { strings:['x',0,1,2,1,'x'], baseFret:1 },
  'Bbm7b5': { strings:['x',1,2,3,2,'x'], baseFret:1 },
};
```

- [ ] **Step 2: Verify file parses — open browser console**

Run `npm run dev` from `CircleOf5ths/` then in browser DevTools console:
```js
// Paste and run:
import('/src/data/musicTheory.js').then(m => {
  console.log('NOTE_COLORS keys:', Object.keys(m.NOTE_COLORS).length); // expect 12
  console.log('musicKeys keys:', Object.keys(m.musicKeys).length);     // expect 24
  console.log('GUITAR_CHORDS C:', m.GUITAR_CHORDS['C']);               // expect object
  console.log('pcToName(0, false):', m.pcToName(0, false));             // expect 'C'
  console.log('getInterval(4, 0):', m.getInterval(4, 0));               // expect '3'
});
```
Expected: all 4 assertions log the expected value, no errors.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/data/musicTheory.js
git commit -m "feat: extract music theory data into musicTheory.js with NOTE_COLORS and GUITAR_CHORDS"
```

---

## Task 2: Tailwind Config + index.css

**Files:**
- Modify: `CircleOf5ths/tailwind.config.js`
- Modify: `CircleOf5ths/src/index.css`

- [ ] **Step 1: Update tailwind.config.js**

Replace the file content:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.jsx",
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 2: Update src/index.css**

Replace the file content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-gradient: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

body {
  background: var(--bg-gradient);
  min-height: 100vh;
}
```

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/tailwind.config.js CircleOf5ths/src/index.css
git commit -m "feat: switch Tailwind to class-based dark mode, add gradient body background"
```

---

## Task 3: useAudio.js — Web Audio Hook

**Files:**
- Create: `CircleOf5ths/src/hooks/useAudio.js`

- [ ] **Step 1: Create the hook**

```js
import { useRef, useState } from 'react';

// Pitch class 0=C to 11=B → frequency in Hz at a given octave
function pcToHz(pc, octave = 4) {
  // C4 = 261.63 Hz, each semitone = *2^(1/12)
  const semisFromC4 = (octave - 4) * 12 + pc;
  return 261.63 * Math.pow(2, semisFromC4 / 12);
}

export function useAudio() {
  const ctxRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const stopRef = useRef(false);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  function playNote(ctx, pc, octave, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = pcToHz(pc, octave);
    // Subtle envelope: attack 10ms, release 50ms before end
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
    gain.gain.setValueAtTime(0.4, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Play scale notes ascending, 200ms per note
  async function playScale(scalePcs, rootOctave = 4) {
    const ctx = getCtx();
    stopRef.current = false;
    setIsPlaying(true);
    const now = ctx.currentTime;
    scalePcs.forEach((pc, i) => {
      // Wrap octave: if pc < first pc, it's in the next octave
      const oct = i > 0 && pc < scalePcs[0] ? rootOctave + 1 : rootOctave;
      playNote(ctx, pc, oct, now + i * 0.2, 0.22);
    });
    await new Promise(r => setTimeout(r, scalePcs.length * 200 + 100));
    setIsPlaying(false);
  }

  // Play chord — arpeggio (default) or block
  async function playChord(pcs, rootOctave = 4, mode = 'arpeggio') {
    const ctx = getCtx();
    stopRef.current = false;
    setIsPlaying(true);
    const now = ctx.currentTime;
    if (mode === 'block') {
      pcs.forEach(pc => playNote(ctx, pc, rootOctave, now, 0.7));
      await new Promise(r => setTimeout(r, 800));
    } else {
      pcs.forEach((pc, i) => playNote(ctx, pc, rootOctave, now + i * 0.15, 0.6));
      await new Promise(r => setTimeout(r, pcs.length * 150 + 500));
    }
    setIsPlaying(false);
  }

  return { playScale, playChord, isPlaying };
}
```

- [ ] **Step 2: Verify hook works**

Temporarily add to `App.jsx` top-level (remove after verifying):
```js
import { useAudio } from './src/hooks/useAudio.js';
// inside App(): const { playScale, isPlaying } = useAudio();
// add a test button: <button onClick={() => playScale([0,2,4,5,7,9,11])}>Test</button>
```
Open browser, click the button — should hear a C major scale ascending. No console errors.
Remove the test code after verifying.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/hooks/useAudio.js
git commit -m "feat: add useAudio hook with Web Audio API scale and chord playback"
```

---

## Task 4: Header.jsx

**Files:**
- Create: `CircleOf5ths/src/components/Header.jsx`

- [ ] **Step 1: Create the component**

```jsx
export default function Header({ darkMode, onToggleDark }) {
  return (
    <header className="sticky top-0 z-10 bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.08] px-7 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Circle of Fifths
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Music Theory Explorer</p>
      </div>
      <button
        onClick={onToggleDark}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] transition-colors"
      >
        {darkMode ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Wire Header into App.jsx temporarily**

Add this to the top of `App.jsx`'s return, above existing JSX:
```jsx
import Header from './src/components/Header.jsx';
// Add state: const [darkMode, setDarkMode] = useState(true);
// Add effect to sync class:
// useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
// Add to JSX: <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
```
Verify in browser: header appears with gradient title and toggle button. Toggle switches the class on `<html>`.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/Header.jsx
git commit -m "feat: add Header component with gradient title and dark/light toggle"
```

---

## Task 5: KeyInfoBar.jsx

**Files:**
- Create: `CircleOf5ths/src/components/KeyInfoBar.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, musicKeys, circleSlices, pcToName } from '../data/musicTheory.js';

function getRelatedKeys(selectedKey, currentKeyInfo) {
  const { rootPc, type, accType } = currentKeyInfo;
  const isFlat = accType === 'flat';

  // Relative key: same key sig, opposite mode
  const relativeKey = type === 'major'
    ? circleSlices.find(s => s.major === selectedKey)?.minor
    : circleSlices.find(s => s.minor === selectedKey)?.major;

  // Parallel key: same root, opposite mode
  const parallelKey = type === 'major'
    ? Object.keys(musicKeys).find(k => musicKeys[k].rootPc === rootPc && musicKeys[k].type === 'minor')
    : Object.keys(musicKeys).find(k => musicKeys[k].rootPc === rootPc && musicKeys[k].type === 'major');

  // Dominant: 5th above root (7 semitones)
  const domPc = (rootPc + 7) % 12;
  const dominantKey = Object.keys(musicKeys).find(k =>
    musicKeys[k].rootPc === domPc && musicKeys[k].type === type
  );

  // Subdominant: 5th below root (5 semitones)
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

  // Build enharmonic display (e.g. "F# / Gb Major")
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
```

- [ ] **Step 2: Add to App.jsx temporarily and verify**

```jsx
import KeyInfoBar from './src/components/KeyInfoBar.jsx';
// Add after Header in JSX:
// <KeyInfoBar selectedKey={selectedKey} currentKeyInfo={currentKeyInfo} onKeySelect={setSelectedKey} />
```
Verify in browser: bar shows key label in its note color, pills for relative/parallel/dominant/subdominant appear and navigate on click.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/KeyInfoBar.jsx
git commit -m "feat: add KeyInfoBar with enharmonic display and related key navigation pills"
```

---

## Task 6: Circle.jsx — Arc-Based SVG Circle

**Files:**
- Create: `CircleOf5ths/src/components/Circle.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, circleSlices, musicKeys } from '../data/musicTheory.js';

// Compute a point on a circle at angleDeg (0=top, clockwise)
function pt(r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

// Donut arc path from innerR to outerR, spanning a1→a2 degrees (clockwise from top)
function arcPath(innerR, outerR, a1, a2) {
  const [ox1, oy1] = pt(outerR, a1);
  const [ox2, oy2] = pt(outerR, a2);
  const [ix1, iy1] = pt(innerR, a1);
  const [ix2, iy2] = pt(innerR, a2);
  const lg = (a2 - a1) > 180 ? 1 : 0;
  return [
    `M ${ox1.toFixed(2)} ${oy1.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${lg} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)}`,
    `L ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${lg} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// Geometry constants
const R_OUTER  = 175; // outer edge of major ring
const R_M_IN   = 128; // inner edge of major ring
const R_G_OUT  = 118; // outer edge of gap
const R_I_OUT  = 106; // outer edge of minor ring
const R_I_IN   = 72;  // inner edge of minor ring
const R_CENTER = 58;  // center circle

export default function Circle({ selectedKey, onKeySelect, rotationAngle }) {
  const selectedIndex = circleSlices.findIndex(
    s => s.major === selectedKey || s.minor === selectedKey
  );
  const isMajor = musicKeys[selectedKey]?.type === 'major';

  // Diatonic neighbors: ±1 slice on the circle
  const diatonicIdxs = [
    selectedIndex,
    (selectedIndex + 1) % 12,
    (selectedIndex + 11) % 12,
  ];

  const currentKeyInfo = musicKeys[selectedKey];
  const centerColor = NOTE_COLORS[currentKeyInfo?.rootPc ?? 0];

  const SIZE = 390;
  const MID = SIZE / 2;

  return (
    <div className="rounded-2xl p-4 flex flex-col items-center"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">Circle of Fifths</p>
      <svg width={SIZE} height={SIZE} viewBox={`${-MID} ${-MID} ${SIZE} ${SIZE}`}>
        {/* Outer background circle */}
        <circle cx={0} cy={0} r={R_OUTER + 12}
          fill="rgba(15,12,41,0.4)" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

        {/* Diatonic sector highlight (rotates with selected key) */}
        <g style={{ transform: `rotate(${rotationAngle}deg)`, transition: 'transform 0.5s ease-in-out' }}>
          <path
            d={arcPath(R_I_IN - 2, R_OUTER + 2, -45, 45)}
            fill={`${isMajor ? '#818cf8' : '#a78bfa'}08`}
            stroke={`${isMajor ? '#818cf8' : '#a78bfa'}15`}
            strokeWidth={1}
          />
        </g>

        {/* ── Major ring wedges ── */}
        {circleSlices.map((slice, i) => {
          const a1 = i * 30 - 15;
          const a2 = i * 30 + 15;
          const color = NOTE_COLORS[musicKeys[slice.major].rootPc];
          const isActive = i === selectedIndex && isMajor;
          const isDiatonic = diatonicIdxs.includes(i) && !isActive;

          return (
            <g key={`maj-${i}`} onClick={() => onKeySelect(slice.major)} style={{ cursor: 'pointer' }}>
              <path
                d={arcPath(R_M_IN, R_OUTER, a1, a2)}
                fill={isActive ? `${color}CC` : isDiatonic ? `${color}30` : 'rgba(255,255,255,0.035)'}
                stroke={isActive ? color : isDiatonic ? `${color}60` : 'rgba(255,255,255,0.07)'}
                strokeWidth={isActive ? 2 : 1}
              />
              {/* Label at arc midpoint */}
              {(() => {
                const [lx, ly] = pt((R_M_IN + R_OUTER) / 2, i * 30);
                const displayName = slice.displayMajor || slice.major;
                const isEnharmonic = displayName.includes('/');
                return (
                  <text
                    x={lx.toFixed(2)} y={ly.toFixed(2)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={isEnharmonic ? 10 : 14}
                    fontWeight={isActive ? 900 : isDiatonic ? 700 : 500}
                    fill={isActive ? 'white' : isDiatonic ? color : 'rgba(255,255,255,0.5)'}
                    style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}
                  >
                    {displayName}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Gap ring separator */}
        <circle cx={0} cy={0} r={R_G_OUT}
          fill="rgba(12,10,30,0.55)" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

        {/* ── Minor ring wedges ── */}
        {circleSlices.map((slice, i) => {
          const a1 = i * 30 - 15;
          const a2 = i * 30 + 15;
          const color = NOTE_COLORS[musicKeys[slice.minor]?.rootPc ?? 0];
          const isActive = i === selectedIndex && !isMajor;
          const isDiatonic = diatonicIdxs.includes(i) && !isActive;

          return (
            <g key={`min-${i}`} onClick={() => onKeySelect(slice.minor)} style={{ cursor: 'pointer' }}>
              <path
                d={arcPath(R_I_IN, R_I_OUT, a1, a2)}
                fill={isActive ? `${color}BB` : isDiatonic ? `${color}25` : 'rgba(255,255,255,0.025)'}
                stroke={isActive ? color : isDiatonic ? `${color}50` : 'rgba(255,255,255,0.06)'}
                strokeWidth={isActive ? 1.5 : 1}
              />
              {(() => {
                const [lx, ly] = pt((R_I_IN + R_I_OUT) / 2, i * 30);
                const displayName = slice.displayMinor || slice.minor;
                const isEnharmonic = displayName.includes('/');
                return (
                  <text
                    x={lx.toFixed(2)} y={ly.toFixed(2)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={isEnharmonic ? 7 : 10}
                    fontWeight={isActive ? 700 : 500}
                    fill={isActive ? 'white' : isDiatonic ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.32)'}
                    style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}
                  >
                    {displayName}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Inner fill */}
        <circle cx={0} cy={0} r={R_I_IN - 1}
          fill="rgba(10,8,26,0.72)" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

        {/* Center circle */}
        <circle cx={0} cy={0} r={R_CENTER}
          fill={`${centerColor}20`} stroke={centerColor} strokeWidth={1.5} />
        <text x={0} y={-12} textAnchor="middle" dominantBaseline="middle"
          fontSize={26} fontWeight={900} fill={centerColor}
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {selectedKey.replace('m','')}
        </text>
        <text x={0} y={10} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.45)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {currentKeyInfo?.type === 'major' ? 'Major' : 'Minor'}
        </text>
        <text x={0} y={26} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fill="rgba(255,255,255,0.25)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {currentKeyInfo?.accidentals === 0 ? 'Natural' : `${currentKeyInfo?.accidentals} ${currentKeyInfo?.accType}${currentKeyInfo?.accidentals > 1 ? 's' : ''}`}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.jsx temporarily and verify**

```jsx
import Circle from './src/components/Circle.jsx';
// Replace the existing SVG block with:
// <Circle selectedKey={selectedKey} onKeySelect={setSelectedKey} rotationAngle={rotationAngle} />
```
Verify: circle renders with arc wedges, active key highlighted, clicking any wedge updates selected key, smooth rotation when key changes.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/Circle.jsx
git commit -m "feat: add Circle component with JS-computed donut arc paths and note color system"
```

---

## Task 7: Staff.jsx

**Files:**
- Create: `CircleOf5ths/src/components/Staff.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, noteYBase, noteToPc } from '../data/musicTheory.js';

const STAFF_LINES = [18, 28, 38, 48, 58];
const SHARP_Y = [18, 33, 13, 28, 43, 23, 38];
const FLAT_Y  = [38, 23, 43, 28, 48, 33, 53];

export default function Staff({ currentKeyInfo }) {
  const { accidentals, accType, drawScale, label } = currentKeyInfo;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Scale &amp; Key Signature — {label}
      </p>
      <svg width="100%" height="80" viewBox="0 0 580 80" className="overflow-visible">
        {/* Staff lines */}
        {STAFF_LINES.map(y => (
          <line key={y} x1={42} x2={572} y1={y} y2={y}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        ))}
        {/* Treble clef */}
        <text x={42} y={62} fontSize={52} fontFamily="serif" fill="rgba(255,255,255,0.6)">𝄞</text>
        {/* Key signature accidentals */}
        {Array.from({ length: accidentals }).map((_, i) => {
          const yPos = accType === 'sharp' ? SHARP_Y[i] : FLAT_Y[i];
          return (
            <text key={i} x={68 + i * 13} y={yPos + 5}
              fontSize={22} fontFamily="serif" fill="rgba(255,255,255,0.65)" fontWeight="bold">
              {accType === 'sharp' ? '♯' : '♭'}
            </text>
          );
        })}
        {/* Scale notes — colored by pitch class */}
        {drawScale.map((note, i) => {
          const y = noteYBase[note];
          if (y === undefined) return null;
          const x = 152 + i * 50;
          const pc = noteToPc(note.replace(/[0-9]/g, ''));
          const color = NOTE_COLORS[pc] ?? 'rgba(255,255,255,0.6)';
          const isUpStem = y >= 38;
          return (
            <g key={i}>
              {/* Ledger line below staff (C4 and below) */}
              {y >= 68 && Array.from({ length: Math.ceil((y - 63) / 10) }).map((_, li) => (
                <line key={li} x1={x-12} x2={x+12} y1={68+li*10} y2={68+li*10}
                  stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              ))}
              {/* Note head */}
              <ellipse cx={x} cy={y} rx={7} ry={5}
                transform={`rotate(-15 ${x} ${y})`} fill={color} />
              {/* Stem */}
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

- [ ] **Step 2: Wire into App.jsx and verify**

Replace the existing `<Staff>` component usage:
```jsx
import Staff from './src/components/Staff.jsx';
// <Staff currentKeyInfo={currentKeyInfo} />
```
Verify: staff renders with note-colored heads, clef visible, key signature accidentals shown, ledger line appears for middle C.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/Staff.jsx
git commit -m "feat: port Staff with note-colored heads using NOTE_COLORS"
```

---

## Task 8: Piano.jsx

**Files:**
- Create: `CircleOf5ths/src/components/Piano.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, PIANO_KEYS, pcToName, getInterval } from '../data/musicTheory.js';

// Piano geometry
const WHITE_W = 40;
const WHITE_H = 130;
const BLACK_W = 24;
const BLACK_H = 78;

// White key x position
function whiteX(whiteIdx) { return whiteIdx * WHITE_W + 1; }
// Black key x position (centered between adjacent white keys)
function blackX(whiteIdx) { return whiteIdx * WHITE_W + WHITE_W - BLACK_W / 2 + 1; }

export default function Piano({ currentKeyInfo, activeChordPcs, activeChordRoot, isFlat, labelMode }) {
  const { scalePcs, rootPc } = currentKeyInfo;
  const whiteKeys = PIANO_KEYS.filter(k => !k.isBlack);
  const blackKeys = PIANO_KEYS.filter(k => k.isBlack);
  const totalWhite = whiteKeys.length; // 21

  function keyColor(pc, isChord = false) {
    const c = NOTE_COLORS[pc];
    if (activeChordPcs) {
      if (pc === activeChordRoot) return `${c}DA`; // chord root ~85%
      if (activeChordPcs.includes(pc)) return `${c}80`; // chord tone ~50%
      if (scalePcs.includes(pc)) return `${c}38`; // scale note ~22%
      return '#0d0b1e';
    }
    if (pc === rootPc) return `${c}BF`; // scale root ~75%
    if (scalePcs.includes(pc)) return `${c}38`; // scale note ~22%
    return null; // use default
  }

  function label(pc) {
    if (labelMode === 'intervals') {
      const ref = activeChordRoot !== undefined ? activeChordRoot : rootPc;
      return getInterval(pc, ref);
    }
    return pcToName(pc, isFlat);
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Piano · {activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : currentKeyInfo.label + ' scale'}
      </p>
      <div className="overflow-x-auto">
        <svg
          width={totalWhite * WHITE_W + 2}
          height={WHITE_H + 10}
          viewBox={`0 0 ${totalWhite * WHITE_W + 2} ${WHITE_H + 10}`}
          style={{ display: 'block', minWidth: totalWhite * WHITE_W + 2 }}
        >
          {/* White keys */}
          {whiteKeys.map(k => {
            const fill = keyColor(k.pc) ?? '#0d0b1e20';
            const border = NOTE_COLORS[k.pc] + '50';
            const x = whiteX(k.whiteIdx);
            const noteColor = NOTE_COLORS[k.pc];
            return (
              <g key={k.note}>
                <rect x={x} y={1} width={WHITE_W - 2} height={WHITE_H}
                  rx={4} fill={fill} stroke={border} strokeWidth={1} />
                {/* Note name label */}
                <text x={x + (WHITE_W - 2) / 2} y={WHITE_H - 8}
                  textAnchor="middle" fontSize={9} fontWeight={700}
                  fill={noteColor} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {label(k.pc)}
                </text>
              </g>
            );
          })}
          {/* Black keys */}
          {blackKeys.map(k => {
            const fillOverride = keyColor(k.pc);
            const fill = fillOverride ?? '#0d0b1e';
            const noteColor = NOTE_COLORS[k.pc];
            const x = blackX(k.whiteIdx);
            return (
              <g key={k.note}>
                <rect x={x} y={1} width={BLACK_W} height={BLACK_H}
                  rx={3} fill={fill} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                <text x={x + BLACK_W / 2} y={BLACK_H - 8}
                  textAnchor="middle" fontSize={7} fontWeight={600}
                  fill={fillOverride ? 'white' : `${noteColor}55`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {label(k.pc)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex gap-5 mt-3 flex-wrap">
        {activeChordPcs ? (
          <>
            <Legend dot="#f87171" label="Chord Root" />
            <Legend dot="rgba(248,113,113,0.5)" label="Chord Tone" />
            <Legend dot="rgba(74,222,128,0.25)" label="Scale Note" />
            <Legend dot="#0d0b1e" label="Outside Scale" border />
          </>
        ) : (
          <>
            <Legend dot="#f87171" label="Root" />
            <Legend dot="rgba(74,222,128,0.25)" label="Scale Note" />
            <Legend dot="#0d0b1e" label="Outside Scale" border />
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ dot, label, border }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: dot, border: border ? '1px solid rgba(255,255,255,0.15)' : undefined }} />
      {label}
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.jsx and verify**

```jsx
import Piano from './src/components/Piano.jsx';
// Replace existing Piano usage:
// <Piano currentKeyInfo={currentKeyInfo} activeChordPcs={activePcs} activeChordRoot={activeRoot}
//   isFlat={isFlat} labelMode={pianoLabelMode} />
```
Verify: 3-octave piano renders, note names on all keys in their note colors, root key highlighted, scale notes tinted. Select a chord to verify chord root / chord tone coloring.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/Piano.jsx
git commit -m "feat: add Piano with labeled keys and per-note color fills"
```

---

## Task 9: GuitarDiagram.jsx

**Files:**
- Create: `CircleOf5ths/src/components/GuitarDiagram.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, GUITAR_CHORDS, OPEN_STRING_PCS, pcToName } from '../data/musicTheory.js';

// Standard tuning open string pitch classes: [low-E, A, D, G, B, high-e]
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

// Compute pitch class played on string s at absolute fret f
function stringPc(stringIdx, fret) {
  return (OPEN_STRING_PCS[stringIdx] + fret) % 12;
}

export default function GuitarDiagram({ chordName, isFlat }) {
  const shape = GUITAR_CHORDS[chordName];

  if (!shape) {
    return (
      <div className="flex items-center justify-center h-40 text-white/25 text-sm">
        No diagram for {chordName}
      </div>
    );
  }

  const { strings, baseFret } = shape;
  const FRETS = 5;
  const STRING_SPACING = 28;
  const FRET_SPACING = 26;
  const MARGIN_TOP = 36; // space for open/muted markers above nut
  const MARGIN_LEFT = 32; // space for fret number
  const DOT_R = 10;
  const W = MARGIN_LEFT + STRING_SPACING * 5 + 20;
  const H = MARGIN_TOP + FRET_SPACING * FRETS + 20;

  return (
    <div className="flex items-start gap-5">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
        {/* Fret number label if not open position */}
        {baseFret > 1 && (
          <text x={4} y={MARGIN_TOP + FRET_SPACING * 0.7}
            fontSize={11} fill="rgba(255,255,255,0.4)"
            style={{ fontFamily: 'system-ui, sans-serif' }}>
            {baseFret}
          </text>
        )}
        {/* Nut (thick line) or position indicator */}
        {baseFret === 1
          ? <rect x={MARGIN_LEFT} y={MARGIN_TOP} width={STRING_SPACING * 5} height={4}
              rx={2} fill="rgba(255,255,255,0.5)" />
          : <line x1={MARGIN_LEFT} x2={MARGIN_LEFT + STRING_SPACING * 5}
              y1={MARGIN_TOP} y2={MARGIN_TOP}
              stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        }
        {/* Fret lines */}
        {Array.from({ length: FRETS }).map((_, fi) => (
          <line key={fi}
            x1={MARGIN_LEFT} x2={MARGIN_LEFT + STRING_SPACING * 5}
            y1={MARGIN_TOP + (fi + 1) * FRET_SPACING}
            y2={MARGIN_TOP + (fi + 1) * FRET_SPACING}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        ))}
        {/* String lines */}
        {Array.from({ length: 6 }).map((_, si) => (
          <line key={si}
            x1={MARGIN_LEFT + si * STRING_SPACING}
            x2={MARGIN_LEFT + si * STRING_SPACING}
            y1={MARGIN_TOP} y2={MARGIN_TOP + FRETS * FRET_SPACING}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
        ))}
        {/* Open / muted / finger dots */}
        {strings.map((fretVal, si) => {
          const x = MARGIN_LEFT + si * STRING_SPACING;
          if (fretVal === 'x') {
            return (
              <text key={si} x={x} y={MARGIN_TOP - 10}
                textAnchor="middle" fontSize={13} fill="rgba(239,68,68,0.8)"
                style={{ fontFamily: 'system-ui, sans-serif' }}>✕</text>
            );
          }
          if (fretVal === 0) {
            return (
              <circle key={si} cx={x} cy={MARGIN_TOP - 12} r={7}
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
            );
          }
          // Finger dot
          const fretPos = fretVal - baseFret + 1; // 1-based position in visible window
          if (fretPos < 1 || fretPos > FRETS) return null;
          const cy = MARGIN_TOP + (fretPos - 0.5) * FRET_SPACING;
          const pc = stringPc(si, fretVal);
          const color = NOTE_COLORS[pc];
          return (
            <g key={si}>
              <circle cx={x} cy={cy} r={DOT_R} fill={color} />
              <text x={x} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fontWeight={700} fill="#0f0c29"
                style={{ fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}>
                {pcToName(pc, false).replace('#','#')}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Chord info beside diagram */}
      <div className="flex flex-col gap-1 pt-2">
        <div className="font-bold text-base text-white">{chordName}</div>
        <div className="text-xs text-white/35">
          {strings.map((f, si) => {
            if (f === 'x' || f === 0) return null;
            return pcToName(stringPc(si, f), isFlat);
          }).filter(Boolean).join(' · ')}
        </div>
        {baseFret > 1 && (
          <div className="text-xs text-white/25">Fret {baseFret}</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test with a few chords**

In the browser DevTools, add temporarily to App.jsx:
```jsx
import GuitarDiagram from './src/components/GuitarDiagram.jsx';
// <GuitarDiagram chordName="C" isFlat={false} />
// <GuitarDiagram chordName="Am" isFlat={false} />
// <GuitarDiagram chordName="Bdim" isFlat={false} />
```
Verify: fretboard renders, open circles and ✕ marks appear above nut, finger dots are colored by the note they play, C chord shows 3 fingers at correct positions.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/GuitarDiagram.jsx
git commit -m "feat: add GuitarDiagram with note-colored finger dots from GUITAR_CHORDS lookup"
```

---

## Task 10: RelatedKeys.jsx

**Files:**
- Create: `CircleOf5ths/src/components/RelatedKeys.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
    { label: 'Relative',         key: relative },
    { label: 'Parallel',         key: parallel },
    { label: 'Dominant (↑5th)',  key: dominant },
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
```

- [ ] **Step 2: Wire in and verify**

```jsx
import RelatedKeys from './src/components/RelatedKeys.jsx';
// <RelatedKeys selectedKey={selectedKey} currentKeyInfo={currentKeyInfo} onKeySelect={setSelectedKey} />
```
Verify: 4 rows appear, each button colored in its note color, clicking navigates to that key.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/RelatedKeys.jsx
git commit -m "feat: add RelatedKeys panel with note-colored navigation buttons"
```

---

## Task 11: DiatonicChords.jsx

**Files:**
- Create: `CircleOf5ths/src/components/DiatonicChords.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, pcToName,
  majorNumerals, minorNumerals, major7Numerals, minor7Numerals } from '../data/musicTheory.js';

export default function DiatonicChords({
  currentKeyInfo, selectedChordDegree, onChordSelect, chordType, onChordTypeChange
}) {
  const { scalePcs, type, rootPc } = currentKeyInfo;
  const isFlat = currentKeyInfo.accType === 'flat';
  const activeNumerals = type === 'major'
    ? (chordType === 'triad' ? majorNumerals : major7Numerals)
    : (chordType === 'triad' ? minorNumerals : minor7Numerals);

  const chords = scalePcs.map((cRootPc, i) => {
    const numeral = activeNumerals[i];
    let suffix = '';
    if (chordType === 'triad') {
      if (numeral.includes('°')) suffix = 'dim';
      else if (numeral === numeral.toLowerCase() && !numeral.includes('I')) suffix = 'm';
    } else {
      if (numeral.includes('maj7')) suffix = 'maj7';
      else if (numeral.includes('ø7')) suffix = 'm7b5';
      else if (numeral.toLowerCase().includes('m7')) suffix = 'm7';
      else if (numeral.includes('7')) suffix = '7';
    }
    const name = pcToName(cRootPc, isFlat) + suffix;
    const color = NOTE_COLORS[cRootPc];
    return { degree: i, numeral, name, color, rootPc: cRootPc };
  });

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
      </div>
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire in and verify**

```jsx
import DiatonicChords from './src/components/DiatonicChords.jsx';
// <DiatonicChords currentKeyInfo={currentKeyInfo} selectedChordDegree={selectedChordDegree}
//   onChordSelect={setSelectedChordDegree} chordType={chordType} onChordTypeChange={setChordType} />
```
Verify: 7 chord buttons appear, each numeral colored in root note color, clicking selects/deselects, toggling Triads/7ths changes chord names.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/DiatonicChords.jsx
git commit -m "feat: add DiatonicChords with note-colored numerals and triad/7th toggle"
```

---

## Task 12: InstrumentPanel.jsx

**Files:**
- Create: `CircleOf5ths/src/components/InstrumentPanel.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { NOTE_COLORS, pcToName } from '../data/musicTheory.js';
import { useAudio } from '../hooks/useAudio.js';
import Piano from './Piano.jsx';
import GuitarDiagram from './GuitarDiagram.jsx';

export default function InstrumentPanel({
  currentKeyInfo,
  activeChordPcs, activeChordRoot, activeName,
  isFlat, labelMode, onLabelModeChange,
  instrumentMode, onInstrumentModeChange,
  selectedChordDegree,
}) {
  const { playScale, playChord, isPlaying } = useAudio();
  const { scalePcs, rootPc } = currentKeyInfo;

  // Chips: scale notes when no chord, chord notes when chord selected
  const chips = activeChordPcs
    ? activeChordPcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }))
    : scalePcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }));

  function handlePlay() {
    if (isPlaying) return;
    if (activeChordPcs) {
      playChord(activeChordPcs, 4, 'arpeggio');
    } else {
      playScale(scalePcs, 4);
    }
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Instrument View</span>
          {/* Notes / Intervals toggle */}
          <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
            {['notes','intervals'].map(m => (
              <button key={m}
                onClick={() => onLabelModeChange(m)}
                className="px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors"
                style={labelMode === m
                  ? { background: 'rgba(255,255,255,0.1)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.35)' }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {/* Piano / Guitar toggle */}
        <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
          {[['piano','🎹 Piano'],['guitar','🎸 Guitar']].map(([mode, label]) => (
            <button key={mode}
              onClick={() => onInstrumentModeChange(mode)}
              className="px-4 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
              style={instrumentMode === mode
                ? { background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }
                : { color: 'rgba(255,255,255,0.38)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Instrument view */}
      {instrumentMode === 'piano' ? (
        <Piano
          currentKeyInfo={currentKeyInfo}
          activeChordPcs={activeChordPcs}
          activeChordRoot={activeChordRoot}
          isFlat={isFlat}
          labelMode={labelMode}
        />
      ) : (
        <div className="min-h-[140px]">
          {activeName ? (
            <GuitarDiagram chordName={activeName} isFlat={isFlat} />
          ) : (
            <div className="flex items-center justify-center h-36 text-white/25 text-sm">
              Select a chord to see the guitar diagram
            </div>
          )}
        </div>
      )}

      {/* Audio bar */}
      <div className="flex items-center gap-3 mt-4 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-opacity disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }}>
          {isPlaying ? '◼' : '▶'}
        </button>
        <span className="text-[10px] text-white/28 uppercase tracking-wide flex-shrink-0">
          {activeChordPcs ? 'Chord' : 'Scale'}
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {chips.map(({ pc, label: chipLabel }, i) => {
            const color = NOTE_COLORS[pc];
            const isRoot = activeChordPcs ? pc === activeChordRoot : pc === rootPc;
            return (
              <button
                key={i}
                onClick={() => !isPlaying && playChord([pc], 4, 'block')}
                className="text-[11px] font-bold rounded-lg px-2 py-1 border transition-opacity hover:opacity-80"
                style={{
                  background: isRoot ? `${color}45` : `${color}18`,
                  borderColor: `${color}50`,
                  color,
                }}>
                {chipLabel}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-[10px] text-white/20">
          {activeName || currentKeyInfo.label}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire in and verify**

```jsx
import InstrumentPanel from './src/components/InstrumentPanel.jsx';
// Add state: const [instrumentMode, setInstrumentMode] = useState('piano');
// <InstrumentPanel
//   currentKeyInfo={currentKeyInfo}
//   activeChordPcs={activePcs} activeChordRoot={activeRoot} activeName={activeName}
//   isFlat={isFlat} labelMode={pianoLabelMode} onLabelModeChange={setPianoLabelMode}
//   instrumentMode={instrumentMode} onInstrumentModeChange={setInstrumentMode}
//   selectedChordDegree={selectedChordDegree}
// />
```
Verify: Piano/Guitar toggle works, Notes/Intervals toggle works, play button plays a scale or chord arpeggio, individual note chips play single notes.

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/InstrumentPanel.jsx
git commit -m "feat: add InstrumentPanel with Piano/Guitar toggle and audio playback bar"
```

---

## Task 13: AIAssistant.jsx

**Files:**
- Create: `CircleOf5ths/src/components/AIAssistant.jsx`

- [ ] **Step 1: Create the component** (same Gemini logic, restyled)

```jsx
import { useState } from 'react';
import { noteToPc, NOTE_COLORS, pcToName } from '../data/musicTheory.js';

const API_KEY = ""; // fill in your Gemini API key

export default function AIAssistant({ currentKeyInfo, onHighlightChord }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [genre, setGenre] = useState('Pop');
  const [error, setError] = useState('');
  const [activeAiIdx, setActiveAiIdx] = useState(null);

  async function callGemini(prompt, isProgression) {
    setLoading(true); setResponse(null); setError(''); setActiveAiIdx(null);
    const delays = [1000,2000,4000,8000,16000];
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
          {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
              contents:[{parts:[{text:prompt}]}],
              systemInstruction:{parts:[{text:'You are an expert music theorist. Be concise.'}]},
            }),
          }
        );
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          if (isProgression) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
              try { setResponse(JSON.parse(match[0])); } catch { setResponse(text); }
            } else { setResponse(text); }
          } else { setResponse(text); }
          setLoading(false); return;
        }
      } catch {
        if (i < 4) await new Promise(r => setTimeout(r, delays[i]));
      }
    }
    setError('AI assistant unavailable. Please try again later.');
    setLoading(false);
  }

  function handleCharacteristics() {
    callGemini(
      `Describe the emotional feel and 2-3 famous pieces in ${currentKeyInfo.label}. Under 150 words, no markdown.`,
      false
    );
  }

  function handleProgression() {
    callGemini(
      `Generate a ${genre} chord progression in ${currentKeyInfo.label}.
Return ONLY valid JSON: {"progression":[{"numeral":"I","name":"Cmaj7","notes":["C","E","G","B"]}],"explanation":"one sentence"}`,
      true
    );
  }

  const isFlat = currentKeyInfo.accType === 'flat';

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.2)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xl">🤖</span>
        <div>
          <div className="font-bold text-sm text-white">AI Musical Assistant</div>
          <div className="text-xs text-white/35 mt-0.5">Discover key characteristics · Generate progressions</div>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <button onClick={handleCharacteristics} disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(96,165,250,0.25))', border:'1px solid rgba(167,139,250,0.35)', color:'#c4b5fd' }}>
            ✨ Key Characteristics
          </button>
          <div className="flex items-center gap-1 rounded-lg px-3 py-1"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <select value={genre} onChange={e => setGenre(e.target.value)}
              className="text-xs text-white/70 bg-transparent outline-none cursor-pointer">
              {['Pop','Jazz','Classical','R&B','Cinematic'].map(g => (
                <option key={g} value={g} style={{ background:'#1e1b4b' }}>{g}</option>
              ))}
            </select>
            <button onClick={handleProgression} disabled={loading}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background:'linear-gradient(135deg,rgba(96,165,250,0.3),rgba(52,211,153,0.3))', border:'1px solid rgba(96,165,250,0.35)', color:'#93c5fd' }}>
              ✨ Generate
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl animate-pulse"
          style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.15)' }}>
          <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm text-purple-300 font-medium">Consulting the musical oracle...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm text-red-300"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {response && !loading && (
        <div className="mt-4 p-4 rounded-xl"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
          {typeof response === 'object' && response.progression ? (
            <>
              <p className="text-[10px] font-bold tracking-[1.5px] text-white/25 uppercase mb-3">
                Interactive Progression — click to highlight
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {response.progression.map((chord, idx) => {
                  const pcs = chord.notes.map(noteToPc).filter(n => n !== null);
                  const rootPc = pcs[0];
                  const color = rootPc !== undefined ? NOTE_COLORS[rootPc] : '#a78bfa';
                  const isActive = activeAiIdx === idx;
                  return (
                    <button key={idx}
                      onClick={() => {
                        setActiveAiIdx(idx);
                        if (pcs.length > 0) onHighlightChord({ name: chord.name, pcs, rootPc });
                      }}
                      className="px-4 py-2.5 rounded-xl border text-center min-w-[72px] transition-all"
                      style={isActive
                        ? { background:`${color}30`, borderColor:`${color}70`, boxShadow:`0 0 14px ${color}25` }
                        : { background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.1)' }}>
                      <div className="font-bold text-base" style={{ color }}>{chord.numeral}</div>
                      <div className="text-xs mt-0.5 text-white/45">{chord.name}</div>
                    </button>
                  );
                })}
              </div>
              {response.explanation && (
                <p className="text-xs text-white/55 leading-relaxed">
                  <span className="font-bold text-white/70">Why it works: </span>
                  {response.explanation}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {typeof response === 'string' ? response : JSON.stringify(response)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Wire into App temporarily. Verify the panel renders, buttons are styled, genre selector works. (API calls require a valid API_KEY in the component.)

- [ ] **Step 3: Commit**

```bash
git add CircleOf5ths/src/components/AIAssistant.jsx
git commit -m "feat: restyle AIAssistant to Modern Gradient theme with note-colored progression chords"
```

---

## Task 14: App.jsx — Final Assembly

**Files:**
- Rewrite: `CircleOf5ths/App.jsx`

- [ ] **Step 1: Rewrite App.jsx as thin orchestrator**

```jsx
import React, { useState, useEffect } from 'react';
import { musicKeys, circleSlices } from './src/data/musicTheory.js';
import Header from './src/components/Header.jsx';
import KeyInfoBar from './src/components/KeyInfoBar.jsx';
import Circle from './src/components/Circle.jsx';
import Staff from './src/components/Staff.jsx';
import InstrumentPanel from './src/components/InstrumentPanel.jsx';
import DiatonicChords from './src/components/DiatonicChords.jsx';
import RelatedKeys from './src/components/RelatedKeys.jsx';
import AIAssistant from './src/components/AIAssistant.jsx';
import {
  majorNumerals, minorNumerals, major7Numerals, minor7Numerals,
  pcToName,
} from './src/data/musicTheory.js';

export default function App() {
  const [selectedKey, setSelectedKey]           = useState('C');
  const [selectedChordDegree, setSelectedChordDegree] = useState(null);
  const [customChordHighlight, setCustomChordHighlight] = useState(null);
  const [chordType, setChordType]               = useState('triad');
  const [instrumentMode, setInstrumentMode]     = useState('piano');
  const [labelMode, setLabelMode]               = useState('notes');
  const [darkMode, setDarkMode]                 = useState(true);
  const [rotationAngle, setRotationAngle]       = useState(0);

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const currentKeyInfo = musicKeys[selectedKey];
  const isFlat = currentKeyInfo.accType === 'flat';
  const selectedIndex = circleSlices.findIndex(
    s => s.major === selectedKey || s.minor === selectedKey
  );

  // Smooth circle rotation
  useEffect(() => {
    setSelectedChordDegree(null);
    setCustomChordHighlight(null);
    setRotationAngle(prev => {
      const cur = ((prev % 360) + 360) % 360;
      const target = selectedIndex * 30;
      let diff = target - cur;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return prev + diff;
    });
  }, [selectedKey, selectedIndex]);

  // Compute diatonic chords
  const activeNumerals = currentKeyInfo.type === 'major'
    ? (chordType === 'triad' ? majorNumerals : major7Numerals)
    : (chordType === 'triad' ? minorNumerals : minor7Numerals);

  const diatonicChords = currentKeyInfo.scalePcs.map((rootPc, i) => {
    const numeral = activeNumerals[i];
    let suffix = '';
    if (chordType === 'triad') {
      if (numeral.includes('°')) suffix = 'dim';
      else if (numeral === numeral.toLowerCase() && !numeral.toUpperCase().includes('I') && !numeral.includes('V')) suffix = 'm';
    } else {
      if (numeral.includes('maj7')) suffix = 'maj7';
      else if (numeral.includes('ø7')) suffix = 'm7b5';
      else if (numeral.toLowerCase().includes('m7')) suffix = 'm7';
      else if (numeral.includes('7')) suffix = '7';
    }
    const name = pcToName(rootPc, isFlat) + suffix;
    const thirdPc  = currentKeyInfo.scalePcs[(i + 2) % 7];
    const fifthPc  = currentKeyInfo.scalePcs[(i + 4) % 7];
    const seventhPc = currentKeyInfo.scalePcs[(i + 6) % 7];
    const pcs = chordType === 'triad'
      ? [rootPc, thirdPc, fifthPc]
      : [rootPc, thirdPc, fifthPc, seventhPc];
    return { degree: i, numeral, name, pcs, rootPc };
  });

  const activeChord = selectedChordDegree !== null ? diatonicChords[selectedChordDegree] : null;
  const activePcs  = customChordHighlight?.pcs  || activeChord?.pcs  || null;
  const activeRoot = customChordHighlight ? customChordHighlight.rootPc : activeChord?.rootPc;
  const activeName = customChordHighlight ? customChordHighlight.name  : activeChord?.name;

  function handleKeySelect(key) {
    setSelectedKey(key);
  }

  function handleChordSelect(degree) {
    setSelectedChordDegree(degree);
    setCustomChordHighlight(null);
  }

  return (
    <div className="min-h-screen font-sans text-white" style={{ background: 'var(--bg-gradient)' }}>
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      <KeyInfoBar
        selectedKey={selectedKey}
        currentKeyInfo={currentKeyInfo}
        onKeySelect={handleKeySelect}
      />

      <main className="max-w-[1350px] mx-auto px-6 py-5 flex gap-5">
        {/* Left column */}
        <div className="flex-shrink-0 flex flex-col gap-4 w-[280px]">
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
          <Staff currentKeyInfo={currentKeyInfo} />
          <InstrumentPanel
            currentKeyInfo={currentKeyInfo}
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
            currentKeyInfo={currentKeyInfo}
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
}
```

- [ ] **Step 2: Run the app and do a full feature check**

```bash
cd CircleOf5ths && npm run dev
```
Open `http://localhost:5173` and verify these:
1. ✅ Header shows gradient title, dark/light toggle works
2. ✅ Key info bar shows current key in its note color, related key pills navigate correctly
3. ✅ Circle shows arc wedges, active key highlighted, clicking any key updates everything
4. ✅ Staff shows note-colored heads matching the selected key signature
5. ✅ Piano shows labeled keys, chord highlighting when diatonic chord selected
6. ✅ Guitar mode shows fretboard diagram when a chord is selected
7. ✅ Play button plays scale ascending; note chips play individual notes
8. ✅ Diatonic chord grid shows note-colored numerals, triad/7th toggle works
9. ✅ Related keys panel shows 4 rows, clicking each navigates to that key
10. ✅ No console errors

- [ ] **Step 3: Final commit**

```bash
git add App.jsx
git commit -m "feat: assemble full redesign — all components wired into thin App.jsx orchestrator"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: All 14 spec requirements covered across 14 tasks
- [x] **Note colors**: `NOTE_COLORS` defined in Task 1, used in Circle (T6), Staff (T7), Piano (T8), Guitar (T9), RelatedKeys (T10), DiatonicChords (T11), InstrumentPanel (T12), AIAssistant (T13)
- [x] **Audio**: `useAudio` created in T3, wired into InstrumentPanel T12
- [x] **Guitar diagrams**: `GUITAR_CHORDS` in T1, `GuitarDiagram` in T9, shown via InstrumentPanel T12
- [x] **Related keys**: `RelatedKeys` in T10, also `KeyInfoBar` in T5
- [x] **Enharmonic labels**: `KeyInfoBar` handles F#/Gb display in T5, Circle shows `displayMajor` in T6
- [x] **Dark mode**: Tailwind `class` mode in T2, Header toggle in T4, synced via `useEffect` in T14
- [x] **Type consistency**: `NOTE_COLORS` keyed by numeric pc (0–11) consistently; `pcToName/getInterval/noteToPc` signatures match throughout; `GUITAR_CHORDS` key format matches chord names produced by `DiatonicChords`
- [x] **No placeholders**: All code blocks are complete and runnable
