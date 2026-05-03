import { useRef, useState } from 'react';

// Pitch class 0=C to 11=B → frequency in Hz at a given octave
function pcToHz(pc, octave = 4) {
  // C4 = 261.63 Hz, each semitone = *2^(1/12)
  const semisFromC4 = (octave - 4) * 12 + pc;
  return 261.63 * Math.pow(2, semisFromC4 / 12);
}

export function useAudio() {
  const ctxRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const stopRef = useRef(false);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  function playNote(ctx, pc, octave, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = pcToHz(pc, octave);
    // Subtle envelope: attack 10ms, release 50ms before end
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
    gain.gain.setValueAtTime(0.4, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Play scale notes ascending, 200ms per note
  async function playScale(scalePcs, rootOctave = 4) {
    const ctx = getCtx();
    stopRef.current = false;
    setIsPlaying(true);
    const now = ctx.currentTime;
    scalePcs.forEach((pc, i) => {
      // Wrap octave: if pc < first pc, it's in the next octave
      const oct = i > 0 && pc < scalePcs[0] ? rootOctave + 1 : rootOctave;
      playNote(ctx, pc, oct, now + i * 0.2, 0.22);
    });
    await new Promise(r => setTimeout(r, scalePcs.length * 200 + 100));
    setIsPlaying(false);
  }

  // Play chord — arpeggio (default) or block
  async function playChord(pcs, rootOctave = 4, mode = 'arpeggio') {
    const ctx = getCtx();
    stopRef.current = false;
    setIsPlaying(true);
    const now = ctx.currentTime;
    if (mode === 'block') {
      pcs.forEach(pc => playNote(ctx, pc, rootOctave, now, 0.7));
      await new Promise(r => setTimeout(r, 800));
    } else {
      pcs.forEach((pc, i) => playNote(ctx, pc, rootOctave, now + i * 0.15, 0.6));
      await new Promise(r => setTimeout(r, pcs.length * 150 + 500));
    }
    setIsPlaying(false);
  }

  return { playScale, playChord, isPlaying };
}
