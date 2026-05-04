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
const _COLOR_SEMITONES = {
  'b2':1, 'b9':1, 'b3':3, '#9':3, 'M3':4, '#4':6, 'b5':6, '#11':6,
  'b6':8, '#5':8, 'b13':8, '♮6':9, 'M6':9, 'b7':10, '♮7':11, 'M7':11,
};

export function getColorNotePcs(scaleMode, rootPc) {
  const { colorNotes = [] } = SCALES[scaleMode] || {};
  return new Set(
    colorNotes.map(n => _COLOR_SEMITONES[n]).filter(s => s !== undefined).map(s => (rootPc + s) % 12)
  );
}

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

// ── Scale definitions ─────────────────────────────────────────────────────────
// parentOffset: semitones to add to rootPc to get the parent major key root (modes only)
export const SCALES = {
  'major':      { label: 'Major',     intervals: [0,2,4,5,7,9,11], parentOffset: null, colorNotes: [],                     context: 'Pop, rock, classical'       },
  'dorian':     { label: 'Dorian',    intervals: [0,2,3,5,7,9,10], parentOffset: 10,   colorNotes: ['♮6'],                  context: 'Jazz, funk, rock'            },
  'phrygian':   { label: 'Phrygian',  intervals: [0,1,3,5,7,8,10], parentOffset: 8,    colorNotes: ['b2'],                  context: 'Flamenco, metal'             },
  'lydian':     { label: 'Lydian',    intervals: [0,2,4,6,7,9,11], parentOffset: 7,    colorNotes: ['#4'],                  context: 'Film, dream pop'             },
  'mixolydian': { label: 'Mixo',      intervals: [0,2,4,5,7,9,10], parentOffset: 5,    colorNotes: ['b7'],                  context: 'Rock, blues, folk'           },
  'minor':      { label: 'Minor',     intervals: [0,2,3,5,7,8,10], parentOffset: 3,    colorNotes: [],                     context: 'Rock, pop, classical'        },
  'locrian':    { label: 'Locrian',   intervals: [0,1,3,5,6,8,10], parentOffset: 1,    colorNotes: ['b2', 'b5'],            context: 'Metal, avant-garde'          },
  'maj-pent':   { label: 'Maj Pent',  intervals: [0,2,4,7,9],      parentOffset: null, colorNotes: [],                     context: 'Country, folk, rock'         },
  'min-pent':   { label: 'Min Pent',  intervals: [0,3,5,7,10],     parentOffset: null, colorNotes: [],                     context: 'Blues, rock, R&B'            },
  'blues':      { label: 'Blues',     intervals: [0,3,5,6,7,10],   parentOffset: null, colorNotes: ['b5'],                  context: 'Blues, jazz, rock'           },
  'mel-minor':  { label: 'Mel Min',   intervals: [0,2,3,5,7,9,11], parentOffset: null, colorNotes: ['♮6', '♮7'],           context: 'Jazz, classical'             },
  'lyd-dom':    { label: 'Lyd Dom',   intervals: [0,2,4,6,7,9,10], parentOffset: null, colorNotes: ['#4', 'b7'],            context: 'Jazz fusion, film'           },
  'altered':    { label: 'Altered',   intervals: [0,1,3,4,6,8,10], parentOffset: null, colorNotes: ['b9', '#9', '#11', 'b13'], context: 'Jazz, tension'            },
  'harm-minor': { label: 'Harm Min',  intervals: [0,2,3,5,7,8,11], parentOffset: null, colorNotes: ['♮7'],                  context: 'Classical, metal, flamenco' },
  'phryg-dom':  { label: 'Phryg Dom', intervals: [0,1,4,5,7,8,10], parentOffset: null, colorNotes: ['b2', 'M3'],            context: 'Flamenco, Middle Eastern'    },
};

