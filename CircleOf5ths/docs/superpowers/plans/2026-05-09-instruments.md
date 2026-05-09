# Instruments & Alternate Tunings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 alternate guitar tunings and two new fretboard instruments (violin, ukulele) to the Circle of Fifths Explorer instrument panel.

**Architecture:** All instrument/tuning configuration lives in a new `src/data/instruments.js` data file. `GuitarFretboard.jsx` is replaced by a new `FretboardInstrument.jsx` that accepts string count, open pitches, fret count, and fret markers as props. `InstrumentPanel.jsx` gains a 4-way instrument toggle and a tuning dropdown that appears only for instruments with multiple tunings.

**Tech Stack:** React 18, Vite (build verification via `npm run build`), Tailwind CSS, SVG.

**Working directory for all commands:** `CircleOf5ths/` (the Vite project root containing `package.json`).

---

## File Map

| File | Action |
|---|---|
| `src/data/instruments.js` | Create — all instrument + tuning configs |
| `src/components/FretboardInstrument.jsx` | Create — generic fretboard SVG (replaces GuitarFretboard) |
| `src/components/InstrumentPanel.jsx` | Modify — 4-way toggle, TuningDropdown, uses FretboardInstrument |
| `src/components/GuitarFretboard.jsx` | Delete — no longer imported anywhere after Task 3 |

No changes to `App.jsx`, `musicTheory.js`, `useAudio.js`, `GuitarDiagram.jsx`, or any other file.

---

## Task 1: Create `src/data/instruments.js`

**Files:**
- Create: `CircleOf5ths/src/data/instruments.js`

- [ ] **Step 1: Create the file**

```js
export const INSTRUMENTS = {
  piano: {
    label: 'Piano',
    emoji: '🎹',
    tunings: null,
  },

  guitar: {
    label: 'Guitar',
    emoji: '🎸',
    defaultTuning: 'standard',
    stringWidths: [0.8, 0.9, 1.1, 1.4, 1.8, 2.3],
    fretCount: 15,
    fretMarkers: { 3: 1, 5: 1, 7: 1, 9: 1, 12: 2, 15: 1 },
    tunings: {
      standard: { label: 'Standard (EADGBE)', openPcs: [4, 11, 7, 2, 9, 4],  labels: ['e', 'B', 'G', 'D', 'A', 'E'] },
      dropD:    { label: 'Drop D (DADGBE)',   openPcs: [4, 11, 7, 2, 9, 2],  labels: ['e', 'B', 'G', 'D', 'A', 'D'] },
      openG:    { label: 'Open G (DGDGBD)',   openPcs: [2, 11, 7, 2, 7, 2],  labels: ['D', 'B', 'G', 'D', 'G', 'D'] },
      openD:    { label: 'Open D (DADf#AD)',  openPcs: [2, 9, 6, 2, 9, 2],   labels: ['D', 'A', 'F#', 'D', 'A', 'D'] },
      dadgad:   { label: 'DADGAD',            openPcs: [2, 9, 7, 2, 9, 2],   labels: ['D', 'A', 'G', 'D', 'A', 'D'] },
      openE:    { label: 'Open E (EBEg#BE)',  openPcs: [4, 11, 8, 4, 11, 4], labels: ['E', 'B', 'G#', 'E', 'B', 'E'] },
      openA:    { label: 'Open A (EAEac#E)', openPcs: [4, 1, 9, 4, 9, 4],   labels: ['E', 'C#', 'A', 'E', 'A', 'E'] },
      halfDown: { label: 'Half-step ↓ (Eb)', openPcs: [3, 10, 6, 1, 8, 3],  labels: ['eb', 'Bb', 'Gb', 'Db', 'Ab', 'Eb'] },
      fullDown: { label: 'Full-step ↓ (D)',  openPcs: [2, 9, 5, 0, 7, 2],   labels: ['D', 'A', 'F', 'C', 'G', 'D'] },
      dropC:    { label: 'Drop C (CADGBE)',   openPcs: [4, 11, 7, 2, 9, 0],  labels: ['E', 'B', 'G', 'D', 'A', 'C'] },
    },
  },

  violin: {
    label: 'Violin',
    emoji: '🎻',
    defaultTuning: 'standard',
    stringWidths: [0.8, 1.1, 1.5, 1.9],
    fretCount: 12,
    fretMarkers: { 3: 1, 5: 1, 7: 1, 12: 2 },
    tunings: {
      standard: { label: 'Standard (GDAE)', openPcs: [4, 9, 2, 7], labels: ['E', 'A', 'D', 'G'] },
    },
  },

  ukulele: {
    label: 'Ukulele',
    emoji: '🪕',
    defaultTuning: 'standard',
    stringWidths: [0.8, 1.0, 1.2, 1.5],
    fretCount: 15,
    fretMarkers: { 5: 1, 7: 1, 10: 1, 12: 2, 15: 1 },
    tunings: {
      standard: { label: 'Standard (GCEA)',  openPcs: [9, 4, 0, 7],  labels: ['A', 'E', 'C', 'G'] },
      dTuning:  { label: 'D Tuning (ADF#B)', openPcs: [11, 6, 2, 9], labels: ['B', 'F#', 'D', 'A'] },
    },
  },
};
```

