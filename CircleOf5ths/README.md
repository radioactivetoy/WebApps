# Circle of Fifths Explorer

An interactive music theory tool for exploring keys, scales, modes, chords, and chord progressions — with real-time audio playback and an AI assistant powered by Google Gemini.

## Features

### Circle & Key Navigation
- Interactive Circle of Fifths — click any slice to select a key
- All 24 keys: 12 major and 12 relative minors
- Enharmonic equivalents handled (F#/Gb, D#m/Ebm)
- Accidental display toggles between sharps and flats

### Scales & Modes
- Major, Natural Minor, all 7 church modes (Dorian, Phrygian, Lydian, Mixolydian, Locrian)
- Extended scales: Melodic Minor, Harmonic Minor, Lydian Dominant, Phrygian Dominant, Altered
- Pentatonics, blues scales, bebop, whole tone, diminished, and more
- Scale formula strip showing the W/H step pattern
- Scale overlay compare mode — show two scales simultaneously on any instrument

### Diatonic Chords
- Full 7-chord diatonic grid for any 7-note scale
- Harmonic function labels (Tonic, Subdominant, Dominant) for major and minor
- 19 voicing variants: Triad, 7th, 9th, 11th, 13th, 6th, 6/9, 7sus4, Sus2, Sus4, Add9, Add11, dim7, Aug+, mMaj7, and dominant alterations (7b9, 7#9, 7#11, 7alt)
- Chord progression history with named pattern recognition (Pop, Jazz ii–V–I, Pachelbel Canon, Axis, and 18 others)

### Modal Interchange
- Borrowed chord suggestions from the parallel major/minor
- Visual indication of non-diatonic chord tones

### Progression Builder
- Build custom chord progressions by degree, root, and voicing
- Transpose progressions to any key
- AI-powered continuation suggestions (requires Gemini API key)
- Export-ready chord symbol display

### Common Progressions Library
- Pre-built library of named progressions
- One-click load into any key

### Instrument View
Visualize any scale or chord on four instruments:

| Instrument | Tunings |
|---|---|
| **Piano** | Full keyboard |
| **Guitar** | Standard, Drop D, Open G, Open D, DADGAD, Open E, Open A, Half-step ↓, Full-step ↓, Drop C |
| **Violin** | Standard (GDAE) |
| **Ukulele** | Standard (GCEA), D Tuning (ADF#B) |
| **Bass** | 4-string Standard/Drop D/Half-step ↓/Full-step ↓/Drop C, 5-string Standard/Drop A, 6-string Standard |

- Note dots colored by pitch class (consistent 12-color system across the entire app)
- Toggle between note name and interval labels
- Characteristic tone highlighting
- Compare scale overlay on fretboard

### Audio Playback
- Scale and chord audio via **Tone.js** with sampled piano
- Play scale ascending, or chord as block or arpeggio
- Individual note tap from the note chip bar
- Active note pulse animation synced to playback

### AI Assistant
- Powered by Google Gemini
- Analyzes the current key and scale context
- Suggests chord progressions with style/feel/genre hints
- Continues an existing progression you've built
- Explains harmonic choices

### Staff Notation
- Grand staff display for the selected scale in any key

### Related Keys
- Relative major/minor, parallel key, and nearby circle-of-fifths neighbors

---

## Tech Stack

- **React 18** — UI
- **Vite** — build tool and dev server
- **Tailwind CSS** — styling
- **Tone.js** — audio synthesis and sample playback
- **Google Gemini API** — AI assistant features

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### AI Assistant (optional)

The AI assistant requires a Google Gemini API key. Add it to `src/lib/gemini.js`:

```js
export const GEMINI_API_KEY = 'your-key-here';
```

Without a key the rest of the app works fully — only the AI panel is inactive.

### Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Project Structure

```
src/
├── components/
│   ├── Circle.jsx            # Interactive Circle of Fifths SVG
│   ├── InstrumentPanel.jsx   # Piano / fretboard instrument view
│   ├── FretboardInstrument.jsx  # Generic SVG fretboard (guitar, bass, violin, ukulele)
│   ├── Piano.jsx             # Piano keyboard SVG
│   ├── DiatonicChords.jsx    # Chord grid + voicing selector
│   ├── ProgressionBuilder.jsx   # Custom progression builder
│   ├── CommonProgressions.jsx   # Named progression library
│   ├── AIAssistant.jsx       # Gemini-powered assistant
│   ├── ModalInterchange.jsx  # Borrowed chord suggestions
│   ├── RelatedKeys.jsx       # Relative / parallel / neighbor keys
│   ├── Staff.jsx             # Grand staff notation
│   ├── ScaleSelector.jsx     # Scale / mode picker
│   ├── ScaleFormulaStrip.jsx # W/H step pattern display
│   ├── KeyInfoBar.jsx        # Key signature info bar
│   ├── RootPicker.jsx        # Chromatic root selector
│   └── Header.jsx
├── data/
│   ├── musicTheory.js        # All music theory data and chord-building logic
│   └── instruments.js        # Instrument and tuning configurations
├── hooks/
│   └── useAudio.js           # Tone.js audio hook
├── lib/
│   └── gemini.js             # Gemini API client
└── main.jsx
```
