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