All arrays are ordered **high string → low string** (same convention as the existing `GuitarFretboard.jsx` which stores `STRING_OPEN_PCS = [4, 11, 7, 2, 9, 4]` meaning high-e first).

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds. `instruments.js` is not yet imported anywhere so this just checks syntax.

- [ ] **Step 3: Commit**

```bash
git add src/data/instruments.js
git commit -m "feat: add instrument and tuning data"
```

---

## Task 2: Create `src/components/FretboardInstrument.jsx`

**Files:**
- Create: `CircleOf5ths/src/components/FretboardInstrument.jsx`

This is a generalization of the existing `GuitarFretboard.jsx`. The hardcoded 6-string/15-fret constants become props. All note-dot rendering logic is identical to `GuitarFretboard.jsx`.

Key differences from `GuitarFretboard.jsx`:
- `numStrings` derived from `openPcs.length` (4 or 6)
- `VB_H` computed as `(numStrings - 1) * SS + MT + MB` so the SVG shrinks for 4-string instruments while string spacing stays constant (`SS = 27.4`)
- `FRET_W` computed as `FRET_AREA_W / fretCount` (not hardcoded to `/15`)
- Double-dot inlay positions use `(numStrings - 1) * 0.3` and `(numStrings - 1) * 0.7` (proportional) instead of hardcoded `sY(1.5)` / `sY(3.5)`
- Fret number labels use `[...new Set([1, 3, 5, 7, 9, 12, fretCount])]` filtered to `<= fretCount` to avoid duplicates when `fretCount === 12` (violin)
- Fret lines loop to `fretCount` instead of `15`

- [ ] **Step 1: Create the file**

