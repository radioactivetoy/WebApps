# Progression & Mobile Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mobile-responsive layout, transpose progression, chord substitution context menu, and metronome click to the Circle of Fifths Explorer.

**Architecture:** Four independent features committed separately. All changes live in existing files — no new files needed. ProgressionBuilder.jsx gains new props from App.jsx (`onTransposeKey`, `playClick`) and new internal state for each feature.

**Tech Stack:** React 18, Vite 5, Tailwind CSS (`md:` breakpoint = 768 px), Tone.js MembraneSynth for click audio.

---

## File Structure

| File | What changes |
|---|---|
| `CircleOf5ths/App.jsx` | Responsive flex classes on lines 215 and 217; `handleTransposeKey`; new props on ProgressionBuilder |
| `CircleOf5ths/src/components/InstrumentPanel.jsx` | `overflow-x-auto` wrapper around the instrument view |
| `CircleOf5ths/src/hooks/useAudio.js` | `playClick()` using MembraneSynth; expose on returned object |
| `CircleOf5ths/src/components/ProgressionBuilder.jsx` | Metronome state + button + playback wiring; transpose popover + logic; SubMenu component + context menu handlers |

---

## Task 1: Mobile Responsive Layout

**Files:**
- Modify: `CircleOf5ths/App.jsx:215,217`
- Modify: `CircleOf5ths/src/components/InstrumentPanel.jsx:149-178`

- [ ] **Step 1: Make the two-column area stack on mobile — App.jsx line 215**

  Current (`App.jsx:215`):
  ```jsx
  <div className="flex gap-5">
  ```

  Change to:
  ```jsx
  <div className="flex flex-col md:flex-row gap-5">
  ```

- [ ] **Step 2: Make the left column full-width on mobile — App.jsx line 217**

  Current (`App.jsx:217`):
  ```jsx
  <div className="flex-shrink-0 flex flex-col gap-4 w-[420px]">
  ```

  Change to:
  ```jsx
  <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-[420px]">
  ```

- [ ] **Step 3: Wrap instrument view in overflow-x-auto — InstrumentPanel.jsx:149**

  Current (`InstrumentPanel.jsx:148-179`):
  ```jsx
  {/* Instrument view */}
  {instrumentMode === 'piano' ? (
    <Piano
      ...
    />
  ) : (
    <div className="mt-1 mb-1">
      ...
    </div>
  )}
  ```

  Change to:
  ```jsx
  {/* Instrument view */}
  <div className="overflow-x-auto">
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
          Guitar · {activeChordPcs ? (activeChordRoot !== undefined ? pcToName(activeChordRoot, isFlat) + ' chord' : 'chord') : scaleLabel}
        </p>
        <GuitarFretboard
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
  ```

- [ ] **Step 4: Verify in browser**

  Run: `cd CircleOf5ths && npm run dev`

  Resize browser window to under 768 px wide. Confirm:
  - Circle, Staff, DiatonicChords, ProgressionBuilder, CommonProgressions, AI Assistant stack vertically (single column)
  - Piano/Guitar do not squash — they scroll horizontally if too wide
  - At ≥ 768 px the two-column layout is unchanged

- [ ] **Step 5: Commit**

  ```bash
  git add CircleOf5ths/App.jsx CircleOf5ths/src/components/InstrumentPanel.jsx
  git commit -m "feat: add mobile-responsive layout with horizontal scroll for instrument"
  ```

---

## Task 2: Metronome Click

**Files:**
- Modify: `CircleOf5ths/src/hooks/useAudio.js`
- Modify: `CircleOf5ths/App.jsx`
- Modify: `CircleOf5ths/src/components/ProgressionBuilder.jsx`

- [ ] **Step 1: Add `playClick` to useAudio.js**

  Add this function before the `return` statement in `useAudio.js` (after `playChord`, before `return`):

  ```js
  function playClick() {
    Tone.start().then(() => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
      }).toDestination();
      synth.triggerAttackRelease('C2', '8n');
      setTimeout(() => synth.dispose(), 500);
    });
  }
  ```

