import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getKlines } from '../api/binance'
import PriceChart from '../components/PriceChart'

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

function CoinDetail() {
  const { symbol } = useParams();
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getKlines(symbol, timeframe)
      .then((klines) => setData(klines))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol, timeframe]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">{symbol}</h1>

      <div className="flex gap-2 mb-4">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setTimeframe(iv)}
            className={`px-3 py-1 rounded text-sm ${
              timeframe === iv
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {iv}
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-500">Grafik yükleniyor...</div>}
      {error && <div className="text-red-500">Hata: {error}</div>}
      {!loading && !error && <PriceChart data={data} />}
    </div>
  );
}

export default CoinDetail;