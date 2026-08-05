import { useState, useEffect } from 'react'

export function useTrades(symbol) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!symbol) return;
    setTrades([]);

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const trade = {
        id: data.t,
        price: parseFloat(data.p),
        qty: parseFloat(data.q),
        time: data.T,
        isBuyerMaker: data.m,
      };
      setTrades((prev) => [trade, ...prev].slice(0, 30));
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return trades;
}