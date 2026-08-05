import { useState, useEffect } from 'react'

export function useKline(symbol, interval) {
  const [candle, setCandle] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;
      setCandle({
        time: k.t / 1000,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      });
    };

    return () => {
      ws.close();
    };
  }, [symbol, interval]);

  return candle;
}