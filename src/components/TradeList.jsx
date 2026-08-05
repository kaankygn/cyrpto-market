function TradeList({ trades }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 text-sm mt-4">
      <div className="font-semibold text-gray-500 mb-2">Son İşlemler</div>
      {trades.map((t) => (
        <div key={t.id} className="flex justify-between">
          <span className={t.isBuyerMaker ? 'text-red-500' : 'text-emerald-600'}>
            {t.price.toLocaleString()}
          </span>
          <span className="text-gray-400">{t.qty.toFixed(4)}</span>
          <span className="text-gray-400">{new Date(t.time).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
}

export default TradeList;