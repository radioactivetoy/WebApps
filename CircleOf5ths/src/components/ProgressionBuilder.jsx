import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { NOTE_COLORS, buildDiatonicChords, pcToName, musicKeys,
  majorHarmonicFn, minorHarmonicFn, HARMONIC_FN_COLORS } from '../data/musicTheory.js';

const PARALLEL_INTERVALS = {
  major:       [0, 2, 3, 5, 7, 8, 10],
  dorian:      [0, 2, 4, 5, 7, 9, 11],
  phrygian:    [0, 2, 4, 5, 7, 9, 11],
  lydian:      [0, 2, 3, 5, 7, 8, 10],
  mixolydian:  [0, 2, 3, 5, 7, 8, 10],
  minor:       [0, 2, 4, 5, 7, 9, 11],
  locrian:     [0, 2, 4, 5, 7, 9, 11],
  'mel-minor':  [0, 2, 4, 5, 7, 9, 11],
  'harm-minor': [0, 2, 4, 5, 7, 9, 11],
  'lyd-dom':    [0, 2, 3, 5, 7, 8, 10],
  'phryg-dom':  [0, 2, 4, 5, 7, 9, 11],
  'altered':    [0, 2, 4, 5, 7, 9, 11],
};

const DEGREE_LABELS = ['I','bII','II','bIII','III','IV','bV','V','bVI','VI','bVII','VII'];

function triadQuality(pcs) {
  const t = (pcs[1] - pcs[0] + 12) % 12;
  const f = (pcs[2] - pcs[0] + 12) % 12;
  if (t === 4 && f === 7) return 'major';
  if (t === 3 && f === 7) return 'minor';
  if (t === 3 && f === 6) return 'dim';
  return 'other';
}

function borrowedNumeral(chordRootPc, keyRootPc, quality) {
  const interval = (chordRootPc - keyRootPc + 12) % 12;
  let num = DEGREE_LABELS[interval];
  if (quality === 'minor') num = num.toLowerCase();
  else if (quality === 'dim') num = num.toLowerCase() + '°';
  return num;
}

// ── Movement suggestion engine ──────────────────────────────────────────────

