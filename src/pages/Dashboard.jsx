import { useState, useEffect } from 'react'
import { getGlobal, getTrending } from '../api/coingecko'

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getGlobal(), getTrending()])
      .then(([g, t]) => {
        setStats(g);
        setTrending(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const formatUsd = (n) =>
    '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-emerald-600 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-semibold">{formatUsd(stats.total_market_cap.usd)}</div>
          <div className="text-sm text-gray-500 mt-1">Total market cap</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-semibold">{stats.market_cap_percentage.btc.toFixed(1)}%</div>
          <div className="text-sm text-gray-500 mt-1">BTC dominance</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-semibold">{formatUsd(stats.total_volume.usd)}</div>
          <div className="text-sm text-gray-500 mt-1">24h volume</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-semibold">{stats.active_cryptocurrencies.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Active coins</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Trending</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {trending.map((c) => (
          <div key={c.item.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
            <img src={c.item.thumb} alt="" className="w-6 h-6" />
            <span className="font-medium">{c.item.name}</span>
            <span className="text-gray-400 uppercase text-sm">{c.item.symbol}</span>
            <span className="ml-auto text-gray-500 text-sm">#{c.item.market_cap_rank ?? '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;