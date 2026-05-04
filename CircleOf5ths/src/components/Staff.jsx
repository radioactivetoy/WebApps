import { NOTE_COLORS, noteYBase, noteToPc } from '../data/musicTheory.js';

const STAFF_LINES = [18, 28, 38, 48, 58];
const SHARP_Y = [18, 33, 13, 28, 43, 23, 38];
const FLAT_Y  = [38, 23, 43, 28, 48, 33, 53];

export default function Staff({ currentKeyInfo, activeDrawScale, scaleLabel, keySignature }) {
  const { accidentals, accType } = keySignature ?? currentKeyInfo;
  const drawScale = activeDrawScale;
  const label = scaleLabel;

  return (
    <div className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">
        Scale &amp; Key Signature — {label}
      </p>
      <svg width="100%" height="100" viewBox="0 0 580 100" className="overflow-visible">
        {STAFF_LINES.map(y => (
          <line key={y} x1={42} x2={572} y1={y} y2={y}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        ))}
        <text x={42} y={62} fontSize={52} fontFamily="serif" fill="rgba(255,255,255,0.6)">𝄞</text>
        {Array.from({ length: accidentals }).map((_, i) => {
          const yPos = accType === 'sharp' ? SHARP_Y[i] : FLAT_Y[i];
          return (
            <text key={i} x={68 + i * 13} y={yPos + 5}
              fontSize={22} fontFamily="serif" fill="rgba(255,255,255,0.65)" fontWeight="bold">
              {accType === 'sharp' ? '♯' : '♭'}
            </text>
          );
        })}
        {drawScale.map((note, i) => {
          const y = noteYBase[note];
          if (y === undefined) return null;
          const x = 152 + i * 50;
          const pc = noteToPc(note.replace(/[0-9]/g, ''));
          const color = NOTE_COLORS[pc] ?? 'rgba(255,255,255,0.6)';
          const isUpStem = y >= 38;
          const noteName = note.replace(/\d/g, '');
          return (
            <g key={i}>
              {y >= 68 && Array.from({ length: Math.ceil((y - 63) / 10) }).map((_, li) => (
                <line key={li} x1={x-12} x2={x+12} y1={68+li*10} y2={68+li*10}
                  stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              ))}
              <ellipse cx={x} cy={y} rx={7} ry={5}
                transform={`rotate(-15 ${x} ${y})`} fill={color} />
              {isUpStem
                ? <line x1={x+6} x2={x+6} y1={y} y2={y-28} stroke={color} strokeWidth={1.5} />
                : <line x1={x-6} x2={x-6} y1={y} y2={y+28} stroke={color} strokeWidth={1.5} />
              }
              <text x={x} y={93} textAnchor="middle"
                fontSize={10} fontWeight={600} fill={color}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
                {noteName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