const MOVEMENT_QUALITY = {
  5:  { label: 'Up a 4th',         desc: 'Strong resolution',           tension: -2 },
  7:  { label: 'Up a 5th',         desc: 'Builds dominant tension',      tension: +2 },
  3:  { label: 'Minor 3rd up',     desc: 'Warm, parallel shift',         tension:  0 },
  9:  { label: 'Minor 3rd down',   desc: 'Melancholic descent',          tension: -1 },
  2:  { label: 'Step up',          desc: 'Forward momentum',             tension: +1 },
  10: { label: 'Step down',        desc: 'Descending, closing',          tension: -1 },
  4:  { label: 'Major 3rd up',     desc: 'Chromatic mediant, dreamy',    tension:  0 },
  8:  { label: 'Major 3rd down',   desc: 'Dark chromatic mediant',       tension: +1 },
  11: { label: 'Half step down',   desc: 'Smooth leading-tone slide',    tension: -1 },
  1:  { label: 'Half step up',     desc: 'Chromatic approach, tense',    tension: +2 },
  6:  { label: 'Tritone',          desc: 'Maximum tension, unstable',    tension: +3 },
};
const MOVEMENT_SCORE   = { 5: 10, 7: 9, 3: 8, 9: 8, 2: 7, 10: 7, 4: 6, 8: 6, 11: 5, 1: 4, 6: 3 };
const CATEGORY_PENALTY = { diatonic: 0, borrowed: -1, 'sec-dom': -2, 'tri-sub': -3 };
const CATEGORY_LABEL   = {
  diatonic: null,
  borrowed: { text: 'Borrow',  bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.3)',  color: '#60a5fa' },
  'sec-dom':{ text: 'Sec Dom', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24' },
  'tri-sub':{ text: 'Tri Sub', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', color: '#a78bfa' },
};

function buildCandidatePool(diatonic, parallelChords, keyRootPc, isFlat) {
  const pool = [];
  const seen = new Set();
  function add(chord, category) {
    const key = `${chord.rootPc}-${chord.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    pool.push({ ...chord, color: chord.color ?? NOTE_COLORS[chord.rootPc], category });
  }
  diatonic.forEach(c => add(c, 'diatonic'));
  if (parallelChords) parallelChords.filter(c => !c.isSame).forEach(c => add(c, 'borrowed'));
  diatonic.forEach(c => {
    const r = (c.rootPc + 7) % 12;
    add({ rootPc: r, pcs: [0,4,7,10].map(n=>(r+n)%12), name: pcToName(r,isFlat)+'7', numeral: 'V7/'+c.numeral }, 'sec-dom');
  });
  diatonic.forEach(c => {
    const r = (c.rootPc + 1) % 12;
    const iv = (r - keyRootPc + 12) % 12;
    add({ rootPc: r, pcs: [0,4,7,10].map(n=>(r+n)%12), name: pcToName(r,isFlat)+'7', numeral: DEGREE_LABELS[iv] }, 'tri-sub');
  });
  return pool;
}

function analyzeContext(seq) {
  if (!seq || seq.length < 2) return { cumulativeTension: 0, lastInterval: null, prevLastInterval: null };
  const recent = seq.slice(-5);
  let cumulativeTension = 0;
  for (let i = 1; i < recent.length; i++) {
    const iv = (recent[i].rootPc - recent[i-1].rootPc + 12) % 12;
    cumulativeTension += (MOVEMENT_QUALITY[iv]?.tension ?? 0);
  }
  const lastInterval = (seq[seq.length-1].rootPc - seq[seq.length-2].rootPc + 12) % 12;
  let prevLastInterval = null;
  if (seq.length >= 3) prevLastInterval = (seq[seq.length-2].rootPc - seq[seq.length-3].rootPc + 12) % 12;
  return { cumulativeTension, lastInterval, prevLastInterval };
}

function getMovementSuggestions(fromRootPc, candidatePool, seq) {
  const { cumulativeTension, lastInterval, prevLastInterval } = analyzeContext(seq);
  const hasCtx = seq && seq.length >= 2;
  return candidatePool
    .filter(c => c.rootPc !== fromRootPc)
    .map(c => {
      const interval = (c.rootPc - fromRootPc + 12) % 12;
      const mq = MOVEMENT_QUALITY[interval] ?? { label: 'Same root', desc: '', tension: 0 };
      let bonus = 0;
      if (hasCtx) {
        if (cumulativeTension >= 2) { if (mq.tension <= -1) bonus += 3; if (mq.tension >= 2) bonus -= 2; }
        if (cumulativeTension <= -2 && mq.tension >= 1) bonus += 2;
        if (lastInterval === 7 && interval === 5) bonus += 5;
        if (prevLastInterval === 2 && lastInterval === 5 && interval === 5) bonus += 4;
        if ((lastInterval === 10 || lastInterval === 9) && (interval === 9 || interval === 10)) bonus += 2;
        if (cumulativeTension >= 2 && (c.category === 'tri-sub' || c.category === 'sec-dom')) bonus += 2;
        if (lastInterval === 7 && c.category === 'tri-sub' && interval === 11) bonus += 4;
      }
      return { chord: c, interval, ...mq, score: (MOVEMENT_SCORE[interval] ?? 0) + (CATEGORY_PENALTY[c.category] ?? 0) + bonus, bonus };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
}

function TensionBadge({ tension }) {
  const cfgs = [
    { min: -2, max: -2, label: 'Resolves',    bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)',  text: '#4ade80' },
    { min: -1, max: -1, label: 'Eases',       bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.25)', text: '#86efac' },
    { min:  0, max:  0, label: 'Neutral',     bg: 'rgba(148,163,184,0.10)',border: 'rgba(148,163,184,0.22)',text: '#94a3b8' },
    { min:  1, max:  1, label: 'Tenses',      bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.30)', text: '#fb923c' },
    { min:  2, max:  2, label: 'Builds',      bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)',  text: '#f87171' },
    { min:  3, max:  3, label: 'Max tension', bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.35)',  text: '#ef4444' },
  ];
  const cfg = cfgs.find(c => tension >= c.min && tension <= c.max) ?? cfgs[3];
  return (
    <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

// ── Voice leading ────────────────────────────────────────────────────────────

function semitoneDistance(a, b) {
  const up = (b - a + 12) % 12;
  return Math.min(up, 12 - up);
}
function voiceLeadingScore(pcsA, pcsB) {
  return pcsA.reduce((sum, a) => sum + Math.min(...pcsB.map(b => semitoneDistance(a, b))), 0);
}

// ── 7th upgrade ──────────────────────────────────────────────────────────────

function upgradeTo7th(chord) {
  if (!chord.pcs || chord.pcs.length !== 3) return chord;
  const t = (chord.pcs[1] - chord.pcs[0] + 12) % 12;
  const f = (chord.pcs[2] - chord.pcs[0] + 12) % 12;
  let seventh, nameSuffix;
  if (t === 4 && f === 7)      { seventh = 11; nameSuffix = 'maj7'; }
  else if (t === 3 && f === 7) { seventh = 10; nameSuffix = '7'; }
  else if (t === 3 && f === 6) { seventh = 10; nameSuffix = 'm7b5'; }
  else return chord;
  const new7 = (chord.pcs[0] + seventh) % 12;
  // Strip existing quality suffix from name, then append new one
  const baseName = chord.name.replace(/maj7$|m7b5$|m7$|7$|dim$/, '').replace(/m$/, '');
  const isMinor  = chord.name.includes('m') && !chord.name.endsWith('dim');
  const root     = baseName + (isMinor && nameSuffix !== 'maj7' ? 'm' : '');
  return { ...chord, pcs: [...chord.pcs, new7], name: root + nameSuffix };
}

const PALETTE_VARIANTS = [
  ['triad',       'Triad'],
  ['seventh',     '7th (auto)'],
  ['forced-maj7', '△7 (all)'],
  ['forced-dom7', 'Dom7 (all)'],
  ['forced-m7',   'm7 (all)'],
  ['ninth',       '9th'],
  ['eleventh',   '11th'],
  ['thirteenth', '13th'],
  ['sixth',      '6th'],
  ['six-nine',   '6/9'],
  ['seven-sus4', '7sus4'],
  ['sus2',       'Sus2'],
  ['sus4',       'Sus4'],
  ['add9',       'Add9'],
  ['add11',      'Add11'],
  ['dom7b9',     '7b9'],
  ['dom7s9',     '7#9'],
  ['dom7s11',    '7#11'],
  ['dom7alt',    '7alt'],
  ['chrom-dim7', 'dim7'],
  ['chrom-aug',  'Aug+'],
  ['mmaj7',      'mMaj7'],
];

const CUSTOM_QUALITY_GROUPS = [
  { group: 'Triad',  qualities: [
    { label: 'maj',  intervals: [0,4,7]        },
    { label: 'm',    intervals: [0,3,7]        },
    { label: 'dim',  intervals: [0,3,6]        },
    { label: 'aug',  intervals: [0,4,8]        },
  ]},
  { group: 'Add·Sus', qualities: [
    { label: '5',      intervals: [0,7]        },
    { label: 'add9',   intervals: [0,4,7,2]    },
    { label: 'madd9',  intervals: [0,3,7,2]    },
    { label: 'add11',  intervals: [0,4,7,5]    },
    { label: 'madd11', intervals: [0,3,7,5]    },
    { label: 'sus2',   intervals: [0,2,7]      },
    { label: 'sus4',   intervals: [0,5,7]      },
  ]},
  { group: '6th', qualities: [
    { label: '6',    intervals: [0,4,7,9]     },
    { label: 'm6',   intervals: [0,3,7,9]     },
    { label: '6/9',  intervals: [0,4,7,9,2]   },
    { label: 'm6/9', intervals: [0,3,7,9,2]   },
  ]},
  { group: '7th', qualities: [
    { label: 'maj7',  intervals: [0,4,7,11]   },
    { label: '7',     intervals: [0,4,7,10]   },
    { label: 'm7',    intervals: [0,3,7,10]   },
    { label: 'mMaj7', intervals: [0,3,7,11]   },
    { label: 'm7b5',  intervals: [0,3,6,10]   },
    { label: '°7',    intervals: [0,3,6,9]    },
    { label: '7sus4', intervals: [0,5,7,10]   },
  ]},
  { group: '9th', qualities: [
    { label: 'maj9',  intervals: [0,4,7,11,2] },
    { label: '9',     intervals: [0,4,7,10,2] },
    { label: 'm9',    intervals: [0,3,7,10,2] },
    { label: 'mMaj9', intervals: [0,3,7,11,2] },
    { label: '7b9',   intervals: [0,4,7,10,1] },
    { label: '7#9',   intervals: [0,4,7,10,3] },
  ]},
  { group: '11th', qualities: [
    { label: 'maj11', intervals: [0,4,7,11,2,5] },
    { label: '11',    intervals: [0,4,7,10,2,5] },
    { label: 'm11',   intervals: [0,3,7,10,2,5] },
    { label: '7#11',  intervals: [0,4,7,10,6]   },
  ]},
  { group: '13th', qualities: [
    { label: 'maj13', intervals: [0,4,7,11,2,9] },
    { label: '13',    intervals: [0,4,7,10,2,9] },
    { label: 'm13',   intervals: [0,3,7,10,2,9] },
  ]},
  { group: 'Alt', qualities: [
    { label: '7alt',  intervals: [0,4,6,10,1]   },
  ]},
];

// ────────────────────────────────────────────────────────────────────────────

function uid() { return crypto.randomUUID(); }

const LS_KEY = 'co5_custom_progressions';
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

const ProgressionBuilder = forwardRef(function ProgressionBuilder({
  activeScalePcs, scaleMode, rootPc, isFlat,
  playChord, playClick, onHighlightChord, onSequenceChange, onTransposeKey,
}, ref) {
  const [sequence, setSequence] = useState([]);
  const [playing,  setPlaying]  = useState(null);
  const [bpm,      setBpm]      = useState(80);
  const [loop,     setLoop]     = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved,    setSaved]    = useState(loadSaved);

  const [use7ths,        setUse7ths]        = useState(false);
  const [paletteVariant, setPaletteVariant] = useState('triad');
  const [customRoot,     setCustomRoot]     = useState(0);
  const [customQuality,  setCustomQuality]  = useState('');
  const [customOpen,     setCustomOpen]     = useState(false);
  const [transposeOpen,  setTransposeOpen]  = useState(false);
  const [subMenu, setSubMenu] = useState(null); // null | { chordId, x, y }
  const longPressRef = useRef(null);

  // Drag-and-drop state
  // dragSource: { type: 'palette', chord } | { type: 'sequence', idx } | null
  const [isDragging, setIsDragging] = useState(false); // triggers re-render for gap visibility
  const [dropGap,    setDropGap]    = useState(null);  // gap index (0 to sequence.length)
  const dragSourceRef = useRef(null);

  const stepMs = Math.round(60000 / bpm);
  const is7Note = activeScalePcs.length === 7;

  const sequenceRef    = useRef(sequence);
  sequenceRef.current  = sequence;
  const playChordRef   = useRef(playChord);
  playChordRef.current = playChord;
  const playClickRef   = useRef(playClick);
  playClickRef.current = playClick;
  const highlightRef   = useRef(onHighlightChord);
  highlightRef.current = onHighlightChord;

  // ── Chord palette data ──────────────────────────────────────────────────────
  // Triads kept separately for candidate pool / borrowed quality comparisons
  const diatonicTriads = useMemo(() =>
    is7Note ? buildDiatonicChords(activeScalePcs, isFlat, 'triad') : [],
    [activeScalePcs, isFlat, is7Note]
  );

  // Palette display uses the selected voicing variant
  const diatonic = useMemo(() =>
    is7Note ? buildDiatonicChords(activeScalePcs, isFlat, paletteVariant) : [],
    [activeScalePcs, isFlat, is7Note, paletteVariant]
  );

  const secDom = useMemo(() =>
    diatonic.map(chord => {
      const r = (chord.rootPc + 7) % 12;
      return { rootPc: r, pcs: [0,4,7,10].map(n => (r+n)%12), name: pcToName(r,isFlat)+'7', numeral: 'V7/'+chord.numeral, category: 'secdom' };
    }),
    [diatonic, isFlat]
  );

  const approach = useMemo(() =>
    diatonic.map(chord => {
      const q = triadQuality(chord.pcs);
      const isMinor = q === 'minor' || q === 'dim';
      const r = (chord.rootPc + 2) % 12;
      return [
        { rootPc: r, pcs: isMinor ? [0,3,6,10].map(n=>(r+n)%12) : [0,3,7,10].map(n=>(r+n)%12), name: pcToName(r,isFlat)+(isMinor?'m7b5':'m7'), category: 'approach' },
        { rootPc: r, pcs: [0,4,7,10].map(n=>(r+n)%12), name: pcToName(r,isFlat)+'7', category: 'approach' },
      ];
    }),
    [diatonic, isFlat]
  );

  const tritoneSub = useMemo(() =>
    diatonic.map(chord => {
      const r = (chord.rootPc + 1) % 12; // secDom root + tritone (6 semitones) = root + 7 + 6 = root + 1
      return { rootPc: r, pcs: [0,4,7,10].map(n=>(r+n)%12), name: pcToName(r,isFlat)+'7', category: 'tritonesub' };
    }),
    [diatonic, isFlat]
  );

  const borrowed = useMemo(() => {
    const intervals = PARALLEL_INTERVALS[scaleMode];
    if (!intervals) return [];
    return buildDiatonicChords(intervals.map(i => (rootPc+i)%12), isFlat, 'triad').map((c, i) => {
      const q = triadQuality(c.pcs);
      const mainQ = triadQuality(diatonicTriads[i]?.pcs ?? [0,4,7]);
      const isSame = c.rootPc === diatonicTriads[i]?.rootPc && q === mainQ;
      return { ...c, numeral: borrowedNumeral(c.rootPc, rootPc, q), isSame, category: 'borrow' };
    });
  }, [scaleMode, rootPc, isFlat, diatonicTriads]);

  const candidatePool = useMemo(
    () => buildCandidatePool(diatonicTriads, borrowed, rootPc, isFlat),
    [diatonicTriads, borrowed, rootPc, isFlat]
  );

  // ── Playback effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const seq = sequenceRef.current;
    if (!seq.length) return;
    const chord = seq[playing.step % seq.length];
    if (metronome) playClickRef.current?.();
    highlightRef.current?.({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name });
    playChordRef.current?.(chord.pcs, 4, 'block');
    const timer = setTimeout(() => {
      setPlaying(p => {
        if (!p) return null;
        const next = p.step + 1;
        if (next >= seq.length) {
          if (loop) return { step: 0 };
          highlightRef.current?.(null);
          return null;
        }
        return { step: next };
      });
    }, stepMs);
    return () => clearTimeout(timer);
  }, [playing, stepMs, loop, metronome]);

  useEffect(() => { if (sequence.length === 0) setPlaying(null); }, [sequence.length]);
  useEffect(() => { onSequenceChange?.(sequence); }, [sequence, onSequenceChange]);

  useEffect(() => {
    if (!transposeOpen) return;
    function close() { setTransposeOpen(false); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [transposeOpen]);

  useEffect(() => {
    if (!subMenu) return;
    function dismiss() { setSubMenu(null); }
    document.addEventListener('click', dismiss);
    return () => document.removeEventListener('click', dismiss);
  }, [subMenu]);

  useImperativeHandle(ref, () => ({
    addChord: (chord) => setSequence(s => [...s, { ...chord, id: uid() }]),
  }));

  // ── Sequence helpers ────────────────────────────────────────────────────────
  function insertChord(chord, gapIdx) {
    setSequence(s => {
      const next = [...s];
      next.splice(gapIdx, 0, { ...chord, id: uid() });
      return next;
    });
  }

  function removeChord(id) {
    setSequence(s => s.filter(c => c.id !== id));
  }

  function clearSequence() {
    setPlaying(null);
    highlightRef.current?.(null);
    setSequence([]);
    setTransposeOpen(false);
  }

  function togglePlay() {
    if (playing) { setPlaying(null); highlightRef.current?.(null); }
    else if (sequence.length) setPlaying({ step: 0 });
  }

  function transposeSequence(targetRootPc) {
    const firstChord = sequence[0];
    if (!firstChord) return;
    const offset = (targetRootPc - firstChord.rootPc + 12) % 12;
    if (offset === 0) { setTransposeOpen(false); return; }
    const type = scaleMode === 'minor' ? 'minor' : 'major';
    const targetKey =
      Object.values(musicKeys).find(k => k.rootPc === targetRootPc && k.type === type) ??
      Object.values(musicKeys).find(k => k.rootPc === targetRootPc);
    const targetIsFlat = targetKey ? targetKey.accType === 'flat' : isFlat;
    setSequence(seq => seq.map(chord => {
      const newRoot = (chord.rootPc + offset) % 12;
      const quality = chord.name.replace(/^[A-G][#b]?/, '');
      return { ...chord, rootPc: newRoot, pcs: chord.pcs.map(pc => (pc + offset) % 12), name: pcToName(newRoot, targetIsFlat) + quality };
    }));
    onTransposeKey?.(targetRootPc);
    setTransposeOpen(false);
  }

  function computeSubstitutions(chord) {
    const { rootPc: r, pcs } = chord;
    const q = triadQuality(pcs);
    const subs = [];

    const triR = (r + 6) % 12;
    subs.push({ label: 'Tritone', rootPc: triR, pcs: [0,4,7,10].map(n=>(triR+n)%12), name: pcToName(triR, isFlat)+'7' });

    if (q === 'major') {
      const relR = (r + 9) % 12;
      subs.push({ label: 'Relative', rootPc: relR, pcs: [0,3,7].map(n=>(relR+n)%12), name: pcToName(relR, isFlat)+'m' });
    } else if (q === 'minor') {
      const relR = (r + 3) % 12;
      subs.push({ label: 'Relative', rootPc: relR, pcs: [0,4,7].map(n=>(relR+n)%12), name: pcToName(relR, isFlat) });
    }

    if (q === 'major') {
      subs.push({ label: 'Parallel', rootPc: r, pcs: [0,3,7].map(n=>(r+n)%12), name: pcToName(r, isFlat)+'m' });
    } else if (q === 'minor') {
      subs.push({ label: 'Parallel', rootPc: r, pcs: [0,4,7].map(n=>(r+n)%12), name: pcToName(r, isFlat) });
    }

    const bVIr = (r + 8) % 12;
    subs.push({ label: 'bVI', rootPc: bVIr, pcs: [0,4,7].map(n=>(bVIr+n)%12), name: pcToName(bVIr, isFlat) });

    subs.push({ label: 'Sus4', rootPc: r, pcs: [0,5,7].map(n=>(r+n)%12), name: pcToName(r, isFlat)+'sus4' });

    return subs;
  }

  function replaceChord(id, newChord) {
    setSequence(s => s.map(c => c.id === id ? { ...newChord, id } : c));
    setSubMenu(null);
  }

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────
  function startPaletteDrag(e, chord) {
    dragSourceRef.current = { type: 'palette', chord };
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function startChipDrag(e, idx) {
    dragSourceRef.current = { type: 'sequence', idx };
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onGapDragOver(e, gapIdx) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = dragSourceRef.current?.type === 'palette' ? 'copy' : 'move';
    setDropGap(gapIdx);
  }

  function onGapDrop(e, gapIdx) {
    e.preventDefault();
    e.stopPropagation();
    const src = dragSourceRef.current;
    if (!src) return endDrag();

    if (src.type === 'palette') {
      insertChord(src.chord, gapIdx);
    } else if (src.type === 'sequence') {
      const from = src.idx;
      if (from !== gapIdx && from !== gapIdx - 1) {
        setSequence(s => {
          const next = [...s];
          const [item] = next.splice(from, 1);
          const at = gapIdx > from ? gapIdx - 1 : gapIdx;
          next.splice(at, 0, item);
          return next;
        });
      }
    }
    endDrag();
  }

  function endDrag() {
    dragSourceRef.current = null;
    setIsDragging(false);
    setDropGap(null);
  }

  // ── Save / load ─────────────────────────────────────────────────────────────
  function saveProgression() {
    if (!sequence.length || !saveName.trim()) return;
    const entry = { name: saveName.trim(), chords: sequence.map(({ id, ...rest }) => rest) };
    const next = [...saved.filter(s => s.name !== entry.name), entry];
    setSaved(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setSaveName('');
  }

  function loadProgression(prog) {
    setPlaying(null);
    highlightRef.current?.(null);
    setSequence(prog.chords.map(c => ({ ...c, id: uid() })));
  }

  function deleteSaved(name) {
    const next = saved.filter(s => s.name !== name);
    setSaved(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  if (!is7Note) return null;

  // ── Sub-components ──────────────────────────────────────────────────────────
  function PaletteBtn({ chord }) {
    const color = NOTE_COLORS[chord.rootPc];
    return (
      <button
        draggable
        onDragStart={e => startPaletteDrag(e, chord)}
        onDragEnd={endDrag}
        onClick={() => insertChord(chord, sequence.length)}
        title={`Click or drag to add ${chord.name}`}
        className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border text-center transition-all hover:opacity-80 active:scale-95 cursor-grab"
        style={{ background: `${color}12`, borderColor: `${color}30` }}>
        {chord.numeral && (
          <span className="text-[7px] font-bold leading-none mb-0.5" style={{ color: `${color}80` }}>
            {chord.numeral}
          </span>
        )}
        <span className="text-[9px] font-semibold leading-tight" style={{ color: `${color}CC` }}>
          {chord.name}
        </span>
      </button>
    );
  }

  function DropGap({ idx }) {
    const isTarget = dropGap === idx;
    return (
      <div
        onDragOver={e => onGapDragOver(e, idx)}
        onDrop={e => onGapDrop(e, idx)}
        onDragLeave={() => setDropGap(null)}
        className="self-stretch flex items-center transition-all flex-shrink-0"
        style={{ width: isTarget ? 18 : (isDragging ? 6 : 2), minHeight: 32 }}>
        <div className="w-full h-full rounded-sm transition-all"
          style={{ background: isTarget ? 'rgba(167,139,250,0.6)' : isDragging ? 'rgba(255,255,255,0.06)' : 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase">Progression Builder</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-white/25">{bpm} bpm</span>
          <input type="range" min={40} max={200} value={bpm}
            onChange={e => setBpm(+e.target.value)}
            className="w-20 h-1 accent-violet-400 cursor-pointer" />
          <button
            onClick={() => setLoop(v => !v)}
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
            style={loop
              ? { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(167,139,250,0.9)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
            ↺ Loop
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

      {/* ── Palette voicing selector ── */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <span className="text-[8px] font-bold tracking-widest uppercase text-white/20 mr-0.5">Voicing</span>
        {PALETTE_VARIANTS.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPaletteVariant(val)}
            className="px-2 py-0.5 rounded-md text-[9px] font-semibold transition-colors"
            style={paletteVariant === val
              ? { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(167,139,250,0.9)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Chord palette ── */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-1">
          <span className="w-14 flex-shrink-0 text-right text-[8px] font-bold tracking-widest uppercase text-white/20 pr-1">Approach</span>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {approach.map((pair, i) => (
              <div key={i} className="grid grid-cols-2 gap-0.5">
                {pair.map((chord, j) => <PaletteBtn key={j} chord={chord} />)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-14 flex-shrink-0 text-right text-[8px] font-bold tracking-widest uppercase text-white/20 pr-1">Sec Dom</span>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {secDom.map((chord, i) => <PaletteBtn key={i} chord={chord} />)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-14 flex-shrink-0 text-right text-[8px] font-bold tracking-widest uppercase text-white/20 pr-1">Diatonic</span>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {diatonic.map(chord => <PaletteBtn key={chord.degree} chord={{ ...chord, category: 'diatonic' }} />)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-14 flex-shrink-0 text-right text-[8px] font-bold tracking-widest uppercase text-white/20 pr-1">Tri-Sub</span>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {tritoneSub.map((chord, i) => <PaletteBtn key={i} chord={chord} />)}
          </div>
        </div>
        {borrowed.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-14 flex-shrink-0 text-right text-[8px] font-bold tracking-widest uppercase text-white/20 pr-1">Borrow</span>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {borrowed.map((chord, i) => (
                chord.isSame ? <div key={i} /> : <PaletteBtn key={i} chord={chord} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Custom chord ── */}
      {(() => {
        if (!customOpen) return (
          <button
            onClick={() => setCustomOpen(true)}
            className="mb-3 w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors hover:bg-white/[0.07]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-[10px] font-semibold text-white/45">+ Custom chord</span>
            <span className="text-white/30 text-[10px]">▼</span>
          </button>
        );
        const CHROMATIC = isFlat
          ? ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
          : ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const allQualities = CUSTOM_QUALITY_GROUPS.flatMap(g => g.qualities);
        const q = allQualities.find(q => q.label === customQuality) ?? allQualities[0];
        const pcs = q.intervals.map(n => (customRoot + n) % 12);
        const displayLabel = customQuality === '' ? 'maj' : customQuality;
        const name = CHROMATIC[customRoot] + (customQuality === '' ? '' : customQuality);
        const color = NOTE_COLORS[customRoot];
        return (
          <div className="mb-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setCustomOpen(false)}
              className="w-full flex items-center justify-between mb-2 hover:opacity-70 transition-opacity">
              <span className="text-[8px] font-bold tracking-[2px] uppercase text-white/20">Custom chord</span>
              <span className="text-white/20 text-[10px]">▲</span>
            </button>
            {/* Root row */}
            <div className="flex gap-0.5 flex-wrap mb-2">
              {CHROMATIC.map((n, pc) => (
                <button key={pc} onClick={() => setCustomRoot(pc)}
                  className="w-7 h-6 rounded text-[9px] font-bold transition-all"
                  style={customRoot === pc
                    ? { background: `${NOTE_COLORS[pc]}30`, border: `1px solid ${NOTE_COLORS[pc]}70`, color: NOTE_COLORS[pc] }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                  {n}
                </button>
              ))}
            </div>
            {/* Quality rows — one per group */}
            <div className="flex flex-col gap-0.5 mb-2">
              {CUSTOM_QUALITY_GROUPS.map(({ group, qualities }) => (
                <div key={group} className="flex items-center gap-0.5">
                  <span className="w-10 flex-shrink-0 text-right text-[7px] font-bold tracking-wide uppercase pr-1"
                    style={{ color: 'rgba(255,255,255,0.18)' }}>{group}</span>
                  {qualities.map(({ label }) => {
                    const isActive = customQuality === label || (label === 'maj' && customQuality === '');
                    return (
                      <button key={label}
                        onClick={() => setCustomQuality(label === 'maj' ? '' : label)}
                        className="px-1.5 h-5 rounded text-[9px] font-semibold transition-all"
                        style={isActive
                          ? { background: `${color}28`, border: `1px solid ${color}60`, color }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                        {label || 'maj'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Preview + add */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg border"
                style={{ background: `${color}18`, borderColor: `${color}40`, color }}>
                {name}
              </span>
              <button
                onClick={() => insertChord({ rootPc: customRoot, pcs, name }, sequence.length)}
                className="px-3 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: `${color}25`, border: `1px solid ${color}50`, color }}>
                + Add to progression
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Sequence ── */}
      <div className="mb-3">
        <div
          className="min-h-[64px] flex flex-wrap items-start p-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isDragging ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)'}` }}
          onDragOver={e => { e.preventDefault(); if (sequence.length === 0) setDropGap(0); }}
          onDrop={e => { if (sequence.length === 0) { e.preventDefault(); const src = dragSourceRef.current; if (src?.type === 'palette') { insertChord(src.chord, 0); } endDrag(); } }}
          onDragLeave={() => { if (sequence.length === 0) setDropGap(null); }}>

          {sequence.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-1"
              style={{ minHeight: 28 }}>
              <span className="text-[11px]"
                style={{ color: isDragging ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.13)' }}>
                {isDragging ? 'Drop here to add' : 'Click or drag chords above to build a progression…'}
              </span>
            </div>
          )}

          {/* Gap before first chip */}
          {sequence.length > 0 && <DropGap idx={0} />}

          {sequence.map((chord, idx) => {
            const color = NOTE_COLORS[chord.rootPc];
            const isActive = playing != null && playing.step % sequence.length === idx;
            const src = dragSourceRef.current;
            const isBeingDragged = src?.type === 'sequence' && src.idx === idx;
            const vlScore = (!isDragging && idx > 0)
              ? voiceLeadingScore(sequence[idx - 1].pcs, chord.pcs)
              : null;
            const vlColor = vlScore === null ? null
              : vlScore <= 2 ? '#4ade80' : vlScore <= 4 ? '#94a3b8' : vlScore <= 6 ? '#fb923c' : '#f87171';

            return (
              <div key={chord.id} className="flex items-center">
                {vlScore !== null && (
                  <span className="text-[7px] font-bold px-0.5 leading-none mr-0.5 flex-shrink-0"
                    style={{ color: vlColor + '99' }} title={`Voice leading: ${vlScore} semitones`}>
                    {vlScore}
                  </span>
                )}
                <div
                  draggable
                  onDragStart={e => { clearTimeout(longPressRef.current); longPressRef.current = null; startChipDrag(e, idx); }}
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
                  onPointerCancel={() => { clearTimeout(longPressRef.current); longPressRef.current = null; }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold select-none transition-all"
                  style={{
                    background: isActive ? `${color}30` : `${color}14`,
                    borderColor: isActive ? `${color}70` : `${color}35`,
                    color,
                    opacity: isBeingDragged ? 0.3 : 1,
                    boxShadow: isActive ? `0 0 10px ${color}30` : 'none',
                    cursor: 'grab',
                  }}>
                  <span className="text-[10px] opacity-35">⠿</span>
                  {chord.name}
                  <button
                    draggable={false}
                    onClick={e => { e.stopPropagation(); removeChord(chord.id); }}
                    className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] hover:opacity-60 transition-opacity"
                    style={{ background: `${color}30`, color }}>
                    ×
                  </button>
                </div>
                <DropGap idx={idx + 1} />
              </div>
            );
          })}
        </div>
        <p className="text-[9px] mt-1 px-1" style={{ color: isDragging ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.13)' }}>
          {isDragging ? 'Drop between chips to insert • drop at end to append' : 'Click to append • drag to insert at any position • no limit on length'}
        </p>
      </div>

      {/* ── Movement suggestions ── */}
      {sequence.length > 0 && (() => {
        const last = sequence[sequence.length - 1];
        const ctx = sequence.map(c => ({ rootPc: c.rootPc, name: c.name, pcs: c.pcs }));
        const rawSuggestions = getMovementSuggestions(last.rootPc, candidatePool, ctx);
        const suggestions = use7ths
          ? rawSuggestions.map(s => ({ ...s, chord: upgradeTo7th(s.chord) }))
          : rawSuggestions;
        const { cumulativeTension } = analyzeContext(ctx);
        const moodCfg =
          cumulativeTension >= 3 ? { text: 'High tension · resolution expected', color: '#ef4444' } :
          cumulativeTension >= 1 ? { text: 'Tension building', color: '#fb923c' } :
          cumulativeTension <= -2 ? { text: 'Relaxed · ready to build', color: '#4ade80' } : null;
        const lastColor = NOTE_COLORS[last.rootPc];
        return (
          <div className="mb-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[8px] font-bold tracking-[2px] uppercase text-white/20">Next chord</span>
              <span className="text-[9px] font-semibold" style={{ color: lastColor + 'CC' }}>after {last.name}</span>
              <span className="text-white/20 text-[9px]">→</span>
              {moodCfg && (
                <span className="text-[8px] font-semibold" style={{ color: moodCfg.color }}>{moodCfg.text}</span>
              )}
              <button
                onClick={() => setUse7ths(v => !v)}
                className="ml-auto text-[8px] font-bold px-2 py-0.5 rounded-full transition-all"
                style={use7ths
                  ? { background: 'rgba(167,139,250,0.25)', border: '1px solid rgba(167,139,250,0.5)', color: '#c4b5fd' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }}>
                7ths
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {suggestions.map(({ chord, label, desc, tension, bonus }, i) => {
                const color = NOTE_COLORS[chord.rootPc];
                const catLabel = CATEGORY_LABEL[chord.category];
                const showFn = chord.category === 'diatonic' && (scaleMode === 'major' || scaleMode === 'minor') && chord.degree !== undefined;
                const fn = showFn ? (scaleMode === 'major' ? majorHarmonicFn[chord.degree] : minorHarmonicFn[chord.degree]) : null;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      insertChord(chord, sequence.length);
                      onHighlightChord?.({ pcs: chord.pcs, rootPc: chord.rootPc, name: chord.name });
                    }}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg border text-left transition-all hover:opacity-80 active:scale-[0.98]"
                    style={{ background: `${color}0C`, borderColor: bonus > 0 ? `${color}38` : `${color}1E` }}>
                    <div className="w-16 flex-shrink-0 flex items-center justify-end">
                      {catLabel ? (
                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                          style={{ background: catLabel.bg, border: `1px solid ${catLabel.border}`, color: catLabel.color }}>
                          {catLabel.text}
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-bold text-[10px] leading-none" style={{ color }}>{chord.numeral}</span>
                          {fn && (
                            <span className="text-[6px] font-bold px-1 py-px rounded-sm leading-none"
                              style={{ color: HARMONIC_FN_COLORS[fn], background: `${HARMONIC_FN_COLORS[fn]}25` }}>
                              {fn}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-[10px] w-[3.5rem] flex-shrink-0" style={{ color }}>
                      {chord.name}
                    </span>
                    <span className="text-[8px] text-white/25 flex-1 leading-tight">{label} · {desc}</span>
                    <TensionBadge tension={tension} />
                    <span className="text-[8px] text-white/20 ml-1">+</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Playback controls ── */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={togglePlay}
          disabled={!sequence.length}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-opacity disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: 'white' }}>
          {playing ? '◼' : '▶'}
        </button>
        <button
          onClick={clearSequence}
          disabled={!sequence.length}
          className="px-3 py-1 rounded-lg text-[10px] font-semibold transition-opacity disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
          Clear
        </button>
        <span className="text-[10px] text-white/20 flex-1">
          {sequence.length ? `${sequence.length} chord${sequence.length > 1 ? 's' : ''}` : ''}
        </span>
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

      {/* ── Save / load ── */}
      <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Name this progression…"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveProgression()}
            maxLength={40}
            className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
          <button
            onClick={saveProgression}
            disabled={!sequence.length || !saveName.trim()}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-opacity disabled:opacity-30"
            style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: 'rgba(167,139,250,0.9)' }}>
            Save
          </button>
        </div>
        {saved.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {saved.map(prog => (
              <div key={prog.name} className="flex items-center rounded-lg overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => loadProgression(prog)}
                  className="px-2.5 py-1 text-[10px] font-semibold hover:opacity-80 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}>
                  {prog.name}
                  <span className="ml-1.5 text-white/20">{prog.chords.length}</span>
                </button>
                <button
                  onClick={() => deleteSaved(prog.name)}
                  className="px-1.5 py-1 text-[9px] hover:opacity-60 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.25)' }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {subMenu && (() => {
        const chord = sequence.find(c => c.id === subMenu.chordId);
        if (!chord) return null;
        const subs = computeSubstitutions(chord);
        const left = Math.min(subMenu.x, window.innerWidth - 240);
        const top  = Math.min(subMenu.y, window.innerHeight - 180);
        return (
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'fixed', top, left, zIndex: 50, maxWidth: 220,
              background: 'rgba(20,20,35,0.97)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '8px 8px 4px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <p className="text-[8px] font-bold tracking-[2px] uppercase text-white/20 mb-2 px-1">{chord.name}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {subs.map((sub) => {
                const color = NOTE_COLORS[sub.rootPc];
                return (
                  <button
                    key={sub.label}
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
      })()}
    </div>
  );
});

export default ProgressionBuilder;
