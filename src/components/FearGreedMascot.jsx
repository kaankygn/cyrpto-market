function FearGreedMascot({ value }) {
  const mood = value == null ? 'neutral' : value <= 45 ? 'evil' : value <= 54 ? 'neutral' : 'greed';
  const spriteClass = mood === 'evil' ? 'devil-sprite' : mood === 'greed' ? 'angel-sprite' : 'neutral-sprite';

  return (
    <div className="fg-mascot relative flex flex-col items-center">
      <div className="flex h-[240px] items-center justify-center">
        <div className={spriteClass} />
      </div>

      <div className="fg-bubble absolute left-full top-0 z-20 ml-3 w-64 rounded-lg border border-cyan/30 bg-panel p-3 text-left">
        <div className="mb-1 font-display text-sm font-bold text-cyan">Fear &amp; Greed Index</div>
        <div className="mb-2 text-xs leading-relaxed text-sub">
          Overall market sentiment (0–100) from volatility, momentum, social buzz &amp; BTC
          dominance. Often read contrarian: extreme fear = possible bottom, extreme greed = possible top.
        </div>
        <div className="space-y-1 text-xs">
          <div><span className="font-bold text-down">Fear</span> <span className="text-sub">0–45 · scared, selling</span></div>
          <div><span className="font-bold text-cyan">Neutral</span> <span className="text-sub">46–54 · undecided</span></div>
          <div><span className="font-bold text-up">Greed</span> <span className="text-sub">55–100 · euphoric, buying</span></div>
        </div>
        {value != null && (
          <div className="mt-2 border-t border-cyan/20 pt-2 text-xs text-sub">
            Now: <span className="font-bold text-ink">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FearGreedMascot;