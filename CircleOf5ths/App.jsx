import React, { useState, useEffect, useMemo } from 'react';
import { musicKeys, circleSlices, SCALES, computeDrawScale, buildDiatonicChords, pcToName } from './src/data/musicTheory.js';
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

export default function App() {
  const [selectedKey, setSelectedKey]                   = useState('C');
  const [selectedChordDegree, setSelectedChordDegree]   = useState(null);
  const [customChordHighlight, setCustomChordHighlight] = useState(null);
  const [chordVariant, setChordVariant]                 = useState('triad');
  const [instrumentMode, setInstrumentMode]             = useState('piano');
  const [labelMode, setLabelMode]                       = useState('notes');
  const [scaleMode, setScaleMode]                       = useState('major');
  const [rotationAngle, setRotationAngle]               = useState(0);

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

  // Only compute diatonic chords for 7-note scales
  const is7Note = activeScalePcs.length === 7;
  const diatonicChords = is7Note ? buildDiatonicChords(activeScalePcs, isFlat, 'triad') : [];

  const activeChord = selectedChordDegree !== null
    ? buildDiatonicChords(activeScalePcs, isFlat, chordVariant)[selectedChordDegree]
    : null;
  const activePcs   = customChordHighlight?.pcs  || activeChord?.pcs  || null;
  const activeRoot  = customChordHighlight ? customChordHighlight.rootPc : activeChord?.rootPc;
  const activeName  = customChordHighlight ? customChordHighlight.name  : activeChord?.name;

  function handleKeySelect(key) {
    setSelectedKey(key);
  }

  function handleChordSelect(degree) {
    setSelectedChordDegree(degree);
    setCustomChordHighlight(null);
    setChordVariant('triad');
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
      <main className="max-w-[1350px] mx-auto px-6 py-5 flex gap-5">
        {/* Left column */}
        <div className="flex-shrink-0 flex flex-col gap-4 w-[420px]">
          <Circle
            selectedKey={selectedKey}
            onKeySelect={handleKeySelect}
            rotationAngle={rotationAngle}
            parentKeyName={parentKeyName}
            scaleMode={scaleMode}
          />
          <ScaleFormulaStrip scaleMode={scaleMode} />
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Staff
            currentKeyInfo={currentKeyInfo}
            activeDrawScale={activeDrawScale}
            scaleLabel={scaleLabel}
            keySignature={parentKeyName ? musicKeys[parentKeyName] : currentKeyInfo}
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
            scaleLabel={scaleLabel}
          />
          <DiatonicChords
            activeScalePcs={activeScalePcs}
            scaleMode={scaleMode}
            rootPc={currentKeyInfo.rootPc}
            isFlat={isFlat}
            selectedChordDegree={selectedChordDegree}
            onChordSelect={handleChordSelect}
            chordVariant={chordVariant}
            onChordVariantChange={setChordVariant}
            onHighlightChord={handleHighlightChord}
          />
          <CommonProgressions
            scaleMode={scaleMode}
            diatonicChords={diatonicChords}
            onChordSelect={handleProgressionStep}
          />
          <AIAssistant
            currentKeyInfo={currentKeyInfo}
            scaleLabel={scaleLabel}
            scaleMode={scaleMode}
            activeScalePcs={activeScalePcs}
            isFlat={isFlat}
            parentKeyName={parentKeyName}
            onHighlightChord={handleHighlightChord}
          />
        </div>
      </main>
    </div>
  );
}
