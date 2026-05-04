export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.08] px-7 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Circle of Fifths
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Music Theory Explorer</p>
      </div>
    </header>
  );
}
