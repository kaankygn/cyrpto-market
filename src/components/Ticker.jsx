import { useNavigate } from 'react-router-dom'
import { useTickerBar } from '../hooks/useTickerBar'

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT', 'LTC', 'TRX'];

function Ticker() {
    const navigate = useNavigate();
    const tickers = useTickerBar(SYMBOLS);
    const fmt = (p) => '$' + p.toLocaleString('en-US', { maximumFractionDigits: p < 1 ? 4 : 2 });

    const row = (
        <div className="flex shrink-0 items-center">
            {SYMBOLS.map((s) => {
                const t = tickers[s];
                return (
                    <button key={s} type="button" onClick={() => navigate(`/coin/${s}USDT`)}
                        className="flex w-52 shrink-0 items-center gap-2 border-r border-cyan/10 px-4 text-sm whitespace-nowrap">
                        <span className="font-medium text-ink">{s}</span>
                        <span className="text-sub tabular-nums">{t ? fmt(t.price) : '—'}</span>
                        {t && <span className={`tabular-nums ${t.change >= 0 ? 'text-up' : 'text-down'}`}>{t.change >= 0 ? '▲' : '▼'}{Math.abs(t.change).toFixed(2)}%</span>}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="ticker-bar sticky top-28 z-40 overflow-hidden border-b border-cyan/20 bg-bg/90 py-2 backdrop-blur">
            <div className="ticker-track flex w-max">
                {row}{row}
            </div>
        </div>
    );
}

export default Ticker;