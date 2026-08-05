import { useState, useEffect } from 'react'

export function useTicker(symbol) {
  const [ticker, setTicker] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTicker({
        price: parseFloat(data.c),
        changePercent: parseFloat(data.P),
      });
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return ticker;
}