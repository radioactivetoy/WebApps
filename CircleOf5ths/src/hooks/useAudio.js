import { useRef, useState } from 'react';
import * as Tone from 'tone';

const PC_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function pcToNote(pc, octave) {
  return `${PC_NAMES[pc]}${octave}`;
}

function noteOctave(pc, rootPc, rootOctave) {
  return pc >= rootPc ? rootOctave : rootOctave + 1;
}

const SALAMANDER_URLS = {
  A0:'A0.mp3',  C1:'C1.mp3',  'D#1':'Ds1.mp3', 'F#1':'Fs1.mp3',
  A1:'A1.mp3',  C2:'C2.mp3',  'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3',
  A2:'A2.mp3',  C3:'C3.mp3',  'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3',
  A3:'A3.mp3',  C4:'C4.mp3',  'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3',
  A4:'A4.mp3',  C5:'C5.mp3',  'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3',
  A5:'A5.mp3',  C6:'C6.mp3',  'D#6':'Ds6.mp3', 'F#6':'Fs6.mp3',
  A6:'A6.mp3',  C7:'C7.mp3',  'D#7':'Ds7.mp3', 'F#7':'Fs7.mp3',
  A7:'A7.mp3',  C8:'C8.mp3',
};

export function useAudio() {
  const samplerRef  = useRef(null);
  const droneRef    = useRef(null);   // Tone.Synth — truly sustained sine drone
  const loadPromise = useRef(null);
  const stopRef     = useRef(null);   // call to cancel current playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePc,  setActivePc]  = useState(null);  // pc of the key currently sounding

  async function getSampler() {
    await Tone.start();
    if (samplerRef.current) return samplerRef.current;

    if (!loadPromise.current) {
      setIsLoading(true);
      loadPromise.current = new Promise(resolve => {
        const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.28 }).toDestination();

        // Sine drone — holds indefinitely until triggerRelease
        droneRef.current = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.35, decay: 0, sustain: 1, release: 1.8 },
          volume: -16,
        }).connect(reverb);

        const sampler = new Tone.Sampler({
          urls: SALAMANDER_URLS,
          baseUrl: 'https://tonejs.github.io/audio/salamander/',
          onload: () => {
            samplerRef.current = sampler;
            setIsLoading(false);
            resolve(sampler);
          },
        }).connect(reverb);
      });
    }

    return loadPromise.current;
  }

  function stop() {
    if (stopRef.current) stopRef.current();
  }

  async function playScale(scalePcs, rootOctave = 4) {
    const sampler = await getSampler();
    if (stopRef.current) stopRef.current();

    setIsPlaying(true);

    const now     = Tone.now();
    const step    = 1.4;
    const dur     = 1.2;
    const tail    = 2.2;
    const totalMs = (scalePcs.length * step + tail) * 1000;

    // True sustaining drone — sine synth holds until explicitly released
    droneRef.current.triggerAttack(pcToNote(scalePcs[0], rootOctave - 1), now, 0.55);

    // Schedule audio + UI highlight for each note
    const ids = scalePcs.map((pc, i) => {
      const oct = noteOctave(pc, scalePcs[0], rootOctave);
      sampler.triggerAttackRelease(pcToNote(pc, oct), dur, now + i * step, 0.62 + Math.random() * 0.18);
      return setTimeout(() => setActivePc(pc), Math.round(i * step * 1000));
    });
    const clearId = setTimeout(() => setActivePc(null), Math.round(scalePcs.length * step * 1000));
    const droneId = setTimeout(() => droneRef.current?.triggerRelease(), totalMs);

    stopRef.current = () => {
      ids.forEach(clearTimeout);
      clearTimeout(clearId);
      clearTimeout(droneId);
      sampler.releaseAll();
      droneRef.current?.triggerRelease();
      setActivePc(null);
      setIsPlaying(false);
      stopRef.current = null;
    };

    await new Promise(r => setTimeout(r, totalMs + 400));
    if (stopRef.current) {
      setIsPlaying(false);
      stopRef.current = null;
    }
  }

  async function playChord(pcs, rootOctave = 4, mode = 'arpeggio') {
    const sampler = await getSampler();
    if (stopRef.current) stopRef.current();

    setIsPlaying(true);

    const now  = Tone.now();
    const root = pcs[0];
    let totalMs;

    if (mode === 'block') {
      pcs.forEach(pc => {
        const oct = noteOctave(pc, root, rootOctave);
        sampler.triggerAttackRelease(pcToNote(pc, oct), 1.6, now, 0.60 + Math.random() * 0.2);
      });
      totalMs = 2100;
    } else if (mode === 'strum') {
      // Quick strum only — no sustain block; used by progression player
      const step = 0.10;
      pcs.forEach((pc, i) => {
        const oct = noteOctave(pc, root, rootOctave);
        sampler.triggerAttackRelease(pcToNote(pc, oct), 1.2, now + i * step, 0.65 + Math.random() * 0.2);
      });
      totalMs = (pcs.length * step + 1.2) * 1000;
    } else {
      const step = 0.13;
      pcs.forEach((pc, i) => {
        const oct = noteOctave(pc, root, rootOctave);
        sampler.triggerAttackRelease(pcToNote(pc, oct), 0.7, now + i * step, 0.65 + Math.random() * 0.2);
      });
      const blockStart = now + pcs.length * step + 0.05;
      pcs.forEach(pc => {
        const oct = noteOctave(pc, root, rootOctave);
        sampler.triggerAttackRelease(pcToNote(pc, oct), 2.4, blockStart, 0.55 + Math.random() * 0.2);
      });
      totalMs = (pcs.length * step + 0.05 + 2.4) * 1000;
    }

    stopRef.current = () => {
      sampler.releaseAll();
      setIsPlaying(false);
      stopRef.current = null;
    };

    await new Promise(r => setTimeout(r, totalMs + 400));
    if (stopRef.current) {
      setIsPlaying(false);
      stopRef.current = null;
    }
  }

  function playClick() {
    function fireClick() {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
      }).toDestination();
      synth.triggerAttackRelease('C2', '8n');
      setTimeout(() => synth.dispose(), 500);
    }
    if (Tone.context.state !== 'running') {
      Tone.start().then(fireClick);
    } else {
      fireClick();
    }
  }

  return { playScale, playChord, playClick, stop, isPlaying, isLoading, activePc };
}
