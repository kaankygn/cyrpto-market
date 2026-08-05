import { useTrades } from '../hooks/useTrades'
import TradeList from '../components/TradeList'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getKlines } from '../api/binance'
import { useTicker } from '../hooks/useTicker'
import { useOrderBook } from '../hooks/useOrderBook'
import PriceChart from '../components/PriceChart'
import OrderBook from '../components/OrderBook'

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

function CoinDetail() {
    const { symbol } = useParams();
    const ticker = useTicker(symbol);
    const book = useOrderBook(symbol);
    const trades = useTrades(symbol);
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
            <div className="flex items-baseline gap-4 mb-4">
                <h1 className="text-3xl font-bold text-emerald-600">{symbol}</h1>
                {ticker && (
                    <>
                        <span className="text-2xl font-semibold">
                            ${ticker.price.toLocaleString()}
                        </span>
                        <span className={ticker.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                            {ticker.changePercent >= 0 ? '+' : ''}
                            {ticker.changePercent.toFixed(2)}%
                        </span>
                    </>
                )}
            </div>

            <div className="flex gap-2 mb-4">
                {INTERVALS.map((iv) => (
                    <button
                        key={iv}
                        onClick={() => setTimeframe(iv)}
                        className={`px-3 py-1 rounded text-sm ${timeframe === iv
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {iv}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    {loading && <div className="text-gray-500">Grafik yükleniyor...</div>}
                    {error && <div className="text-red-500">Hata: {error}</div>}
                    {!loading && !error && <PriceChart data={data} />}
                </div>
                <div>
                    <OrderBook book={book} />
                    <TradeList trades={trades} />
                </div>
            </div>
        </div>
    );
}

export default CoinDetail;