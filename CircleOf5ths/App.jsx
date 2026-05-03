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
  const [selectedKey, setSelectedKey]                   = useState('C');
  const [selectedChordDegree, setSelectedChordDegree]   = useState(null);
  const [customChordHighlight, setCustomChordHighlight] = useState(null);
  const [chordType, setChordType]                       = useState('triad');
  const [instrumentMode, setInstrumentMode]             = useState('piano');
  const [labelMode, setLabelMode]                       = useState('notes');
  const [darkMode, setDarkMode]                         = useState(true);
  const [rotationAngle, setRotationAngle]               = useState(0);

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
    const thirdPc   = currentKeyInfo.scalePcs[(i + 2) % 7];
    const fifthPc   = currentKeyInfo.scalePcs[(i + 4) % 7];
    const seventhPc = currentKeyInfo.scalePcs[(i + 6) % 7];
    const pcs = chordType === 'triad'
      ? [rootPc, thirdPc, fifthPc]
      : [rootPc, thirdPc, fifthPc, seventhPc];
    return { degree: i, numeral, name, pcs, rootPc };
  });

  const activeChord = selectedChordDegree !== null ? diatonicChords[selectedChordDegree] : null;
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