```jsx
import { NOTE_COLORS, pcToName, INTERVAL_LABELS } from '../data/musicTheory.js';

const VB_W = 1000;
const LABEL_W = 24;
const OPEN_W = 40;
const NUT_X = LABEL_W + OPEN_W;          // 64
const MARGIN_R = 6;
const FRET_AREA_W = VB_W - NUT_X - MARGIN_R; // 930
const MT = 18, MB = 30;
const SS = 27.4;                          // fixed string spacing in viewbox units
const DOT_R = 10;
const OPEN_X = LABEL_W + OPEN_W / 2;     // 44

export default function FretboardInstrument({
  openPcs, stringLabels, stringWidths, fretCount, fretMarkers,
  activeScalePcs, activeChordPcs, activeChordRoot,
  rootPc, labelMode, isFlat, colorPcs, activePc, compareScalePcs,
}) {
  const numStrings = openPcs.length;
  const STRINGS_H = (numStrings - 1) * SS;
  const VB_H = STRINGS_H + MT + MB;
  const FRET_W = FRET_AREA_W / fretCount;
  const midY = MT + STRINGS_H / 2;

  const scalePcsSet = new Set(activeScalePcs);
  const chordPcsSet = activeChordPcs ? new Set(activeChordPcs) : null;
  const highlightRoot = activeChordRoot ?? rootPc;
  const intervalRef   = activeChordRoot ?? rootPc;

  function sY(s) { return MT + s * SS; }
  function fX(f) { return NUT_X + (f - 0.5) * FRET_W; }
  function fLineX(f) { return NUT_X + f * FRET_W; }

  function dotOpacity(pc) {
    if (!chordPcsSet) return 1;
    return chordPcsSet.has(pc) ? 1 : 0.22;
  }

  function isNonDiatonic(pc) {
    return chordPcsSet?.has(pc) && !scalePcsSet.has(pc);
  }

  function dotLabel(pc) {
    if (!labelMode || labelMode === 'none') return null;
    if (labelMode === 'intervals') {
      const diff = (pc - intervalRef + 12) % 12;
      return INTERVAL_LABELS[diff].short;
    }
    return pcToName(pc, isFlat);
  }

  const fretLabels = [...new Set([1, 3, 5, 7, 9, 12, fretCount])].filter(f => f <= fretCount);

  return (
    <svg width="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ display: 'block' }}>

      {/* ── Fret position inlays ── */}
      {Object.entries(fretMarkers).map(([fStr, count]) => {
        const f = +fStr;
        const x = fX(f);
        if (count === 2) {
          return (
            <g key={f}>
              <circle cx={x} cy={sY((numStrings - 1) * 0.3)} r={4} fill="rgba(255,255,255,0.09)" />
              <circle cx={x} cy={sY((numStrings - 1) * 0.7)} r={4} fill="rgba(255,255,255,0.09)" />
            </g>
          );
        }
        return <circle key={f} cx={x} cy={midY} r={4} fill="rgba(255,255,255,0.09)" />;
      })}

      {/* ── Fret lines ── */}
      {Array.from({ length: fretCount }, (_, i) => (
        <line key={i} x1={fLineX(i + 1)} y1={MT - 2} x2={fLineX(i + 1)} y2={MT + STRINGS_H + 2}
          stroke="rgba(255,255,255,0.18)" strokeWidth={i === 0 ? 1 : 0.8} />
      ))}

      {/* ── Nut ── */}
      <rect x={NUT_X - 3} y={MT - 3} width={5} height={STRINGS_H + 6}
        fill="rgba(255,255,255,0.65)" rx={1} />

      {/* ── String lines ── */}
      {stringLabels.map((_, s) => (
        <line key={s}
          x1={LABEL_W} y1={sY(s)} x2={VB_W - MARGIN_R} y2={sY(s)}
          stroke="rgba(255,255,255,0.22)" strokeWidth={stringWidths[s]} />
      ))}

      {/* ── String labels ── */}
      {stringLabels.map((lbl, s) => (
        <text key={s} x={LABEL_W - 5} y={sY(s)} textAnchor="end" dominantBaseline="middle"
          fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.35)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {lbl}
        </text>
      ))}

      {/* ── Fret number labels ── */}
      {fretLabels.map(f => (
        <text key={f} x={fX(f)} y={VB_H - 7} textAnchor="middle"
          fontSize={10} fill="rgba(255,255,255,0.28)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {f}
        </text>
      ))}

      {/* ── Note dots ── */}
      {openPcs.map((openPc, s) => {
        const positions = [];

        function renderDot(pc, cx, cy, key) {
          const inScale    = scalePcsSet.has(pc);
          const nonDia     = isNonDiatonic(pc);
          const compareOnly = compareScalePcs?.has(pc) && !inScale && !nonDia;
          if (!inScale && !nonDia && !compareOnly) return null;
          const color  = NOTE_COLORS[pc];
          const isRoot = pc === highlightRoot;
          const lbl    = dotLabel(pc);
          return (
            <g key={key} opacity={compareOnly ? 1 : dotOpacity(pc)}>
              {compareOnly ? (
                <circle cx={cx} cy={cy} r={DOT_R} fill="rgba(96,165,250,0.15)"
                  stroke="rgba(96,165,250,0.65)" strokeWidth={1.5} strokeDasharray="3 2" />
              ) : nonDia ? (
                <circle cx={cx} cy={cy} r={DOT_R} fill="rgba(255,255,255,0.15)"
                  stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              ) : (
                <circle cx={cx} cy={cy} r={DOT_R} fill={color} />
              )}
              {isRoot && !nonDia && !compareOnly &&
                <circle cx={cx} cy={cy} r={DOT_R} fill="none" stroke="white" strokeWidth={2.5} />}
              {colorPcs?.has(pc) && !nonDia && !compareOnly &&
                <circle cx={cx} cy={cy} r={DOT_R + 4} fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth={1.5} />}
              {activePc === pc && !compareOnly &&
                <circle cx={cx} cy={cy} r={DOT_R + 5} fill="rgba(255,255,255,0.15)"
                  stroke="white" strokeWidth={1.5} strokeOpacity={0.7} />}
              {lbl && !compareOnly &&
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fontWeight={700}
                  fill={nonDia ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}
                  style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>
                  {lbl}
                </text>}
            </g>
          );
        }

        // Fret 0 — open string
        const oPc  = openPc % 12;
        const oDot = renderDot(oPc, OPEN_X, sY(s), 'o');
        if (oDot) positions.push(oDot);

        // Frets 1–fretCount
        for (let f = 1; f <= fretCount; f++) {
          const pc  = (openPc + f) % 12;
          const dot = renderDot(pc, fX(f), sY(s), f);
          if (dot) positions.push(dot);
        }

        return <g key={s}>{positions}</g>;
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds. `FretboardInstrument.jsx` is not yet imported anywhere, so this is a syntax/import check only.

- [ ] **Step 3: Commit**

```bash
git add src/components/FretboardInstrument.jsx
git commit -m "feat: add generic FretboardInstrument component"
```

---

## Task 3: Update `InstrumentPanel.jsx` and remove `GuitarFretboard.jsx`

**Files:**
- Modify: `CircleOf5ths/src/components/InstrumentPanel.jsx`
- Delete: `CircleOf5ths/src/components/GuitarFretboard.jsx`

Replace the entire file content of `InstrumentPanel.jsx` with the version below. Key changes vs the current file:

1. Imports: remove `GuitarFretboard`, add `FretboardInstrument` and `INSTRUMENTS`
2. Add `TuningDropdown` component (after `ScaleDropdown`, same pattern)
3. Add `guitarTuning` / `ukuleleTuning` state + `localStorage` persistence
4. Add `activeTuning` useMemo
5. Replace 2-button instrument toggle with 4-button data-driven toggle built from `Object.entries(INSTRUMENTS)`
6. Add tuning row (visible only when active instrument has >1 tuning)
7. Replace `<GuitarFretboard>` with `<FretboardInstrument>` passing config from `INSTRUMENTS[instrumentMode]` and `activeTuning`
8. Update the fretboard label to include instrument name and tuning

- [ ] **Step 1: Replace `InstrumentPanel.jsx` with the following**

```jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { NOTE_COLORS, pcToName, SCALES } from '../data/musicTheory.js';
import { INSTRUMENTS } from '../data/instruments.js';
import Piano from './Piano.jsx';
import FretboardInstrument from './FretboardInstrument.jsx';

