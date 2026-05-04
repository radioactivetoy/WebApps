import { NOTE_COLORS, circleSlices, musicKeys, SCALES } from '../data/musicTheory.js';

function pt(r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

function arcPath(innerR, outerR, a1, a2) {
  const [ox1, oy1] = pt(outerR, a1);
  const [ox2, oy2] = pt(outerR, a2);
  const [ix1, iy1] = pt(innerR, a1);
  const [ix2, iy2] = pt(innerR, a2);
  const lg = (a2 - a1) > 180 ? 1 : 0;
  return [
    `M ${ox1.toFixed(2)} ${oy1.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${lg} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)}`,
    `L ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${lg} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
    'Z',
  ].join(' ');
}

const R_OUTER  = 175;
const R_M_IN   = 128;
const R_G_OUT  = 118;
const R_I_OUT  = 106;
const R_I_IN   = 72;
const R_CENTER = 58;

export default function Circle({ selectedKey, onKeySelect, rotationAngle, parentKeyName, scaleMode }) {
  const selectedIndex = circleSlices.findIndex(
    s => s.major === selectedKey || s.minor === selectedKey
  );
  const isMajor = musicKeys[selectedKey]?.type === 'major';

  const currentKeyInfo = musicKeys[selectedKey];
  const centerColor = NOTE_COLORS[currentKeyInfo?.rootPc ?? 0];

  const isModal = !!parentKeyName;
  const parentIndex = isModal ? circleSlices.findIndex(s => s.major === parentKeyName) : -1;
  const circleRefIndex = isModal ? parentIndex : selectedIndex;
  // Lydian/Mixolydian have a major third (interval[2]=4); Dorian/Phrygian/Locrian have a minor third (interval[2]=3)
  const modalRootIsMajor = isModal && SCALES[scaleMode].intervals[2] === 4;

  const diatonicIdxs = [
    circleRefIndex,
    (circleRefIndex + 1) % 12,
    (circleRefIndex + 11) % 12,
  ];

  const SIZE = 390;
  const MID = SIZE / 2;

  return (
    <div className="rounded-2xl p-4 flex flex-col items-center"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-3">Circle of Fifths</p>
      <svg width={SIZE} height={SIZE} viewBox={`${-MID} ${-MID} ${SIZE} ${SIZE}`}>
        {/* Outer background circle */}
        <circle cx={0} cy={0} r={R_OUTER + 12}
          fill="rgba(15,12,41,0.4)" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

        {/* Diatonic sector highlight */}
        <g style={{ transform: `rotate(${rotationAngle}deg)`, transition: 'transform 0.5s ease-in-out' }}>
          <path
            d={arcPath(R_I_IN - 2, R_OUTER + 2, -45, 45)}
            fill={`${isMajor ? '#818cf8' : '#a78bfa'}08`}
            stroke={`${isMajor ? '#818cf8' : '#a78bfa'}15`}
            strokeWidth={1}
          />
        </g>

        {/* ── Major ring wedges ── */}
        {circleSlices.map((slice, i) => {
          const a1 = i * 30 - 15;
          const a2 = i * 30 + 15;
          const color = NOTE_COLORS[musicKeys[slice.major].rootPc];
          const isActive = isModal ? i === parentIndex : (i === selectedIndex && isMajor);
          const isModalRoot = isModal && i === selectedIndex && modalRootIsMajor;
          const isDiatonic = diatonicIdxs.includes(i) && !isActive && !isModalRoot;

          return (
            <g key={`maj-${i}`} onClick={() => onKeySelect(slice.major)} style={{ cursor: 'pointer' }}>
              <path
                d={arcPath(R_M_IN, R_OUTER, a1, a2)}
                fill={isActive ? `${color}CC` : isDiatonic ? `${color}30` : 'rgba(255,255,255,0.035)'}
                stroke={isActive ? color : isDiatonic ? `${color}60` : 'rgba(255,255,255,0.07)'}
                strokeWidth={isActive ? 2 : 1}
              />
              {(() => {
                const [lx, ly] = pt((R_M_IN + R_OUTER) / 2, i * 30);
                const displayName = slice.displayMajor || slice.major;
                const isEnharmonic = displayName.includes('/');
                return (
                  <text
                    x={lx.toFixed(2)} y={ly.toFixed(2)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={isEnharmonic ? 10 : 14}
                    fontWeight={isActive ? 900 : isDiatonic ? 700 : 500}
                    fill={isActive ? 'white' : isDiatonic ? color : 'rgba(255,255,255,0.5)'}
                    style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}
                  >
                    {displayName}
                  </text>
                );
              })()}
              {isModalRoot && (
                <path
                  d={arcPath(R_M_IN, R_OUTER, a1, a2)}
                  fill={`${color}15`}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        {/* Gap ring separator */}
        <circle cx={0} cy={0} r={R_G_OUT}
          fill="rgba(12,10,30,0.55)" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

        {/* ── Minor ring wedges ── */}
        {circleSlices.map((slice, i) => {
          const a1 = i * 30 - 15;
          const a2 = i * 30 + 15;
          const color = NOTE_COLORS[musicKeys[slice.minor]?.rootPc ?? 0];
          const isActive = i === selectedIndex && !isMajor;
          const isModalRoot = isModal && i === selectedIndex && !modalRootIsMajor;
          const isDiatonic = diatonicIdxs.includes(i) && !isActive && !isModalRoot;

          return (
            <g key={`min-${i}`} onClick={() => onKeySelect(slice.minor)} style={{ cursor: 'pointer' }}>
              <path
                d={arcPath(R_I_IN, R_I_OUT, a1, a2)}
                fill={isActive ? `${color}BB` : isDiatonic ? `${color}25` : 'rgba(255,255,255,0.025)'}
                stroke={isActive ? color : isDiatonic ? `${color}50` : 'rgba(255,255,255,0.06)'}
                strokeWidth={isActive ? 1.5 : 1}
              />
              {isModalRoot && (
                <path
                  d={arcPath(R_I_IN, R_I_OUT, a1, a2)}
                  fill={`${color}20`}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {(() => {
                const [lx, ly] = pt((R_I_IN + R_I_OUT) / 2, i * 30);
                const displayName = slice.displayMinor || slice.minor;
                const isEnharmonic = displayName.includes('/');
                return (
                  <text
                    x={lx.toFixed(2)} y={ly.toFixed(2)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={isEnharmonic ? 7 : 10}
                    fontWeight={isActive ? 700 : 500}
                    fill={isActive ? 'white' : isDiatonic ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.32)'}
                    style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}
                  >
                    {displayName}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Inner fill */}
        <circle cx={0} cy={0} r={R_I_IN - 1}
          fill="rgba(10,8,26,0.72)" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

        {/* Center circle */}
        <circle cx={0} cy={0} r={R_CENTER}
          fill={`${centerColor}20`} stroke={centerColor} strokeWidth={1.5} />
        <text x={0} y={-12} textAnchor="middle" dominantBaseline="middle"
          fontSize={26} fontWeight={900} fill={centerColor}
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {selectedKey.replace('m','')}
        </text>
        <text x={0} y={10} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.45)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {SCALES[scaleMode]?.label ?? (currentKeyInfo?.type === 'major' ? 'Major' : 'Minor')}
        </text>
        <text x={0} y={26} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fill="rgba(255,255,255,0.25)"
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {currentKeyInfo?.accidentals === 0 ? 'Natural' : `${currentKeyInfo?.accidentals} ${currentKeyInfo?.accType}${currentKeyInfo?.accidentals > 1 ? 's' : ''}`}
        </text>
      </svg>
    </div>
  );
}
