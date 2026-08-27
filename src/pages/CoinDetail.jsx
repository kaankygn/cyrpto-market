import { useTrades } from '../hooks/useTrades'
import TradeList from '../components/TradeList'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getKlines, getBinanceSymbols } from '../api/binance'
import { getCoinBySymbol, getCoinOHLC } from '../api/coingecko'
import { useTicker } from '../hooks/useTicker'
import { useOrderBook } from '../hooks/useOrderBook'
import PriceChart from '../components/PriceChart'
import OrderBook from '../components/OrderBook'
import { useKline } from '../hooks/useKline'
import { analyzeCandles } from '../lib/analysis'
import AnalysisPanel from '../components/AnalysisPanel'


const INTERVALS = ['15m', '1h', '4h', '1d', '1w', '1M'];

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
    const [meta, setMeta] = useState(null);
    const [fbData, setFbData] = useState([]);
    const [fbDays, setFbDays] = useState(7);
    const [fbLoading, setFbLoading] = useState(false);
    const [fbError, setFbError] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [llm, setLlm] = useState(null);
    const [llmLoading, setLlmLoading] = useState(false);
    const [llmError, setLlmError] = useState(null);
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
        let active = true;
        setMeta(null);
        getCoinBySymbol(symbol.replace('USDT', '')).then((m) => { if (active) setMeta(m); }).catch(() => { });
        return () => { active = false; };
    }, [symbol]);

    useEffect(() => {
        if (supported !== false || !meta?.id) return;
        let active = true;
        setFbLoading(true); setFbError(false);
        getCoinOHLC(meta.id, fbDays)
            .then((c) => { if (active) { setFbData(c); setFbLoading(false); } })
            .catch(() => { if (active) { setFbError(true); setFbLoading(false); } });
        return () => { active = false; };
    }, [supported, meta, fbDays]);

    useEffect(() => { setAnalysis(null); setLlm(null); setLlmError(null); }, [symbol, timeframe, fbDays]);
    const canAnalyze = supported === false ? fbData.length > 0 : data.length > 0;
    const runAnalysis = async () => {
        const a = analyzeCandles(supported === false ? fbData : data);
        setAnalysis(a);
        setLlm(null); setLlmError(null);
        if (!a) return;
        setLlmLoading(true);
        try {
            const base = import.meta.env.VITE_API_BASE || '';
            const res = await fetch(`${base}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, rangeLabel: supported === false ? `${fbDays}D` : timeframe, indicators: a }),
            });
            const j = await res.json();
            if (!res.ok || j.error) throw new Error(j.error || 'failed');
            setLlm(j);
        } catch {
            setLlmError('AI analysis unavailable.');
        } finally {
            setLlmLoading(false);
        }
    };

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
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    {meta?.image && <img src={meta.image} alt="" className="h-9 w-9" />}
                    <h1 className="font-display text-3xl font-bold text-cyan glow-cyan">
                        {symbol.replace('USDT', '')}<span className="text-lg text-sub">/USDT</span>
                    </h1>
                    {meta?.name && <span className="text-sm text-sub">{meta.name}</span>}
                </div>
                {ticker ? (
                    <>
                        <span className="text-2xl font-semibold tabular-nums text-ink">${ticker.price.toLocaleString()}</span>
                        <span className={`tabular-nums ${ticker.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {ticker.changePercent >= 0 ? '▲' : '▼'}{Math.abs(ticker.changePercent).toFixed(2)}%
                        </span>
                    </>
                ) : supported === false && meta ? (
                    <span className="text-2xl font-semibold tabular-nums text-ink">${meta.current_price?.toLocaleString()}</span>
                ) : null}
                {supported === false && (
                    <span className="rounded border border-magenta/40 px-2 py-0.5 text-xs text-magenta">CoinGecko</span>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    {supported !== false
                        ? INTERVALS.map((iv) => (
                            <button key={iv} onClick={() => setTimeframe(iv)}
                                className={`rounded border px-3 py-1 text-sm transition ${timeframe === iv ? 'border-cyan/50 bg-cyan/20 text-cyan' : 'border-cyan/20 text-sub hover:text-cyan'}`}>
                                {iv}
                            </button>
                        ))
                        : meta?.id
                            ? [[1, '1D'], [7, '7D'], [30, '1M'], [90, '3M'], [365, '1Y']].map(([d, label]) => (
                                <button key={d} onClick={() => setFbDays(d)}
                                    className={`rounded border px-3 py-1 text-sm transition ${fbDays === d ? 'border-cyan/50 bg-cyan/20 text-cyan' : 'border-cyan/20 text-sub hover:text-cyan'}`}>
                                    {label}
                                </button>
                            ))
                            : null}
                </div>
                {canAnalyze && (
                    <button onClick={runAnalysis}
                        className="flex items-center gap-1.5 rounded border border-magenta/40 bg-magenta/10 px-3 py-1 text-sm text-magenta transition hover:bg-magenta/20 active:scale-95">
                        ⚡ Analyze
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 self-start">
                    <div className="cyber-card rounded-lg border border-cyan/20 bg-panel p-2">
                        {supported === false ? (
                            !meta?.id ? (
                                <div className="p-6 text-sub">Not listed on Binance — no chart data available.</div>
                            ) : fbLoading ? (
                                <div className="p-6 text-sub">Loading chart...</div>
                            ) : fbError ? (
                                <div className="p-6 text-down">Failed to load chart.</div>
                            ) : (
                                <PriceChart data={fbData} />
                            )
                        ) : (
                            <>
                                {loading && <div className="p-6 text-sub">Loading chart...</div>}
                                {error === 'fetch' && (
                                    <div className="p-6 text-down">
                                        Failed to load chart.
                                        <button onClick={retry} className="ml-2 rounded border border-cyan/40 px-2 py-0.5 text-cyan hover:bg-cyan/10">Retry</button>
                                    </div>
                                )}
                                {!loading && !error && <PriceChart data={data} liveCandle={liveCandle} />}
                            </>
                        )}
                    </div>
                </div>
                <div className="self-start">
                    {supported === false ? (
                        <div className="cyber-card rounded-lg border border-cyan/20 bg-panel p-4 text-sm text-sub">
                            Order book & trades unavailable (not on Binance).
                        </div>
                    ) : (
                        <>
                            <OrderBook book={book} />
                            <TradeList trades={trades} />
                        </>
                    )}
                </div>
            </div>
            <AnalysisPanel analysis={analysis} rangeLabel={supported === false ? `${fbDays}D` : timeframe} llm={llm} llmLoading={llmLoading} llmError={llmError} />
        </div>
    );
}

export default CoinDetail;