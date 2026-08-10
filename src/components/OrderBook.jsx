function OrderBook({ book }) {
  const asks = book.asks.slice(0, 8).reverse();
  const bids = book.bids.slice(0, 8);

  return (
    <div className="border border-gray-200 rounded-lg p-3 text-sm">
      <div className="font-semibold text-gray-500 mb-2">Order Book</div>

      {asks.map(([price, qty], i) => (
        <div key={i} className="flex justify-between text-red-500">
          <span>{parseFloat(price).toLocaleString()}</span>
          <span className="text-gray-400">{parseFloat(qty).toFixed(4)}</span>
        </div>
      ))}

      <div className="border-y border-gray-100 my-1"></div>

      {bids.map(([price, qty], i) => (
        <div key={i} className="flex justify-between text-emerald-600">
          <span>{parseFloat(price).toLocaleString()}</span>
          <span className="text-gray-400">{parseFloat(qty).toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

export default OrderBook;