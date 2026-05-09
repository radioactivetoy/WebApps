import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

function CollapsiblePanel({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ background: open ? 'transparent' : 'rgba(255,255,255,0.04)', border: open ? 'none' : '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-[9px] font-bold tracking-[2px] uppercase text-white/25">{title}</span>
        <span className="text-white/20 text-[10px] leading-none">{open ? '▲' : '▼'}</span>
      </button>
      {open && children}
    </div>
  );
}
import { musicKeys, circleSlices, SCALES, computeDrawScale, buildDiatonicChords, pcToName, getColorNotePcs } from './src/data/musicTheory.js';
import { useAudio } from './src/hooks/useAudio.js';
import Header from './src/components/Header.jsx';
import KeyInfoBar from './src/components/KeyInfoBar.jsx';
import Circle from './src/components/Circle.jsx';
import Staff from './src/components/Staff.jsx';
import InstrumentPanel from './src/components/InstrumentPanel.jsx';
import DiatonicChords from './src/components/DiatonicChords.jsx';
import AIAssistant from './src/components/AIAssistant.jsx';
import ScaleSelector from './src/components/ScaleSelector.jsx';
import RootPicker from './src/components/RootPicker.jsx';
import ScaleFormulaStrip from './src/components/ScaleFormulaStrip.jsx';
import CommonProgressions from './src/components/CommonProgressions.jsx';
import ProgressionBuilder from './src/components/ProgressionBuilder.jsx';