- [ ] **Step 2: Expose `playClick` on the returned object in useAudio.js**

  Current (`useAudio.js:162`):
  ```js
  return { playScale, playChord, stop, isPlaying, isLoading, activePc };
  ```

  Change to:
  ```js
  return { playScale, playChord, playClick, stop, isPlaying, isLoading, activePc };
  ```

- [ ] **Step 3: Pass `playClick` prop to ProgressionBuilder in App.jsx**

  Find the `<ProgressionBuilder` JSX in App.jsx (around line 246). Add one prop:

  Current:
  ```jsx
  <ProgressionBuilder
    ref={progressionBuilderRef}
    activeScalePcs={activeScalePcs}
    scaleMode={scaleMode}
    rootPc={currentKeyInfo.rootPc}
    isFlat={isFlat}
    playChord={audio.playChord}
    onHighlightChord={handleHighlightChord}
    onSequenceChange={setProgressionSequence}
  />
  ```

  Change to:
  ```jsx
  <ProgressionBuilder
    ref={progressionBuilderRef}
    activeScalePcs={activeScalePcs}
    scaleMode={scaleMode}
    rootPc={currentKeyInfo.rootPc}
    isFlat={isFlat}
    playChord={audio.playChord}
    playClick={audio.playClick}
    onHighlightChord={handleHighlightChord}
    onSequenceChange={setProgressionSequence}
  />
  ```

- [ ] **Step 4: Add `playClick` to ProgressionBuilder props and add metronome state**

  Current component signature (`ProgressionBuilder.jsx:261-264`):
  ```jsx
  const ProgressionBuilder = forwardRef(function ProgressionBuilder({
    activeScalePcs, scaleMode, rootPc, isFlat,
    playChord, onHighlightChord, onSequenceChange,
  }, ref) {
  ```

  Change to:
  ```jsx
  const ProgressionBuilder = forwardRef(function ProgressionBuilder({
    activeScalePcs, scaleMode, rootPc, isFlat,
    playChord, playClick, onHighlightChord, onSequenceChange,
  }, ref) {
  ```

  Then add metronome state and ref after the existing `const [loop, setLoop] = useState(true);` line:
  ```js
  const [metronome, setMetronome] = useState(false);
  ```

  Add the click ref alongside the existing `playChordRef`:
  ```js
  const playClickRef   = useRef(playClick);
  playClickRef.current = playClick;
  ```

  (Place this immediately after the existing `playChordRef.current = playChord;` lines, around line 291.)

- [ ] **Step 5: Add 🥁 metronome toggle button to the header row**

  In the header `<div className="flex items-center gap-2 flex-wrap">` section (around `ProgressionBuilder.jsx:525`), add the metronome button next to the Loop button:

  Current (after the Loop button, around line 533):
  ```jsx
          </button>
        </div>
      </div>
  ```

  Change to add the metronome button right after the Loop button:
  ```jsx
          </button>
          <button
            onClick={() => setMetronome(v => !v)}
            title="Metronome click on each chord"
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
            style={metronome
              ? { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(167,139,250,0.9)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
            🥁
          </button>
        </div>
      </div>
  ```

- [ ] **Step 6: Wire metronome click into the playback effect**

  In the playback `useEffect` (around `ProgressionBuilder.jsx:358-359`):

  Current:
  ```js
  highlightRef.current?.({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name });
  playChordRef.current?.(chord.pcs, 4, 'block');
  ```

  Change to:
  ```js
  if (metronome) playClickRef.current?.();
  highlightRef.current?.({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name });
  playChordRef.current?.(chord.pcs, 4, 'block');
  ```

- [ ] **Step 7: Verify in browser**

  - Build a progression with 3+ chords
  - Click ▶ to play — no click sound heard
  - Click 🥁 to activate metronome (button turns violet)
  - Play again — audible click on every chord change
  - Click 🥁 again to deactivate — click sound stops

- [ ] **Step 8: Commit**

  ```bash
  git add CircleOf5ths/src/hooks/useAudio.js CircleOf5ths/App.jsx CircleOf5ths/src/components/ProgressionBuilder.jsx
  git commit -m "feat: add metronome click on chord changes during progression playback"
  ```

---

## Task 3: Transpose Progression

**Files:**
- Modify: `CircleOf5ths/App.jsx`
- Modify: `CircleOf5ths/src/components/ProgressionBuilder.jsx`

