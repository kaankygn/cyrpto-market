import { useTrades } from '../hooks/useTrades'
import TradeList from '../components/TradeList'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getKlines, getBinanceSymbols } from '../api/binance'
import { useTicker } from '../hooks/useTicker'
import { useOrderBook } from '../hooks/useOrderBook'
import PriceChart from '../components/PriceChart'
import OrderBook from '../components/OrderBook'
import { useKline } from '../hooks/useKline'


const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

function CoinDetail() {
    const { symbol } = useParams();
    const ticker = useTicker(symbol);
    const book = useOrderBook(symbol);
    const trades = useTrades(symbol);
    const [data, setData] = useState([]);
    const [timeframe, setTimeframe] = useState('1h');
    const liveCandle = useKline(symbol, timeframe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [supported, setSupported] = useState(null); // null=bilinmiyor, true/false
    const [reloadKey, setReloadKey] = useState(0);
    const retry = () => setReloadKey((k) => k + 1);

    useEffect(() => {
        let active = true;
        setSupported(null);
        getBinanceSymbols().then((set) => {
            if (!active) return;
            setSupported(set.size === 0 ? true : set.has(symbol.toUpperCase()));
        });
        return () => { active = false; };
    }, [symbol]);

    useEffect(() => {
        if (supported === null) return;
        if (supported === false) { setError('unsupported'); setLoading(false); return; }
        const controller = new AbortController();
        let cancelled = false;
        let attempt = 0;
        let timer;

        const load = () => {
            setLoading(true);
            setError(null);
            getKlines(symbol, timeframe, 200, controller.signal)
                .then((klines) => { if (!cancelled) { setData(klines); setLoading(false); } })
                .catch((err) => {
                    if (cancelled || err.name === 'AbortError') return;
                    if (err.message === 'UNSUPPORTED') { setError('unsupported'); setLoading(false); return; }
                    if (attempt < 2) { attempt += 1; timer = setTimeout(load, 800 * attempt); return; }
                    setError('fetch'); setLoading(false);
                });
        };
        load();

        return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
    }, [symbol, timeframe, reloadKey, supported]);

    return (
        <div className="p-4 md:p-8">
            <div className="mb-4 flex flex-wrap items-baseline gap-4">
                <h1 className="font-display text-3xl font-bold text-cyan glow-cyan">
                    {symbol.replace('USDT', '')}<span className="text-lg text-sub">/USDT</span>
                </h1>
                {ticker && (
                    <>
                        <span className="text-2xl font-semibold tabular-nums text-ink">${ticker.price.toLocaleString()}</span>
                        <span className={`tabular-nums ${ticker.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {ticker.changePercent >= 0 ? '▲' : '▼'}{Math.abs(ticker.changePercent).toFixed(2)}%
                        </span>
                    </>
                )}
            </div>

            <div className="mb-4 flex gap-2">
                {INTERVALS.map((iv) => (
                    <button key={iv} onClick={() => setTimeframe(iv)}
                        className={`rounded border px-3 py-1 text-sm transition ${timeframe === iv ? 'border-cyan/50 bg-cyan/20 text-cyan' : 'border-cyan/20 text-sub hover:text-cyan'}`}>
                        {iv}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 self-start">
                    <div className="cyber-card rounded-lg border border-cyan/20 bg-panel p-2">
                        {loading && <div className="p-6 text-sub">Loading chart...</div>}
                        {error === 'unsupported' && (
                            <div className="p-6 text-sub">Bu varlık Binance'te listelenmemiş — canlı grafik yok.</div>
                        )}
                        {error === 'fetch' && (
                            <div className="p-6 text-down">
                                Grafik yüklenemedi.
                                <button onClick={retry} className="ml-2 rounded border border-cyan/40 px-2 py-0.5 text-cyan hover:bg-cyan/10">Tekrar dene</button>
                            </div>
                        )}
                        {!loading && !error && <PriceChart data={data} liveCandle={liveCandle} />}
                    </div>
                </div>
                <div className="self-start">
                    <OrderBook book={book} />
                    <TradeList trades={trades} />
                </div>
            </div>
        </div>
    );
}

export default CoinDetail;