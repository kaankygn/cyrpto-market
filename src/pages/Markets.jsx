import { useState, useEffect } from 'react'
import { getCoins } from '../api/coingecko'

function Markets() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    getCoins()
      .then((data) => setCoins(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-red-500">Hata: {error}</div>;

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const diff = a[sortKey] - b[sortKey];
    return sortDir === 'asc' ? diff : -diff;
  });

  const arrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-emerald-600 mb-6">Markets</h1>

      <input
        type="text"
        placeholder="Coin ara... (BTC, ethereum)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 text-sm">
            <th className="py-2">#</th>
            <th className="py-2">Coin</th>
            <th className="py-2 text-right cursor-pointer select-none hover:text-emerald-600"
                onClick={() => handleSort('current_price')}>
              Fiyat{arrow('current_price')}
            </th>
            <th className="py-2 text-right cursor-pointer select-none hover:text-emerald-600"
                onClick={() => handleSort('price_change_percentage_24h')}>
              24s %{arrow('price_change_percentage_24h')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((coin, index) => (
            <tr key={coin.id} className="border-b border-gray-100">
              <td className="py-3 text-gray-400">{index + 1}</td>
              <td className="py-3 font-medium">
                <img src={coin.image} alt="" className="inline w-5 h-5 mr-2 align-middle" />
                {coin.name} <span className="text-gray-400 uppercase text-sm">{coin.symbol}</span>
              </td>
              <td className="py-3 text-right">${coin.current_price.toLocaleString()}</td>
              <td className={`py-3 text-right ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Markets;