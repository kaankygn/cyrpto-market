import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGlobal, getTrending, getCoins } from '../api/coingecko'
import { getFearGreed } from '../api/fng'
import FearGreedMascot from '../components/FearGreedMascot'

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
    Promise.all([
      getGlobal(),
      getTrending(),
      getCoins(),
      getFearGreed().catch(() => null),
    ])
      .then(([g, t, c, f]) => {
        setStats(g);
        setTrending(t);
        setCoins(c);
        setFng(f);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <div className="p-8 text-sub">Loading...</div>;
  if (error) return <div className="p-8 text-down">Error: {error}</div>;

  const fmtUsd = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtPrice = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 });
  const goTo = (sym) => navigate(`/coin/${sym.toUpperCase()}USDT`);

  const pct = (v) => {
    const n = v ?? 0;
    return <span className={n >= 0 ? 'text-up' : 'text-down'}>{n >= 0 ? '+' : ''}{n.toFixed(2)}%</span>;
  };

  const mcChange = stats.market_cap_change_percentage_24h_usd ?? 0;
  const gainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  const losers = [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);
  const fngColor = !fng ? 'text-sub' : fng.value <= 45 ? 'text-down' : fng.value <= 54 ? 'text-sub' : 'text-up';

  // === TEST: F&G mood ===
  let testValue = null;
  // testValue = 20;   // Fear   → devil
  // testValue = 50;   // Neutral → cyan (neutral)
  // testValue = 80;   // Greed  → angel


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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-cyan/20 bg-panel p-4">
          <div className="text-2xl font-semibold text-ink">{fmtUsd(stats.total_market_cap.usd)}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-sub">Total market cap {pct(mcChange)}</div>
        </div>
        <div className="rounded-lg border border-cyan/20 bg-panel p-4">
          <div className="text-2xl font-semibold text-ink">{stats.market_cap_percentage.btc.toFixed(1)}%</div>
          <div className="mt-1 text-sm text-sub">BTC dominance</div>
        </div>
        <div className="rounded-lg border border-cyan/20 bg-panel p-4">
          <div className="text-2xl font-semibold text-ink">{fmtUsd(stats.total_volume.usd)}</div>
          <div className="mt-1 text-sm text-sub">24h volume</div>
        </div>
        <div className="rounded-lg border border-cyan/20 bg-panel p-4">
          <div className="text-2xl font-semibold text-ink">{stats.active_cryptocurrencies.toLocaleString()}</div>
          <div className="mt-1 text-sm text-sub">Active coins</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr_4fr] gap-4 mb-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-cyan/20 bg-panel p-4">
          <div className="mb-1 text-sm text-sub">Fear &amp; Greed</div>
          <FearGreedMascot value={testValue ?? fng?.value} />
          {fng ? (
            <>
              <div className={`text-4xl font-bold ${fngColor}`}>{fng.value}</div>
              <div className={`text-sm ${fngColor}`}>{fng.value_classification}</div>
              <div className="mt-4 w-full max-w-[260px]">
                <div className="relative h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #ff3b6b 0%, #ff3b6b 38%, #00e5ff 50%, #00ffa3 62%, #00ffa3 100%)' }}>
                  <div
                    className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded bg-white"
                    style={{ left: `${fng.value}%`, boxShadow: '0 0 6px #fff' }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-sub">
                  <span>Fear</span><span>Neutral</span><span>Greed</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sub">&mdash;</div>
          )}
        </div>

        <div className="rounded-lg border border-cyan/20 bg-panel py-2">
          <div className="px-3 pb-2 font-display text-sm font-bold text-up">Top Gainers</div>
          {gainers.map((c) => (
            <div key={c.id} onClick={() => goTo(c.symbol)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-cyan/5">
              <img src={c.image} alt="" className="h-5 w-5" />
              <span className="font-medium text-ink">{c.symbol.toUpperCase()}</span>
              <span className="ml-auto text-sm text-sub">{fmtPrice(c.current_price)}</span>
              <span className="w-20 text-right text-sm">{pct(c.price_change_percentage_24h)}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-cyan/20 bg-panel py-2">
          <div className="px-3 pb-2 font-display text-sm font-bold text-down">Top Losers</div>
          {losers.map((c) => (
            <div key={c.id} onClick={() => goTo(c.symbol)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-cyan/5">
              <img src={c.image} alt="" className="h-5 w-5" />
              <span className="font-medium text-ink">{c.symbol.toUpperCase()}</span>
              <span className="ml-auto text-sm text-sub">{fmtPrice(c.current_price)}</span>
              <span className="w-20 text-right text-sm">{pct(c.price_change_percentage_24h)}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-magenta glow-magenta mb-3">Trending</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {trending.map(({ item }) => (
          <div key={item.id} onClick={() => goTo(item.symbol)}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-cyan/20 bg-panel p-3 transition-colors hover:border-cyan/60">
            <img src={item.thumb} alt="" className="h-6 w-6" />
            <span className="font-medium text-ink">{item.name}</span>
            <span className="text-sm uppercase text-sub">{item.symbol}</span>
            <span className="ml-auto text-sm text-sub">{item.data?.price ? fmtPrice(item.data.price) : ''}</span>
            <span className="w-16 text-right text-sm">
              {item.data?.price_change_percentage_24h?.usd != null ? pct(item.data.price_change_percentage_24h.usd) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;