import React, { useState } from 'react';

// --- MUSIC THEORY DATA ---
const musicKeys = {
  'C': { type: 'major', rootPc: 0, scalePcs: [0,2,4,5,7,9,11], accidentals: 0, accType: 'none', drawScale: ['C4','D4','E4','F4','G4','A4','B4','C5'], label: 'C Major' },
  'G': { type: 'major', rootPc: 7, scalePcs: [7,9,11,0,2,4,6], accidentals: 1, accType: 'sharp', drawScale: ['G4','A4','B4','C5','D5','E5','F5','G5'], label: 'G Major' },
  'D': { type: 'major', rootPc: 2, scalePcs: [2,4,6,7,9,11,1], accidentals: 2, accType: 'sharp', drawScale: ['D4','E4','F4','G4','A4','B4','C5','D5'], label: 'D Major' },
  'A': { type: 'major', rootPc: 9, scalePcs: [9,11,1,2,4,6,8], accidentals: 3, accType: 'sharp', drawScale: ['A3','B3','C4','D4','E4','F4','G4','A4'], label: 'A Major' },
  'E': { type: 'major', rootPc: 4, scalePcs: [4,6,8,9,11,1,3], accidentals: 4, accType: 'sharp', drawScale: ['E4','F4','G4','A4','B4','C5','D5','E5'], label: 'E Major' },
  'B': { type: 'major', rootPc: 11, scalePcs: [11,1,3,4,6,8,10], accidentals: 5, accType: 'sharp', drawScale: ['B3','C4','D4','E4','F4','G4','A4','B4'], label: 'B Major' },
  'F#': { type: 'major', rootPc: 6, scalePcs: [6,8,10,11,1,3,5], accidentals: 6, accType: 'sharp', drawScale: ['F4','G4','A4','B4','C5','D5','E5','F5'], label: 'F# Major' },
  'Db': { type: 'major', rootPc: 1, scalePcs: [1,3,5,6,8,10,0], accidentals: 5, accType: 'flat', drawScale: ['D4','E4','F4','G4','A4','B4','C5','D5'], label: 'Db Major' },
  'Ab': { type: 'major', rootPc: 8, scalePcs: [8,10,0,1,3,5,7], accidentals: 4, accType: 'flat', drawScale: ['A3','B3','C4','D4','E4','F4','G4','A4'], label: 'Ab Major' },
  'Eb': { type: 'major', rootPc: 3, scalePcs: [3,5,7,8,10,0,2], accidentals: 3, accType: 'flat', drawScale: ['E4','F4','G4','A4','B4','C5','D5','E5'], label: 'Eb Major' },
  'Bb': { type: 'major', rootPc: 10, scalePcs: [10,0,2,3,5,7,9], accidentals: 2, accType: 'flat', drawScale: ['B3','C4','D4','E4','F4','G4','A4','B4'], label: 'Bb Major' },
  'F': { type: 'major', rootPc: 5, scalePcs: [5,7,9,10,0,2,4], accidentals: 1, accType: 'flat', drawScale: ['F4','G4','A4','B4','C5','D5','E5','F5'], label: 'F Major' },

  'Am': { type: 'minor', rootPc: 9, scalePcs: [9,11,0,2,4,5,7], accidentals: 0, accType: 'none', drawScale: ['A3','B3','C4','D4','E4','F4','G4','A4'], label: 'A Minor' },
  'Em': { type: 'minor', rootPc: 4, scalePcs: [4,6,7,9,11,0,2], accidentals: 1, accType: 'sharp', drawScale: ['E4','F4','G4','A4','B4','C5','D5','E5'], label: 'E Minor' },
  'Bm': { type: 'minor', rootPc: 11, scalePcs: [11,1,2,4,6,7,9], accidentals: 2, accType: 'sharp', drawScale: ['B3','C4','D4','E4','F4','G4','A4','B4'], label: 'B Minor' },
  'F#m': { type: 'minor', rootPc: 6, scalePcs: [6,8,9,11,1,2,4], accidentals: 3, accType: 'sharp', drawScale: ['F4','G4','A4','B4','C5','D5','E5','F5'], label: 'F# Minor' },
  'C#m': { type: 'minor', rootPc: 1, scalePcs: [1,3,4,6,8,9,11], accidentals: 4, accType: 'sharp', drawScale: ['C4','D4','E4','F4','G4','A4','B4','C5'], label: 'C# Minor' },
  'G#m': { type: 'minor', rootPc: 8, scalePcs: [8,10,11,1,3,4,6], accidentals: 5, accType: 'sharp', drawScale: ['G3','A3','B3','C4','D4','E4','F4','G4'], label: 'G# Minor' },
  'Ebm': { type: 'minor', rootPc: 3, scalePcs: [3,5,6,8,10,11,1], accidentals: 6, accType: 'flat', drawScale: ['E4','F4','G4','A4','B4','C5','D5','E5'], label: 'Eb Minor' },
  'Bbm': { type: 'minor', rootPc: 10, scalePcs: [10,0,1,3,5,6,8], accidentals: 5, accType: 'flat', drawScale: ['B3','C4','D4','E4','F4','G4','A4','B4'], label: 'Bb Minor' },
  'Fm': { type: 'minor', rootPc: 5, scalePcs: [5,7,8,10,0,1,3], accidentals: 4, accType: 'flat', drawScale: ['F4','G4','A4','B4','C5','D5','E5','F5'], label: 'F Minor' },
  'Cm': { type: 'minor', rootPc: 0, scalePcs: [0,2,3,5,7,8,10], accidentals: 3, accType: 'flat', drawScale: ['C4','D4','E4','F4','G4','A4','B4','C5'], label: 'C Minor' },
  'Gm': { type: 'minor', rootPc: 7, scalePcs: [7,9,10,0,2,3,5], accidentals: 2, accType: 'flat', drawScale: ['G4','A4','B4','C5','D5','E5','F5','G5'], label: 'G Minor' },
  'Dm': { type: 'minor', rootPc: 2, scalePcs: [2,4,5,7,9,10,0], accidentals: 1, accType: 'flat', drawScale: ['D4','E4','F4','G4','A4','B4','C5','D5'], label: 'D Minor' }
};