- [ ] **Step 1: Add `handleTransposeKey` and `onTransposeKey` prop in App.jsx**

  Add this function in `App.jsx` right after `handleScaleModeChange` (around line 172):

  ```js
  function handleTransposeKey(targetRootPc) {
    const type = scaleMode === 'minor' ? 'minor' : 'major';
    const keyName =
      Object.keys(musicKeys).find(k => musicKeys[k].rootPc === targetRootPc && musicKeys[k].type === type) ??
      Object.keys(musicKeys).find(k => musicKeys[k].rootPc === targetRootPc);
    if (keyName) handleKeySelect(keyName);
  }
  ```

  Then pass it to ProgressionBuilder in the JSX (add alongside the other props):
  ```jsx
  onTransposeKey={handleTransposeKey}
  ```

- [ ] **Step 2: Add `onTransposeKey` to ProgressionBuilder props and `transposeOpen` state**

  Add `onTransposeKey` to the destructured props:
  ```jsx
  const ProgressionBuilder = forwardRef(function ProgressionBuilder({
    activeScalePcs, scaleMode, rootPc, isFlat,
    playChord, playClick, onHighlightChord, onSequenceChange, onTransposeKey,
  }, ref) {
  ```

  Add transpose state after the other useState declarations (e.g., after `customOpen`):
  ```js
  const [transposeOpen, setTransposeOpen] = useState(false);
  ```

- [ ] **Step 3: Add outside-click dismiss for the transpose popover**

  Add this useEffect alongside the other effects (e.g., after the `onSequenceChange` effect):
  ```js
  useEffect(() => {
    if (!transposeOpen) return;
    function close() { setTransposeOpen(false); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [transposeOpen]);
  ```

- [ ] **Step 4: Add `transposeSequence` function**

  Add this function after `togglePlay` (around line 404):
  ```js
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
    onTransposeKey?.(targetRootPc);
    setTransposeOpen(false);
  }
  ```

- [ ] **Step 5: Add Transpose button with popover to the playback controls row**

  The playback controls row (`ProgressionBuilder.jsx:831` area) currently ends with the Copy button. Add the Transpose button with its popover **after** the Copy button and before the closing `</div>` of the controls row:

  Current playback controls row (around line 849-860):
  ```jsx
      <button
        disabled={!sequence.length}
        onClick={() => {
          const text = sequence.map(c => c.name).join(' · ');
          navigator.clipboard.writeText(text);
        }}
        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-opacity disabled:opacity-30 hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        title="Copy progression as text">
        Copy
      </button>
    </div>
  ```

  Change to add the Transpose button after Copy:
  ```jsx
      <button
        disabled={!sequence.length}
        onClick={() => {
          const text = sequence.map(c => c.name).join(' · ');
          navigator.clipboard.writeText(text);
        }}
        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-opacity disabled:opacity-30 hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        title="Copy progression as text">
        Copy
      </button>

      {sequence.length > 0 && (
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setTransposeOpen(v => !v); }}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-80"
            style={transposeOpen
              ? { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(167,139,250,0.9)' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
            ⇅ Transpose
          </button>
          {transposeOpen && (
            <div
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 z-40 rounded-xl p-2"
              style={{ background: 'rgba(20,20,35,0.97)', border: '1px solid rgba(167,139,250,0.25)', minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <p className="text-[8px] font-bold tracking-[2px] uppercase text-white/20 mb-2 px-1">Transpose to root</p>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 12 }, (_, pc) => {
                  const name = pcToName(pc, isFlat);
                  const isCurrent = sequence[0]?.rootPc === pc;
                  return (
                    <button
                      key={pc}
                      onClick={() => transposeSequence(pc)}
                      className="py-1 rounded-lg text-[10px] font-bold transition-all hover:opacity-80"
                      style={isCurrent
                        ? { background: 'rgba(167,139,250,0.3)', border: '1px solid rgba(167,139,250,0.6)', color: '#c4b5fd' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ```

