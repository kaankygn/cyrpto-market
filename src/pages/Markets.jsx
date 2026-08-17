import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoins } from '../api/coingecko'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import Sparkline from '../components/Sparkline'
import { useLivePrices } from '../hooks/useLivePrices'

const RANGES = {
  '1h': 'price_change_percentage_1h_in_currency',
  '24h': 'price_change_percentage_24h',
  '7d': 'price_change_percentage_7d_in_currency',
};

function smartPicks(coins, n = 6) {
  const rows = coins.map((c) => {
    const p = c.sparkline_in_7d?.price || [];
    const min = p.length ? Math.min(...p) : 0;
    const max = p.length ? Math.max(...p) : 0;
    const brk = max > min ? (c.current_price - min) / (max - min) : 0.5;
    const mom = 0.2 * (c.price_change_percentage_1h_in_currency ?? 0)
      + 0.5 * (c.price_change_percentage_24h ?? 0)
      + 0.3 * (c.price_change_percentage_7d_in_currency ?? 0);
    const turn = c.market_cap ? c.total_volume / c.market_cap : 0;
    return { c, mom, turn, brk };
  });

  const norm = (key) => {
    const vals = rows.map((r) => r[key]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return (v) => (hi > lo ? (v - lo) / (hi - lo) : 0);
  };
  const nMom = norm('mom'), nTurn = norm('turn'), nBrk = norm('brk');

  const scored = rows.map((r) => {
    const sMom = nMom(r.mom), sTurn = nTurn(r.turn), sBrk = nBrk(r.brk);
    const total = 0.5 * sMom + 0.25 * sTurn + 0.25 * sBrk;
    const parts = [
      { label: '🔥 Momentum', v: sMom },
      { label: '📊 Volume', v: sTurn },
      { label: '⚡ Breakout', v: sBrk },
    ];
    const reason = parts.sort((a, b) => b.v - a.v)[0].label;
    return { c: r.c, total, reason };
  });

  return scored.sort((a, b) => b.total - a.total).slice(0, n);
}

function Markets() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('24h');
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('market_cap');
  const [sortDir, setSortDir] = useState('desc');
  const [watch, setWatch] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coinpunk_watch') || '[]'); } catch { return []; }
  });
  const live = useLivePrices();

  useEffect(() => {
    getCoins()
      .then((data) => setCoins(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const prevLive = useRef({});
  const [flash, setFlash] = useState({});
  useEffect(() => {
    const changed = {};
    for (const c of coins) {
      const sym = c.symbol.toUpperCase();
      const now = live[sym]?.price;
      const before = prevLive.current[sym];
      if (now != null && before != null && now !== before) changed[sym] = now > before ? 'up' : 'down';
      if (now != null) prevLive.current[sym] = now;
    }
    if (Object.keys(changed).length) {
      setFlash(changed);
      const id = setTimeout(() => setFlash({}), 1200);
      return () => clearTimeout(id);
    }
  }, [live]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const liveOf = (c) => live[c.symbol.toUpperCase()];
  const priceOf = (c) => liveOf(c)?.price ?? c.current_price;
  const chg = (c) => {
    if (range === '24h') { const l = liveOf(c); if (l) return l.change; }
    return c[RANGES[range]] ?? 0;
  };
  const picks = smartPicks(coins);

  function handleSort(key) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }
  const arrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const changeRange = (r) => {
    if (Object.values(RANGES).includes(sortKey)) setSortKey(RANGES[r]);
    setRange(r);
  };
  const toggleWatch = (id, e) => {
    e.stopPropagation();
    setWatch((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  };

  const searched = coins.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const shown = searched.filter((c) =>
    filter === 'gainers' ? chg(c) >= 0
      : filter === 'losers' ? chg(c) < 0
        : filter === 'watch' ? watch.includes(c.id)
          : true
  );
  const sorted = [...shown].sort((a, b) => {
    if (!sortKey) return 0;
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
    return sortDir === 'asc' ? diff : -diff;
  });
  const watchCoins = coins.filter((c) => watch.includes(c.id));
  const fmtUsd = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtPrice = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 });
  const spColor = (v) => (v >= 0 ? '#00ffa3' : '#ff3b6b');
  const pctCell = (n) => {
    const v = n ?? 0;
    return <span className={v >= 0 ? 'text-up' : 'text-down'}>{v >= 0 ? '▲' : '▼'}{Math.abs(v).toFixed(2)}%</span>;
  };

  const chip = (key, label) => (
    <button onClick={() => setFilter(key)}
      className={`rounded border px-3 py-1.5 text-xs transition ${filter === key ? 'border-cyan/50 bg-cyan/15 text-cyan' : 'border-cyan/20 text-sub hover:text-cyan'}`}>
      {label}
    </button>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-cyan glow-cyan">Markets</h1>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-sub">
          <span className="h-2 w-2 rounded-full bg-up animate-pulse"></span>
          live screener · {coins.length} assets
        </div>
      </div>
      {watchCoins.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-4 w-1 rounded-full" style={{ background: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-cyan glow-cyan">★ My Watchlist</h2>
            <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg,#00e5ff55,transparent)' }} />
            <span className="text-[10px] uppercase tracking-widest text-sub">{watchCoins.length} saved</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {watchCoins.map((c) => (
              <div key={c.id} onClick={() => navigate(`/coin/${c.symbol.toUpperCase()}USDT`)}
                className="cyber-card cursor-pointer rounded-lg border border-cyan/25 bg-panel p-4 transition active:scale-[0.98]">
                <div className="flex items-center gap-2">
                  <img src={c.image} alt="" className="h-6 w-6" />
                  <span className="text-sm font-bold uppercase text-ink">{c.symbol}</span>
                  <span className="truncate text-xs text-sub">{c.name}</span>
                  <button onClick={(e) => toggleWatch(c.id, e)} aria-label="remove"
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded text-base text-cyan transition hover:bg-cyan/10">★</button>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-xl font-bold tabular-nums text-ink">{fmtPrice(priceOf(c))}</div>
                  <div className="text-sm tabular-nums">{pctCell(chg(c))}</div>
                </div>
                <div className="mt-3"><Sparkline data={c.sparkline_in_7d?.price} color={spColor(c.price_change_percentage_7d_in_currency ?? 0)} height={56} className="w-full" /></div>
                <div className="mt-3 flex justify-between text-[11px] text-sub">
                  <span>Mkt Cap {fmtUsd(c.market_cap)}</span>
                  <span>Vol {fmtUsd(c.total_volume)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {picks.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-4 w-1 rounded-full" style={{ background: '#ff2bd6', boxShadow: '0 0 8px #ff2bd6' }} />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-magenta" style={{ textShadow: '0 0 8px #ff2bd666' }}>COINPUNK Picks</h2>
            <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg,#ff2bd655,transparent)' }} />
            <span className="text-[10px] uppercase tracking-widest text-sub">auto · scored</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {picks.map(({ c, reason }) => (
              <button key={c.id} onClick={() => navigate(`/coin/${c.symbol.toUpperCase()}USDT`)}
                className="cyber-card flex flex-col gap-1 rounded-lg border border-magenta/25 bg-panel p-3 text-left transition active:scale-95">
                <div className="flex items-center gap-2">
                  <img src={c.image} alt="" className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase text-ink">{c.symbol}</span>
                </div>
                <div className="text-sm font-semibold tabular-nums text-ink">{fmtPrice(priceOf(c))}</div>
                <div className="text-xs tabular-nums">{pctCell(chg(c))}</div>
                <div className="mt-1 w-fit rounded bg-magenta/10 px-1.5 py-0.5 text-[10px] text-magenta">{reason}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search coins... (BTC, ETH)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded border border-cyan/30 bg-panel px-3 py-2 text-sm text-ink outline-none placeholder:text-sub focus:border-cyan"
        />
        <div className="flex flex-wrap items-center gap-2">
          {chip('all', 'All')}
          {chip('gainers', 'Gainers')}
          {chip('losers', 'Losers')}
          {chip('watch', '★ Watchlist')}
          <div className="ml-1 flex overflow-hidden rounded border border-cyan/20 text-xs">
            {['1h', '24h', '7d'].map((r) => (
              <button key={r} onClick={() => changeRange(r)}
                className={`px-3 py-1.5 ${range === r ? 'bg-cyan/20 text-cyan' : 'text-sub hover:text-cyan'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cyber-card overflow-x-auto rounded-lg border border-cyan/20 bg-panel">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-cyan/20 text-xs uppercase tracking-wider text-sub">
              <th className="w-12 py-3 pl-3"></th>
              <th className="py-3 pl-1">#</th>
              <th className="py-3">Coin</th>
              <th className="cursor-pointer select-none py-3 pr-4 text-right hover:text-cyan" onClick={() => handleSort('current_price')}>Price{arrow('current_price')}</th>
              <th className="cursor-pointer select-none py-3 pr-4 text-right hover:text-cyan" onClick={() => handleSort(RANGES[range])}>{range} %{arrow(RANGES[range])}</th>
              <th className="py-3 pr-4 text-right">7d</th>
              <th className="cursor-pointer select-none py-3 pr-4 text-right hover:text-cyan" onClick={() => handleSort('market_cap')}>Market Cap{arrow('market_cap')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((coin, index) => (
              <tr
                key={coin.id}
                onClick={() => navigate(`/coin/${coin.symbol.toUpperCase()}USDT`)}
                className="group cursor-pointer border-b border-cyan/5 transition-colors hover:bg-cyan/10"
              >
                <td className="border-l-2 border-transparent py-2 pl-3 group-hover:border-cyan">
                  <button onClick={(e) => toggleWatch(coin.id, e)} aria-label="watchlist"
                    className={`flex h-8 w-8 items-center justify-center rounded text-lg leading-none transition hover:bg-cyan/10 ${watch.includes(coin.id) ? 'text-cyan' : 'text-sub hover:text-cyan'}`}>
                    {watch.includes(coin.id) ? '★' : '☆'}
                  </button>
                </td>
                <td className="py-3 pl-1 text-sub">{index + 1}</td>
                <td className="py-3 font-medium text-ink">
                  <img src={coin.image} alt="" className="mr-2 inline h-5 w-5 align-middle" />
                  {coin.name} <span className="text-sm uppercase text-sub">{coin.symbol}</span>
                </td>
                <td className={`py-3 pr-4 text-right tabular-nums text-ink ${flash[coin.symbol.toUpperCase()] === 'up' ? 'flash-up' : flash[coin.symbol.toUpperCase()] === 'down' ? 'flash-down' : ''}`}>{fmtPrice(priceOf(coin))}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{pctCell(chg(coin))}</td>
                <td className="py-3 pr-4"><div className="flex justify-end"><Sparkline data={coin.sparkline_in_7d?.price} color={spColor(coin.price_change_percentage_7d_in_currency ?? 0)} width={100} height={30} /></div></td>
                <td className="py-3 pr-4 text-right tabular-nums text-sub">{fmtUsd(coin.market_cap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="mt-6 text-center text-sm text-sub">No coins match your filters.</div>
      )}
    </div>
  );
}

export default Markets;