// Circle wedges configuration
const circleSlices = [
  { major: 'C', minor: 'Am' },
  { major: 'G', minor: 'Em' },
  { major: 'D', minor: 'Bm' },
  { major: 'A', minor: 'F#m' },
  { major: 'E', minor: 'C#m' },
  { major: 'B', minor: 'G#m' },
  { major: 'F#', minor: 'Ebm', displayMajor: 'F#/Gb', displayMinor: 'D#m/Ebm' },
  { major: 'Db', minor: 'Bbm' },
  { major: 'Ab', minor: 'Fm' },
  { major: 'Eb', minor: 'Cm' },
  { major: 'Bb', minor: 'Gm' },
  { major: 'F',  minor: 'Dm' },
];

// Map notes to Y coordinates on the staff
const noteYBase = {
  'G5': 25, 'F5': 30, 'E5': 35, 'D5': 40, 'C5': 45, 
  'B4': 50, 'A4': 55, 'G4': 60, 'F4': 65, 'E4': 70, 
  'D4': 75, 'C4': 80, 'B3': 85, 'A3': 90, 'G3': 95
};

const pcToName = (pc, isFlat) => {
  const sharpNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const flatNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  return isFlat ? flatNames[pc] : sharpNames[pc];
};

// Helper to calculate the musical interval relative to a root note
const getInterval = (pc, rootPc) => {
  const diff = (pc - rootPc + 12) % 12;
  const intervals = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
  return intervals[diff];
};

// Helper to convert arbitrary note strings from AI to pitch classes
const noteToPc = (noteStr) => {
  if (!noteStr) return null;
  const map = {
    'C': 0, 'B#': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4, 'F': 5, 'E#': 5,
    'F#': 6, 'Gb': 6, 'G': 7,
    'G#': 8, 'Ab': 8, 'A': 9,
    'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11
  };
  const clean = noteStr.trim().replace(/[0-9]/g, ''); // Remove octaves if any
  const formatted = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  return map[formatted] !== undefined ? map[formatted] : null;
};

const majorNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const minorNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
const major7Numerals = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'];
const minor7Numerals = ['im7', 'iiø7', 'IIImaj7', 'iv7', 'v7', 'VImaj7', 'VII7'];
const majorIntervalNames = ['Root', 'Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Major 6th', 'Major 7th'];
const minorIntervalNames = ['Root', 'Major 2nd', 'Minor 3rd', 'Perfect 4th', 'Perfect 5th', 'Minor 6th', 'Minor 7th'];
const majorSteps = 'W - W - H - W - W - W - H';
const minorSteps = 'W - H - W - W - H - W - W';

// Calculate background sector path for the diatonic chord grouping (spans 3 wedges / 90 degrees)
const diatonicSectorPath = (() => {
  const startRad = -135 * (Math.PI / 180);
  const endRad = -45 * (Math.PI / 180);
  const rOuter = 188; // Just outside the major nodes
  const rInner = 72;  // Just inside the minor nodes
  const x1o = rOuter * Math.cos(startRad);
  const y1o = rOuter * Math.sin(startRad);
  const x2o = rOuter * Math.cos(endRad);
  const y2o = rOuter * Math.sin(endRad);
  const x1i = rInner * Math.cos(startRad);
  const y1i = rInner * Math.sin(startRad);
  const x2i = rInner * Math.cos(endRad);
  const y2i = rInner * Math.sin(endRad);
  return `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${rOuter} ${rOuter} 0 0 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 0 0 ${x1i} ${y1i} Z`;
})();

