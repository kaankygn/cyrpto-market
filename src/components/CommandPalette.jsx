import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSearchCoins } from '../api/coingecko'

function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState([]);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  // Global kısayol: Cmd/Ctrl+K aç/kapat, Esc kapat
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Açılınca coin listesini bir kez yükle + input'a odaklan
  useEffect(() => {
    if (!open) return;
    if (coins.length === 0) getSearchCoins().then(setCoins).catch(() => {});
    setQ('');
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open, coins.length]);

  if (!open) return null;

  const s = q.toLowerCase();
  const results = coins
    .filter((c) => !s || c.symbol.toLowerCase().includes(s) || c.name.toLowerCase().includes(s))
    .slice(0, 8);

  const go = (c) => {
    navigate(`/coin/${c.symbol.toUpperCase()}USDT`);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active]); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="cyber-card w-full max-w-lg overflow-hidden rounded-lg border border-cyan/30 bg-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder="Jump to coin…  (BTC, Ethereum)"
          className="w-full border-b border-cyan/20 bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-sub"
        />
        <div className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && <div className="px-4 py-3 text-sm text-sub">No coins found.</div>}
          {results.map((c, i) => (
            <button key={c.id} onClick={() => go(c)} onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${i === active ? 'bg-cyan/10 text-cyan' : 'text-ink hover:bg-cyan/5'}`}>
              <img src={c.image} alt="" className="h-5 w-5" />
              <span className="font-medium">{c.name}</span>
              <span className="text-xs uppercase text-sub">{c.symbol}</span>
              <span className="ml-auto text-xs tabular-nums text-sub">${c.current_price?.toLocaleString()}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-cyan/10 px-4 py-2 text-[10px] uppercase tracking-wider text-sub">↑↓ navigate · ↵ open · esc close</div>
      </div>
    </div>
  );
}

export default CommandPalette;
