export default function Header({ darkMode, onToggleDark }) {
  return (
    <header className="sticky top-0 z-10 bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.08] px-7 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Circle of Fifths
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Music Theory Explorer</p>
      </div>
      <button
        onClick={onToggleDark}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] transition-colors"
      >
        {darkMode ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}
