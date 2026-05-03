// ── Note color system — one color per chromatic pitch class ──────────────────
export const NOTE_COLORS = {
  0:  '#f87171', // C  — red
  1:  '#f472b6', // C#/Db — pink
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

export const INTERVAL_LABELS = [
  { line1: 'Root',    line2: '',      short: 'R'  },
  { line1: 'Minor',   line2: '2nd',   short: 'm2' },
  { line1: 'Major',   line2: '2nd',   short: 'M2' },
  { line1: 'Minor',   line2: '3rd',   short: 'm3' },
  { line1: 'Major',   line2: '3rd',   short: 'M3' },
  { line1: 'Perfect', line2: '4th',   short: 'P4' },
  { line1: 'Aug',     line2: '4th',   short: 'A4' },
  { line1: 'Perfect', line2: '5th',   short: 'P5' },
  { line1: 'Minor',   line2: '6th',   short: 'm6' },
  { line1: 'Major',   line2: '6th',   short: 'M6' },
  { line1: 'Minor',   line2: '7th',   short: 'm7' },
  { line1: 'Major',   line2: '7th',   short: 'M7' },
];

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
// Harmonic function per diatonic degree (major / minor)
export const majorHarmonicFn = ['Tonic','Subdom','Tonic','Subdom','Dominant','Tonic','Dominant'];
export const minorHarmonicFn = ['Tonic','Subdom','Mediant','Subdom','Dominant','Subdom','Subtonic'];

export const HARMONIC_FN_COLORS = {
  'Tonic':    '#60a5fa',
  'Subdom':   '#4ade80',
  'Dominant': '#f87171',
  'Mediant':  '#a78bfa',
  'Subtonic': '#fbbf24',
};

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