// Maps each pc to the natural letter used for its staff position.
// Sharp spelling: C# sits on C's line; flat spelling: Db sits on D's line.
const _STAFF_SHARP = ['C','C','D','D','E','F','F','G','G','A','A','B'];
const _STAFF_FLAT  = ['C','D','D','E','E','F','G','G','A','A','B','B'];

export function computeDrawScale(rootPc, scalePcs, isFlat) {
  const sharpMapped = scalePcs.map(pc => _STAFF_SHARP[pc]);
  const hasCollision = new Set(sharpMapped).size < sharpMapped.length;
  const letters = (isFlat || hasCollision) ? _STAFF_FLAT : _STAFF_SHARP;
  let octave = rootPc >= 9 ? 3 : 4;
  return scalePcs.map((pc, i) => {
    if (i > 0 && pc < scalePcs[i - 1]) octave++;
    return letters[pc] + octave;
  });
}

// Computes diatonic chord names + pcs for any 7-note scale.
// Returns array of { degree, numeral, name, pcs, rootPc }.
export function buildDiatonicChords(scalePcs, isFlat, chordType) {
  const ROMAN = ['I','II','III','IV','V','VI','VII'];
  return scalePcs.map((rootPc, i) => {
    const second  = scalePcs[(i + 1) % 7];
    const third   = scalePcs[(i + 2) % 7];
    const fourth  = scalePcs[(i + 3) % 7];
    const fifth   = scalePcs[(i + 4) % 7];
    const sixth   = scalePcs[(i + 5) % 7];
    const seventh = scalePcs[(i + 6) % 7];
    const t = (third   - rootPc + 12) % 12;
    const f = (fifth   - rootPc + 12) % 12;
    const s = (seventh - rootPc + 12) % 12;

    let quality;
    if      (t === 4 && f === 7) quality = 'major';
    else if (t === 3 && f === 7) quality = 'minor';
    else if (t === 3 && f === 6) quality = 'dim';
    else                         quality = 'aug';

    const roman = ROMAN[i];
    const isMaj = quality === 'major';
    const isMin = quality === 'minor';
    const isDim = quality === 'dim';
    let numeral = isMaj ? roman : isMin ? roman.toLowerCase() : isDim ? roman.toLowerCase()+'°' : roman+'+';
    const suffix = isMaj ? '' : isMin ? 'm' : isDim ? 'dim' : 'aug';
    const root = pcToName(rootPc, isFlat);

    let name, pcs;
    switch (chordType) {
      case 'seventh': {
        let suf7;
        if      (isMaj && s===11) { suf7='maj7'; numeral=roman+'maj7';             }
        else if (isMaj && s===10) { suf7='7';    numeral=roman+'7';                }
        else if (isMin && s===10) { suf7='m7';   numeral=roman.toLowerCase()+'7';  }
        else if (isDim && s===10) { suf7='m7b5'; numeral=roman.toLowerCase()+'ø7'; }
        else if (isDim && s===9)  { suf7='dim7'; numeral=roman.toLowerCase()+'°7'; }
        else                      { suf7='m7';   numeral=roman.toLowerCase()+'7';  }
        name = root + suf7; pcs = [rootPc, third, fifth, seventh]; break;
      }
      case 'sus2':
        numeral = roman + 'sus2';
        name = root + 'sus2'; pcs = [rootPc, second, fifth]; break;
      case 'sus4':
        numeral = roman + 'sus4';
        name = root + 'sus4'; pcs = [rootPc, fourth, fifth]; break;
      case 'add9':
        numeral = (isMaj ? roman : roman.toLowerCase()) + 'add9';
        name = root + suffix + 'add9'; pcs = [rootPc, second, third, fifth]; break;
      case 'add11':
        numeral = (isMaj ? roman : roman.toLowerCase()) + 'add11';
        name = root + suffix + 'add11'; pcs = [rootPc, third, fourth, fifth]; break;
      case 'ninth': {
        let suf9;
        if      (isMaj && s===11) { suf9='maj9'; numeral=roman+'maj9';             }
        else if (isMaj && s===10) { suf9='9';    numeral=roman+'9';                }
        else if (isMin)           { suf9='m9';   numeral=roman.toLowerCase()+'9';  }
        else if (isDim)           { suf9='dim9'; numeral=roman.toLowerCase()+'°9'; }
        else                      { suf9='9';    numeral=roman+'9';                }
        name = root + suf9; pcs = [rootPc, second, third, fifth, seventh]; break;
      }
      case 'eleventh': {
        let suf11;
        if      (isMaj && s===11) { suf11='maj11'; numeral=roman+'maj11';            }
        else if (isMaj && s===10) { suf11='11';    numeral=roman+'11';               }
        else if (isMin)           { suf11='m11';   numeral=roman.toLowerCase()+'11'; }
        else                      { suf11='11';    numeral=roman+'11';               }
        name = root + suf11; pcs = [rootPc, second, third, fourth, fifth, seventh]; break;
      }
      case 'thirteenth': {
        let suf13;
        if      (isMaj && s===11) { suf13='maj13'; numeral=roman+'maj13';            }
        else if (isMaj && s===10) { suf13='13';    numeral=roman+'13';               }
        else if (isMin)           { suf13='m13';   numeral=roman.toLowerCase()+'13'; }
        else                      { suf13='13';    numeral=roman+'13';               }
        name = root + suf13; pcs = [rootPc, second, third, fourth, fifth, sixth, seventh]; break;
      }
      case 'sixth': {
        let suf6;
        if      (isMaj) { suf6='6';    numeral=roman+'6';                }
        else if (isMin) { suf6='m6';   numeral=roman.toLowerCase()+'6';  }
        else if (isDim) { suf6='dim6'; numeral=roman.toLowerCase()+'°6'; }
        else            { suf6='6';    numeral=roman+'6';                 }
        name = root + suf6; pcs = [rootPc, third, fifth, sixth]; break;
      }
      case 'six-nine': {
        let sufSN;
        if      (isMaj) { sufSN='6/9';  numeral=roman+'6/9';               }
        else if (isMin) { sufSN='m6/9'; numeral=roman.toLowerCase()+'6/9'; }
        else            { sufSN='6/9';  numeral=roman+'6/9';                }
        name = root + sufSN; pcs = [rootPc, second, third, fifth, sixth]; break;
      }
      case 'seven-sus4': {
        let suf7s;
        if (s===11) { suf7s='maj7sus4'; numeral=roman+'maj7sus4'; }
        else        { suf7s='7sus4';    numeral=roman+'7sus4';     }
        name = root + suf7s; pcs = [rootPc, fourth, fifth, seventh]; break;
      }
      // ── Non-diatonic / chromatic variants (fixed semitone intervals from root) ──
      case 'dom7b9':
        numeral = roman + '7b9';
        name = root + '7b9';
        pcs = [0,4,7,10,1].map(n => (rootPc+n)%12); break;
      case 'dom7s9':
        numeral = roman + '7#9';
        name = root + '7#9';
        pcs = [0,4,7,10,3].map(n => (rootPc+n)%12); break;
      case 'dom7s11':
        numeral = roman + '7#11';
        name = root + '7#11';
        pcs = [0,4,7,10,6].map(n => (rootPc+n)%12); break;
      case 'dom7alt':
        numeral = roman + '7alt';
        name = root + '7alt';
        pcs = [0,4,6,10,1].map(n => (rootPc+n)%12); break;
      case 'chrom-dim7':
        numeral = roman.toLowerCase() + '°7';
        name = root + '°7';
        pcs = [0,3,6,9].map(n => (rootPc+n)%12); break;
      case 'chrom-aug':
        numeral = roman + '+';
        name = root + 'aug';
        pcs = [0,4,8].map(n => (rootPc+n)%12); break;
      default: // triad
        name = root + suffix; pcs = [rootPc, third, fifth]; break;
    }
    return { degree: i, numeral, name, pcs, rootPc };
  });
}

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
