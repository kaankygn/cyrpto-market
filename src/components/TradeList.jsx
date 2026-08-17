function TradeList({ trades }) {
  return (
    <div className="cyber-card mt-4 rounded-lg border border-cyan/20 bg-panel p-3 text-sm">
      <div className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-magenta">Recent Trades</div>
      <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
        {trades.slice(0, 30).map((t) => (
          <div key={t.id} className="flex justify-between tabular-nums">
            <span className={t.isBuyerMaker ? 'text-down' : 'text-up'}>{t.price.toLocaleString()}</span>
            <span className="text-sub">{t.qty.toFixed(4)}</span>
            <span className="text-sub">{new Date(t.time).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TradeList;