- [ ] **Step 6: Verify in browser**

  - Build a progression in C major (e.g., Cmaj7 – Am7 – Fmaj7 – G7)
  - Click "⇅ Transpose" — popover appears with C highlighted
  - Click G — chord names shift (Gmaj7 – Em7 – Cmaj7 – D7), Circle rotates to G, staff and key labels update
  - Click outside popover — popover closes
  - Click "⇅ Transpose" again — G is now highlighted as current root

- [ ] **Step 7: Commit**

  ```bash
  git add CircleOf5ths/App.jsx CircleOf5ths/src/components/ProgressionBuilder.jsx
  git commit -m "feat: add transpose progression popover that updates key across the whole app"
  ```

---

## Task 4: Chord Substitution Context Menu

**Files:**
- Modify: `CircleOf5ths/src/components/ProgressionBuilder.jsx`

- [ ] **Step 1: Add `subMenu` state and `longPressRef`**

  Add after the `transposeOpen` state:
  ```js
  const [subMenu, setSubMenu] = useState(null); // null | { chordId, x, y }
  const longPressRef = useRef(null);
  ```

- [ ] **Step 2: Add dismiss-on-outside-click effect for the sub menu**

  Add alongside the other effects:
  ```js
  useEffect(() => {
    if (!subMenu) return;
    function dismiss() { setSubMenu(null); }
    document.addEventListener('click', dismiss);
    return () => document.removeEventListener('click', dismiss);
  }, [subMenu]);
  ```

- [ ] **Step 3: Add `computeSubstitutions` and `replaceChord` functions**

  Add after `transposeSequence`:
  ```js
  function computeSubstitutions(chord) {
    const { rootPc: r, pcs } = chord;
    const q = triadQuality(pcs);
    const subs = [];

    // Tritone sub — always applicable, dom7 chord a tritone away
    const triR = (r + 6) % 12;
    subs.push({ label: 'Tritone', rootPc: triR, pcs: [0,4,7,10].map(n=>(triR+n)%12), name: pcToName(triR, isFlat)+'7' });

    // Relative — major↔minor pair a minor 3rd away
    if (q === 'major') {
      const relR = (r + 9) % 12;
      subs.push({ label: 'Relative', rootPc: relR, pcs: [0,3,7].map(n=>(relR+n)%12), name: pcToName(relR, isFlat)+'m' });
    } else if (q === 'minor') {
      const relR = (r + 3) % 12;
      subs.push({ label: 'Relative', rootPc: relR, pcs: [0,4,7].map(n=>(relR+n)%12), name: pcToName(relR, isFlat) });
    }

    // Parallel — same root, opposite quality
    if (q === 'major') {
      subs.push({ label: 'Parallel', rootPc: r, pcs: [0,3,7].map(n=>(r+n)%12), name: pcToName(r, isFlat)+'m' });
    } else if (q === 'minor') {
      subs.push({ label: 'Parallel', rootPc: r, pcs: [0,4,7].map(n=>(r+n)%12), name: pcToName(r, isFlat) });
    }

    // bVI sub — major triad built on b6 of current root
    const bVIr = (r + 8) % 12;
    subs.push({ label: 'bVI', rootPc: bVIr, pcs: [0,4,7].map(n=>(bVIr+n)%12), name: pcToName(bVIr, isFlat) });

    // Sus4 — same root
    subs.push({ label: 'Sus4', rootPc: r, pcs: [0,5,7].map(n=>(r+n)%12), name: pcToName(r, isFlat)+'sus4' });

    return subs;
  }

  function replaceChord(id, newChord) {
    setSequence(s => s.map(c => c.id === id ? { ...newChord, id } : c));
    setSubMenu(null);
  }
  ```

- [ ] **Step 4: Add context menu handlers on each sequence chip**

  In the sequence map (around `ProgressionBuilder.jsx:699`), the chip `<div>` currently has `draggable`, `onDragStart`, and `onDragEnd`. Add three more handlers to that same chip div:

  ```jsx
  <div
    draggable
    onDragStart={e => startChipDrag(e, idx)}
    onDragEnd={endDrag}
    onContextMenu={e => { e.preventDefault(); setSubMenu({ chordId: chord.id, x: e.clientX, y: e.clientY }); }}
    onPointerDown={e => {
      longPressRef.current = setTimeout(() => {
        longPressRef.current = null;
        setSubMenu({ chordId: chord.id, x: e.clientX, y: e.clientY });
      }, 500);
    }}
    onPointerUp={() => { clearTimeout(longPressRef.current); longPressRef.current = null; }}
    onPointerMove={() => { clearTimeout(longPressRef.current); longPressRef.current = null; }}
    className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold select-none transition-all"
    style={{ ... }}>
  ```

  The `className` and `style` props are unchanged — just add the five new event handlers.

