import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTickerBar } from '../hooks/useTickerBar'

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT', 'LTC', 'TRX'];

function Ticker() {
  const navigate = useNavigate();
  const tickers = useTickerBar(SYMBOLS);
  const scrollRef = useRef(null);
  const paused = useRef(false);
  const prev = useRef({});
  const [flashes, setFlashes] = useState({});

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf;
    const step = () => {
      if (!paused.current) {
        el.scrollLeft += 0.6;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else if (el.scrollLeft < 0) el.scrollLeft += half;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const changed = {};
    for (const s of SYMBOLS) {
      const now = tickers[s]?.price;
      const before = prev.current[s];
      if (now != null && before != null && now !== before) changed[s] = now > before ? 'up' : 'down';
      if (now != null) prev.current[s] = now;
    }
    if (Object.keys(changed).length) {
      setFlashes(changed);
      const id = setTimeout(() => setFlashes({}), 1200);
      return () => clearTimeout(id);
    }
  }, [tickers]);

  const fmt = (p) => '$' + p.toLocaleString('en-US', { maximumFractionDigits: p < 1 ? 4 : 2 });

  const item = (s, key) => {
    const t = tickers[s];
    const f = flashes[s];
    return (
      <button key={key} type="button" onClick={() => navigate(`/coin/${s}USDT`)}
        className={`flex w-52 shrink-0 items-center gap-2 border-r border-cyan/10 px-4 text-sm whitespace-nowrap ${f === 'up' ? 'flash-up' : f === 'down' ? 'flash-down' : ''}`}>
        <span className="font-bold text-cyan">{s}</span>
        <span className="text-sub tabular-nums">{t ? fmt(t.price) : '—'}</span>
        {t && <span className={`tabular-nums ${t.change >= 0 ? 'text-up' : 'text-down'}`}>{t.change >= 0 ? '▲' : '▼'}{Math.abs(t.change).toFixed(2)}%</span>}
      </button>
    );
  };

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      className="ticker-bar sticky top-28 z-40 overflow-x-auto border-b border-cyan/20 bg-bg/90 py-2 backdrop-blur"
    >
      <div className="flex w-max">
        {SYMBOLS.map((s) => item(s, 'a-' + s))}
        {SYMBOLS.map((s) => item(s, 'b-' + s))}
      </div>
    </div>
  );
}

export default Ticker;