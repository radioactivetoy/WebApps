# Progression & Mobile Features Design

> **For agentic workers:** implement via `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

**Goal:** Add transpose, chord substitution menu, metronome click, and mobile-responsive layout to the Circle of Fifths Explorer.

**Scope:** Four independent features, each self-contained. All changes live in existing files — no new top-level files required.

---

## 1. Mobile Layout

### What changes
- `App.jsx` — make the two-column main content area responsive
- `InstrumentPanel.jsx` — wrap the instrument (Piano/Guitar) in a horizontal-scroll container on narrow screens

### Layout rules
- Below `md` (768 px): single column, panels stack vertically in this order:
  1. Circle of Fifths
  2. ScaleFormulaStrip + Staff
  3. DiatonicChords
  4. ProgressionBuilder (collapsible, default open)
  5. Common Progressions (collapsible, default closed)
  6. AI Assistant (collapsible, default closed)
- At `md` and above: existing two-column layout unchanged
- The Piano SVG already uses a `viewBox`; wrap it in `overflow-x-auto` so it scrolls horizontally rather than squashing on narrow screens

### Tailwind changes (App.jsx)
```
// two-column wrapper
<div className="flex gap-5">
→ <div className="flex flex-col md:flex-row gap-5">

// left column
<div className="flex-shrink-0 flex flex-col gap-4 w-[420px]">
→ <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-[420px]">
```

### InstrumentPanel.jsx
Wrap the `<Piano />` and `<GuitarFretboard />` render output in:
```jsx
<div className="overflow-x-auto">
  {/* existing instrument JSX */}
