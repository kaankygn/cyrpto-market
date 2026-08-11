import { useState, useEffect, useRef } from 'react'

const GLYPHS = '!<>-_\\/[]{}=+*#%&@?01';

function Logo({ glitch }) {
  const [coin, setCoin] = useState('COIN');
  const [punk, setPunk] = useState('PUNK');
  const raf = useRef();

  useEffect(() => {
    if (!glitch) { setCoin('COIN'); setPunk('PUNK'); return; }
    let start;
    const dur = 1000;
    const scr = (target, p) =>
      target.split('').map((ch, i) =>
        i < Math.floor(p * target.length) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      ).join('');
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setCoin(scr('COIN', p));
      setPunk(scr('PUNK', p));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else { setCoin('COIN'); setPunk('PUNK'); }
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [glitch]);

  return (
    <div className="logo-hover flex items-center gap-3">
      <span className="logo-mark relative inline-block h-27">
        <img src="/logo-open.png" alt="CoinPunk" className="h-27 w-auto" />
        <img src="/logo-wink.png" alt="" aria-hidden="true" className="logo-wink absolute left-0 top-0 h-27 w-auto" />
      </span>
      <span className="logo-life logo-word font-display text-2xl font-bold tracking-wider">
        <span className="text-cyan glow-cyan">{coin}</span>
        <span className="text-magenta glow-magenta">{punk}</span>
      </span>
    </div>
  );
}

export default Logo;