function Logo() {
  return (
    <div className="logo-hover flex items-center gap-3">
      <span className="logo-mark relative inline-block h-27">
        <img src="/logo-open.png" alt="CoinPunk" className="h-27 w-auto" />
        <img src="/logo-wink.png" alt="" aria-hidden="true" className="logo-wink absolute left-0 top-0 h-27 w-auto" />
      </span>
      <span className="logo-life font-display text-2xl font-bold tracking-wider">
        <span className="text-cyan glow-cyan">COIN</span>
        <span className="text-magenta glow-magenta">PUNK</span>
      </span>
    </div>
  );
}

export default Logo;