</div>
```

---

## 2. Transpose Progression

### Where it lives
Inside `ProgressionBuilder.jsx`, in the playback controls row (alongside ▶, Clear, chord count, Copy).

### UI
A single small **"⇅ Transpose"** button in the playback controls row (next to Clear and Copy). Visible only when `sequence.length > 0`. Clicking it toggles a compact popover anchored below the button showing the 12 chromatic note buttons. After the user picks a target root the popover closes automatically. Clicking outside also closes it.

```
[ ▶ ] [ Clear ] [ 3 chords ] [ Copy ] [ ⇅ Transpose ]
                                              ↓ (popover)
                                       [C][C#][D][D#][E][F]
                                       [F#][G][G#][A][A#][B]
```

State: `const [transposeOpen, setTransposeOpen] = useState(false)`.  
Popover is `position: absolute` relative to a wrapper `div` on the button, z-index 40.  
Current first-chord root is highlighted in the picker so the user can see where they are.

### Logic
Transpose does two things in one action:
1. Shifts all chord objects in the sequence (rootPc, pcs, name) by the offset.
2. Calls `onTransposeKey(targetRootPc)` so App.jsx navigates to the matching key — this propagates the new root to the Circle, staff key signature, DiatonicChords grid, piano, KeyInfoBar, and RootPicker automatically via the existing key-selection flow.

```js
// ProgressionBuilder.jsx
function transposeSequence(targetRootPc) {
  const firstChord = sequence[0];
  if (!firstChord) return;
  const offset = (targetRootPc - firstChord.rootPc + 12) % 12;
  if (offset === 0) { setTransposeOpen(false); return; }
  setSequence(seq => seq.map(chord => {
    const newRoot = (chord.rootPc + offset) % 12;
    const oldRootName = pcToName(chord.rootPc, isFlat);
    const quality = chord.name.startsWith(oldRootName)
      ? chord.name.slice(oldRootName.length)
      : chord.name.replace(/^[A-G][#b]?/, '');
    return { ...chord, rootPc: newRoot, pcs: chord.pcs.map(pc => (pc + offset) % 12), name: pcToName(newRoot, isFlat) + quality };
  }));
  onTransposeKey?.(targetRootPc);  // updates Circle, staff, piano, etc.
  setTransposeOpen(false);
}
```

```js
// App.jsx — new handler passed as onTransposeKey prop
function handleTransposeKey(targetRootPc) {
  // Find a musicKeys entry matching rootPc + current mode (major/minor)
  const type = scaleMode === 'minor' ? 'minor' : 'major';
  const keyName =
    Object.keys(musicKeys).find(k => musicKeys[k].rootPc === targetRootPc && musicKeys[k].type === type) ??
    Object.keys(musicKeys).find(k => musicKeys[k].rootPc === targetRootPc);
  if (keyName) handleKeySelect(keyName);
}
```

`handleKeySelect` already triggers the rotation animation, resets chord selection, and updates all dependents — no extra wiring needed.
```

---

## 3. Chord Substitution Context Menu

### What it is
A floating panel that appears when the user right-clicks (desktop) or long-presses (mobile) a chord chip in the sequence. It shows substitution options for that chord. Clicking a substitution replaces the chord in place. Clicking outside dismisses.

### State (in ProgressionBuilder)
```js
const [subMenu, setSubMenu] = useState(null);
// null | { chordId, x, y }
```

### Trigger
- `onContextMenu` on each chip `<div>` — `e.preventDefault(); setSubMenu({ chordId: chord.id, x: e.clientX, y: e.clientY })`
- Long-press: `useRef` timer, fire after 500 ms on `onPointerDown`, cancel on `onPointerUp`/`onPointerMove`
- Dismiss: click on `document` (useEffect cleanup)

### Substitutions computed per chord
Given `chord` (the target):

| Name | Rule | Example (Cmaj7) |
|---|---|---|
| Tritone sub | rootPc + 6, dom7 | F#7 |
| Relative | rootPc ± 3 (major → +9, minor → +3), same quality flipped | Am |
| Parallel | same root, flip maj↔min | Cm |
| bVI sub | rootPc + 8, major triad | Ab |
| Sus4 | same root, sus4 | Csus4 |
| ✕ Remove | removes the chord from the sequence | — |

Each substitution shows as a colored chip. Clicking it calls `replaceChord(chordId, substitutionChord)`.

```js
function replaceChord(id, newChord) {
  setSequence(s => s.map(c => c.id === id ? { ...newChord, id } : c));
  setSubMenu(null);
}
```

### Positioning
The menu `<div>` is `position: fixed` at `{ top: subMenu.y, left: subMenu.x }` with a max-width of 220px, z-index 50. If it would overflow the right edge, flip left.

### Implementation location
Inline `SubMenu` component inside `ProgressionBuilder.jsx`. Rendered at the bottom of the outer container via a `useEffect`-controlled portal or just a fixed-position div inside the component (simpler, no portal needed since it's fixed-position).

---

## 4. Metronome Click

### What it is
An audible click on each chord change during playback. Toggled by a button in the ProgressionBuilder header.

### Audio
New function in `useAudio.js`:
```js
function playClick() {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
  }).toDestination();
  synth.triggerAttackRelease('C2', '8n');
  setTimeout(() => synth.dispose(), 500);
}
```
Exposed via the `audio` object returned from `useAudio`: `audio.playClick`.

### UI
A small `🥁` toggle button in the ProgressionBuilder header row (next to the BPM slider). Active state uses the same violet style as the Loop button.

```jsx
<button onClick={() => setMetronome(v => !v)} ... >
  🥁
</button>
```

### Wiring
In the playback `useEffect` in `ProgressionBuilder.jsx`, before playing a chord:
```js
if (metronome) playClickRef.current?.();
playChordRef.current?.(chord.pcs, 4, 'block');
```

`playClickRef` is a stable ref to `audio.playClick`, updated each render like `playChordRef`.

---

## File Change Summary

| File | Changes |
|---|---|
| `App.jsx` | Responsive flex classes on main layout and left column; `handleTransposeKey` handler; pass `onTransposeKey` prop to ProgressionBuilder |
| `src/components/InstrumentPanel.jsx` | `overflow-x-auto` wrapper on instrument output |
| `src/components/ProgressionBuilder.jsx` | Transpose UI + logic; SubMenu component + context menu state/handlers; metronome toggle state + wiring |
| `src/hooks/useAudio.js` | Add `playClick()` function, expose on returned object |

No new files. No changes to `musicTheory.js`, `gemini.js`, or any other component.

---

## Non-Goals
- Time-signature support (metronome clicks only on chord change, not subdivided beats)
- Chord substitution for AI-generated chords (only sequence chips)
- Transpose that auto-selects a new key in the Circle of Fifths (the app key stays, only the progression shifts)
- Offline / PWA support