- [ ] **Step 5: Add the inline SubMenu component and render it**

  Add this `SubMenu` function inside `ProgressionBuilder` (after `DropGap`), before the `return` statement:

  ```jsx
  function SubMenu() {
    if (!subMenu) return null;
    const chord = sequence.find(c => c.id === subMenu.chordId);
    if (!chord) return null;
    const subs = computeSubstitutions(chord);
    const left = Math.min(subMenu.x, window.innerWidth - 240);
    return (
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'fixed', top: subMenu.y, left, zIndex: 50, maxWidth: 220,
          background: 'rgba(20,20,35,0.97)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, padding: '8px 8px 4px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <p className="text-[8px] font-bold tracking-[2px] uppercase text-white/20 mb-2 px-1">{chord.name}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {subs.map((sub, i) => {
            const color = NOTE_COLORS[sub.rootPc];
            return (
              <button
                key={i}
                onClick={() => replaceChord(chord.id, sub)}
                className="flex flex-col items-center px-2 py-1 rounded-lg border text-left transition-all hover:opacity-80"
                style={{ background: `${color}14`, borderColor: `${color}35` }}>
                <span className="text-[8px] font-bold text-white/30 leading-none mb-0.5">{sub.label}</span>
                <span className="text-[11px] font-bold leading-none" style={{ color }}>{sub.name}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => { removeChord(chord.id); setSubMenu(null); }}
          className="w-full text-[10px] font-semibold py-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}>
          ✕ Remove
        </button>
      </div>
    );
  }
  ```

  Then render `<SubMenu />` at the very bottom of the component's returned JSX, just before the final closing `</div>`:

  Current end of return (`ProgressionBuilder.jsx:904`):
  ```jsx
      </div>
    </div>
  );
  ```

  Change to:
  ```jsx
      </div>
      <SubMenu />
    </div>
  );
  ```

- [ ] **Step 6: Verify in browser**

  - Build a progression with 3+ chords
  - Right-click a chord chip — context menu appears with substitution options
  - Click "Tritone" — chord is replaced in-place
  - On a touch/mobile device (or by simulating): hold finger on a chord chip for 500 ms — same menu appears
  - Click outside the menu — it dismisses
  - Click "✕ Remove" — chord is removed from the sequence

- [ ] **Step 7: Commit**

  ```bash
  git add CircleOf5ths/src/components/ProgressionBuilder.jsx
  git commit -m "feat: add chord substitution context menu (right-click / long-press)"
  ```

---

## Self-Review Checklist

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Below 768 px: single column stacking | Task 1, Steps 1–2 |
| Piano/Guitar horizontal scroll | Task 1, Step 3 |
| Metronome toggle button in header | Task 2, Step 5 |
| Audible click on each chord change | Task 2, Step 6 |
| "⇅ Transpose" button, visible when sequence > 0 | Task 3, Step 5 |
| Popover with 12 chromatic notes, current root highlighted | Task 3, Step 5 |
| Popover closes on selection and on outside click | Task 3, Steps 3 + 5 |
| Transpose shifts all chord rootPc/pcs/name | Task 3, Step 4 |
| Transpose calls onTransposeKey to update Circle + staff + labels | Task 3, Steps 1 + 4 |
| Context menu on right-click | Task 4, Step 4 |
| Context menu on 500 ms long-press | Task 4, Step 4 |
| Six substitution types (Tritone, Relative, Parallel, bVI, Sus4, Remove) | Task 4, Step 3 |
| Clicking substitution replaces chord in-place | Task 4, Step 3 + 5 |
| Menu positioned at cursor, clamped to viewport | Task 4, Step 5 |
| Dismiss on outside click | Task 4, Step 2 |

**No new files required** — confirmed.
**No changes to musicTheory.js, gemini.js, or other components** — confirmed.
