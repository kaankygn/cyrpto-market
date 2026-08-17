function OrderBook({ book }) {
  const asks = book.asks.slice(0, 8).reverse();
  const bids = book.bids.slice(0, 8);
  const max = Math.max(1, ...[...asks, ...bids].map(([, q]) => parseFloat(q)));

  const row = (entry, up, key) => {
    const [price, qty] = entry;
    return (
      <div key={key} className="relative flex justify-between py-0.5 tabular-nums">
        <div className={`absolute inset-y-0 right-0 rounded-sm ${up ? 'bg-up/10' : 'bg-down/10'}`}
          style={{ width: `${(parseFloat(qty) / max) * 100}%` }} />
        <span className={`relative ${up ? 'text-up' : 'text-down'}`}>{parseFloat(price).toLocaleString()}</span>
        <span className="relative text-sub">{parseFloat(qty).toFixed(4)}</span>
      </div>
    );
  };

  return (
    <div className="cyber-card rounded-lg border border-cyan/20 bg-panel p-3 text-sm">
      <div className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-cyan">Order Book</div>
      {asks.map((a, i) => row(a, false, 'a' + i))}
      <div className="my-1 border-y border-cyan/10"></div>
      {bids.map((b, i) => row(b, true, 'b' + i))}
    </div>
  );
}

export default OrderBook;