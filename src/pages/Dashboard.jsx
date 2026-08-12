import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGlobal, getTrending, getCoins } from '../api/coingecko'
import { getFearGreed } from '../api/fng'
import FearGreedMascot from '../components/FearGreedMascot'
import Sparkline from '../components/Sparkline'
import CountUp from '../components/CountUp'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

const ic = 'h-5 w-5 text-sub shrink-0';
const IconGlobe = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></svg>);
const IconBtc = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M9.5 8h4a2 2 0 010 4h-4m0 0h4.3a2 2 0 010 4H9.5m0-8v8m1.5-9v1m0 8v1" /></svg>);
const IconBars = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 20V11M10 20V4M16 20v-6M2 20h19" /></svg>);
const IconCoins = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6" /></svg>);

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [coins, setCoins] = useState([]);
  const [fng, setFng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const started = Date.now();
    Promise.all([getGlobal(), getTrending(), getCoins(), getFearGreed().catch(() => null)])
      .then(([g, t, c, f]) => { setStats(g); setTrending(t); setCoins(c); setFng(f); })
      .catch((err) => setError(err.message))
      .finally(() => {
        const wait = Math.max(0, 2300 - (Date.now() - started));
        setTimeout(() => setLoading(false), wait);
      });
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const fmtUsd = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtPrice = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 });
  const goTo = (sym) => navigate(`/coin/${sym.toUpperCase()}USDT`);
  const spColor = (v) => (v >= 0 ? '#00ffa3' : '#ff3b6b');

  const pct = (v) => {
    const n = v ?? 0;
    return <span className={n >= 0 ? 'text-up' : 'text-down'}>{n >= 0 ? '+' : ''}{n.toFixed(2)}%</span>;
  };

  const mcChange = stats.market_cap_change_percentage_24h_usd ?? 0;
  const gainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 8);
  const losers = [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 8);
  const hero = ['btc', 'eth'].map((s) => coins.find((c) => c.symbol.toLowerCase() === s)).filter(Boolean);
  const fngColor = !fng ? 'text-sub' : fng.value <= 45 ? 'text-down' : fng.value <= 54 ? 'text-sub' : 'text-up';

  const statCards = [
    { label: 'Total market cap', num: stats.total_market_cap.usd, fmt: fmtUsd, extra: pct(mcChange), icon: <IconGlobe /> },
    { label: 'BTC dominance', num: stats.market_cap_percentage.btc, fmt: (n) => n.toFixed(1) + '%', icon: <IconBtc /> },
    { label: '24h volume', num: stats.total_volume.usd, fmt: fmtUsd, icon: <IconBars /> },
    { label: 'Active coins', num: stats.active_cryptocurrencies, fmt: (n) => Math.round(n).toLocaleString(), icon: <IconCoins /> },
  ];

  const MoverRow = ({ c }) => (
    <div onClick={() => goTo(c.symbol)} className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-cyan/5">
      <img src={c.image} alt="" className="h-5 w-5" />
      <span className="font-medium text-ink">{c.symbol.toUpperCase()}</span>
      <span className="ml-auto"><Sparkline data={c.sparkline_in_7d?.price} color={spColor(c.price_change_percentage_24h)} width={56} height={18} /></span>
      <span className="w-24 text-right text-sm tabular-nums text-sub">{fmtPrice(c.current_price)}</span>
      <span className="w-16 text-right text-sm tabular-nums">{pct(c.price_change_percentage_24h)}</span>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-cyan glow-cyan">Market Overview</h1>
          <span className="flex items-center gap-1.5 text-xs text-up">
            <span className="h-2 w-2 rounded-full bg-up animate-pulse"></span>LIVE
          </span>
        </div>
        <div className="mt-1 text-xs text-sub">last update · {clock} UTC</div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {hero.map((c) => (
          <div key={c.id} onClick={() => goTo(c.symbol)}
            style={{ boxShadow: `0 0 45px ${c.price_change_percentage_24h >= 0 ? 'rgba(0,255,163,0.35)' : 'rgba(255,59,107,0.35)'}` }}
            className="cyber-card flex cursor-pointer items-center gap-4 rounded-lg border border-cyan/20 bg-panel p-4">
            <img src={c.image} alt="" className="h-10 w-10" />
            <div>
              <div className="text-sm uppercase text-sub">{c.symbol} <span className="normal-case text-ink">{c.name}</span></div>
              <div className="text-2xl font-bold tabular-nums text-ink">${c.current_price.toLocaleString()}</div>
              <div className={`text-sm ${c.price_change_percentage_24h >= 0 ? 'text-up' : 'text-down'}`}>
                {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
            <div className="ml-auto"><Sparkline data={c.sparkline_in_7d?.price} color={spColor(c.price_change_percentage_24h)} /></div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="cyber-card rounded-lg border border-cyan/20 bg-panel p-4">
            <div className="flex items-start justify-between">
              <div className="text-2xl font-semibold tabular-nums text-ink"><CountUp value={c.num} format={c.fmt} /></div>
              {c.icon}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-sub">{c.label} {c.extra}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_4fr_4fr]">
        <div className="relative z-30 flex flex-col items-center justify-center rounded-lg cyber-card border border-cyan/20 bg-panel p-4">
          <div className="mb-1 text-sm text-sub">Fear &amp; Greed</div>
          <FearGreedMascot value={fng?.value} />
          {fng ? (
            <>
              <div className={`text-4xl font-bold ${fngColor}`}>{fng.value}</div>
              <div className={`text-sm ${fngColor}`}>{fng.value_classification}</div>
              <div className="mt-4 w-full max-w-[260px]">
                <div className="relative h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #ff3b6b 0%, #ff3b6b 38%, #00e5ff 50%, #00ffa3 62%, #00ffa3 100%)' }}>
                  <div className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded bg-white" style={{ left: `${fng.value}%`, boxShadow: '0 0 6px #fff' }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-sub"><span>Fear</span><span>Neutral</span><span>Greed</span></div>
              </div>
            </>
          ) : (<div className="text-sub">&mdash;</div>)}
        </div>

        <div className="cyber-card rounded-lg border border-cyan/20 bg-panel py-2">
          <div className="px-3 pb-2 font-display text-sm font-bold text-up">Top Gainers</div>
          {gainers.map((c) => <MoverRow key={c.id} c={c} />)}
        </div>

        <div className="cyber-card rounded-lg border border-cyan/20 bg-panel py-2">
          <div className="px-3 pb-2 font-display text-sm font-bold text-down">Top Losers</div>
          {losers.map((c) => <MoverRow key={c.id} c={c} />)}
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold text-magenta glow-magenta">Trending</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {trending.map(({ item }) => (
          <div key={item.id} onClick={() => goTo(item.symbol)}
            className="cyber-card flex cursor-pointer items-center gap-3 rounded-lg border border-cyan/20 bg-panel p-3 transition-colors hover:border-cyan/60">
            <img src={item.thumb} alt="" className="h-6 w-6" />
            <span className="font-medium text-ink">{item.name}</span>
            <span className="text-sm uppercase text-sub">{item.symbol}</span>
            <span className="ml-auto text-sm text-sub">{item.data?.price ? fmtPrice(item.data.price) : ''}</span>
            <span className="w-16 text-right text-sm">{item.data?.price_change_percentage_24h?.usd != null ? pct(item.data.price_change_percentage_24h.usd) : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;