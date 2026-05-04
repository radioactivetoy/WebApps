import { useRef, useState } from 'react';

function pcToHz(pc, octave = 4) {
  return 261.63 * Math.pow(2, ((octave - 4) * 12 + pc) / 12);
}

// Piano-like harmonic series (index = harmonic number)
function buildPianoWave(ctx) {
  const n    = 12;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  real[1] = 1;      // fundamental
  real[2] = 0.50;   // octave
  real[3] = 0.35;   // perfect 5th
  real[4] = 0.18;   // 2nd octave
  real[5] = 0.10;
  real[6] = 0.06;
  real[7] = 0.03;
  real[8] = 0.016;
  real[9] = 0.008;
  return ctx.createPeriodicWave(real, imag);
}

// Synthetic reverb — decaying random noise impulse response
function buildReverb(ctx) {
  const conv = ctx.createConvolver();
  const sr   = ctx.sampleRate;
  const len  = Math.floor(sr * 1.5);
  const buf  = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
  }
  conv.buffer = buf;
  return conv;
}

// Keep pc within one octave above rootPc so chords don't span multiple octaves
function noteOctave(pc, rootPc, rootOctave) {
  return pc >= rootPc ? rootOctave : rootOctave + 1;
}

export function useAudio() {
  const ctxRef   = useRef(null);
  const nodesRef = useRef(null);   // { wave, dry, reverb }
  const [isPlaying, setIsPlaying] = useState(false);

  function getCtx() {
    if (!ctxRef.current) {
      const ctx = new AudioContext();

      // Signal chain: source → gain → dry ──────────────── destination
      //                              └──→ reverb → wet ──→ destination
      const dry    = ctx.createGain();
      const wet    = ctx.createGain();
      const reverb = buildReverb(ctx);

      dry.gain.value = 0.72;
      wet.gain.value = 0.28;

      dry.connect(ctx.destination);
      reverb.connect(wet);
      wet.connect(ctx.destination);

      ctxRef.current   = ctx;
      nodesRef.current = { wave: buildPianoWave(ctx), dry, reverb };
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  function playNote(pc, octave, startTime, duration, velocity = 1) {
    const ctx              = ctxRef.current;
    const { wave, dry, reverb } = nodesRef.current;
    const freq  = pcToHz(pc, octave);
    const peak  = 0.30 * velocity;

    // ── Main tone ─────────────────────────────────────────────────────────
    const gain = ctx.createGain();
    gain.connect(dry);
    gain.connect(reverb);

    // Piano ADSR: near-instant attack → fast initial decay → slow fade → release
    const rel = Math.max(duration - 0.07, duration * 0.9);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peak,          startTime + 0.006);   // 6 ms attack
    gain.gain.exponentialRampToValueAtTime(peak * 0.28, startTime + 0.12); // fast decay
    gain.gain.exponentialRampToValueAtTime(peak * 0.09, rel);              // slow fade
    gain.gain.exponentialRampToValueAtTime(0.0001,    startTime + duration);// release

    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start(startTime);
    osc.stop(startTime + duration);

    // ── Hammer click — very short high-frequency burst ────────────────────
    const clickGain = ctx.createGain();
    clickGain.connect(dry);
    clickGain.gain.setValueAtTime(0.055 * velocity, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.022);

    const click = ctx.createOscillator();
    click.frequency.value = freq * 5.5;
    click.connect(clickGain);
    click.start(startTime);
    click.stop(startTime + 0.025);
  }

  async function playScale(scalePcs, rootOctave = 4) {
    const ctx  = getCtx();
    setIsPlaying(true);
    const now  = ctx.currentTime;
    const step = 0.20;

    scalePcs.forEach((pc, i) => {
      const oct = noteOctave(pc, scalePcs[0], rootOctave);
      playNote(pc, oct, now + i * step, 0.55, 0.75 + Math.random() * 0.25);
    });

    await new Promise(r => setTimeout(r, scalePcs.length * step * 1000 + 700));
    setIsPlaying(false);
  }

  async function playChord(pcs, rootOctave = 4, mode = 'arpeggio') {
    const ctx  = getCtx();
    setIsPlaying(true);
    const now  = ctx.currentTime;
    const root = pcs[0];

    if (mode === 'block') {
      // Used by individual note chips — short block
      pcs.forEach(pc => {
        const oct = noteOctave(pc, root, rootOctave);
        playNote(pc, oct, now, 1.5, 0.75 + Math.random() * 0.25);
      });
      await new Promise(r => setTimeout(r, 1800));
    } else {
      // Arpeggio up, then all notes together sustained
      const step        = 0.13;
      const arpeggioEnd = pcs.length * step;
      const blockStart  = now + arpeggioEnd + 0.04;

      // 1 — strum up
      pcs.forEach((pc, i) => {
        const oct = noteOctave(pc, root, rootOctave);
        playNote(pc, oct, now + i * step, 0.55, 0.72 + Math.random() * 0.28);
      });

      // 2 — block sustain (slightly softer so it doesn't clip over the tail)
      pcs.forEach(pc => {
        const oct = noteOctave(pc, root, rootOctave);
        playNote(pc, oct, blockStart, 1.8, 0.60 + Math.random() * 0.20);
      });

      const total = arpeggioEnd + 0.04 + 1.8;
      await new Promise(r => setTimeout(r, total * 1000 + 300));
    }

    setIsPlaying(false);
  }

  return { playScale, playChord, isPlaying };
}
