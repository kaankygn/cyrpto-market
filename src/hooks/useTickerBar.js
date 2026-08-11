import { useState, useEffect, useRef } from 'react'

export function useTickerBar(symbols) {
  const [tickers, setTickers] = useState({});
  const buf = useRef({});

  useEffect(() => {
    const streams = symbols.map((s) => `${s.toLowerCase()}usdt@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (e) => {
      const { data } = JSON.parse(e.data);
      const sym = data.s.replace('USDT', '');
      buf.current[sym] = { price: parseFloat(data.c), change: parseFloat(data.P) };
    };
    const id = setInterval(() => setTickers({ ...buf.current }), 1500);
    return () => {
      ws.close();
      clearInterval(id);
    };
  }, []);

  return tickers;
}