import { useState, useEffect, useRef } from 'react'

export function useLivePrices() {
  const [prices, setPrices] = useState({});
  const buf = useRef({});

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    ws.onmessage = (e) => {
      const arr = JSON.parse(e.data);
      if (!Array.isArray(arr)) return;
      for (const t of arr) {
        const s = t.s;
        if (!s.endsWith('USDT')) continue;
        const base = s.slice(0, -4);
        const price = parseFloat(t.c);
        const open = parseFloat(t.o);
        const change = open ? ((price - open) / open) * 100 : 0;
        buf.current[base] = { price, change };
      }
    };
    const id = setInterval(() => setPrices({ ...buf.current }), 1500);
    return () => { ws.close(); clearInterval(id); };
  }, []);

  return prices;
}