// Generate Piano Keys
const PIANO_KEYS = [];
const notesArr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let whiteIdx = 0;
for (let oct = 3; oct <= 5; oct++) {
  for (let i = 0; i < 12; i++) {
    const isBlack = [1, 3, 6, 8, 10].includes(i);
    PIANO_KEYS.push({
      note: notesArr[i] + oct,
      pc: i,
      isBlack,
      whiteIdx: isBlack ? whiteIdx - 1 : whiteIdx,
    });
    if (!isBlack) whiteIdx++;
  }
}

// --- COMPONENTS ---

const Staff = ({ currentKeyInfo }) => {
  const { accidentals, accType, drawScale } = currentKeyInfo;
  const staffLines = [30, 40, 50, 60, 70];
  
  const sharpYPositions = [30, 45, 25, 40, 55, 35, 50]; // F, C, G, D, A, E, B
  const flatYPositions = [50, 35, 55, 40, 60, 45, 65];   // B, E, A, D, G, C, F
  
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6">
        {currentKeyInfo.label} Scale & Key Signature
      </h3>
      <svg width="600" height="120" viewBox="0 0 600 120" className="max-w-full">
        {/* Staff Lines */}
        {staffLines.map(y => (
          <line key={y} x1="10" x2="590" y1={y} y2={y} stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-slate-500" />
        ))}
        
        {/* Treble Clef */}
        <text x="15" y="72" fontSize="65" fontFamily="serif" fill="currentColor" className="text-slate-800 dark:text-slate-100">𝄞</text>
        
        {/* Key Signature */}
        {[...Array(accidentals)].map((_, i) => {
          const yPos = accType === 'sharp' ? sharpYPositions[i] : flatYPositions[i];
          const symbol = accType === 'sharp' ? '♯' : '♭';
          return (
            <text 
              key={i} x={65 + (i * 12)} y={yPos + 5} 
              fontSize="24" fontFamily="serif" 
              fill="currentColor" 
              className="text-slate-800 dark:text-slate-100 font-bold"
            >
              {symbol}
            </text>
          );
        })}

        {/* Scale Notes */}
        {drawScale.map((note, i) => {
          const y = noteYBase[note];
          const x = 160 + (i * 45);
          const isUpStem = y >= 50;
          
          return (
            <g key={i} className="text-slate-800 dark:text-slate-100">
              {/* Ledger Lines (Middle C and below) */}
              {y >= 80 && [...Array(Math.floor((y - 70) / 10))].map((_, li) => (
                <line key={`l-down-${li}`} x1={x - 12} x2={x + 12} y1={80 + (li * 10)} y2={80 + (li * 10)} stroke="currentColor" strokeWidth="1" />
              ))}
              {/* Ledger Lines (A5 and above) */}
              {y <= 20 && [...Array(Math.floor((30 - y) / 10))].map((_, li) => (
                <line key={`l-up-${li}`} x1={x - 12} x2={x + 12} y1={20 - (li * 10)} y2={20 - (li * 10)} stroke="currentColor" strokeWidth="1" />
              ))}
              
              {/* Note Head */}
              <ellipse cx={x} cy={y} rx="6.5" ry="4.5" transform={`rotate(-15 ${x} ${y})`} fill="currentColor" />
              
              {/* Note Stem */}
              {isUpStem ? (
                <line x1={x + 5.5} x2={x + 5.5} y1={y} y2={y - 30} stroke="currentColor" strokeWidth="1.2" />
              ) : (
                <line x1={x - 5.5} x2={x - 5.5} y1={y} y2={y + 30} stroke="currentColor" strokeWidth="1.2" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Piano = ({ currentKeyInfo, activeChordPcs, activeChordRoot, activeChordName, isFlat, labelMode, onLabelModeChange }) => {
  const { scalePcs, rootPc, type } = currentKeyInfo;
  
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-6 overflow-x-auto transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-center sm:text-left">
          Piano Keyboard Layout {activeChordName && <span className="text-emerald-500 font-bold tracking-wide">- {activeChordName}</span>}
        </h3>
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600 shadow-sm">
          <button
            onClick={() => onLabelModeChange('notes')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${labelMode === 'notes' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Notes
          </button>
          <button
            onClick={() => onLabelModeChange('intervals')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${labelMode === 'intervals' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Intervals
          </button>
        </div>
      </div>
      <div className="flex justify-center min-w-max pb-2">
        <svg width={21 * 40} height="150" className="border border-slate-300 dark:border-slate-600 rounded shadow-sm">
          {/* White Keys First */}
          {PIANO_KEYS.filter(k => !k.isBlack).map((k) => {
            const isScaleRoot = k.pc === rootPc;
            const inScale = scalePcs.includes(k.pc);
            const isChordTone = activeChordPcs ? activeChordPcs.includes(k.pc) : false;
            const isChordRoot = activeChordPcs ? k.pc === activeChordRoot : false;
            
            let fillClass = "fill-white";
            if (activeChordPcs) {
              if (isChordRoot) fillClass = "fill-emerald-300 dark:fill-emerald-500";
              else if (isChordTone) fillClass = "fill-emerald-100 dark:fill-emerald-800/50";
              else if (inScale) fillClass = "fill-slate-100 dark:fill-slate-700";
            } else {
              if (isScaleRoot) fillClass = type === 'major' ? "fill-blue-200 dark:fill-blue-300" : "fill-purple-200 dark:fill-purple-300";
              else if (inScale) fillClass = type === 'major' ? "fill-blue-50 dark:fill-blue-100" : "fill-purple-50 dark:fill-purple-100";
            }

            return (
              <g key={k.note}>
                <rect 
                  x={k.whiteIdx * 40} y="0" width="40" height="150" 
                  className={`${fillClass} stroke-slate-300 dark:stroke-slate-500 transition-colors duration-300`}
                  strokeWidth="1"
                />
                {!activeChordPcs && isScaleRoot && (
                  <g className="pointer-events-none">
                    <circle cx={k.whiteIdx * 40 + 20} cy="125" r="14" className={type === 'major' ? "fill-blue-500 shadow-sm" : "fill-purple-500 shadow-sm"} />
                    <text x={k.whiteIdx * 40 + 20} y="129" textAnchor="middle" className="fill-white font-bold text-[11px]">
                      {labelMode === 'intervals' ? 'R' : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
                {!activeChordPcs && inScale && !isScaleRoot && (
                  <g className="pointer-events-none">
                    <circle cx={k.whiteIdx * 40 + 20} cy="125" r="12" className={type === 'major' ? "fill-blue-100 dark:fill-blue-800 stroke-blue-300 dark:stroke-blue-600" : "fill-purple-100 dark:fill-purple-800 stroke-purple-300 dark:stroke-purple-600"} strokeWidth="1" />
                    <text x={k.whiteIdx * 40 + 20} y="129" textAnchor="middle" className={type === 'major' ? "fill-blue-800 dark:fill-blue-200 font-bold text-[10px]" : "fill-purple-800 dark:fill-purple-200 font-bold text-[10px]"}>
                      {labelMode === 'intervals' ? getInterval(k.pc, rootPc) : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
                {activeChordPcs && isChordRoot && (
                  <g className="pointer-events-none">
                    <circle cx={k.whiteIdx * 40 + 20} cy="125" r="14" className="fill-emerald-500 dark:fill-emerald-400 shadow-sm" />
                    <text x={k.whiteIdx * 40 + 20} y="129" textAnchor="middle" className="fill-white font-bold text-[11px]">
                      {labelMode === 'intervals' ? 'R' : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
                {activeChordPcs && isChordTone && !isChordRoot && (
                  <g className="pointer-events-none">
                    <circle cx={k.whiteIdx * 40 + 20} cy="125" r="12" className="fill-emerald-100 dark:fill-emerald-800 stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="1" />
                    <text x={k.whiteIdx * 40 + 20} y="129" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-200 font-bold text-[10px]">
                      {labelMode === 'intervals' ? getInterval(k.pc, activeChordRoot) : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Black Keys Rendered on Top */}
          {PIANO_KEYS.filter(k => k.isBlack).map((k) => {
            const isScaleRoot = k.pc === rootPc;
            const inScale = scalePcs.includes(k.pc);
            const isChordTone = activeChordPcs ? activeChordPcs.includes(k.pc) : false;
            const isChordRoot = activeChordPcs ? k.pc === activeChordRoot : false;
            
            let fillClass = "fill-slate-800";
            if (activeChordPcs) {
              if (isChordRoot) fillClass = "fill-emerald-600 dark:fill-emerald-400";
              else if (isChordTone) fillClass = "fill-emerald-800 dark:fill-emerald-600";
              else if (inScale) fillClass = "fill-slate-700 dark:fill-slate-600";
            } else {
              if (isScaleRoot) fillClass = type === 'major' ? "fill-blue-600" : "fill-purple-600";
              else if (inScale) fillClass = type === 'major' ? "fill-blue-900" : "fill-purple-900";
            }

            return (
              <g key={k.note}>
                <rect 
                  x={(k.whiteIdx * 40) + 26} y="0" width="28" height="95" 
                  className={`${fillClass} stroke-slate-900 transition-colors duration-300`}
                  strokeWidth="1" rx="2" ry="2"
                />
                {!activeChordPcs && isScaleRoot && (
                  <g className="pointer-events-none">
                    <circle cx={(k.whiteIdx * 40) + 40} cy="75" r="13" className={type === 'major' ? "fill-blue-500 shadow-sm" : "fill-purple-500 shadow-sm"} />
                    <text x={(k.whiteIdx * 40) + 40} y="79" textAnchor="middle" className="fill-white font-bold text-[11px]">
                      {labelMode === 'intervals' ? 'R' : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
                {!activeChordPcs && inScale && !isScaleRoot && (
                  <g className="pointer-events-none">
                    <circle cx={(k.whiteIdx * 40) + 40} cy="75" r="11" className={type === 'major' ? "fill-blue-800 dark:fill-blue-700 stroke-blue-500 dark:stroke-blue-400" : "fill-purple-800 dark:fill-purple-700 stroke-purple-500 dark:stroke-purple-400"} strokeWidth="1" />
                    <text x={(k.whiteIdx * 40) + 40} y="78.5" textAnchor="middle" className={type === 'major' ? "fill-blue-100 dark:fill-blue-200 font-bold text-[9px]" : "fill-purple-100 dark:fill-purple-200 font-bold text-[9px]"}>
                      {labelMode === 'intervals' ? getInterval(k.pc, rootPc) : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
                {activeChordPcs && isChordRoot && (
                  <g className="pointer-events-none">
                    <circle cx={(k.whiteIdx * 40) + 40} cy="75" r="13" className="fill-emerald-500 dark:fill-emerald-400 shadow-sm" />
                    <text x={(k.whiteIdx * 40) + 40} y="79" textAnchor="middle" className="fill-white font-bold text-[11px]">
                      {labelMode === 'intervals' ? 'R' : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
                {activeChordPcs && isChordTone && !isChordRoot && (
                  <g className="pointer-events-none">
                    <circle cx={(k.whiteIdx * 40) + 40} cy="75" r="11" className="fill-emerald-800 dark:fill-emerald-700 stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="1" />
                    <text x={(k.whiteIdx * 40) + 40} y="78.5" textAnchor="middle" className="fill-emerald-100 dark:fill-emerald-200 font-bold text-[9px]">
                      {labelMode === 'intervals' ? getInterval(k.pc, activeChordRoot) : pcToName(k.pc, isFlat)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
        {!activeChordPcs ? (
          <>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 inline-block"></span> Major Root</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 inline-block"></span> Minor Root</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span> Scale Note</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block"></span> Chord Root</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-200 dark:bg-emerald-800/50 inline-block border border-emerald-300"></span> Chord Tones</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-700 inline-block border border-slate-300"></span> Scale Notes</div>
          </>
        )}
      </div>
    </div>
  );
};

const apiKey = "";

const AIAssistant = ({ currentKeyInfo, onHighlightChord }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [genre, setGenre] = useState("Pop");
  const [error, setError] = useState("");
  const [activeAiIdx, setActiveAiIdx] = useState(null);

  const callGemini = async (prompt, isProgression = false) => {
    setLoading(true);
    setResponse(null);
    setError("");
    setActiveAiIdx(null);
    
    const delays = [1000, 2000, 4000, 8000, 16000];
    let success = false;

    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: "You are an expert music theorist and composer assistant. Provide concise, helpful insights." }] }
          })
        });
        
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          if (isProgression) {
            // Try to extract and parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0]);
                setResponse(parsed);
              } catch (e) {
                setResponse(text); // Fallback to text if JSON parsing fails
              }
            } else {
              setResponse(text);
            }
          } else {
            setResponse(text);
          }
          success = true;
          break;
        }
      } catch (err) {
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
      }
    }

    if (!success) {
      setError("Oops! The AI assistant is currently unavailable. Please try again later.");
    }
    setLoading(false);
  };

  const handleCharacteristics = () => {
    callGemini(`Describe the musical characteristics, emotional feel (affect), and mention 2-3 famous pieces written in the key of ${currentKeyInfo.label}. Keep it under 150 words without markdown blocks.`, false);
  };

  const handleProgression = () => {
    const prompt = `Generate a creative ${genre} chord progression in the key of ${currentKeyInfo.label}. 
    Return ONLY a valid JSON object with this exact structure:
    {
      "progression": [
        { "numeral": "I", "name": "Cmaj7", "notes": ["C", "E", "G", "B"] },
        { "numeral": "vi", "name": "Am7", "notes": ["A", "C", "E", "G"] }
      ],
      "explanation": "A brief one-sentence explanation of why it works well."
    }`;
    callGemini(prompt, true);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-6 border border-purple-100 dark:border-purple-900/30">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span className="text-2xl">🤖</span> AI Musical Assistant
      </h3>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={handleCharacteristics}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          ✨ Discover Key Characteristics
        </button>
        
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 pl-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Style:</span>
          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 outline-none p-1 cursor-pointer"
          >
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="R&B">R&B</option>
            <option value="Cinematic">Cinematic</option>
          </select>
          <button 
            onClick={handleProgression}
            disabled={loading}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-md font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-1"
          >
            ✨ Generate Progression
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg animate-pulse">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Consulting the musical oracle...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {response && !loading && (
        <>
          {typeof response === 'object' && response.progression ? (
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-bold mb-3">Interactive Progression (Click to play)</p>
              <div className="flex flex-wrap gap-3 mb-5">
                {response.progression.map((chord, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveAiIdx(idx);
                      const pcs = chord.notes.map(noteToPc).filter(n => n !== null);
                      if (pcs.length > 0) {
                        onHighlightChord({ name: chord.name, pcs, rootPc: pcs[0] });
                      }
                    }}
                    className={`px-4 py-3 rounded-lg border transition-all text-center min-w-[80px] ${
                      activeAiIdx === idx 
                        ? 'bg-purple-500 text-white border-purple-600 shadow-md transform scale-105' 
                        : 'bg-white hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-900/30 text-slate-700 dark:text-slate-200 border-purple-200 dark:border-purple-800/50 hover:border-purple-400'
                    }`}
                  >
                    <div className={`font-bold text-lg ${activeAiIdx === idx ? 'text-white' : 'text-purple-700 dark:text-purple-400'}`}>
                      {chord.numeral}
                    </div>
                    <div className={`text-sm font-medium ${activeAiIdx === idx ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {chord.name}
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md text-sm text-purple-900 dark:text-purple-200 border border-purple-100 dark:border-purple-800/50">
                <span className="font-bold mr-2">Why it works:</span> 
                {response.explanation}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                {typeof response === 'string' ? response : JSON.stringify(response)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedChordDegree, setSelectedChordDegree] = useState(null);
  const [customChordHighlight, setCustomChordHighlight] = useState(null);
  const [chordType, setChordType] = useState('triad');
  const [pianoLabelMode, setPianoLabelMode] = useState('notes');
  const [rotationAngle, setRotationAngle] = useState(0);
  
  const currentKeyInfo = musicKeys[selectedKey];
  const selectedIndex = circleSlices.findIndex(s => s.major === selectedKey || s.minor === selectedKey);

  // Reset selected chord and smoothly update rotation when key changes
  React.useEffect(() => {
    setSelectedChordDegree(null);
    setCustomChordHighlight(null);
    
    setRotationAngle(prev => {
      const currentMod = ((prev % 360) + 360) % 360;
      const targetMod = selectedIndex * 30;
      let diff = targetMod - currentMod;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return prev + diff;
    });
  }, [selectedKey, chordType, selectedIndex]);

  const isFlat = currentKeyInfo.accType === 'flat';
  const intervals = currentKeyInfo.type === 'major' ? majorIntervalNames : minorIntervalNames;
  const steps = currentKeyInfo.type === 'major' ? majorSteps : minorSteps;
  const activeNumerals = currentKeyInfo.type === 'major' 
    ? (chordType === 'triad' ? majorNumerals : major7Numerals) 
    : (chordType === 'triad' ? minorNumerals : minor7Numerals);

  // Calculate Diatonic Chords based on the selected scale
  const diatonicChords = currentKeyInfo.scalePcs.map((rootPc, i) => {
    const thirdPc = currentKeyInfo.scalePcs[(i + 2) % 7];
    const fifthPc = currentKeyInfo.scalePcs[(i + 4) % 7];
    const seventhPc = currentKeyInfo.scalePcs[(i + 6) % 7];
    
    const numeral = activeNumerals[i];
    let suffix = '';
    
    if (chordType === 'triad') {
      if (numeral.includes('°')) suffix = 'dim';
      else if (numeral === numeral.toLowerCase()) suffix = 'm';
    } else {
      if (numeral.includes('maj7')) suffix = 'maj7';
      else if (numeral.includes('ø7')) suffix = 'm7b5';
      else if (numeral.includes('m7')) suffix = 'm7';
      else if (numeral.includes('7')) suffix = '7';
    }
    
    const name = pcToName(rootPc, isFlat) + suffix;
    const pcs = chordType === 'triad' ? [rootPc, thirdPc, fifthPc] : [rootPc, thirdPc, fifthPc, seventhPc];

    return {
      degree: i,
      numeral,
      name,
      pcs,
      rootPc
    };
  });

  const activeChord = selectedChordDegree !== null ? diatonicChords[selectedChordDegree] : null;
  const scaleNoteNames = currentKeyInfo.scalePcs.map(pc => pcToName(pc, isFlat));
  
  // Resolve which chord should be highlighted on the piano (Custom AI chord vs Diatonic chord)
  const activePcs = customChordHighlight?.pcs || activeChord?.pcs;
  const activeRoot = customChordHighlight ? customChordHighlight.rootPc : activeChord?.rootPc;
  const activeName = customChordHighlight ? customChordHighlight.name : activeChord?.name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Circle of Fifths Explorer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Select any major or minor key on the circle to visualize its scale on the staff and piano keyboard.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Circle Column */}
          <div className="flex-shrink-0 flex justify-center lg:justify-start items-start">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 relative">
              <svg width="380" height="380" viewBox="0 0 380 380">
                <g transform="translate(190, 190)">
                  
                  {/* Decorative background rings */}
                  <circle cx="0" cy="0" r="160" className="fill-transparent stroke-slate-100 dark:stroke-slate-700 stroke-[40]" />
                  <circle cx="0" cy="0" r="100" className="fill-transparent stroke-slate-50 dark:stroke-slate-700/50 stroke-[40]" />

                  {/* Diatonic Sector Grouping Background */}
                  <g transform={`rotate(${rotationAngle})`} className="transition-transform duration-500 ease-in-out">
                    <path 
                      d={diatonicSectorPath} 
                      className={`stroke-2 transition-colors duration-500 ${
                        currentKeyInfo.type === 'major' 
                          ? "fill-blue-500/10 dark:fill-blue-400/10 stroke-blue-500/20 dark:stroke-blue-400/20"
                          : "fill-purple-500/10 dark:fill-purple-400/10 stroke-purple-500/20 dark:stroke-purple-400/20"
                      }`} 
                    />
                  </g>

                  {/* Draw Wedges / Nodes */}
                  {circleSlices.map((slice, index) => {
                    const angleDeg = (index * 30) - 90;
                    const angleRad = angleDeg * (Math.PI / 180);
                    
                    const outerRadius = 160;
                    const innerRadius = 100;
                    
                    const outerX = outerRadius * Math.cos(angleRad);
                    const outerY = outerRadius * Math.sin(angleRad);
                    const innerX = innerRadius * Math.cos(angleRad);
                    const innerY = innerRadius * Math.sin(angleRad);

                    const isMajorActive = selectedKey === slice.major;
                    const isMinorActive = selectedKey === slice.minor;
                    
                    // A key's primary diatonic chords always sit perfectly adjacent to it on the circle!
                    const isSelectedWedge = index === selectedIndex;
                    const isLeftWedge = index === (selectedIndex + 11) % 12;
                    const isRightWedge = index === (selectedIndex + 1) % 12;
                    const isDiatonicWedge = isSelectedWedge || isLeftWedge || isRightWedge;

                    const isDiatonicMajor = !isMajorActive && isDiatonicWedge;
                    const isDiatonicMinor = !isMinorActive && isDiatonicWedge;

                    return (
                      <g key={index}>
                        {/* Major Node (Outer) */}
                        <g 
                          transform={`translate(${outerX}, ${outerY})`} 
                          className="cursor-pointer group"
                          onClick={() => setSelectedKey(slice.major)}
                        >
                          <circle 
                            cx="0" cy="0" r="22" 
                            className={`transition-all duration-300 ${
                              isMajorActive 
                                ? "fill-blue-500 shadow-lg scale-110" 
                                : isDiatonicMajor
                                  ? "fill-blue-50 dark:fill-blue-900/40 stroke-blue-300 dark:stroke-blue-700 stroke-[3px]"
                                  : "fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-600 stroke-2 group-hover:stroke-blue-400 group-hover:scale-105"
                            }`} 
                          />
                          <text 
                            x="0" y="5" textAnchor="middle" 
                            className={`text-sm font-bold pointer-events-none transition-colors ${
                              isMajorActive 
                                ? "fill-white" 
                                : isDiatonicMajor
                                  ? "fill-blue-700 dark:fill-blue-300"
                                  : "fill-slate-700 dark:fill-slate-300"
                            }`}
                          >
                            {slice.displayMajor || slice.major}
                          </text>
                        </g>

                        {/* Minor Node (Inner) */}
                        <g 
                          transform={`translate(${innerX}, ${innerY})`} 
                          className="cursor-pointer group"
                          onClick={() => setSelectedKey(slice.minor)}
                        >
                          <circle 
                            cx="0" cy="0" r="18" 
                            className={`transition-all duration-300 ${
                              isMinorActive 
                                ? "fill-purple-500 shadow-lg scale-110" 
                                : isDiatonicMinor
                                  ? "fill-purple-50 dark:fill-purple-900/40 stroke-purple-300 dark:stroke-purple-700 stroke-[3px]"
                                  : "fill-slate-100 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-600 stroke-2 group-hover:stroke-purple-400 group-hover:scale-105"
                            }`} 
                          />
                          <text 
                            x="0" y="4" textAnchor="middle" 
                            className={`text-xs font-semibold pointer-events-none transition-colors ${
                              isMinorActive 
                                ? "fill-white" 
                                : isDiatonicMinor
                                  ? "fill-purple-700 dark:fill-purple-300"
                                  : "fill-slate-600 dark:fill-slate-400"
                            }`}
                          >
                            {slice.displayMinor || slice.minor}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  
                  {/* Center Text Info */}
                  <text x="0" y="-10" textAnchor="middle" className="text-xl font-bold fill-slate-800 dark:fill-slate-100">
                    {currentKeyInfo.label}
                  </text>
                  <text x="0" y="15" textAnchor="middle" className="text-sm font-medium fill-slate-500 dark:fill-slate-400">
                    {currentKeyInfo.accidentals} {currentKeyInfo.accidentals === 1 ? currentKeyInfo.accType : currentKeyInfo.accType + 's'}
                  </text>
                  <text x="0" y="32" textAnchor="middle" className="text-xs fill-slate-400 dark:fill-slate-500">
                    {currentKeyInfo.accidentals === 0 && 'Natural'}
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right Column (Staff & Piano) */}
          <div className="flex-1 flex flex-col items-center">
            <Staff currentKeyInfo={currentKeyInfo} />
            <Piano 
              currentKeyInfo={currentKeyInfo} 
              activeChordPcs={activePcs} 
              activeChordRoot={activeRoot}
              activeChordName={activeName}
              isFlat={isFlat}
              labelMode={pianoLabelMode}
              onLabelModeChange={setPianoLabelMode}
            />
            
            {/* New Intervals & Harmonization Section */}
            <div className="w-full mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
              
              {/* Intervals Box */}
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex flex-col justify-center shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Scale Intervals & Notes</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p className="mb-3"><span className="font-medium text-slate-800 dark:text-slate-200">Step Pattern:</span> {steps}</p>
                  <div className="flex flex-wrap gap-2">
                    {scaleNoteNames.map((name, i) => (
                      <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-700 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-600">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{name}</span>
                        <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{intervals[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Harmonization / Chords Box */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-5 rounded-xl flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm uppercase tracking-wider">
                      Diatonic Chords
                    </h4>
                    <div className="flex bg-emerald-100 dark:bg-emerald-800/50 rounded-lg p-0.5">
                      <button
                        onClick={() => setChordType('triad')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chordType === 'triad' ? 'bg-emerald-500 text-white shadow' : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-700/50'}`}
                      >
                        Triads
                      </button>
                      <button
                        onClick={() => setChordType('seventh')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chordType === 'seventh' ? 'bg-emerald-500 text-white shadow' : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-700/50'}`}
                      >
                        7ths
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-500 animate-pulse font-medium hidden sm:inline">Click a chord!</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {diatonicChords.map((chord) => (
                    <button
                      key={chord.degree}
                      onClick={() => {
                        setSelectedChordDegree(selectedChordDegree === chord.degree ? null : chord.degree);
                        setCustomChordHighlight(null); // Clear AI highlight if user clicks diatonic chord
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        selectedChordDegree === chord.degree 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-md transform scale-105' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-emerald-200 dark:border-emerald-700/50 hover:border-emerald-400 hover:shadow-sm'
                      }`}
                    >
                      <span className="font-bold text-base">{chord.numeral}</span>
                      <span className={`text-xs mt-1 font-medium ${selectedChordDegree === chord.degree ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {chord.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
            </div>
            
            <AIAssistant 
              currentKeyInfo={currentKeyInfo} 
              onHighlightChord={(chordInfo) => {
                setCustomChordHighlight(chordInfo);
                setSelectedChordDegree(null); // Clear diatonic highlight if AI chord clicked
              }}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}