const SCALE_OPTIONS = Object.entries(SCALES).map(([key, s]) => ({ key, label: s.label }));

function ScaleDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = value ? SCALE_OPTIONS.find(o => o.key === value) : null;

  useEffect(() => {
    if (!open) return;
    function handle(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
        style={active
          ? { background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(147,197,253,0.9)' }
          : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
        {active ? active.label : 'none'}
        <span className="text-[8px] opacity-60">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden py-1"
          style={{ background: 'rgba(24,24,40,0.97)', border: '1px solid rgba(255,255,255,0.12)', minWidth: '9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-[11px] transition-colors hover:bg-white/10"
            style={{ color: !active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', fontWeight: !active ? 600 : 400 }}>
            None
          </button>
          {SCALE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] transition-colors hover:bg-white/10"
              style={{ color: value === key ? 'rgba(147,197,253,0.95)' : 'rgba(255,255,255,0.55)', fontWeight: value === key ? 700 : 400, background: value === key ? 'rgba(96,165,250,0.1)' : 'transparent' }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TuningDropdown({ tunings, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = Object.entries(tunings);
  const active = tunings[value];

  useEffect(() => {
    if (!open) return;
    function handle(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
        style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(196,181,253,0.9)' }}>
        {active?.label ?? value}
        <span className="text-[8px] opacity-60">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden py-1"
          style={{ background: 'rgba(24,24,40,0.97)', border: '1px solid rgba(255,255,255,0.12)', minWidth: '14rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {options.map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] transition-colors hover:bg-white/10"
              style={{ color: value === key ? 'rgba(196,181,253,0.95)' : 'rgba(255,255,255,0.55)', fontWeight: value === key ? 700 : 400, background: value === key ? 'rgba(167,139,250,0.1)' : 'transparent' }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InstrumentPanel({
  currentKeyInfo,
  activeScalePcs,
  activeChordPcs, activeChordRoot, activeName,
  isFlat, labelMode, onLabelModeChange,
  instrumentMode, onInstrumentModeChange,
  selectedChordDegree, scaleLabel,
  colorNotePcs,
  audio,
}) {
  const { rootPc } = currentKeyInfo;
  const { playScale, playChord, stop, isPlaying, isLoading, activePc } = audio;
  const [showColorNotes, setShowColorNotes] = useState(true);
  const [compareMode,    setCompareMode]    = useState(null);
  const [guitarTuning,   setGuitarTuning]   = useState(
    () => localStorage.getItem('co5_guitar_tuning') || 'standard'
  );
  const [ukuleleTuning, setUkuleleTuning]   = useState(
    () => localStorage.getItem('co5_ukulele_tuning') || 'standard'
  );

  useEffect(() => { localStorage.setItem('co5_guitar_tuning',  guitarTuning);  }, [guitarTuning]);
  useEffect(() => { localStorage.setItem('co5_ukulele_tuning', ukuleleTuning); }, [ukuleleTuning]);

  const activeTuning = useMemo(() => {
    const inst = INSTRUMENTS[instrumentMode];
    if (!inst?.tunings) return null;
    const key = instrumentMode === 'guitar'  ? guitarTuning
              : instrumentMode === 'ukulele' ? ukuleleTuning
              : inst.defaultTuning;
    return inst.tunings[key] ?? inst.tunings[inst.defaultTuning];
  }, [instrumentMode, guitarTuning, ukuleleTuning]);

  const hasColorNotes  = colorNotePcs?.size > 0;
  const colorPcs       = showColorNotes && hasColorNotes && !activeChordPcs ? colorNotePcs : null;

  const compareScalePcs = useMemo(() => {
    if (!compareMode) return null;
    const intervals = SCALES[compareMode]?.intervals;
    if (!intervals) return null;
    return new Set(intervals.map(i => (rootPc + i) % 12));
  }, [compareMode, rootPc]);

  const chips = activeChordPcs
    ? activeChordPcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }))
    : activeScalePcs.map(pc => ({ pc, label: pcToName(pc, isFlat) }));

  function handlePlay() {
    if (isPlaying) { stop(); return; }
    if (activeChordPcs) {
      playChord(activeChordPcs, 4, 'arpeggio');
    } else {
      playScale(activeScalePcs, 4);
    }
  }

  const inst = INSTRUMENTS[instrumentMode];
  const showTuningRow = inst?.tunings && Object.keys(inst.tunings).length > 1;
  const tuningValue    = instrumentMode === 'guitar' ? guitarTuning : ukuleleTuning;
  const tuningOnChange = instrumentMode === 'guitar' ? setGuitarTuning : setUkuleleTuning;

  const fretboardLabel = inst && activeTuning
    ? `${inst.label} · ${activeTuning.label} · ${activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : scaleLabel}`
    : inst
    ? `${inst.label} · ${activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : scaleLabel}`
    : '';

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Instrument View</span>
          {/* Notes / Intervals toggle */}
          <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
            {['notes', 'intervals'].map(m => (
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
          {hasColorNotes && (
            <button
              onClick={() => setShowColorNotes(v => !v)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
              style={showColorNotes
                ? { background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', color: 'rgba(251,191,36,0.9)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
              ◆ Characteristic tones
            </button>
          )}
          {/* Compare scale selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25">Compare:</span>
            <ScaleDropdown value={compareMode} onChange={setCompareMode} />
          </div>
        </div>

        {/* Instrument toggle — 4 buttons built from INSTRUMENTS data */}
        <div className="flex bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
          {Object.entries(INSTRUMENTS).map(([id, { label, emoji }]) => (
            <button key={id}
              onClick={() => onInstrumentModeChange(id)}
              className="px-4 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
              style={instrumentMode === id
                ? { background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }
                : { color: 'rgba(255,255,255,0.38)' }}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tuning row — visible only when active instrument has multiple tunings */}
      {showTuningRow && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-white/25">Tuning:</span>
          <TuningDropdown
            tunings={inst.tunings}
            value={tuningValue}
            onChange={tuningOnChange}
          />
        </div>
      )}

      {/* Instrument view */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px]">
          {instrumentMode === 'piano' ? (
            <Piano
              currentKeyInfo={currentKeyInfo}
              activeScalePcs={activeScalePcs}
              activeChordPcs={activeChordPcs}
              activeChordRoot={activeChordRoot}
              isFlat={isFlat}
              labelMode={labelMode}
              scaleLabel={scaleLabel}
              colorPcs={colorPcs}
              activePc={activePc}
              compareScalePcs={compareScalePcs}
            />
          ) : (
            <div className="mt-1 mb-1">
              <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
                {fretboardLabel}
              </p>
              <FretboardInstrument
                openPcs={activeTuning.openPcs}
                stringLabels={activeTuning.labels}
                stringWidths={inst.stringWidths}
                fretCount={inst.fretCount}
                fretMarkers={inst.fretMarkers}
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
        </div>
      </div>

      {/* Audio bar */}
      <div className="flex items-center gap-3 mt-4 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-opacity disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }}>
          {isPlaying ? '◼' : '▶'}
        </button>
        <span className="text-[10px] text-white/28 uppercase tracking-wide flex-shrink-0">
          {isLoading ? 'Loading samples…' : activeChordPcs ? 'Chord' : 'Scale'}
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {chips.map(({ pc, label: chipLabel }, i) => {
            const color  = NOTE_COLORS[pc];
            const isRoot = activeChordPcs ? pc === activeChordRoot : pc === rootPc;
            return (
              <button
                key={i}
                onClick={() => !isPlaying && playChord([pc], 4, 'block')}
                className="text-[11px] font-bold rounded-lg px-2 py-1 border transition-opacity hover:opacity-80"
                style={{
                  background:  isRoot ? `${color}45` : `${color}18`,
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

      {/* Compare legend */}
      {compareScalePcs && (
        <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <svg width={14} height={14}><circle cx={7} cy={7} r={4} fill="rgba(167,139,250,0.6)"/></svg>
            In both
          </span>
          <span className="flex items-center gap-1">
            <svg width={14} height={14}><circle cx={7} cy={7} r={4} fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.7)" strokeWidth={1.5} strokeDasharray="3 2"/></svg>
            {SCALES[compareMode]?.label} only
          </span>
          <span className="flex items-center gap-1">
            <svg width={14} height={14}><circle cx={7} cy={7} r={6} fill="none" stroke="rgba(251,146,60,0.7)" strokeWidth={1.5} strokeDasharray="3 2"/></svg>
            Current only
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Delete `GuitarFretboard.jsx`**

```bash
git rm src/components/GuitarFretboard.jsx
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no missing-module errors. The output should include `FretboardInstrument` and `instruments` in the bundle. If you see `Cannot find module './GuitarFretboard.jsx'`, check that Step 1 replaced all content of `InstrumentPanel.jsx` correctly (the old import line must be gone).

- [ ] **Step 4: Commit**

```bash
git add src/components/InstrumentPanel.jsx
git commit -m "feat: add violin, ukulele, and alternate guitar tunings"
```

---

## Verification Checklist

After all three tasks:

1. **Piano** tab still works — scale and chord highlighting unchanged
2. **Guitar · Standard** — 6 strings, 15 frets, same as before the change
3. **Guitar · Drop D** — low string label shows 'D', open-string dot on low string is D (pc 2)
4. **Guitar · Open G** — all six open strings show G/D/B notes in the scale
5. **Violin** — 4 strings (E A D G), 12 frets, no tuning row visible
6. **Ukulele · Standard** — 4 strings (A E C G), tuning row visible with Standard and D Tuning options
7. **Ukulele · D Tuning** — strings switch to B F# D A
8. Switching key/scale updates dots on all instruments correctly
9. Compare scale overlay works on violin and ukulele
10. Tuning selection persists after page reload (localStorage keys `co5_guitar_tuning`, `co5_ukulele_tuning`)