export default function App() {
  const audio = useAudio();
  const [selectedKey, setSelectedKey]                   = useState('C');
  const [selectedChordDegree, setSelectedChordDegree]   = useState(null);
  const [customChordHighlight, setCustomChordHighlight] = useState(null);
  const [chordVariant, setChordVariant]                 = useState('triad');
  const [instrumentMode, setInstrumentMode]             = useState(() => localStorage.getItem('co5_instrument') || 'piano');
  const [labelMode, setLabelMode]                       = useState('notes');
  const [scaleMode, setScaleMode]                       = useState('major');
  const [rotationAngle, setRotationAngle]               = useState(0);
  const [progressionSequence, setProgressionSequence]   = useState([]);
  const progressionBuilderRef                            = useRef(null);

  useEffect(() => { localStorage.setItem('co5_instrument', instrumentMode); }, [instrumentMode]);

  const currentKeyInfo = musicKeys[selectedKey];
  const selectedIndex = circleSlices.findIndex(
    s => s.major === selectedKey || s.minor === selectedKey
  );

  // Compute active scale pitch classes from root + mode intervals
  const activeScalePcs = useMemo(() =>
    SCALES[scaleMode].intervals.map(i => (currentKeyInfo.rootPc + i) % 12),
    [scaleMode, currentKeyInfo.rootPc]
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

  // Enharmonic preference follows the parent key for modal scales
  const isFlat = (parentKeyName ? musicKeys[parentKeyName] : currentKeyInfo).accType === 'flat';

  // Draw scale (note names with octaves) for Staff
  const activeDrawScale = useMemo(() =>
    (scaleMode === 'major' || scaleMode === 'minor')
      ? currentKeyInfo.drawScale
      : computeDrawScale(currentKeyInfo.rootPc, activeScalePcs, isFlat),
    [scaleMode, currentKeyInfo, activeScalePcs, isFlat]
  );

  const scaleLabel = `${currentKeyInfo.label.split(' ')[0]} ${SCALES[scaleMode].label}`;

  const colorNotePcs = useMemo(
    () => getColorNotePcs(scaleMode, currentKeyInfo.rootPc),
    [scaleMode, currentKeyInfo.rootPc]
  );

  useEffect(() => {
    setSelectedChordDegree(null);
    setCustomChordHighlight(null);
    setChordVariant('triad');
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

  // Only compute diatonic chords for 7-note scales
  const diatonicChords = useMemo(
    () => activeScalePcs.length === 7 ? buildDiatonicChords(activeScalePcs, isFlat, 'triad') : [],
    [activeScalePcs, isFlat]
  );

  const diatonicChordsVariant = useMemo(
    () => activeScalePcs.length === 7 ? buildDiatonicChords(activeScalePcs, isFlat, chordVariant) : [],
    [activeScalePcs, isFlat, chordVariant]
  );

  const activeChord = selectedChordDegree !== null ? diatonicChordsVariant[selectedChordDegree] : null;
  const activePcs   = customChordHighlight?.pcs  || activeChord?.pcs  || null;
  const activeRoot  = customChordHighlight ? customChordHighlight.rootPc : activeChord?.rootPc;
  const activeName  = customChordHighlight ? customChordHighlight.name  : activeChord?.name;

  function handleKeySelect(key) {
    setSelectedKey(key);
  }

  function handleChordSelect(degree) {
    setSelectedChordDegree(degree);
    setCustomChordHighlight(null);
  }

  function handleHighlightChord(info) {
    setCustomChordHighlight(info);
    setSelectedChordDegree(null);
  }

  function handleProgressionStep(degree) {
    if (degree === null) { setSelectedChordDegree(null); return; }
    setSelectedChordDegree(degree);
    setCustomChordHighlight(null);
  }

  function handleScaleModeChange(mode) {
    setScaleMode(mode);
    setSelectedChordDegree(null);
    setCustomChordHighlight(null);
    setChordVariant('triad');
    // parentKeyName memo is stale here (mode state not yet applied), so we recompute
    const offset = SCALES[mode].parentOffset;
    if (offset !== null) {
      const parentPc = (currentKeyInfo.rootPc + offset) % 12;
      const parentKey = Object.keys(musicKeys).find(
        k => musicKeys[k].type === 'major' && musicKeys[k].rootPc === parentPc
      );
      const parentIdx = parentKey ? circleSlices.findIndex(s => s.major === parentKey) : -1;
      if (parentIdx !== -1) {
        setRotationAngle(prev => {
          const cur = ((prev % 360) + 360) % 360;
          const target = parentIdx * 30;
          let diff = target - cur;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          return prev + diff;
        });
      }
    } else {
      setRotationAngle(prev => {
        const cur = ((prev % 360) + 360) % 360;
        const target = selectedIndex * 30;
        let diff = target - cur;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return prev + diff;
      });
    }
  }

  return (
    <div className="min-h-screen font-sans text-white" style={{ background: 'var(--bg-gradient)' }}>
      <Header />
      <KeyInfoBar
        selectedKey={selectedKey}
        currentKeyInfo={currentKeyInfo}
        parentKeyName={parentKeyName}
        scaleMode={scaleMode}
        onKeySelect={handleKeySelect}
      />
      <RootPicker
        rootPc={currentKeyInfo.rootPc}
        scaleMode={scaleMode}
        isFlat={isFlat}
        onKeySelect={handleKeySelect}
      />
      <ScaleSelector
        scaleMode={scaleMode}
        onScaleModeChange={handleScaleModeChange}
        rootPc={currentKeyInfo.rootPc}
      />
      <main className="max-w-[1350px] mx-auto px-6 py-5 flex flex-col gap-5">
        {/* Full-width instrument panel */}
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
          scaleLabel={scaleLabel}
          colorNotePcs={colorNotePcs}
          audio={audio}
        />

        {/* Two-column area */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Left column */}
          <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-[420px]">
            <Circle
              selectedKey={selectedKey}
              onKeySelect={handleKeySelect}
              rotationAngle={rotationAngle}
              parentKeyName={parentKeyName}
              scaleMode={scaleMode}
            />
            <ScaleFormulaStrip scaleMode={scaleMode} />
            <Staff
              currentKeyInfo={currentKeyInfo}
              activeDrawScale={activeDrawScale}
              scaleLabel={scaleLabel}
              keySignature={parentKeyName ? musicKeys[parentKeyName] : currentKeyInfo}
            />
          </div>

          {/* Right column */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <DiatonicChords
              activeScalePcs={activeScalePcs}
              scaleMode={scaleMode}
              isFlat={isFlat}
              selectedChordDegree={selectedChordDegree}
              onChordSelect={handleChordSelect}
              chordVariant={chordVariant}
              onChordVariantChange={setChordVariant}
            />
            <CollapsiblePanel title="Progression Builder">
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
            </CollapsiblePanel>
            <CollapsiblePanel title="Common Progressions" defaultOpen={false}>
              <CommonProgressions
                scaleMode={scaleMode}
                diatonicChords={diatonicChords}
                onChordSelect={handleProgressionStep}
                playChord={audio.playChord}
                currentKeyInfo={currentKeyInfo}
                activeScalePcs={activeScalePcs}
                isFlat={isFlat}
                parentKeyName={parentKeyName}
                onHighlightChord={handleHighlightChord}
              />
            </CollapsiblePanel>
            <CollapsiblePanel title="AI Assistant" defaultOpen={false}>
              <AIAssistant
                currentKeyInfo={currentKeyInfo}
                scaleLabel={scaleLabel}
                scaleMode={scaleMode}
                activeScalePcs={activeScalePcs}
                isFlat={isFlat}
                parentKeyName={parentKeyName}
                onHighlightChord={handleHighlightChord}
                progressionSequence={progressionSequence}
                diatonicChords={diatonicChords}
                onAddToProgression={(chord) => progressionBuilderRef.current?.addChord(chord)}
              />
            </CollapsiblePanel>
          </div>
        </div>
      </main>
    </div>
  );
}
