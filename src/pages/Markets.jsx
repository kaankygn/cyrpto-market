import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoins } from '../api/coingecko'

function Markets() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('market_cap');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    getCoins()
      .then((data) => setCoins(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-sub">Loading...</div>;
  if (error) return <div className="p-8 text-down">Error: {error}</div>;

  function handleSort(key) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }
  const arrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  const filtered = coins.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const diff = a[sortKey] - b[sortKey];
    return sortDir === 'asc' ? diff : -diff;
  });

  const fmtUsd = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtPrice = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 });

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-cyan glow-cyan">Markets</h1>

      <input
        type="text"
        placeholder="Search coins... (BTC, ETH)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded border border-cyan/30 bg-panel px-3 py-2 text-sm text-ink outline-none placeholder:text-sub focus:border-cyan"
      />

      <div className="overflow-hidden rounded-lg border border-cyan/20 bg-panel">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cyan/20 text-sub">
              <th className="py-3 pl-4">#</th>
              <th className="py-3">Coin</th>
              <th className="cursor-pointer select-none py-3 pr-4 text-right hover:text-cyan" onClick={() => handleSort('current_price')}>Price{arrow('current_price')}</th>
              <th className="cursor-pointer select-none py-3 pr-4 text-right hover:text-cyan" onClick={() => handleSort('price_change_percentage_24h')}>24h %{arrow('price_change_percentage_24h')}</th>
              <th className="cursor-pointer select-none py-3 pr-4 text-right hover:text-cyan" onClick={() => handleSort('market_cap')}>Market Cap{arrow('market_cap')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((coin, index) => (
              <tr
                key={coin.id}
                onClick={() => navigate(`/coin/${coin.symbol.toUpperCase()}USDT`)}
                className="cursor-pointer border-b border-cyan/5 transition-colors hover:bg-cyan/5"
              >
                <td className="py-3 pl-4 text-sub">{index + 1}</td>
                <td className="py-3 font-medium text-ink">
                  <img src={coin.image} alt="" className="mr-2 inline h-5 w-5 align-middle" />
                  {coin.name} <span className="text-sm uppercase text-sub">{coin.symbol}</span>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-ink">{fmtPrice(coin.current_price)}</td>
                <td className={`py-3 pr-4 text-right tabular-nums ${coin.price_change_percentage_24h >= 0 ? 'text-up' : 'text-down'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-sub">{fmtUsd(coin.market_cap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Markets;