import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSearchCoins } from '../api/coingecko'

function CoinSearch() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [q, setQ] = useState('');
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        getSearchCoins().then(setList).catch(() => { });
    }, []);

    const t = q.trim().toLowerCase();
    const results = t
        ? list.filter((c) => c.symbol.toLowerCase().startsWith(t) || c.name.toLowerCase().startsWith(t)).slice(0, 8)
        : [];

    const go = (symbol) => {
        navigate(`/coin/${symbol.toUpperCase()}USDT`);
        setQ('');
        setFocused(false);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (results[0]) go(results[0].symbol);
        else if (t) go(t);
    };

    return (
        <form onSubmit={onSubmit} className="relative">
            <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search coin…  /"
                className="w-44 rounded border border-cyan/30 bg-bg/60 py-1.5 pl-8 pr-3 text-sm text-ink outline-none transition-all placeholder:text-sub focus:w-56 focus:border-cyan"
            />

            {focused && results.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-56 overflow-auto rounded border border-cyan/30 bg-panel">
                    {results.map((c) => (
                        <button
                            type="button"
                            key={c.id}
                            onMouseDown={() => go(c.symbol)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-cyan/10"
                        >
                            <img src={c.image} alt="" className="h-4 w-4" />
                            <span className="font-medium text-ink">{c.name}</span>
                            <span className="ml-auto uppercase text-sub">{c.symbol}</span>
                        </button>
                    ))}
                </div>
            )}
        </form>
    );
}

export default CoinSearch;