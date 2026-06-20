export function SpectrumAnalyser() {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8 mb-grid-3" aria-label="Audio visualizer">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="w-[3px] bg-gold rounded-full animate-equalizer"
          style={{
            animationDelay: `${i * 0.08}s`,
            animationDuration: `${0.6 + Math.sin(i * 0.5) * 0.3}s`,
            height: `${40 + Math.sin(i * 0.7) * 30 + Math.cos(i * 1.2) * 20}%`,
            opacity: 0.4 + Math.sin(i * 0.3) * 0.3 + 0.3,
          }}
        />
      ))}
    </div>
  );
}
